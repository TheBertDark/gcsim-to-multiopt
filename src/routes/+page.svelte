<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import Prism from 'prismjs';
    import 'prismjs/themes/prism-tomorrow.css';
    import 'prismjs/components/prism-json';

    import { readGZ, readJSON } from '$lib';
    import { getCharacterAbils, getCustomDescription } from '$lib/gcsim-to-multiopt';
    import type { NoteItem } from '$lib/gcsim-to-multiopt/config/custom_descriptions';
    import { convertAbils } from '$lib/gcsim-to-multiopt/convert';
    import getAbilities from '$lib/gcsim-to-multiopt/config/abil_name';
    import statNameConvert from '$lib/gcsim-to-multiopt/config/stat_name';
    import resistNameConvert from '$lib/gcsim-to-multiopt/config/resist_name';
    import { abilityDescriptions } from '$lib/gcsim-to-multiopt/config/ability_descriptions';
    import { computeDefaultIgnored } from '$lib/gcsim-to-multiopt/config/default_ignored_mods';

    import type { Sample } from '$lib/gcsim-to-multiopt/gcsim_types';
    import type { CustomMultiTarget } from '$lib/gcsim-to-multiopt/go_types';

    import { initKonamiCode } from '$lib/utils/konamiCode';
    import themeManager from '$lib/utils/themeManager';
    import halloweenTester from '$lib/utils/halloweenTester';
    import christmasTester from '$lib/utils/christmasTester';

    import '$lib/styles/theme-neon.scss';
    import '$lib/styles/prism-theme.scss';

    import type { ErrorContext } from '$lib/types';
    import BuildCardsPromoOverlay from '$lib/components/BuildCardsPromoOverlay.svelte';
    import WelcomeOverlay from '$lib/components/WelcomeOverlay.svelte';
    import UploadDropZone from '$lib/components/UploadDropZone.svelte';
    import CharacterControls from '$lib/components/CharacterControls.svelte';
    import ModifierFilters from '$lib/components/ModifierFilters.svelte';
    import ErrorViewer from '$lib/components/ErrorViewer.svelte';
    import OutputViewer from '$lib/components/OutputViewer.svelte';
    import AudioPlayer from '$lib/components/AudioPlayer.svelte';
    import Tooltip from '$lib/components/Tooltip.svelte';
    import Toast from '$lib/components/Toast.svelte';
    import Footer from '$lib/components/Footer.svelte';

    // Element Icons
    import AnemoIcon from '$lib/icons/AnemoIcon.svelte';
    import CryoIcon from '$lib/icons/CryoIcon.svelte';
    import DendroIcon from '$lib/icons/DendroIcon.svelte';
    import ElectroIcon from '$lib/icons/ElectroIcon.svelte';
    import GeoIcon from '$lib/icons/GeoIcon.svelte';
    import HydroIcon from '$lib/icons/HydroIcon.svelte';
    import PyroIcon from '$lib/icons/PyroIcon.svelte';

    let isNeonTheme = false;
    let isPlaying = false;
    let isMuted = false;
    let currentTrackIndex = 0;
    let audio: HTMLAudioElement | null = null;
    const audioFiles = [
        '/gcsim-to-multiopt/sound1.mp3',
        '/gcsim-to-multiopt/sound2.mp3',
        '/gcsim-to-multiopt/sound3.mp3',
        '/gcsim-to-multiopt/sound4.mp3',
    ];

    // Dynamic character to element mapping from loaded file
    let characterElements: Record<string, string> = {};

    const elementColors: Record<string, string> = {
        anemo: '#2dd4bf',
        cryo: '#7dd3fc',
        dendro: '#a3e635',
        electro: '#c084fc',
        geo: '#fbbf24',
        hydro: '#38bdf8',
        pyro: '#ff5a50',
    };

    $: currentElement = characterElements[charName?.toLowerCase()] || 'anemo';

    const elementIcons: Record<string, any> = {
        anemo: AnemoIcon,
        cryo: CryoIcon,
        dendro: DendroIcon,
        electro: ElectroIcon,
        geo: GeoIcon,
        hydro: HydroIcon,
        pyro: PyroIcon,
    };

    $: currentElementIcon = elementIcons[currentElement];

    let sample: Sample | null = null;
    let charName = '';
    let charNames: string[] = [];
    let ignoredMods: string[] = [];
    let availabledMods: string[] = [];
    let manualEnabledMods: Set<string> = new Set();
    let target: CustomMultiTarget | null = null;
    let customDescNote: NoteItem[] = [];
    $: customDescItems = customDescNote;

    let errors: string[] = [];
    let errorContexts: ErrorContext[] = [];
    let addConvert = '';
    let highlightedJson = '';
    let currentFileName = '';
    let showToast = false;
    let toastMessage = 'Copied to clipboard!';
    let toastIcon = '✓';
    let toastTimeout: ReturnType<typeof setTimeout>;
    let configName = '';
    let showWelcomeOverlay = true;
    let showBuildCardsPromo = true;
    const buildCardsPromoUrl = 'https://www.khaenri.online/';

    function showNotification(msg: string, icon = '✓', duration = 2500) {
        toastMessage = msg;
        toastIcon = icon;
        showToast = true;
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            showToast = false;
        }, duration);
    }

    // Tooltip variables
    let tooltipX = 0;
    let tooltipY = 0;
    let showTooltip = false;
    let tooltipTimeout: ReturnType<typeof setTimeout> | null = null;

    (globalThis as any).abilityDescriptions = abilityDescriptions;

    function handleMouseEnter(event: MouseEvent) {
        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = null;
        }
        showTooltip = true;
        updateTooltipPosition(event);
    }

    function handleMouseMove(event: MouseEvent) {
        if (showTooltip) {
            updateTooltipPosition(event);
        }
    }

    function handleMouseLeave() {
        tooltipTimeout = setTimeout(() => {
            showTooltip = false;
            tooltipTimeout = null;
        }, 50);
    }

    function updateTooltipPosition(event: MouseEvent) {
        tooltipX = event.clientX + 15;
        tooltipY = event.clientY - 15;

        const tooltipWidth = 320;
        let originX = 'left';
        let originY = 'top';

        if (tooltipX + tooltipWidth > window.innerWidth) {
            tooltipX = event.clientX - tooltipWidth - 15;
            originX = 'right';
        }

        if (tooltipY < 0) {
            tooltipY = event.clientY + 15;
            originY = 'bottom';
        }

        const tooltipElement = document.querySelector('.tooltip') as HTMLElement;
        if (tooltipElement) {
            tooltipElement.style.transformOrigin = `${originX} ${originY}`;
        }
    }

    onMount(() => {
        if (typeof window !== 'undefined') {
            themeManager.init();
            themeManager.forceThemeCheck();

            setTimeout(() => {
                console.log('🎃 Theme status:', {
                    currentTheme: themeManager.getCurrentTheme(),
                    bodyHasClass: document.body.classList.contains('halloween-theme'),
                    htmlHasClass: document.documentElement.classList.contains('halloween-theme'),
                    cssLoaded: !!document.getElementById('halloween-theme-css'),
                });
            }, 1000);
        }

        currentTrackIndex = Math.floor(Math.random() * audioFiles.length);
        audio = new Audio(audioFiles[currentTrackIndex]);
        audio.volume = 0.3;
        audio.loop = true;

        initKonamiCode(() => {
            console.log('¡Konami Code activado!');
            toggleNeonTheme();
        });

        if (target) {
            updateHighlightedJson();
        }

        return () => {
            if (toastTimeout) clearTimeout(toastTimeout);
            if (audio) {
                audio.pause();
                audio = null;
            }
        };
    });

    afterUpdate(() => {
        document.querySelectorAll('.token.string').forEach(span => {
            const texto = span.textContent || '';
            const url = 'https://thebertdark.github.io/gcsim-to-multiopt/';

            if (texto === '"No description available."') {
                (span as HTMLElement).style.setProperty('color', 'hsl(0, 100%, 50%)', 'important');
                (span as HTMLElement).style.fontWeight = 'bold';
                (span as HTMLElement).style.fontStyle = 'italic';
                return;
            }

            if (texto === '"Powered by DarkJake"') {
                (span as HTMLElement).style.setProperty('color', 'hsl(161 100% 50%)', 'important');
                (span as HTMLElement).style.fontWeight = 'bold';
                return;
            }

            if (texto.includes(url)) {
                const partes = texto.split(url);
                const parent = span.parentElement;

                if (parent) {
                    const spanBefore = document.createElement('span');
                    spanBefore.className = 'token string';
                    spanBefore.textContent = partes[0];
                    spanBefore.style.setProperty('color', 'hsl(76, 100%, 50%)', 'important');
                    spanBefore.style.setProperty('font-style', 'italic', 'important');

                    const spanLink = document.createElement('span');
                    spanLink.className = 'token string';
                    spanLink.textContent = url;
                    spanLink.style.setProperty('color', 'hsl(196, 100%, 60%)', 'important');
                    spanLink.style.setProperty('text-decoration', 'underline', 'important');
                    spanLink.style.setProperty(
                        'background-color',
                        'rgba(0, 255, 255, 0.1)',
                        'important'
                    );
                    spanLink.style.setProperty('font-style', 'italic', 'important');

                    const spanAfter = document.createElement('span');
                    spanAfter.className = 'token string';
                    spanAfter.textContent = partes[1];
                    spanAfter.style.setProperty('color', 'hsl(76, 100%, 50%)', 'important');
                    spanAfter.style.setProperty('font-style', 'italic', 'important');

                    parent.replaceChild(spanBefore, span);
                    parent.insertBefore(spanLink, spanBefore.nextSibling);
                    parent.insertBefore(spanAfter, spanLink.nextSibling);
                }
            }
        });
    });

    function playTrack(index: number) {
        if (audio) {
            audio.pause();
        }
        currentTrackIndex = (index + audioFiles.length) % audioFiles.length;
        audio = new Audio(audioFiles[currentTrackIndex]);
        audio.volume = isMuted ? 0 : 0.3;
        audio.loop = true;
        if (isPlaying) {
            audio.play().catch(err => console.warn('Audio play notice:', err));
        }
    }

    function toggleAudio() {
        if (!audio) {
            playTrack(currentTrackIndex);
            isPlaying = true;
            return;
        }
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            audio.play().then(() => {
                isPlaying = true;
            }).catch(error => {
                console.error('Error al reproducir el audio:', error);
            });
        }
    }

    function nextTrack() {
        playTrack(currentTrackIndex + 1);
        if (audio && isPlaying) audio.play().catch(() => {});
    }

    function prevTrack() {
        playTrack(currentTrackIndex - 1);
        if (audio && isPlaying) audio.play().catch(() => {});
    }

    function toggleMute() {
        isMuted = !isMuted;
        if (audio) {
            audio.volume = isMuted ? 0 : 0.3;
        }
    }

    function toggleNeonTheme() {
        isNeonTheme = !isNeonTheme;
        if (isNeonTheme) {
            document.body.classList.add('neon-retro-theme');
            showNotification('🕹️ Konami Code: 8-Bit Retro Mode Unlocked!', '🎮', 3000);
            if (!audio) {
                audio = new Audio(audioFiles[currentTrackIndex]);
                audio.volume = isMuted ? 0 : 0.3;
                audio.loop = true;
            }
            audio.play().then(() => {
                isPlaying = true;
            }).catch(err => {
                console.warn('Audio autoplay notice:', err);
            });
        } else {
            document.body.classList.remove('neon-retro-theme');
            showNotification('Returned to Standard Mode', '✦', 2000);
            if (audio) {
                audio.pause();
                isPlaying = false;
            }
        }
    }

    function updateCharacterAbils() {
        if (!sample) return;
        errors = [];
        errorContexts = [];

        const [_, modsFirstPass] = getCharacterAbils(sample, charName, ignoredMods);
        availabledMods = modsFirstPass;

        if (availabledMods.length > 0) {
            const defaultIgnored = computeDefaultIgnored(availabledMods);
            const toAdd = defaultIgnored.filter(m => !manualEnabledMods.has(m));
            if (toAdd.length > 0) {
                ignoredMods = Array.from(new Set([...ignoredMods, ...toAdd]));
            }
        }

        const [abilities, mods, char] = getCharacterAbils(sample, charName, ignoredMods);
        availabledMods = mods;
        customDescNote = getCustomDescription(char, mods) || [];

        if (abilities.length === 0) {
            target = null;
            highlightedJson = '';
            errors = [`No information available for character "${charName}" in the loaded file.`];
            errorContexts = [
                {
                    message: `No information available for character "${charName}" in the loaded file.`,
                    suggestion:
                        'This character has no damage data recorded in the simulation. Make sure the character actively participated in combat during the simulation.',
                },
            ];
            customDescNote = [];
            return;
        }

        const convert = getAbilities(charName);
        try {
            const addedConvert = JSON.parse(addConvert || '{}');
            Object.assign(convert, addedConvert);
        } catch (e) {
            errors.push(`Invalid JSON in additional abilities: ${e}`);
            errorContexts.push({
                message: `Invalid JSON in additional abilities: ${e}`,
                raw: addConvert,
                suggestion:
                    'Check that your JSON is properly formatted with quotes around keys and values',
            });
            return;
        }

        const [newTarget, newErrors] = convertAbils(abilities, convert, char);
        target = newTarget;
        errors = newErrors.map(e => e.message);

        errorContexts = errors.map(error => {
            const context: ErrorContext = { message: error };

            if (error.includes('Unknown ability')) {
                const abilityName = error.match(/^Unknown ability "(.+)"$/)?.[1];
                if (abilityName && abilities) {
                    const ability = abilities.find(a => a.name === abilityName);
                    if (ability) {
                        context.raw = {
                            name: ability.name,
                            buffs: ability.buffs,
                            resists: ability.resists,
                            reaction: ability.reaction,
                            infusion: ability.infusion,
                            defShred: ability.defShred,
                        };
                        context.suggestion = `Add this ability to the conversion map below with appropriate type and subtype`;
                    }
                }
            } else if (error.includes('Unknown stat')) {
                const statName = error.match(/"([^"]+)"/)?.[1];
                if (statName) {
                    context.raw = {
                        stat: statName,
                        validStats: Object.keys(statNameConvert),
                    };
                    context.suggestion = `Use one of the valid stat names shown above`;
                }
            } else if (error.includes('Unknown element')) {
                const elementName = error.match(/"([^"]+)"/)?.[1];
                if (elementName) {
                    context.raw = {
                        element: elementName,
                        validElements: Object.keys(resistNameConvert),
                    };
                    context.suggestion = `Use one of the valid element names shown above`;
                }
            }

            return context;
        });

        if (target) {
            updateHighlightedJson();
        }
    }

    function handleModToggle(mod: string) {
        const isIgnored = ignoredMods.includes(mod);
        if (isIgnored) {
            ignoredMods = ignoredMods.filter(m => m !== mod);
            manualEnabledMods.add(mod);
        } else {
            ignoredMods = [...ignoredMods, mod];
            manualEnabledMods.delete(mod);
        }
        updateCharacterAbils();
    }

    async function processFile(file: File) {
        const sampleFile = file.name;
        currentFileName = sampleFile;
        if (sampleFile.endsWith('.gz')) {
            sample = await readGZ(file);
        } else if (sampleFile.endsWith('.json')) {
            sample = await readJSON(file);
        } else {
            alert('Unsupported file type.');
            return;
        }

        if (!sample) return;

        ignoredMods = [];
        manualEnabledMods = new Set();
        charNames = sample.character_details?.map(detail => detail.name) ?? [];
        charName = charNames[0] ?? '';

        if (sample.character_details) {
            characterElements = {};
            for (const character of sample.character_details) {
                characterElements[character.name] = character.element.toLowerCase();
            }
        }

        if (charName) {
            updateCharacterAbils();
        }
    }

    function updateHighlightedJson() {
        if (target) {
            target.name = configName || 'Powered by DarkJake';
            const jsonString = JSON.stringify(target, null, 2);
            highlightedJson = Prism.highlight(jsonString, Prism.languages.json, 'json');
        }
    }

    function handleCopy() {
        showNotification('Copied to clipboard!', '✓', 2000);
    }

    $: if (target) {
        updateHighlightedJson();
    }

    $: ignoredMods = ignoredMods.filter(mod => availabledMods.includes(mod));

    $: if (configName) {
        updateHighlightedJson();
    }
</script>

<svelte:head>
    <title>GCSim to GO-MultiOpt</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&family=Press+Start+2P&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<div class="layout">
    <main>
        <header class="hero-header">
            <h1 class="gradient-animated-title">GCSim to GO-MultiOpt</h1>
            <p class="hero-subtitle">
                Transform gcsim combat simulations into optimized multi-target configurations in seconds
            </p>
            <div class="credit">
                Enhanced by
                <a
                    href="https://discord.com/users/723426524585525300"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <code>DarkJake#6238</code>
                </a>
            </div>
        </header>

        <UploadDropZone
            {sample}
            {currentFileName}
            onFileSelected={processFile}
        />

        <CharacterControls
            {charNames}
            bind:charName
            bind:configName
            {characterElements}
            {elementIcons}
            {elementColors}
            onGenerate={updateCharacterAbils}
        />

        <ModifierFilters
            {availabledMods}
            bind:ignoredMods
            {customDescItems}
            onModToggle={handleModToggle}
            onMouseEnterInfo={handleMouseEnter}
            onMouseMoveInfo={handleMouseMove}
            onMouseLeaveInfo={handleMouseLeave}
        />

        <ErrorViewer
            {errors}
            {errorContexts}
            bind:addConvert
        />

        <OutputViewer
            {target}
            {highlightedJson}
            {charName}
            onCopy={handleCopy}
        />

        <Toast show={showToast} message={toastMessage} icon={toastIcon} />

        {#if isNeonTheme}
            <AudioPlayer
                {isPlaying}
                {currentTrackIndex}
                totalTracks={audioFiles.length}
                {isMuted}
                onTogglePlay={toggleAudio}
                onNextTrack={nextTrack}
                onPrevTrack={prevTrack}
                onToggleMute={toggleMute}
                onExitTheme={toggleNeonTheme}
            />
        {/if}

        <Tooltip
            show={showTooltip}
            x={tooltipX}
            y={tooltipY}
        />

        {#if showBuildCardsPromo && !showWelcomeOverlay}
            <BuildCardsPromoOverlay
                promoUrl={buildCardsPromoUrl}
                demoImage="/gcsim-to-multiopt/Mavuika_build.png"
                on:close={() => {
                    showBuildCardsPromo = false;
                }}
            />
        {/if}
    </main>

    {#if showWelcomeOverlay}
        <WelcomeOverlay
            on:close={() => {
                showWelcomeOverlay = false;
            }}
        />
    {/if}

    <Footer />
</div>

<style lang="scss">
    :global(body) {
        margin: 0;
        background-color: #0b0e14;
        background-image: 
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.08) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(56, 189, 248, 0.08) 0px, transparent 50%),
            radial-gradient(at 50% 50%, rgba(15, 23, 42, 0.5) 0px, transparent 100%);
        background-attachment: fixed;
        color: #f1f5f9;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
            Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    :global(body.christmas-theme) {
        background-color: transparent !important;
        background-image: none !important;
    }

    :global(body.halloween-theme) {
        background-image: none !important;
    }

    .layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    main {
        flex: 1;
        width: 100%;
        max-width: 1100px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem 3rem;
        box-sizing: border-box;
    }

    .hero-header {
        text-align: center;
        margin-bottom: 2.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;

        .gradient-animated-title {
            font-size: 3rem;
            font-weight: 800;
            letter-spacing: -0.025em;
            background: linear-gradient(135deg, #ffffff 0%, #c7d2fe 35%, #38bdf8 65%, #f472b6 100%);
            background-size: 300% 300%;
            animation: gradient-move 8s ease infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0 0 0.85rem 0;
            filter: drop-shadow(0 2px 10px rgba(99, 102, 241, 0.25));
        }

        .hero-subtitle {
            font-size: 1.1rem;
            color: #94a3b8;
            max-width: 620px;
            margin: 0 0 1.25rem 0;
            line-height: 1.6;
        }
    }

    .credit {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.85rem;
        color: #94a3b8;
        padding: 0.35rem 0.85rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        transition: all 0.3s ease;

        a {
            text-decoration: none;

            code {
                font-family: 'Fira Code', monospace;
                color: #38bdf8;
                font-weight: 600;
                transition: color 0.2s ease;
            }

            &:hover code {
                color: #a5b4fc;
                text-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
            }
        }

        &:hover {
            border-color: rgba(99, 102, 241, 0.4);
            background: rgba(99, 102, 241, 0.1);
        }
    }

    @keyframes gradient-move {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
</style>
