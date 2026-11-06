<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { cubicOut } from 'svelte/easing';

    const dispatch = createEventDispatcher();

    export let promoUrl = 'https://www.khaenri.online/';
    export let demoImage = '/gcsim-to-multiopt/Mavuika_build.png';
    export let title = 'Build Cards for Genshin';
    export let subtitle = 'Create aesthetic character cards ready to share with art, key stats, and your best builds.';
    export let highlights = [
        'Export your build to a clean and aesthetic image',
        'Share on Discord, Twitter, or wherever you want',
        'Show stats, sets, constellations, weapons, and more',
    ];
    export let ctaText = 'Explore Build Cards';
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

    onMount(() => {
        restartRotation();
        return () => {
            if (rotationId) clearInterval(rotationId);
        };
    });
</script>

<aside class="promo-section" aria-labelledby="promo-title">
    <button class="close-btn" on:click={closeOverlay} aria-label="Dismiss notice" title="Dismiss notice">
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    </button>

    <div class="promo-grid">
        <div class="promo-info">
            <div class="badge-row">
                <span class="promo-badge">
                    <span class="badge-dot"></span>
                    <span>Sister Project</span>
                </span>
            </div>

            <h2 id="promo-title">{title}</h2>
            <p class="subtitle">{subtitle}</p>

            <ul class="highlights">
                {#each highlights as item}
                    <li>
                        <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{item}</span>
                    </li>
                {/each}
            </ul>

            <div class="actions">
                <a
                    class="cta-btn"
                    href={promoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>{ctaText}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </div>
        </div>

        <div class="promo-preview">
            <button
                class="image-button"
                type="button"
                on:click={() => {
                    nextImage();
                    restartRotation();
                }}
                aria-label="Click to preview next card design"
                title="Click to preview next card design"
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
            <div class="caption">Real example generated with the tool • Click to preview next</div>
            <div class="preload" aria-hidden="true">
                {#each imageList as src}
                    <img {src} alt="" loading="eager" />
                {/each}
            </div>
        </div>
    </div>
</aside>

<style lang="scss">
    .promo-section {
        position: relative;
        background: rgba(18, 23, 34, 0.75);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 1.75rem 2rem;
        margin-top: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        box-sizing: border-box;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;

        &:hover {
            border-color: rgba(99, 102, 241, 0.3);
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35), 0 0 20px rgba(99, 102, 241, 0.1);
        }
    }

    .close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #94a3b8;
        border-radius: 8px;
        width: 30px;
        height: 30px;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 5;

        &:hover {
            color: #f8fafc;
            background: rgba(239, 68, 68, 0.15);
            border-color: rgba(239, 68, 68, 0.4);
            transform: scale(1.05);
        }
    }

    .promo-grid {
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        gap: 2.25rem;
        align-items: center;
    }

    .badge-row {
        margin-bottom: 0.75rem;
    }

    .promo-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 0.25rem 0.7rem;
        border-radius: 999px;
        background: rgba(99, 102, 241, 0.12);
        border: 1px solid rgba(99, 102, 241, 0.3);
        color: #a5b4fc;

        .badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #38bdf8;
            box-shadow: 0 0 8px #38bdf8;
        }
    }

    #promo-title {
        margin: 0 0 0.5rem 0;
        font-size: 1.6rem;
        font-weight: 700;
        letter-spacing: -0.015em;
        color: #f8fafc;
    }

    .subtitle {
        margin: 0 0 1.25rem 0;
        color: #94a3b8;
        font-size: 0.92rem;
        line-height: 1.55;
    }

    .highlights {
        list-style: none;
        padding: 0;
        margin: 0 0 1.5rem 0;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;

        li {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            color: #cbd5e1;
            font-size: 0.88rem;

            .check-icon {
                color: #38bdf8;
                flex-shrink: 0;
            }
        }
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .cta-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.65rem 1.3rem;
        border-radius: 8px;
        background: linear-gradient(135deg, #6366f1 0%, #38bdf8 100%);
        color: #ffffff;
        font-weight: 600;
        font-size: 0.875rem;
        text-decoration: none;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
            filter: brightness(1.08);
        }
    }

    .promo-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    .image-button {
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        width: 100%;
        outline: none;
    }

    .image-frame {
        position: relative;
        width: 100%;
        background: rgba(11, 14, 20, 0.6);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 8px;
        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.35);
        overflow: hidden;
        aspect-ratio: 2605 / 997;
        transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;

        .image-button:hover & {
            transform: translateY(-2px);
            border-color: rgba(99, 102, 241, 0.4);
            box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.6), 0 12px 28px rgba(0, 0, 0, 0.45);
        }
    }

    .image-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: calc(100% - 16px);
        border-radius: 8px;
        display: block;
        object-fit: cover;
        will-change: mask-image, -webkit-mask-image;
    }

    .base-image {
        z-index: 1;
        padding: 8px;
    }

    .top-image {
        z-index: 2;
        padding: 8px;
    }

    .caption {
        font-size: 0.76rem;
        color: #64748b;
        margin-top: 0.65rem;
        text-align: center;
    }

    .preload {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;

        img {
            width: 1px;
            height: 1px;
        }
    }

    @media (max-width: 860px) {
        .promo-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        .promo-section {
            padding: 1.5rem;
        }

        #promo-title {
            font-size: 1.4rem;
        }
    }
</style>
