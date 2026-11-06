<script lang="ts">
    import {
        applyNoteStyling,
        type NoteItem,
    } from '$lib/gcsim-to-multiopt/config/custom_descriptions';

    export let availabledMods: string[] = [];
    export let ignoredMods: string[] = [];
    export let customDescItems: NoteItem[] = [];
    export let onModToggle: (mod: string) => void;
    export let onMouseEnterInfo: (event: MouseEvent) => void;
    export let onMouseMoveInfo: (event: MouseEvent) => void;
    export let onMouseLeaveInfo: () => void;

    $: activeCount = availabledMods.length - ignoredMods.length;
    $: ignoredCount = ignoredMods.length;
</script>

{#if availabledMods.length > 0}
    <div class="modifiers-card">
        <div class="header-row">
            <div class="title-group">
                <div class="step-label">
                    <span class="step-number">2</span>
                    <span>Simulation Modifiers & Buffs</span>
                </div>
                <div class="meta-counts">
                    <span class="count-pill active">{activeCount} Included</span>
                    <span class="count-pill ignored">{ignoredCount} Ignored</span>
                    <button
                        type="button"
                        class="info-bubble"
                        aria-label="How modifiers work"
                        on:mouseenter={onMouseEnterInfo}
                        on:mousemove={onMouseMoveInfo}
                        on:mouseleave={onMouseLeaveInfo}
                    >?</button>
                </div>
            </div>
        </div>

        {#if customDescItems.length > 0}
            <div class="custom-desc-note" aria-live="polite">
                <div class="note-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>Character Tips</span>
                </div>
                <ul class="note-list">
                    {#each customDescItems as note}
                        <li class:has-image={!!note.image}>
                            {@html applyNoteStyling(note.text)}
                            {#if note.image}
                                <div class="image-tooltip">
                                    <img src={note.image} alt="Visual help for {note.text}" />
                                </div>
                            {/if}
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}

        <div class="mods-grid">
            {#each availabledMods as mod}
                {@const isIgnored = ignoredMods.includes(mod)}
                <button
                    type="button"
                    class="mod-chip"
                    class:ignored={isIgnored}
                    on:click={() => onModToggle(mod)}
                    aria-pressed={!isIgnored}
                >
                    <span class="status-indicator">
                        {#if isIgnored}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        {:else}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        {/if}
                    </span>
                    <span class="mod-label">{mod}</span>
                    <span class="state-tag">{isIgnored ? 'Ignored' : 'Active'}</span>
                </button>
            {/each}
        </div>
    </div>
{/if}

<style lang="scss">
    .modifiers-card {
        background: rgba(18, 23, 34, 0.75);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }

    .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1.25rem;
    }

    .title-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .step-label {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94a3b8;

        .step-number {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: rgba(99, 102, 241, 0.2);
            color: #818cf8;
            border: 1px solid rgba(99, 102, 241, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
        }
    }

    .meta-counts {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .count-pill {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.2rem 0.6rem;
            border-radius: 999px;

            &.active {
                background: rgba(34, 197, 94, 0.15);
                border: 1px solid rgba(34, 197, 94, 0.3);
                color: #4ade80;
            }

            &.ignored {
                background: rgba(239, 68, 68, 0.15);
                border: 1px solid rgba(239, 68, 68, 0.3);
                color: #f87171;
            }
        }
    }

    .info-bubble {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(99, 102, 241, 0.2);
        border: 1px solid rgba(99, 102, 241, 0.4);
        color: #818cf8;
        font-size: 0.75rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: help;
        transition: all 0.2s ease;

        &:hover {
            background: #6366f1;
            color: white;
            transform: scale(1.15);
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
        }
    }

    .custom-desc-note {
        margin-bottom: 1.25rem;
        padding: 1rem 1.25rem;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
        border: 1px solid rgba(99, 102, 241, 0.25);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

        .note-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.8rem;
            font-weight: 600;
            color: #818cf8;
            margin-bottom: 0.6rem;
            background: rgba(99, 102, 241, 0.15);
            padding: 0.2rem 0.6rem;
            border-radius: 6px;
        }

        .note-list {
            margin: 0;
            padding-left: 0;
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            li {
                position: relative;
                padding: 0.5rem 0.75rem 0.5rem 1.8rem;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.06);
                color: #e2e8f0;
                font-size: 0.9rem;
                line-height: 1.5;

                &::before {
                    content: '•';
                    position: absolute;
                    left: 0.75rem;
                    color: #818cf8;
                    font-size: 1.2rem;
                    line-height: 1;
                    top: 0.5rem;
                }

                &.has-image::before {
                    content: '📷';
                    font-size: 0.8rem;
                    top: 0.6rem;
                    left: 0.6rem;
                    cursor: help;
                }

                &.has-image:hover .image-tooltip {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
            }
        }
    }

    .image-tooltip {
        position: absolute;
        top: 100%;
        left: 1.5rem;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        padding-top: 8px;

        img {
            max-width: 320px;
            border-radius: 10px;
            border: 2px solid #38bdf8;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
            background: #0b0e14;
            display: block;
        }
    }

    .mods-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 0.75rem;
    }

    .mod-chip {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.65rem 0.85rem;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(34, 197, 94, 0.35);
        color: #f1f5f9;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.06);
        }

        .status-indicator {
            width: 20px;
            height: 20px;
            border-radius: 6px;
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.2s ease;
        }

        .mod-label {
            font-size: 0.85rem;
            font-weight: 500;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: 'Fira Code', monospace;
        }

        .state-tag {
            font-size: 0.7rem;
            color: #4ade80;
            background: rgba(34, 197, 94, 0.1);
            padding: 0.15rem 0.45rem;
            border-radius: 4px;
        }

        &.ignored {
            border-color: rgba(255, 255, 255, 0.08);
            color: #94a3b8;
            background: rgba(255, 255, 255, 0.015);

            .status-indicator {
                background: rgba(239, 68, 68, 0.15);
                color: #f87171;
            }

            .state-tag {
                color: #f87171;
                background: rgba(239, 68, 68, 0.1);
            }
        }
    }

    // Dynamic classes from applyNoteStyling
    .custom-desc-note :global(.note-strong) { font-weight: 700 !important; color: #ffffff !important; }
    .custom-desc-note :global(.note-emphasis) { color: #38bdf8 !important; font-style: normal !important; }
    .custom-desc-note :global(.note-highlight) {
        background: rgba(250, 204, 21, 0.15);
        border: 1px solid rgba(250, 204, 21, 0.35);
        border-radius: 4px;
        padding: 0.05rem 0.25rem;
        color: #fef08a !important;
        font-weight: 600 !important;
    }
    .custom-desc-note :global(.note-warning) { color: #f87171 !important; font-weight: 700 !important; }
    .custom-desc-note :global(.note-important) {
        color: #fca5a5 !important;
        font-weight: 700 !important;
        border-bottom: 2px solid rgba(239, 68, 68, 0.6);
    }
    .custom-desc-note :global(.note-underline) { text-decoration: underline !important; }

    .custom-desc-note :global(.note-pyro) { color: #ff7875 !important; font-weight: 600; }
    .custom-desc-note :global(.note-hydro) { color: #69c0ff !important; font-weight: 600; }
    .custom-desc-note :global(.note-electro) { color: #d3adf7 !important; font-weight: 600; }
    .custom-desc-note :global(.note-geo) { color: #ffd666 !important; font-weight: 600; }
    .custom-desc-note :global(.note-cryo) { color: #87e8de !important; font-weight: 600; }
    .custom-desc-note :global(.note-anemo) { color: #5cdbd3 !important; font-weight: 600; }
    .custom-desc-note :global(.note-dendro) { color: #b7eb8f !important; font-weight: 600; }
    .custom-desc-note :global(.note-physical) { color: #cbd5e1 !important; font-weight: 600; }
</style>
