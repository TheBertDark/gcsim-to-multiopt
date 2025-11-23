<script lang="ts">
    import { copy } from 'svelte-copy';
    import { onMount, afterUpdate } from 'svelte';
    import Prism from 'prismjs';
    import 'prismjs/themes/prism-tomorrow.css';
    import 'prismjs/components/prism-json';

    import { readGZ, readJSON } from '$lib';
    import { getCharacterAbils, getCustomDescription } from '$lib/gcsim-to-multiopt';
    import { applyNoteStyling } from '$lib/gcsim-to-multiopt/config/custom_descriptions';
    import { convertAbils } from '$lib/gcsim-to-multiopt/convert';
    import getAbilities from '$lib/gcsim-to-multiopt/config/abil_name';
    import statNameConvert from '$lib/gcsim-to-multiopt/config/stat_name';
    import resistNameConvert from '$lib/gcsim-to-multiopt/config/resist_name';
    import { abilityDescriptions } from '$lib/gcsim-to-multiopt/config/ability_descriptions';

    import type { Sample } from '$lib/gcsim-to-multiopt/gcsim_types';
    import type { CustomMultiTarget } from '$lib/gcsim-to-multiopt/go_types';

    import { initKonamiCode } from '$lib/utils/konamiCode';
    import themeManager from '$lib/utils/themeManager.js';
    import halloweenTester from '$lib/utils/halloweenTester.js';
    import christmasTester from '$lib/utils/christmasTester';
    import PauseIcon from '$lib/components/PauseIcon.svelte';
    import PlayIcon from '$lib/components/PlayIcon.svelte';
    import WelcomeOverlay from '$lib/components/WelcomeOverlay.svelte';

    // Import element icons
    import AnemoIcon from '$lib/icons/AnemoIcon.svelte';
    import CryoIcon from '$lib/icons/CryoIcon.svelte';
    import DendroIcon from '$lib/icons/DendroIcon.svelte';
    import ElectroIcon from '$lib/icons/ElectroIcon.svelte';
    import GeoIcon from '$lib/icons/GeoIcon.svelte';
    import HydroIcon from '$lib/icons/HydroIcon.svelte';
    import PyroIcon from '$lib/icons/PyroIcon.svelte';

    let isNeonTheme = false;
    let isPlaying = false;
    let decryptSound: HTMLAudioElement;
    let audio: HTMLAudioElement | null = null;
    const audioFiles = [
        '/gcsim-to-multiopt/sound1.mp3',
        '/gcsim-to-multiopt/sound2.mp3',
        '/gcsim-to-multiopt/sound3.mp3',
        '/gcsim-to-multiopt/sound4.mp3',
    ];

    // Dynamic character to element mapping from loaded file
    let characterElements: Record<string, string> = {};

    // Element colors
    const elementColors: Record<string, string> = {
        anemo: '#61DBBB',
        cryo: '#4FC3F7',
        dendro: '#A5C83B',
        electro: '#AB47BC',
        geo: '#F8BA4E',
        hydro: '#5680FF',
        pyro: '#FF3C32',
    };

    // Get current character element
    $: currentElement = characterElements[charName?.toLowerCase()] || 'anemo';

    // Element icon components mapping
    const elementIcons: Record<string, any> = {
        anemo: AnemoIcon,
        cryo: CryoIcon,
        dendro: DendroIcon,
        electro: ElectroIcon,
        geo: GeoIcon,
        hydro: HydroIcon,
        pyro: PyroIcon,
    };

    // Get current element icon component
    $: currentElementIcon = elementIcons[currentElement];

    interface ErrorContext {
        message: string;
        raw?: any;
        suggestion?: string;
    }

    let sample: Sample | null = null;
    let charName = '';
    let charNames: string[] = [];
    let ignoredMods: string[] = [];
    let availabledMods: string[] = [];
    // Mods that the user has decided to enable even though they are ignored by default
    let manualEnabledMods: Set<string> = new Set();
    import { computeDefaultIgnored } from '$lib/gcsim-to-multiopt/config/default_ignored_mods';
    let target: CustomMultiTarget | null = null;
    // Visible note with character-specific recommendations for the UI
    let customDescNote: string = '';
    $: customDescItems = (customDescNote || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
    let errors: string[] = [];
    let errorContexts: ErrorContext[] = [];
    let addConvert = '';
    let highlightedJson = '';
    let isDragging = false;
    let currentFileName = '';
    let expandedErrors: Set<number> = new Set();
    let showToast = false;
    let toastTimeout: ReturnType<typeof setTimeout>;
    let configName = '';
    let showWelcomeOverlay = true;

    // Variables para el tooltip
    let tooltipX = 0;
    let tooltipY = 0;
    let showTooltip = false;
    let tooltipTimeout: ReturnType<typeof setTimeout> | null = null;
    let arrowPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'top-left';

    (globalThis as any).abilityDescriptions = abilityDescriptions;

    // Funciones para el tooltip
    function handleMouseEnter(event: MouseEvent) {
        // Limpiar cualquier timeout pendiente
        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = null;
        }

        // Mostrar tooltip inmediatamente
        showTooltip = true;
        updateTooltipPosition(event);
    }

    function handleMouseMove(event: MouseEvent) {
        if (showTooltip) {
            updateTooltipPosition(event);
        }
    }

    function handleMouseLeave() {
        // Usar un pequeño delay para evitar parpadeos
        tooltipTimeout = setTimeout(() => {
            showTooltip = false;
            tooltipTimeout = null;
        }, 50);
    }

    function updateTooltipPosition(event: MouseEvent) {
        // Posicionar el tooltip en la esquina superior derecha del cursor
        tooltipX = event.clientX + 15; // 15px a la derecha del cursor
        tooltipY = event.clientY - 15; // 15px arriba del cursor

        // Ajustar si el tooltip se sale de la pantalla
        const tooltipWidth = 320;
        const tooltipHeight = 200; // altura aproximada

        let originX = 'left';
        let originY = 'top';

        if (tooltipX + tooltipWidth > window.innerWidth) {
            tooltipX = event.clientX - tooltipWidth - 15; // Mover a la izquierda
            originX = 'right';
        }

        if (tooltipY < 0) {
            tooltipY = event.clientY + 15; // Mover abajo del cursor
            originY = 'bottom';
        }

        // Establecer el transform-origin dinámicamente para el efecto globo
        const tooltipElement = document.querySelector('.tooltip') as HTMLElement;
        if (tooltipElement) {
            tooltipElement.style.transformOrigin = `${originX} ${originY}`;
        }

        // Actualizar la posición de la flecha
        if (originY === 'top' && originX === 'left') {
            arrowPosition = 'top-left';
        } else if (originY === 'top' && originX === 'right') {
            arrowPosition = 'top-right';
        } else if (originY === 'bottom' && originX === 'left') {
            arrowPosition = 'bottom-left';
        } else {
            arrowPosition = 'bottom-right';
        }
    }

    function toggleError(index: number) {
        if (expandedErrors.has(index)) {
            expandedErrors.delete(index);
        } else {
            expandedErrors.add(index);
        }
        expandedErrors = expandedErrors; // trigger reactivity
    }

    onMount(() => {
        // Initialize the Halloween theme manager
        if (typeof window !== 'undefined') {
            // Initialize the theme manager first
            themeManager.init();
            // Then force the theme check
            themeManager.forceThemeCheck();
            
            // Aplicar tema según la temporada actual (no forzar Halloween)
            console.log('🔄 Verificando tema según temporada actual...');

            // Verify the theme status after a short delay
            setTimeout(() => {
                console.log('🎃 Theme status:', {
                    currentTheme: themeManager.getCurrentTheme(),
                    bodyHasClass: document.body.classList.contains('halloween-theme'),
                    htmlHasClass: document.documentElement.classList.contains('halloween-theme'),
                    cssLoaded: !!document.getElementById('halloween-theme-css'),
                });
            }, 1000);
        }

        const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
        audio = new Audio(randomAudioFile);
        audio.volume = 0.3;
        audio.loop = true;

        const decryptSound = new Audio('/gcsim-to-multiopt/decrypt.mp3');
        decryptSound.volume = 0.3;

        let revealInterval: NodeJS.Timeout | null = null;

        initKonamiCode(() => {
            console.log('¡Konami Code activado!');
            isNeonTheme = true;

            document.body.classList.add('neon-retro-theme');
            console.log('Estado isNeonTheme:', isNeonTheme); // Depuración
            if (audio) {
                audio.play().catch(error => {
                    console.error('Error al reproducir el audio:', error);
                });
                isPlaying = true; // Actualizar el estado
            }
        });

        if (target) {
            updateHighlightedJson();
        }

        // --- EFECTO DE TEXTO HACKER + SONIDO ---
        const hintElement = document.getElementById('hintMessage');
        const message =
            'Ancient patterns echo through pixels past... A famous sequence that saved lives in 8 bits... Can you bring it back to life?';
        const chars = '!<>-_\\/[]{}—=+*^?#________';

        const hintArea = document.querySelector('.hint-area');
        if (hintElement && hintArea) {
            hintArea.addEventListener('mouseenter', () => {
                // Reiniciar sonido y animación
                if (revealInterval) clearInterval(revealInterval);
                decryptSound.pause();
                decryptSound.currentTime = 0;
                decryptSound.play().catch(e => console.error('Audio error:', e));

                let frame = 0;
                const interval = 40;

                revealInterval = setInterval(() => {
                    let output = '';
                    for (let i = 0; i < message.length; i++) {
                        if (i < frame) {
                            output += message[i];
                        } else {
                            output += chars[Math.floor(Math.random() * chars.length)];
                        }
                    }
                    hintElement.textContent = output;
                    frame++;

                    if (frame > message.length) {
                        if (revealInterval) clearInterval(revealInterval);
                        hintElement.textContent = message;
                        decryptSound.pause();
                    }
                }, interval);
            });

            hintArea.addEventListener('mouseleave', () => {
                if (revealInterval) clearInterval(revealInterval);
                decryptSound.pause();
            });
        }

        return () => {
            if (toastTimeout) clearTimeout(toastTimeout);
            if (audio) {
                audio.pause();
                audio = null;
            }
            decryptSound.pause();
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
                    spanBefore.style.setProperty('color', 'hsl(76, 100%, 50%)', 'important'); // Amarillo claro
                    spanBefore.style.setProperty('font-style', 'italic', 'important'); // Negrita

                    const spanLink = document.createElement('span');
                    spanLink.className = 'token string';
                    spanLink.textContent = url;
                    spanLink.style.setProperty('color', 'hsl(196, 100%, 60%)', 'important'); // Azul claro
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
                    spanAfter.style.setProperty('color', 'hsl(76, 100%, 50%)', 'important'); // Amarillo claro
                    spanAfter.style.setProperty('font-style', 'italic', 'important'); // Negrita

                    parent.replaceChild(spanBefore, span);
                    parent.insertBefore(spanLink, spanBefore.nextSibling);
                    parent.insertBefore(spanAfter, spanLink.nextSibling);
                }
            }
        });
    });

    function toggleAudio() {
        if (!audio) return;

        if (isPlaying) {
            audio.pause(); // Detener el audio
        } else {
            audio.play().catch(error => {
                console.error('Error al reproducir el audio:', error);
            }); // Reanudar el audio
        }

        isPlaying = !isPlaying; // Alternar el estado
    }

    function updateCharacterAbils() {
        if (!sample) {
            return;
        }
        errors = [];
        errorContexts = [];
        // First pass to collect available mods
        const [_, modsFirstPass] = getCharacterAbils(sample, charName, ignoredMods);
        availabledMods = modsFirstPass;

        // Apply ignored defaults while respecting manual user overrides
        if (availabledMods.length > 0) {
            const defaultIgnored = computeDefaultIgnored(availabledMods);
            // Add ignored defaults except those the user manually enabled
            const toAdd = defaultIgnored.filter(m => !manualEnabledMods.has(m));
            if (toAdd.length > 0) {
                ignoredMods = Array.from(new Set([...ignoredMods, ...toAdd]));
            }
        }

        // Recompute abilities with the (possibly) updated ignoredMods
        const [abilities, mods, char] = getCharacterAbils(sample, charName, ignoredMods);
        availabledMods = mods;
        customDescNote = getCustomDescription(char) || '';

        if (abilities.length === 0) {
            // Clear the previous target and show "information not available" message
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
            customDescNote = '';
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

        // Crear contexto para cada error
        errorContexts = errors.map(error => {
            const context: ErrorContext = {
                message: error,
            };

            if (error.includes('Unknown ability')) {
                const abilityName = error.match(/"([^"]+)"/)?.[1];
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

    function handleDragEnter(e: DragEvent) {
        e.preventDefault();
        isDragging = true;
    }

    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        isDragging = false;
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
    }

    async function handleDrop(e: DragEvent) {
        e.preventDefault();
        isDragging = false;

        const file = e.dataTransfer?.files[0];
        if (!file) return;

        await processFile(file);
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

        if (!sample) {
            return;
        }
        // Reset ignored mods when loading a new sample file
        ignoredMods = [];
        manualEnabledMods = new Set();
        charNames = sample.character_details?.map(detail => detail.name) ?? [];
        charName = charNames[0] ?? '';

        // Extract character elements from the loaded file
        if (sample.character_details) {
            characterElements = {};
            for (const character of sample.character_details) {
                characterElements[character.name] = character.element.toLowerCase();
            }
        }
    }

    async function handleFileInput(
        event: Event & { currentTarget: EventTarget & HTMLInputElement }
    ) {
        const file = event.currentTarget.files?.[0];
        if (!file) return;

        await processFile(file);
    }

    function updateTarget() {
        if (!charName || !sample) return;

        const [abils, mods, char] = getCharacterAbils(sample, charName, ignoredMods);
        if (!abils || abils.length === 0) return;

        const [newTarget, errors] = convertAbils(abils, getAbilities(charName), char);
        if (errors.length > 0) {
            errorContexts = errors.map(err => ({
                message: err.message,
            }));
            target = null;
        } else if (newTarget) {
            errorContexts = [];
            target = newTarget;
            const customDesc = getCustomDescription(char);
            target.description = customDesc
                ? [customDesc, target.description].join('\n')
                : target.description;
            target.name = configName || 'Powered by DarkJake';
            customDescNote = customDesc || '';
            updateHighlightedJson();
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
        showToast = true;
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            showToast = false;
        }, 2000);
    }

    $: if (target) {
        updateHighlightedJson();
    }

    $: ignoredMods = ignoredMods.filter(mod => availabledMods.includes(mod));

    function showCopyToast() {
        showToast = true;
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            showToast = false;
        }, 2000);
    }

    $: if (configName) {
        updateHighlightedJson();
    }
</script>

<svelte:head>
    <title>GCSim to GO-MultiOpt</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Fira+Code&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<div class="layout">
    <main>
        <h1 class="gradient-animated-title">GCSim to GO-MultiOpt</h1>
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
        <div
            class="upload-section"
            class:dragging={isDragging}
            on:dragenter={handleDragEnter}
            on:dragleave={handleDragLeave}
            on:dragover={handleDragOver}
            on:drop={handleDrop}
            role="button"
            aria-label="Upload file zone"
            tabindex="0"
        >
            {#if sample == null}
                <span class="upload-icon">📁</span>
                <p class="upload-text">Drop your file here or click to upload</p>
                <p class="upload-hint">Run the sim, open the "Sample" tab and press "Download"</p>
            {:else}
                <div class="current-file">
                    <span class="file-name">{currentFileName}</span>
                    <span class="change-file">(click or drop to change file)</span>
                </div>
                <p class="upload-hint">Current file loaded and ready</p>
            {/if}
            <input type="file" accept=".gz,.json" on:change={handleFileInput} />
        </div>

        {#if sample == null}
            <div class="upload-image-container">
                <div class="image-wrapper">
                    <img
                        src="/gcsim-to-multiopt/GCSim-to-GO.png"
                        alt="Upload hint"
                        class="upload-image"
                    />
                    <!-- Área interactiva -->
                    <div class="hint-area"></div>
                    <!-- Mensaje oculto -->
                    <div id="hintMessage" class="hint-message"></div>
                </div>
            </div>
        {/if}

        {#if charNames.length > 0}
            <div class="controls">
                <div class="input-group">
                    <label for="configName">Config Name (optional)</label>
                    <input
                        type="text"
                        id="configName"
                        bind:value={configName}
                        placeholder="Enter configuration name"
                    />
                </div>

                <div class="input-group">
                    <label for="charSelect">Select Character</label>
                    <div
                        class="character-select-wrapper"
                        style="--element-color: {elementColors[currentElement]}"
                    >
                        <div class="element-icon-wrapper">
                            <svelte:component this={currentElementIcon} />
                        </div>
                        <select id="charSelect" bind:value={charName}>
                            {#each charNames as name}
                                <option value={name}
                                    >{name
                                        .split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ')}</option
                                >
                            {/each}
                        </select>
                    </div>
                </div>

                {#if sample != null}
                    <button on:click={updateCharacterAbils}>Generate</button>
                {/if}
            </div>
        {/if}

        {#if availabledMods.length > 0}
            <div class="section-header">
                <h2>Ignored Mods</h2>
                <span
                    class="info-icon"
                    role="button"
                    tabindex="0"
                    aria-label="Show information about ignored mods"
                    on:mouseenter={handleMouseEnter}
                    on:mousemove={handleMouseMove}
                    on:mouseleave={handleMouseLeave}>?</span
                >
                <div
                    class="tooltip"
                    class:show={showTooltip}
                    style="left: {tooltipX}px; top: {tooltipY}px;"
                >
                    <p><strong>What is this for?</strong></p>
                    <p style="text-align: justify">
                        Enable or disable specific mods to include or exclude them from the
                        configuration used for Genshin Optimizer.
                    </p>

                    <p class="tooltip-note">
                        <strong>Heads up:</strong> Some mods start disabled on purpose. This avoids
                        double-counting buffs that Genshin Optimizer already applies by default — for
                        example set bonuses with the suffix <code>-2pc</code> or passives tied to non-fixed stats like
                        <code>nahida-a4</code>.
                    </p>
                    <p class="tooltip-note">
                        You can enable any mod manually. Your choice persists while switching characters
                        for the current file and resets when you upload a new file.
                    </p>

                    <div class="tooltip-color-guide">
                        <div>
                            <span class="mod-box active"></span> Active Mod (Included)
                        </div>
                        <div>
                            <span class="mod-box inactive"></span> Inactive Mod (Ignored)
                        </div>
                    </div>
                </div>
            </div>

            {#if customDescItems.length > 0}
                <div class="custom-desc-note" aria-live="polite">
                    <span class="note-label">Note:</span>
                    <ul class="note-list">
                        {#each customDescItems as note}
                            <li>{@html applyNoteStyling(note)}</li>
                        {/each}
                    </ul>
                </div>
            {/if}

            <div class="mods-grid">
                {#each availabledMods as mod}
                    <div class="mod-item">
                        <input
                            type="checkbox"
                            bind:group={ignoredMods}
                            value={mod}
                            id={mod}
                            on:change={() => {
                                // Register manual override: if the mod is ignored by default and is now unchecked, add it to manualEnabledMods
                                const defaultIgnored = computeDefaultIgnored(availabledMods);
                                const isDefaultIgnored = defaultIgnored.includes(mod);
                                const isIgnored = ignoredMods.includes(mod);
                                if (isDefaultIgnored) {
                                    if (isIgnored) {
                                        // User decided to ignore it (keep default), remove override if it exists
                                        manualEnabledMods.delete(mod);
                                    } else {
                                        // User decided to enable it (remove default), register override
                                        manualEnabledMods.add(mod);
                                    }
                                }
                                updateCharacterAbils();
                            }}
                        />
                        <label for={mod}>{mod}</label>
                    </div>
                {/each}
            </div>
        {/if}

        {#if errors.length > 0}
            <div class="error-section">
                <h2>Errors</h2>
                <ul>
                    {#each errorContexts as error, i}
                        <li>
                            <div
                                class="error-header"
                                on:click={() => toggleError(i)}
                                role="button"
                                tabindex="0"
                                on:keydown={e => e.key === 'Enter' && toggleError(i)}
                            >
                                <span class="toggle-icon" class:expanded={expandedErrors.has(i)}
                                    >▶</span
                                >
                                {error.message}
                            </div>
                            <div class="error-details" class:expanded={expandedErrors.has(i)}>
                                <div class="error-content">
                                    {#if error.message.includes('Unknown ability')}
                                        This ability name was not found in the conversion map. You
                                        can add it manually below using the format:
                                        {#if error.raw}
                                            <div class="raw-data">
                                                <span class="label">Raw ability data:</span>
                                                {JSON.stringify(error.raw, null, 2)}
                                            </div>
                                            <div class="suggestion">
                                                Suggested fix: Add to the conversion map below:<br
                                                />
                                                "{error.raw.name}": ["type", "subtype"]
                                            </div>
                                        {/if}
                                    {:else if error.message.includes('Unknown stat')}
                                        This stat type is not recognized. Common stats are: atk,
                                        def, hp, cr, cd, dmg_bonus, etc.
                                        {#if error.raw}
                                            <div class="raw-data">
                                                <span class="label">Invalid stat:</span>
                                                {error.raw.stat}
                                                <span class="label">Valid stats:</span>
                                                {error.raw.validStats.join(', ')}
                                            </div>
                                        {/if}
                                    {:else if error.message.includes('Unknown element')}
                                        Invalid element type. Valid elements are: pyro, hydro,
                                        electro, cryo, dendro, anemo, geo, physical
                                        {#if error.raw}
                                            <div class="raw-data">
                                                <span class="label">Invalid element:</span>
                                                {error.raw.element}
                                                <span class="label">Valid elements:</span>
                                                {error.raw.validElements.join(', ')}
                                            </div>
                                        {/if}
                                    {:else if error.message.includes('No information available')}
                                        Character has no combat data in the loaded simulation file.
                                        {#if error.suggestion}
                                            <div class="suggestion">
                                                {error.suggestion}
                                            </div>
                                        {/if}
                                    {:else if error.suggestion}
                                        <div class="suggestion">
                                            {error.suggestion}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </li>
                    {/each}
                </ul>

                <p>You can manually add abilities that aren't on the site:</p>
                <textarea
                    id="addConvert"
                    bind:value={addConvert}
                    placeholder={`{
    "Normal 0": ["normal", "0"],
    "Bake-Kurage": ["skill", "dmg"],
    "Sea-Dyed Foam": ["artifact:OceanHuedClam", "heal"]
}`}
                ></textarea>
            </div>
        {/if}

        {#if target}
            <div class="result-section">
                <h2>Result</h2>
                <div class="result-container">
                    <pre><code class="language-json">{@html highlightedJson}</code></pre>
                    <button
                        class="copy-button"
                        use:copy={JSON.stringify(target, null, 2)}
                        on:click={handleCopy}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                            ></path>
                        </svg>
                        Copy to Clipboard
                    </button>
                </div>
            </div>
        {/if}

        <div class="toast-container">
            <div class="toast" class:show={showToast}>
                <span class="check-icon">✓</span>
                Copied to clipboard!
            </div>
        </div>

        <!-- Botón para detener/reanudar el audio -->
        {#if isNeonTheme}
            <div class="audio-control">
                <button on:click={toggleAudio}>
                    {#if isPlaying}
                        <PauseIcon width="24" height="24" />
                    {:else}
                        <PlayIcon width="24" height="24" />
                    {/if}
                </button>
            </div>
        {/if}
    </main>

    <!-- Overlay de bienvenida -->
    {#if showWelcomeOverlay}
        <WelcomeOverlay on:close={() => (showWelcomeOverlay = false)} />
    {/if}

    <footer>
        <div class="footer-inner">
            <div class="footer-main">
                <div class="footer-text">
                    <span>This application is a rework of </span>
                    <a
                        href="https://imring.github.io/gcsim-to-multiopt/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        imring.github.io/gcsim-to-multiopt/
                    </a>
                    <span>, enhancing the user experience.</span>
                </div>
                <div class="footer-separator"></div>
                <div class="footer-support">
                    <div class="support-title">Support me</div>
                    <div class="footer-icons">
                        <a
                            href="https://www.youtube.com/@animadogi"
                            target="_blank"
                            title="YouTube"
                            rel="noopener noreferrer"
                            class="footer-icon"
                            aria-label="YouTube"
                        >
                            <svg width="28" height="28" viewBox="0 0 461.001 461.001" fill="none">
                                <defs>
                                    <linearGradient id="yt-gradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#ff00cc">
                                            <animate
                                                attributeName="stop-color"
                                                values="#ff00cc;#3333ff;#00ffe7;#ff00cc"
                                                dur="6s"
                                                repeatCount="indefinite"
                                            ></animate>
                                        </stop>
                                        <stop offset="100%" stop-color="#00ffe7">
                                            <animate
                                                attributeName="stop-color"
                                                values="#00ffe7;#ff00cc;#3333ff;#00ffe7"
                                                dur="6s"
                                                repeatCount="indefinite"
                                            ></animate>
                                        </stop>
                                    </linearGradient>
                                </defs>
                                <path
                                    fill="url(#yt-gradient)"
                                    d="M365.257 67.393H95.744C42.866 67.393 0 110.259 0 163.137v134.728c0 52.878 42.866 95.744 95.744 95.744h269.513c52.878 0 95.744-42.866 95.744-95.744V163.137c0-52.878-42.866-95.744-95.744-95.744zm-64.751 169.663-126.06 60.123c-3.359 1.602-7.239-.847-7.239-4.568V168.607c0-3.774 3.982-6.22 7.348-4.514l126.06 63.881c3.748 1.899 3.683 7.274-.109 9.082z"
                                ></path>
                            </svg>
                        </a>
                        <a
                            href="https://ko-fi.com/darkjake"
                            target="_blank"
                            title="Ko-fi"
                            rel="noopener noreferrer"
                            class="footer-icon"
                            aria-label="Ko-fi"
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <defs>
                                    <linearGradient id="kofi-gradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stop-color="#00ffe7">
                                            <animate
                                                attributeName="stop-color"
                                                values="#00ffe7;#ff00cc;#3333ff;#00ffe7"
                                                dur="6s"
                                                repeatCount="indefinite"
                                            ></animate>
                                        </stop>
                                        <stop offset="100%" stop-color="#ff00cc">
                                            <animate
                                                attributeName="stop-color"
                                                values="#ff00cc;#3333ff;#00ffe7;#ff00cc"
                                                dur="6s"
                                                repeatCount="indefinite"
                                            ></animate>
                                        </stop>
                                    </linearGradient>
                                </defs>
                                <path
                                    fill="url(#kofi-gradient)"
                                    d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"
                                ></path>
                            </svg>
                        </a>
                        <a
                            href="https://discord.gg/excelverso-3-0-1104977284609343558"
                            target="_blank"
                            title="Discord"
                            rel="noopener noreferrer"
                            class="footer-icon"
                            aria-label="Discord"
                        >
                            <svg width="28" height="28" viewBox="0 -28.5 256 256" fill="none">
                                <defs>
                                    <linearGradient
                                        id="discord-gradient"
                                        x1="0"
                                        y1="0"
                                        x2="1"
                                        y2="1"
                                    >
                                        <stop offset="0%" stop-color="#ff00cc">
                                            <animate
                                                attributeName="stop-color"
                                                values="#ff00cc;#3333ff;#00ffe7;#ff00cc"
                                                dur="6s"
                                                repeatCount="indefinite"
                                            ></animate>
                                        </stop>
                                        <stop offset="100%" stop-color="#00ffe7">
                                            <animate
                                                attributeName="stop-color"
                                                values="#00ffe7;#ff00cc;#3333ff;#00ffe7"
                                                dur="6s"
                                                repeatCount="indefinite"
                                            ></animate>
                                        </stop>
                                    </linearGradient>
                                </defs>
                                <path
                                    fill="url(#discord-gradient)"
                                    d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z"
                                ></path>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    <style>
        footer {
            background: linear-gradient(
                90deg,
                rgba(30, 30, 60, 0.95) 0%,
                rgba(40, 20, 60, 0.95) 100%
            );
            color: #d1d5db;
            text-align: left;
            padding: 1rem 1rem 0.5rem 1rem;
            font-size: 1rem;
            font-style: italic;
            box-shadow: 0 -4px 24px 0 rgba(100, 108, 255, 0.16);
            border-top: 2px solid #646cff;
            backdrop-filter: blur(6px);
            position: relative;
            margin-top: 1rem;
            overflow: hidden;
        }
        .footer-inner {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: row;
            align-items: stretch;
            justify-content: space-between;
            gap: 2rem;
        }
        .footer-main {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 2rem;
        }
        .footer-text {
            font-family: 'Roboto', 'Inter', sans-serif;
            font-size: 1.05rem;
            color: #e4e5e7;
            margin-bottom: 0;
            flex: 1 1 auto;
            min-width: 0;
            white-space: pre-line;
            overflow-wrap: anywhere;
        }
        .footer-separator {
            width: 2px;
            min-height: 48px;
            background: linear-gradient(180deg, #646cff 0%, #42b883 100%);
            margin: 0 2rem;
            border-radius: 4px;
            opacity: 0.4;
        }
        .footer-support {
            display: flex;
            flex-direction: column;
            align-items: center; /* Cambiado de flex-end a center para centrar el texto y los iconos */
            gap: 0.5rem;
            min-width: 150px;
        }
        .support-title {
            color: #93c5fd;
            font-weight: 600;
            font-size: 1.08rem;
            margin-bottom: 0.25rem;
            letter-spacing: 0.5px;
            text-shadow: 0 0 8px #646cff44;
            text-align: center;
        }
        .footer-icons {
            display: flex;
            gap: 1.2rem;
            justify-content: center;
        }
        @media (max-width: 900px) {
            .footer-inner,
            .footer-main {
                flex-direction: column;
                align-items: flex-start;
                gap: 1.2rem;
            }
            .footer-support {
                align-items: center; /* Centrado también en responsive */
                width: 100%;
            }
            .footer-separator {
                display: none;
            }
            .footer-icons {
                justify-content: center;
            }
        }
        @media (max-width: 600px) {
            footer {
                padding: 1.2rem 0.5rem 0.7rem 0.5rem;
            }
            .footer-inner,
            .footer-main {
                gap: 0.7rem;
            }
            .footer-support {
                min-width: 0;
            }
            .footer-icons {
                gap: 0.7rem;
            }
        }
    </style>
</div>

<style lang="scss">
    :global(body) {
        margin: 0;
        background-color: #1a1b1e;
        color: #e4e5e7;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
            Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    /* Override body background when Christmas theme is active */
    :global(body.christmas-theme) {
        background-color: transparent !important;
    }

    main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    h1.gradient-animated-title {
        display: block;
        font-size: 2.5rem;
        font-weight: bold;
        background: linear-gradient(270deg, #ff00cc, #3333ff, #00ffe7, #ff00cc);
        background-size: 600% 600%;
        animation: icon-gradient-move 8s ease infinite;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
        text-align: center;
        margin-bottom: 2rem;
    }

    h2 {
        font-size: 1.5rem;
        margin: 2rem 0 1rem 0;
    }

    button {
        background: #646cff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s ease;

        &:hover {
            background: #7c82ff;
        }

        &:active {
            background: #4c53ff;
        }
    }

    :global(body.neon-retro-theme) footer {
        background: linear-gradient(90deg, #1a0032 0%, #0c003f 100%);
        color: #00ffe7;
        border-top: 2px solid #ff00ff;
        box-shadow:
            0 -4px 32px 0 #ff00ff55,
            0 -1px 16px 0 #00ffe799;
    }
    :global(body.neon-retro-theme) .footer-separator {
        background: linear-gradient(180deg, #ff00ff 0%, #00ffe7 100%);
        opacity: 0.5;
    }
    :global(body.neon-retro-theme) .support-title {
        color: #ff00ff;
        text-shadow:
            0 0 10px #ff00ff88,
            0 0 6px #00ffe799;
    }
    :global(body.neon-retro-theme) .footer-icon {
        color: #ff00ff;
        filter: drop-shadow(0 2px 16px #ff00ff22);
        transition:
            color 0.2s,
            filter 0.2s;
    }
    :global(body.neon-retro-theme) .footer-icon:hover {
        color: #00ffe7;
        filter: drop-shadow(0 2px 16px #00ffe799);
    }
    :global(body.neon-retro-theme) .footer-icon:active {
        transform: scale(0.98);
    }

    :global(body.neon-retro-theme) {
        background: #070410; /* Fondo oscuro */
        color: #00ffcc; /* Texto en color cian neón */
        font-family: 'Press Start 2P', monospace; /* Fuente pixelada */
        font-size: 0.8rem; /* Tamaño reducido */
        margin: 0;
        padding: 0;
        overflow-x: hidden; /* Evitar desbordamiento horizontal */
    }

    :global(body.neon-retro-theme h1),
    :global(body.neon-retro-theme h2),
    :global(body.neon-retro-theme h3) {
        font-size: 1.5rem; /* Tamaño reducido para encabezados */
        text-shadow:
            0 0 5px #ff00ff,
            0 0 10px #ff00ff,
            0 0 20px #ff00ff; /* Sombra de neón magenta */
    }

    :global(body.neon-retro-theme p) {
        font-size: 0.9rem; /* Tamaño reducido para párrafos */
        text-shadow:
            0 0 5px #00ffcc,
            0 0 10px #00ffcc,
            0 0 20px #00ffcc; /* Sombra de neón cian */
    }

    :global(body.neon-retro-theme button) {
        background: #ff00ff; /* Botón magenta */
        color: white;
        border: none;
        padding: 10px 20px;
        font-size: 1rem;
        border-radius: 5px;
        cursor: pointer;
        box-shadow:
            0 0 10px #ff00ff,
            0 0 20px #ff00ff; /* Sombra de neón */
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }

    :global(body.neon-retro-theme button:hover) {
        transform: scale(1.1);
        box-shadow:
            0 0 15px #ff00ff,
            0 0 30px #ff00ff; /* Sombra más intensa al pasar el mouse */
    }

    :global(body.neon-retro-theme button:active) {
        transform: scale(0.95);
    }

    :global(body.neon-retro-theme .neon-text) {
        font-size: 2rem;
        animation: flicker 1.5s infinite alternate;
    }

    @keyframes flicker {
        0% {
            text-shadow:
                0 0 5px #00ffcc,
                0 0 10px #00ffcc;
        }
        100% {
            text-shadow:
                0 0 10px #00ffcc,
                0 0 20px #00ffcc,
                0 0 40px #00ffcc,
                0 0 80px #00ffcc;
        }
    }

    :global(body.neon-retro-theme .upload-image-container) {
        text-align: center;
        margin-top: 1rem;
        position: relative;
    }

    :global(body.neon-retro-theme .image-wrapper) {
        position: relative;
        display: inline-block;
    }

    :global(body.neon-retro-theme .upload-image) {
        width: 500px;
        height: auto;
        border-radius: 8px;
        display: block;

        /* Efecto de borde neon */
        filter: drop-shadow(0 0 5px #011c36) drop-shadow(0 0 10px #011c36)
            drop-shadow(0 0 15px #011c36);
        transition:
            transform 0.3s ease,
            filter 0.3s ease;

        /* Animación al pasar el mouse (opcional) */
        &:hover {
            transform: scale(1.05);
            filter: drop-shadow(0 0 7.5px #011c36) drop-shadow(0 0 15px #011c36)
                drop-shadow(0 0 20px #011c36);
        }
    }

    .audio-control {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
    }

    .audio-control button {
        background: rgba(0, 0, 0, 0.5);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition:
            background 0.3s ease,
            transform 0.3s ease;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        padding: 0;
    }

    .audio-control button:hover {
        background: rgba(0, 0, 0, 0.8);
        transform: scale(1.1);
    }

    .audio-control button:active {
        transform: scale(0.95);
    }

    .upload-image-container {
        text-align: center;
        margin-top: 1rem;
        position: relative;
    }

    .image-wrapper {
        position: relative;
        display: inline-block;
    }

    .upload-image {
        filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.8));
        width: 500px;
        height: auto;
        border-radius: 8px;
        display: block;
        margin-left: auto;
        margin-right: auto;

        animation: jump 2s infinite;
    }

    @keyframes jump {
        0% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-5px);
        }
        100% {
            transform: translateY(0);
        }
    }

    .hint-area {
        position: absolute;
        top: 20%;
        left: 30%;
        width: 40%;
        height: 20%;
        background: rgba(255, 255, 255, 0);
        border-radius: 8px;
        cursor: pointer;
        opacity: 0;
        transition:
            background 0.4s ease,
            opacity 0.3s ease;
        overflow: hidden;
    }

    .hint-area::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(0, 255, 204, 0.2);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        opacity: 0;
        transition: none;
    }

    .hint-area:hover::after {
        animation: radarPing 1.5s infinite ease-out;
    }

    @keyframes radarPing {
        0% {
            width: 0;
            height: 0;
            opacity: 0.6;
        }
        70% {
            width: 200%;
            height: 200%;
            opacity: 0;
        }
        100% {
            opacity: 0;
        }
    }

    .hint-message {
        position: absolute;
        bottom: -3rem;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        color: #00ffcc;
        padding: 0.6rem 1rem;
        border-radius: 5px;
        font-size: 0.9rem;
        opacity: 0;
        pointer-events: none;
        white-space: nowrap;
        overflow: hidden;
        font-family: 'Share Tech Mono', monospace;
        box-shadow: 0 0 10px rgba(0, 255, 204, 0.4);

        transition: opacity 0.4s ease;
    }

    .hint-area:hover + .hint-message {
        opacity: 1;
    }

    @keyframes glitchReveal {
        from {
            width: 0;
        }
        to {
            width: 100%;
        }
    }

    @keyframes flicker {
        0%,
        100% {
            opacity: 1;
            text-shadow:
                0 0 5px #00ffcc,
                0 0 10px #00ffcc;
        }
        20% {
            opacity: 0.8;
        }
        40% {
            opacity: 0.5;
        }
        60% {
            opacity: 0.9;
            text-shadow:
                0 0 2px #00ffcc,
                0 0 5px #00ffcc;
        }
        80% {
            opacity: 0.6;
        }
    }

    .upload-section {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        margin-bottom: 2rem;
        border: 2px dashed rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;

        &:hover,
        &.dragging {
            border-color: #646cff;
            background: rgba(255, 255, 255, 0.1);
        }

        .current-file {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 0.5rem;

            .file-name {
                color: #e4e5e7;
                font-weight: 500;
                word-break: break-all;
            }

            .change-file {
                color: #646cff;
                font-size: 0.9rem;
                opacity: 0.8;
                transition: opacity 0.2s ease;

                &:hover {
                    opacity: 1;
                }
            }
        }

        p {
            margin-bottom: 1rem;
            color: #a1a1aa;
        }

        input[type='file'] {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            opacity: 0;
            cursor: pointer;
        }

        .upload-icon {
            display: block;
            font-size: 2rem;
            color: #646cff;
            margin-bottom: 1rem;
        }

        .upload-text {
            color: #e4e5e7;
            margin-bottom: 0.5rem;
        }

        .upload-hint {
            font-size: 0.9rem;
            color: #a1a1aa;
        }
    }

    .controls {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;

        label {
            min-width: 100px;
        }
    }

    select,
    input[type='file'] {
        background: #2c2c2c;
        border: 1px solid #3f3f3f;
        color: #fff;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 1rem;
        transition: all 0.2s ease;

        &:hover {
            border-color: #646cff;
        }

        &:focus {
            outline: none;
            border-color: #646cff;
            box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
        }
    }

    .mods-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        margin: 1rem 0;
        padding: 0.5rem;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
    }

    .mod-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border-radius: 8px;
        transition: all 0.2s ease;
        background: rgba(255, 255, 255, 0.03);
        min-height: 40px;
    }

    .mod-item input[type='checkbox'] {
        display: none;
    }

    .mod-item label {
        padding: 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 0.9rem;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .mod-item input[type='checkbox']:checked + label {
        background-color: hsla(3, 100%, 60%, 0.531);
        color: white;
    }

    .mod-item input[type='checkbox']:not(:checked) + label {
        background-color: hsla(120, 39%, 45%, 0.531);
        color: white;
    }

    .mod-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .custom-desc-note {
        margin: 0.75rem 0 1rem;
        padding: 1rem;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(39, 41, 54, 0.65) 0%, rgba(28, 29, 39, 0.6) 100%);
        font-size: 0.95rem;
        color: #e6e7ff;
        border: 1px solid rgba(100, 108, 255, 0.35);
        box-shadow: 0 6px 18px rgba(100, 108, 255, 0.15);
        display: flex;
        align-items: flex-start;
        gap: 0.8rem;
    }

    .custom-desc-note .note-label {
        font-weight: 600;
        margin-right: 0.5rem;
        color: #c9cbff;
        flex-shrink: 0;
        background: rgba(100, 108, 255, 0.16);
        border: 1px solid rgba(100, 108, 255, 0.35);
        padding: 0.25rem 0.6rem;
        border-radius: 999px;
    }

    .custom-desc-note .note-list {
        margin: 0.1rem 0 0;
        padding-left: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        list-style: none;
    }

    .custom-desc-note .note-list li {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0.6rem 0.75rem;
        border-radius: 10px;
        background: rgba(100, 108, 255, 0.08);
        border: 1px solid rgba(100, 108, 255, 0.25);
        color: #e6e7ff;
        line-height: 1.45;
        white-space: normal;
        word-break: break-word;
        overflow-wrap: anywhere;
        box-sizing: border-box;
        max-width: 100%;
    }

    .custom-desc-note .note-list li::before {
        content: 'i';
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        font-size: 12px;
        font-weight: 700;
        color: #1c1d27;
        background: #c9cbff;
        border: 1px solid rgba(100, 108, 255, 0.45);
        border-radius: 999px;
        flex-shrink: 0;
    }

    /* Tag styles inside notes (global because content se inserta con {@html}) */
    .custom-desc-note :global(.note-strong) {
        font-weight: 700 !important;
        color: #ffffff !important;
        display: inline;
        line-height: inherit;
        white-space: normal;
        overflow-wrap: break-word;
        vertical-align: baseline;
    }
    .custom-desc-note :global(.note-emphasis) {
        color: #9adcf8 !important;
        font-style: normal !important;
        // text-decoration: underline dotted rgba(154, 220, 248, 0.6);
        text-underline-offset: 3px;
        display: inline;
        line-height: inherit;
        white-space: nowrap;
        vertical-align: baseline;
    }
    .custom-desc-note :global(.note-highlight) {
        background: rgba(255, 223, 88, 0.18);
        border: 1px solid rgba(255, 223, 88, 0.35);
        border-radius: 6px;
        padding: 0.05rem 0.2rem;
        color: #fff2a0 !important;
        font-weight: 600 !important;
        display: inline;
        line-height: inherit;
        white-space: nowrap; /* evita salto dentro del resaltado */
        vertical-align: baseline;
        box-decoration-break: clone;
    }
    .custom-desc-note :global(.note-warning) {
        color: #ff7b7b !important;
        font-weight: 700 !important;
        // text-decoration: underline rgba(255, 123, 123, 0.6);
        text-underline-offset: 3px;
        display: inline;
        line-height: inherit;
        white-space: nowrap;
        vertical-align: baseline;
    }
    .custom-desc-note :global(.note-important) {
        color: #ffd3d3 !important;
        font-weight: 700 !important;
        border-bottom: 2px solid rgba(255, 87, 87, 0.6);
        padding-bottom: 0.05rem;
        display: inline;
        line-height: inherit;
        white-space: normal;
        overflow-wrap: anywhere;
        vertical-align: baseline;
    }
    .custom-desc-note :global(.note-underline) {
        text-decoration: underline !important;
        text-underline-offset: 3px;
        display: inline;
        line-height: inherit;
        white-space: normal;
        overflow-wrap: anywhere;
        vertical-align: baseline;
    }

    .error-section {
        background: rgba(255, 87, 87, 0.1);
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;

        ul {
            margin: 0.5rem 0;
            padding-left: 1.5rem;
            list-style: none;

            li {
                color: #ff5757;
                margin-bottom: 0.75rem;
                position: relative;

                &::before {
                    content: '⚠️';
                    position: absolute;
                    left: -1.5rem;
                }

                .error-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;

                    &:hover {
                        opacity: 0.9;
                    }

                    .toggle-icon {
                        font-size: 0.8rem;
                        color: #e4e5e7;
                        transition: transform 0.3s ease;
                        display: inline-block;
                        width: 1rem;
                        text-align: center;

                        &.expanded {
                            transform: rotate(90deg);
                        }
                    }
                }

                .error-details {
                    overflow: hidden;
                    max-height: 0;
                    opacity: 0;
                    transition:
                        max-height 0.3s ease,
                        opacity 0.3s ease,
                        margin 0.3s ease;
                    margin-top: 0;

                    &.expanded {
                        max-height: none;
                        opacity: 1;
                        margin-top: 0.5rem;
                    }

                    .error-content {
                        color: #e4e5e7;
                        font-size: 0.9rem;
                        padding: 0 0 0.5rem 1.5rem;
                        border-left: 2px solid #e13238;

                        .raw-data {
                            margin-top: 1rem;
                            background: rgba(0, 0, 0, 0.2);
                            padding: 0.75rem;
                            border-radius: 4px;
                            font-family: 'Fira Code', monospace;
                            font-size: 0.85rem;
                            white-space: pre-wrap;

                            .label {
                                color: #a1a1aa;
                                display: block;
                                margin-bottom: 0.5rem;
                            }
                        }

                        .suggestion {
                            margin-top: 1rem;
                            padding: 0.5rem;
                            background: #646cff1a;
                            border-radius: 4px;
                            border-left: 2px solid #646cff;
                        }
                    }
                }
            }
        }

        p {
            color: #e4e5e7;
            margin: 1rem 0 0.5rem 0;
        }
    }

    textarea {
        width: 100%;
        min-height: 150px;
        background: #2c2c2c;
        border: 1px solid #3f3f3f;
        color: #fff;
        padding: 1rem;
        border-radius: 6px;
        font-family: 'Fira Code', monospace;
        margin: 1rem 0;
        resize: vertical;
        box-sizing: border-box;

        &:focus {
            outline: none;
            border-color: #646cff;
            box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
        }

        &::placeholder {
            color: rgba(255, 255, 255, 0.3);
        }
    }

    .result-section {
        background: rgba(66, 184, 131, 0.1);
        border-radius: 12px;
        padding: 2rem;
        margin: 2rem 0;

        h2 {
            margin: 0 0 1rem 0;
        }

        .result-container {
            position: relative;

            pre {
                margin: 0;
                border-radius: 8px;
                max-height: 400px;
                overflow-y: auto;
                background: #2c2c2c;
                padding: 1rem;
                font-family: 'Fira Code', monospace;
                border: 1px solid rgba(0, 184, 131, 0.3);

                /* Estilo para Firefox */
                scrollbar-width: thin;
                scrollbar-color: rgba(66, 184, 131, 0.5) rgba(44, 44, 44, 0.3);

                /* Estilo para Chrome/Safari/Edge */
                &::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                &::-webkit-scrollbar-track {
                    background: rgba(44, 44, 44, 0.3);
                    border-radius: 4px;
                }

                &::-webkit-scrollbar-thumb {
                    background: rgba(66, 184, 131, 0.5);
                    border-radius: 4px;
                    transition: background 0.2s ease;

                    &:hover {
                        background: rgba(66, 184, 131, 0.7);
                    }
                }

                &::-webkit-scrollbar-corner {
                    background: transparent;
                }
            }

            .copy-button {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: linear-gradient(135deg, #00ffe7 0%, #646cff 100%);
                color: #1a1b1e;
                border: 1px solid #00ffe7;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 1rem;
                text-shadow: none;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                z-index: 1;

                &:hover {
                    background: linear-gradient(135deg, #646cff 0%, #00ffe7 100%);
                    color: #e4e5e7;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 255, 231, 0.4);
                }

                &:active {
                    transform: translateY(0px) scale(0.98);
                }
            }
        }
    }

    .toast-container {
        position: fixed;
        bottom: 2rem;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        pointer-events: none;
        z-index: 1000;
    }

    .toast {
        background: rgba(23, 23, 23, 0.9);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        background-clip: padding-box;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        color: #e4e5e7;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translateY(1rem);
        transition:
            opacity 0.2s ease,
            transform 0.2s ease;

        &.show {
            opacity: 1;
            transform: translateY(0);
        }

        .check-icon {
            color: #4ade80;
        }
    }

    :global(code[class*='language-']) {
        text-shadow: none !important;
    }

    :global(pre[class*='language-']) {
        text-shadow: none !important;
    }

    :global(.token.property) {
        color: hsl(125, 100%, 60%) !important;
    }

    :global(.token.property:has(+ .token.operator + .token.punctuation + .token.property)) {
        color: hsl(339, 100%, 60%) !important;
    }

    :global(
            .token.property:has(
                    + .token.operator
                        + .token.punctuation
                        + .token.property:has(
                            + .token.operator + .token.punctuation + .token.property
                        )
                )
        ) {
        color: hsl(4, 100%, 60%) !important;
    }

    :global(.token.property:has(+ .token.operator + .token.number)) {
        color: hsl(36, 100%, 60%) !important;
    }

    :global(.token.string) {
        color: hsl(187, 100%, 60%) !important;
    }

    :global(.token.number) {
        color: hsl(59, 100%, 60%) !important;
    }

    :global(.token.punctuation) {
        color: hsl(302, 100%, 60%) !important;
    }

    :global(.token.operator) {
        color: #c9d1d9 !important;
    }

    :global(.token.boolean) {
        color: #ff1100 !important;
    }

    .section-header {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .info-icon {
        display: inline-flex;
        width: 16px;
        height: 16px;
        background: linear-gradient(135deg, #646cff, #747bff);
        border-radius: 50%;
        color: white;
        font-size: 0.7rem;
        font-weight: bold;
        align-items: center;
        justify-content: center;
        cursor: help;
        position: relative;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(100, 108, 255, 0.3);
    }

    .info-icon:hover {
        transform: scale(1.1);
        background: linear-gradient(135deg, #747bff, #646cff);
        box-shadow: 0 4px 8px rgba(100, 108, 255, 0.4);
    }

    .tooltip {
        position: fixed;
        background: linear-gradient(145deg, rgba(25, 25, 35, 0.97), rgba(15, 15, 25, 0.97));
        color: #f5f5f5;
        padding: 1.2rem;
        border-radius: 16px;
        font-size: 0.85rem;
        line-height: 1.6;
        white-space: normal;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: scale(0.3);
        transform-origin: top left;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        width: 320px;
        max-width: 90vw;
        box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(100, 108, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(100, 108, 255, 0.15);
    }

    .tooltip.show {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: scale(1);
    }

    .tooltip p {
        margin-bottom: 0.8rem;
        color: #e8e8e8;
    }

    .tooltip p:last-child {
        margin-bottom: 0;
    }

    .tooltip strong {
        color: #ffffff;
        font-weight: 600;
    }

    .tooltip-note {
        font-size: 0.75rem;
        color: #b8b8b8;
        font-style: italic;
        border-top: 1px solid rgba(100, 108, 255, 0.2);
        padding-top: 0.7rem;
        margin-top: 0.7rem;
        background: rgba(100, 108, 255, 0.05);
        padding: 0.7rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
    }

    .tooltip-color-guide {
        display: flex;
        flex-direction: column;
        margin-top: 0.8rem;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.2);
        padding: 0.8rem;
        border-radius: 8px;
        border: 1px solid rgba(100, 108, 255, 0.1);
    }

    .tooltip-color-guide > div {
        display: flex;
        align-items: center;
        font-size: 0.8rem;
        color: #d0d0d0;
    }

    .mod-box {
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        margin-right: 0.7rem;
        vertical-align: middle;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.2s ease;
    }

    .mod-box.active {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
    }

    .mod-box.inactive {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
    }

    .input-group {
        margin-bottom: 1rem;

        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #e4e5e7;
            font-size: 0.9rem;
        }

        input[type='text'],
        select {
            width: 100%;
            padding: 0.5rem;
            border-radius: 6px;
            border: 1px solid #3f3f3f;
            background: #2c2c2c;
            color: #fff;
            font-size: 0.9rem;
            transition: border-color 0.2s ease;

            &:focus {
                outline: none;
                border-color: #646cff;
            }

            &::placeholder {
                color: rgba(255, 255, 255, 0.3);
            }
        }
    }

    .character-select-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        background: #2c2c2c;
        border: 1px solid #3f3f3f;
        border-radius: 6px;
        transition: all 0.3s ease;
        overflow: hidden;
    }

    .character-select-wrapper:focus-within {
        border-color: var(--element-color);
        box-shadow: 0 0 0 2px rgba(var(--element-color-rgb), 0.2);
    }

    .element-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        background: var(--element-color);
        color: white;
        min-width: 40px;
        height: 100%;
    }

    .element-icon-wrapper :global(svg) {
        width: 20px;
        height: 20px;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    }

    .character-select-wrapper select {
        border: none;
        background: #2c2c2c;
        flex: 1;
        padding-left: 0.75rem;
        margin: 0;
    }

    .character-select-wrapper select:focus {
        border: none;
        outline: none;
    }

    .credit {
        font-size: 0.85rem;
        color: #d1d5db;
        text-align: center;
        margin-top: -2rem;
        margin-bottom: 1rem;
        font-style: italic;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(10px);
        animation:
            fadeInUp 0.8s ease-out forwards,
            pulse 4s ease-in-out 1s infinite;
    }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-2px);
        }
    }

    .credit a {
        text-decoration: none;
    }

    .credit a:hover code {
        color: #93c5fd;
        text-shadow: 0 0 12px #60a5fa;
    }

    /* Hover */
    .credit:hover {
        color: #ffffff;
        transform: scale(1.02);
    }

    .credit code {
        font-family: 'Fira Code', monospace;
        color: #60a5fa;
        background: transparent;
        padding: 0.1rem 0.3rem;
        border-radius: 4px;
        animation: glow 2s ease-in-out infinite alternate;
    }

    @keyframes glow {
        from {
            text-shadow: 0 0 2px #60a5fa;
        }
        to {
            text-shadow:
                0 0 10px #60a5fa,
                0 0 20px #60a5fa;
        }
    }

    .layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: none;
    }

    main {
        flex: 1;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }

    footer {
        background: linear-gradient(to right, rgba(30, 30, 30, 0.95), rgba(40, 40, 40, 0.95));
        color: #d1d5db;
        text-align: left;
        padding: 0.5rem 1rem 0.5rem 1rem;
        font-size: 1rem;
        font-style: italic;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        margin-top: 2rem;
        position: relative;
        border-top: 2px solid rgba(255, 255, 255, 0.1);
    }

    footer::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, rgba(30, 30, 30, 0.2), rgba(30, 30, 30, 0.8));
        z-index: -1;
        opacity: 0.3;
    }

    footer a {
        color: hsl(142, 100%, 70%);
        font-weight: 500;
        text-decoration: none;
        transition:
            color 0.3s ease,
            text-shadow 0.3s ease,
            transform 0.3s ease;
        font-family: 'Roboto', sans-serif;
    }

    footer a:hover {
        color: hsl(144, 100%, 80%);
        text-shadow: 0 0 8px hsl(144, 100%, 70%);
        text-decoration: underline;
        transform: translateY(-3px);
    }

    footer a:active {
        transform: translateY(0);
    }

    .footer-support {
        display: flex;
        flex-direction: column;
        align-items: center; /* Cambiado de flex-end a center para centrar el texto y los iconos */
        gap: 0.5rem;
        min-width: 150px;
    }
    .support-title {
        color: #93c5fd;
        font-weight: 600;
        font-size: 1.08rem;
        margin-bottom: 0.25rem;
        letter-spacing: 0.5px;
        text-shadow: 0 0 8px #646cff44;
        text-align: center;
    }
    .footer-icons {
        display: flex;
        gap: 1.2rem;
        justify-content: center; /* Cambiado de flex-end a center para centrar los iconos */
        /* Degradado animado */
        /* background: linear-gradient(270deg, #ff00cc, #3333ff, #00ffe7, #ff00cc);
  background-size: 600% 600%;
  animation: gradient-move 8s ease infinite; */
        border-radius: 16px; /* Opcional, para bordes redondeados */
        padding: 0.5rem 1.5rem; /* Opcional, para que se note el fondo */
    }

    .footer-icon svg,
    .footer-icon {
        background: linear-gradient(270deg, #ff00cc, #3333ff, #00ffe7, #ff00cc);
        background-size: 600% 600%;
        animation: icon-gradient-move 8s ease infinite;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
        /* Para SVGs: */
        fill: transparent;
    }

    @keyframes icon-gradient-move {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    @keyframes gradient-move {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
    @media (max-width: 900px) {
        .footer-inner,
        .footer-main {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.2rem;
        }
        .footer-support {
            align-items: center; /* Centrado también en responsive */
            width: 100%;
        }
        .footer-separator {
            display: none;
        }
        .footer-icons {
            justify-content: center;
        }
    }
    @media (max-width: 600px) {
        footer {
            padding: 1.2rem 0.5rem 0.7rem 0.5rem;
        }
        .footer-inner,
        .footer-main {
            gap: 0.7rem;
        }
        .footer-support {
            min-width: 0;
        }
        .footer-icons {
            gap: 0.7rem;
        }
    }
</style>
