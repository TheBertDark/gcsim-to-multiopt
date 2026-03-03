<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { cubicOut } from 'svelte/easing';

    const dispatch = createEventDispatcher();

    export let promoUrl = 'https://www.khaenri.online/';
    export let demoImage = '/gcsim-to-multiopt/Mavuika_build.png';
    export let title = 'Build Cards for Genshin';
    export let subtitle = 'Create cards ready to share with art, key stats, and your best builds.';
    export let highlights = [
        'Export your build to a clean and aesthetic image',
        'Share on Discord, Twitter, or wherever you want',
        'Show stats, sets, constellations, weapons, and more',
    ];
    export let ctaText = 'Go to Build Cards';
    export let galleryImages = [
        '/gcsim-to-multiopt/multi-card-simple.png',
        '/gcsim-to-multiopt/multi-card-full.png',
    ];

    let currentIndex = 0;
    let prevImage = demoImage;
    let rotationId: ReturnType<typeof setInterval> | null = null;
    let isTransitioning = false;

    $: imageList = [demoImage, ...galleryImages];
    $: currentImage = imageList[currentIndex];

    function closeOverlay() {
        dispatch('close');
    }

    function nextImage() {
        if (isTransitioning || imageList.length === 0) return;
        isTransitioning = true;
        prevImage = currentImage;
        currentIndex = (currentIndex + 1) % imageList.length;

        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }

    function restartRotation() {
        if (rotationId) clearInterval(rotationId);
        rotationId = setInterval(() => {
            nextImage();
        }, 5000);
    }

    function sweep(node: Element, { duration = 750 } = {}) {
        return {
            duration,
            easing: cubicOut,
            css: (t: number) => {
                const edge = t * 130 - 15;
                const trail = edge - 15;
                return `
                    -webkit-mask-image: linear-gradient(
                        110deg,
                        #000 ${trail}%,
                        transparent ${edge}%
                    );
                    mask-image: linear-gradient(
                        110deg,
                        #000 ${trail}%,
                        transparent ${edge}%
                    );
                `;
            },
        };
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeOverlay();
        }
    }

    onMount(() => {
        document.addEventListener('keydown', handleKeydown);
        restartRotation();
        return () => {
            document.removeEventListener('keydown', handleKeydown);
            if (rotationId) clearInterval(rotationId);
        };
    });
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="promo-title" tabindex="-1">
    <button class="backdrop" on:click={closeOverlay} aria-label="Close"></button>
    <div class="promo-card">
        <button class="close-btn" on:click={closeOverlay} aria-label="Close">
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>

        <div class="content">
            <div class="text">
                <div class="badge">New</div>
                <h2 id="promo-title">{title}</h2>
                <p class="subtitle">{subtitle}</p>
                <ul class="highlights">
                    {#each highlights as item}
                        <li>{item}</li>
                    {/each}
                </ul>
                <div class="actions">
                    <a
                        class="btn primary"
                        href={promoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {ctaText}
                    </a>
                </div>
            </div>

            <div class="preview">
                <button
                    class="image-button"
                    type="button"
                    on:click={() => {
                        nextImage();
                        restartRotation();
                    }}
                    aria-label="Change image"
                >
                    <div class="image-frame">
                        <img class="image-layer base-image" src={prevImage} alt="" />
                        {#key currentImage}
                            <img
                                class="image-layer top-image"
                                src={currentImage}
                                alt="Demo Build Card"
                                loading="lazy"
                                in:sweep={{ duration: 750 }}
                            />
                        {/key}
                    </div>
                </button>
                <div class="caption">Real example generated with the tool</div>
                <div class="preload" aria-hidden="true">
                    {#each imageList as src}
                        <img {src} alt="" loading="eager" />
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .overlay {
        inset: 0;
        background: rgba(6, 6, 16, 0.85);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1200;
        padding: 24px;
    }

    .backdrop {
        position: absolute;
        inset: 0;
        background: transparent;
        border: none;
        cursor: pointer;
        z-index: 0;
    }

    .promo-card {
        position: relative;
        width: min(960px, 96vw);
        z-index: 1;
        background: linear-gradient(140deg, rgba(20, 20, 34, 0.98), rgba(34, 20, 48, 0.98));
        border: 1px solid rgba(100, 108, 255, 0.6);
        border-radius: 20px;
        box-shadow:
            0 24px 80px rgba(8, 12, 40, 0.6),
            0 0 50px rgba(100, 108, 255, 0.2);
        overflow: hidden;
    }

    .close-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(12, 12, 24, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #e4e5e7;
        border-radius: 10px;
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
    }

    .close-btn:hover {
        transform: scale(1.05);
        background: rgba(220, 38, 38, 0.8);
        box-shadow: 0 0 12px rgba(220, 38, 38, 0.5);
    }

    .content {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 28px;
        padding: 40px;
    }

    .text h2 {
        margin: 12px 0 8px;
        font-size: 2rem;
        color: #f8fafc;
        letter-spacing: 0.5px;
    }

    .subtitle {
        margin: 0 0 20px;
        color: #cbd5f5;
        line-height: 1.6;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        background: rgba(0, 255, 231, 0.15);
        border: 1px solid rgba(0, 255, 231, 0.4);
        color: #00ffe7;
        border-radius: 999px;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 1px;
    }

    .highlights {
        margin: 0 0 24px;
        padding-left: 18px;
        color: #e2e8f0;
        display: grid;
        gap: 10px;
    }

    .highlights li::marker {
        color: #00ffe7;
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    .btn {
        text-decoration: none;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 600;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
    }

    .btn.primary {
        background: linear-gradient(135deg, #00ffe7 0%, #646cff 100%);
        color: #0b0d1a;
        border: 1px solid rgba(0, 255, 231, 0.6);
    }

    .btn.primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 24px rgba(0, 255, 231, 0.25);
    }

    .preview {
        display: flex;
        flex-direction: column;
        gap: 14px;
        align-items: center;
    }

    .image-button {
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        width: 100%;
    }

    .image-frame {
        position: relative;
        width: 426px;
        background: rgba(12, 12, 28, 0.8);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 12px;
        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.6);
        overflow: hidden;
        aspect-ratio: 2605 / 997;
    }

    .image-button:hover .image-frame {
        transform: translateY(-2px);
        box-shadow:
            inset 0 0 20px rgba(0, 0, 0, 0.6),
            0 12px 24px rgba(0, 0, 0, 0.35);
    }

    .image-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: calc(100% - 24px);
        border-radius: 12px;
        display: block;
        object-fit: cover;
        will-change:
            mask-image,
            -webkit-mask-image;
    }

    .base-image {
        z-index: 1;
        padding: 12px;
    }

    .top-image {
        z-index: 2;
        padding: 12px;
    }

    .preload {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
    }

    .preload img {
        width: 1px;
        height: 1px;
    }

    .caption {
        font-size: 0.9rem;
        color: #94a3b8;
        text-align: center;
    }

    @media (max-width: 900px) {
        .content {
            grid-template-columns: 1fr;
            padding: 32px 24px;
        }

        .promo-card {
            width: min(720px, 94vw);
        }

        .text h2 {
            font-size: 1.6rem;
        }
    }

    @media (max-width: 640px) {
        .content {
            padding: 28px 20px;
        }

        .actions {
            flex-direction: column;
        }

        .btn {
            text-align: center;
        }
    }
</style>
