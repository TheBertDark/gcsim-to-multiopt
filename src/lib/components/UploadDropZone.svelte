<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { Sample } from '$lib/gcsim-to-multiopt/gcsim_types';

    export let sample: Sample | null = null;
    export let currentFileName: string = '';
    export let onFileSelected: (file: File) => void;

    let isDragging = false;
    let hintElement: HTMLElement | null = null;
    let decryptSound: HTMLAudioElement | null = null;
    let revealInterval: ReturnType<typeof setInterval> | null = null;

    const message =
        'Ancient patterns echo through pixels past... A famous sequence that saved lives in 8 bits... Can you bring it back to life?';
    const chars = '!<>-_\\/[]{}—=+*^?#________';

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

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        isDragging = false;
        const file = e.dataTransfer?.files[0];
        if (file) {
            onFileSelected(file);
        }
    }

    function handleFileInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
        const file = event.currentTarget.files?.[0];
        if (file) {
            onFileSelected(file);
        }
    }

    function handleHintMouseEnter() {
        if (!decryptSound || !hintElement) return;
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
            if (hintElement) {
                hintElement.textContent = output;
            }
            frame++;

            if (frame > message.length) {
                if (revealInterval) clearInterval(revealInterval);
                if (hintElement) hintElement.textContent = message;
                if (decryptSound) decryptSound.pause();
            }
        }, interval);
    }

    function handleHintMouseLeave() {
        if (revealInterval) clearInterval(revealInterval);
        if (decryptSound) decryptSound.pause();
    }

    let mascotSrc = '/gcsim-to-multiopt/GCSim-to-GO.png';
    let themeObserver: MutationObserver | null = null;

    function updateMascotForTheme() {
        if (typeof document === 'undefined') return;
        if (document.body.classList.contains('halloween-theme')) {
            mascotSrc = '/gcsim-to-multiopt/GCSim-to-GO_Halloween.png';
        } else if (document.body.classList.contains('christmas-theme')) {
            mascotSrc = '/gcsim-to-multiopt/GCSim-to-GO_Navidad.png';
        } else {
            mascotSrc = '/gcsim-to-multiopt/GCSim-to-GO.png';
        }
    }

    onMount(() => {
        decryptSound = new Audio('/gcsim-to-multiopt/decrypt.mp3');
        decryptSound.volume = 0.3;

        updateMascotForTheme();
        if (typeof MutationObserver !== 'undefined' && document.body) {
            themeObserver = new MutationObserver(() => {
                updateMascotForTheme();
            });
            themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
            themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        }
    });

    onDestroy(() => {
        if (revealInterval) clearInterval(revealInterval);
        if (decryptSound) {
            decryptSound.pause();
            decryptSound = null;
        }
        if (themeObserver) {
            themeObserver.disconnect();
            themeObserver = null;
        }
    });
</script>

<div
    class="upload-card"
    class:dragging={isDragging}
    class:loaded={sample != null}
    on:dragenter={handleDragEnter}
    on:dragleave={handleDragLeave}
    on:dragover={handleDragOver}
    on:drop={handleDrop}
    role="button"
    aria-label="Upload simulation file"
    tabindex="0"
>
    {#if sample == null}
        <div class="upload-content">
            <div class="icon-bubble">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
            </div>
            <h3 class="upload-title">Drop your GCSim simulation file here</h3>
            <p class="upload-subtitle">or click to browse your computer</p>
            <div class="upload-badges">
                <span class="badge">.gz sample</span>
                <span class="badge">.json sample</span>
            </div>
        </div>
    {:else}
        <div class="loaded-content">
            <div class="file-info-row">
                <div class="file-icon-badge">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <div class="file-details">
                    <div class="file-name">{currentFileName}</div>
                    <div class="file-status">
                        <span class="status-dot"></span>
                        <span>Simulation loaded & verified</span>
                    </div>
                </div>
            </div>
            <div class="change-file-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span>Change file</span>
            </div>
        </div>
    {/if}
    <input type="file" accept=".gz,.json" on:change={handleFileInput} aria-label="Upload file" />
</div>

{#if sample == null}
    <div class="upload-image-container">
        <div class="image-wrapper">
            <img
                src={mascotSrc}
                alt="Upload tutorial hint"
                class="upload-image"
            />
            <div
                class="hint-area"
                role="region"
                aria-label="Secret Easter Egg Hint"
                on:mouseenter={handleHintMouseEnter}
                on:mouseleave={handleHintMouseLeave}
            ></div>
            <div bind:this={hintElement} class="hint-message"></div>
        </div>
    </div>
{/if}

<style lang="scss">
    .upload-card {
        position: relative;
        background: rgba(18, 23, 34, 0.7);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 2px dashed rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        padding: 2.2rem 1.5rem;
        text-align: center;
        margin-bottom: 2rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);

        &:hover,
        &.dragging {
            border-color: #6366f1;
            background: rgba(24, 32, 48, 0.85);
            box-shadow: 0 12px 32px rgba(99, 102, 241, 0.25);
            transform: translateY(-2px);
        }

        &.loaded {
            border-style: solid;
            border-color: rgba(56, 189, 248, 0.3);
            background: linear-gradient(135deg, rgba(18, 24, 38, 0.85) 0%, rgba(24, 34, 54, 0.85) 100%);
            padding: 1.25rem 1.75rem;

            &:hover {
                border-color: rgba(56, 189, 248, 0.6);
            }
        }

        input[type='file'] {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
            z-index: 5;
        }
    }

    .upload-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .icon-bubble {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(56, 189, 248, 0.2));
        border: 1px solid rgba(99, 102, 241, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #818cf8;
        margin-bottom: 0.5rem;
        transition: transform 0.3s ease;

        .upload-card:hover & {
            transform: scale(1.1);
            color: #38bdf8;
            border-color: #38bdf8;
        }
    }

    .upload-title {
        font-size: 1.15rem;
        font-weight: 600;
        color: #f8fafc;
        margin: 0;
    }

    .upload-subtitle {
        font-size: 0.9rem;
        color: #94a3b8;
        margin: 0 0 0.5rem 0;
    }

    .upload-badges {
        display: flex;
        gap: 0.5rem;

        .badge {
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #cbd5e1;
            font-family: 'Fira Code', monospace;
        }
    }

    .loaded-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .file-info-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        text-align: left;
    }

    .file-icon-badge {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: rgba(56, 189, 248, 0.15);
        border: 1px solid rgba(56, 189, 248, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #38bdf8;
    }

    .file-details {
        .file-name {
            font-weight: 600;
            color: #f8fafc;
            font-size: 1.05rem;
            word-break: break-all;
        }

        .file-status {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.8rem;
            color: #4ade80;
            margin-top: 0.15rem;

            .status-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #4ade80;
                box-shadow: 0 0 8px #4ade80;
                animation: pulse-dot 2s infinite;
            }
        }
    }

    .change-file-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.9rem;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        color: #94a3b8;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.2s ease;

        .upload-card:hover & {
            color: #38bdf8;
            border-color: rgba(56, 189, 248, 0.4);
            background: rgba(56, 189, 248, 0.1);
        }
    }

    @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.85); }
    }

    .upload-image-container {
        text-align: center;
        margin-top: 1.5rem;
        position: relative;
    }

    .image-wrapper {
        position: relative;
        display: inline-block;
    }

    .upload-image {
        filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.7));
        max-width: 520px;
        width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
        animation: subtleFloat 4s ease-in-out infinite;
    }

    @keyframes subtleFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
    }

    .hint-area {
        position: absolute;
        top: 20%;
        left: 30%;
        width: 40%;
        height: 20%;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        z-index: 2;

        &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(0, 255, 204, 0.25);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            opacity: 0;
        }

        &:hover::after {
            animation: radarPing 1.5s infinite ease-out;
        }
    }

    @keyframes radarPing {
        0% { width: 0; height: 0; opacity: 0.7; }
        70% { width: 220%; height: 220%; opacity: 0; }
        100% { opacity: 0; }
    }

    .hint-message {
        position: absolute;
        bottom: -3.5rem;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(10, 12, 18, 0.95);
        color: #00ffcc;
        padding: 0.7rem 1.2rem;
        border-radius: 8px;
        font-size: 0.85rem;
        opacity: 0;
        pointer-events: none;
        white-space: nowrap;
        overflow: hidden;
        font-family: 'Share Tech Mono', monospace;
        box-shadow: 0 0 15px rgba(0, 255, 204, 0.3);
        border: 1px solid rgba(0, 255, 204, 0.3);
        transition: opacity 0.3s ease;
    }

    .hint-area:hover + .hint-message {
        opacity: 1;
    }
</style>
