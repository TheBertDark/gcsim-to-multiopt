<script lang="ts">
    import type { ErrorContext } from '$lib/types';

    export let errors: string[] = [];
    export let errorContexts: ErrorContext[] = [];
    export let addConvert: string = '';

    let expandedErrors: Set<number> = new Set();

    function toggleError(index: number) {
        if (expandedErrors.has(index)) {
            expandedErrors.delete(index);
        } else {
            expandedErrors.add(index);
        }
        expandedErrors = new Set(expandedErrors);
    }
</script>

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
                        <span class="toggle-icon" class:expanded={expandedErrors.has(i)}>▶</span>
                        {error.message}
                    </div>
                    <div class="error-details" class:expanded={expandedErrors.has(i)}>
                        <div class="error-content">
                            {#if error.message.includes('Unknown ability')}
                                This ability name was not found in the conversion map. You can add it manually below using the format:
                                {#if error.raw}
                                    <div class="raw-data">
                                        <span class="label">Raw ability data:</span>
                                        {JSON.stringify(error.raw, null, 2)}
                                    </div>
                                    <div class="suggestion">
                                        Suggested fix: Add to the conversion map below:<br />
                                        {JSON.stringify(error.raw.name)}: ["type", "subtype"]
                                    </div>
                                {/if}
                            {:else if error.message.includes('Unknown stat')}
                                This stat type is not recognized. Common stats are: atk, def, hp, cr, cd, dmg_bonus, etc.
                                {#if error.raw}
                                    <div class="raw-data">
                                        <span class="label">Invalid stat:</span>
                                        {error.raw.stat}
                                        <span class="label">Valid stats:</span>
                                        {error.raw.validStats.join(', ')}
                                    </div>
                                {/if}
                            {:else if error.message.includes('Unknown element')}
                                Invalid element type. Valid elements are: pyro, hydro, electro, cryo, dendro, anemo, geo, physical
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

<style lang="scss">
    .error-section {
        background: rgba(255, 87, 87, 0.1);
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;

        h2 {
            font-size: 1.5rem;
            margin: 0 0 1rem 0;
        }

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
</style>
