<script lang="ts">
    export let charNames: string[] = [];
    export let charName: string = '';
    export let configName: string = '';
    export let characterElements: Record<string, string> = {};
    export let elementIcons: Record<string, any> = {};
    export let elementColors: Record<string, string> = {};
    export let onGenerate: () => void;

    function formatName(name: string): string {
        return name
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    }
</script>

{#if charNames.length > 0}
    <div class="controls-card">
        <div class="step-label">
            <span class="step-number">1</span>
            <span>Select Target Character</span>
        </div>

        <div class="character-grid">
            {#each charNames as name}
                {@const element = characterElements[name.toLowerCase()] || 'anemo'}
                {@const color = elementColors[element] || '#61DBBB'}
                {@const iconComponent = elementIcons[element]}
                {@const isSelected = charName === name}

                <button
                    type="button"
                    class="character-pill"
                    class:selected={isSelected}
                    style="--char-color: {color};"
                    on:click={() => {
                        charName = name;
                        onGenerate();
                    }}
                >
                    <div class="element-badge">
                        {#if iconComponent}
                            <svelte:component this={iconComponent} />
                        {/if}
                    </div>
                    <span class="char-name">{formatName(name)}</span>
                    {#if isSelected}
                        <span class="active-indicator"></span>
                    {/if}
                </button>
            {/each}
        </div>

        <div class="config-row">
            <div class="input-field">
                <label for="configName">
                    <span class="label-text">Configuration Name (optional)</span>
                </label>
                <div class="input-wrapper">
                    <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <input
                        type="text"
                        id="configName"
                        bind:value={configName}
                        placeholder="e.g. Spiral Abyss Floor 12 Rotation"
                    />
                </div>
            </div>

            <button type="button" class="generate-btn" on:click={onGenerate}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span>Generate Target</span>
            </button>
        </div>
    </div>
{/if}

<style lang="scss">
    .controls-card {
        background: rgba(18, 23, 34, 0.75);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
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
        margin-bottom: 1rem;

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

    .character-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.85rem;
        margin-bottom: 1.5rem;
    }

    .character-pill {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #e2e8f0;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        text-align: left;

        &:hover {
            background: rgba(255, 255, 255, 0.07);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        &.selected {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
            border-color: var(--char-color);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.4), 0 0 12px rgba(var(--char-color), 0.25);

            .element-badge {
                background: var(--char-color);
                color: #0b0e14;
                box-shadow: 0 0 10px var(--char-color);
            }

            .char-name {
                color: #ffffff;
                font-weight: 600;
            }
        }
    }

    .element-badge {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--char-color);
        flex-shrink: 0;
        transition: all 0.2s ease;

        :global(svg) {
            width: 18px;
            height: 18px;
        }
    }

    .char-name {
        font-size: 0.95rem;
        font-weight: 500;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .active-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--char-color);
        box-shadow: 0 0 8px var(--char-color);
    }

    .config-row {
        display: flex;
        gap: 1rem;
        align-items: flex-end;
        flex-wrap: wrap;
    }

    .input-field {
        flex: 1;
        min-width: 250px;

        label {
            display: block;
            margin-bottom: 0.4rem;
            color: #94a3b8;
            font-size: 0.85rem;
            font-weight: 500;
        }

        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;

            .input-icon {
                position: absolute;
                left: 0.85rem;
                color: #64748b;
                pointer-events: none;
            }

            input {
                width: 100%;
                padding: 0.65rem 1rem 0.65rem 2.4rem;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(11, 14, 20, 0.6);
                color: #f8fafc;
                font-size: 0.9rem;
                transition: all 0.2s ease;
                box-sizing: border-box;

                &:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                    background: rgba(11, 14, 20, 0.9);
                }

                &::placeholder {
                    color: #475569;
                }
            }
        }
    }

    .generate-btn {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: #ffffff;
        font-weight: 600;
        font-size: 0.95rem;
        padding: 0.65rem 1.4rem;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
            background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
        }

        &:active {
            transform: translateY(0);
        }
    }
</style>
