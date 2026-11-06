<script lang="ts">
    import { copy } from 'svelte-copy';
    import type { CustomMultiTarget } from '$lib/gcsim-to-multiopt/go_types';

    export let target: CustomMultiTarget | null = null;
    export let highlightedJson: string = '';
    export let charName: string = '';
    export let onCopy: () => void;

    let hasCopied = false;

    function handleCopyClick() {
        hasCopied = true;
        onCopy();
        setTimeout(() => {
            hasCopied = false;
        }, 2000);
    }

    function handleDownload() {
        if (!target) return;
        const jsonStr = JSON.stringify(target, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `multiopt_${(charName || 'config').toLowerCase()}.json`;
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
</script>

{#if target}
    <div class="result-card">
        <div class="header-row">
            <div class="title-group">
                <div class="step-label">
                    <span class="step-number">3</span>
                    <span>Multi-Opt Configuration</span>
                </div>
                <div class="metrics-pills">
                    <span class="metric-pill targets">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="6"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                        <span>{target.targets?.length ?? 0} Targets</span>
                    </span>
                    <span class="metric-pill ready">✓ Ready for GO</span>
                </div>
            </div>

            <div class="action-buttons">
                <button
                    type="button"
                    class="action-btn download-btn"
                    on:click={handleDownload}
                    title="Download JSON file"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download JSON</span>
                </button>

                <button
                    type="button"
                    class="action-btn copy-btn"
                    class:copied={hasCopied}
                    use:copy={JSON.stringify(target, null, 2)}
                    on:click={handleCopyClick}
                >
                    {#if hasCopied}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Copied!</span>
                    {:else}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>Copy to Clipboard</span>
                    {/if}
                </button>
            </div>
        </div>

        <div class="code-window">
            <div class="window-chrome">
                <div class="window-dots">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                </div>
                <div class="window-title">multi-target-config.json</div>
            </div>
            <pre><code class="language-json">{@html highlightedJson}</code></pre>
        </div>
    </div>
{/if}

<style lang="scss">
    .result-card {
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

    .metrics-pills {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .metric-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.2rem 0.6rem;
            border-radius: 999px;

            &.targets {
                background: rgba(56, 189, 248, 0.15);
                border: 1px solid rgba(56, 189, 248, 0.3);
                color: #38bdf8;
            }

            &.ready {
                background: rgba(34, 197, 94, 0.15);
                border: 1px solid rgba(34, 197, 94, 0.3);
                color: #4ade80;
            }
        }
    }

    .action-buttons {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        font-weight: 600;
        padding: 0.55rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;

        &.download-btn {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #cbd5e1;

            &:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
                border-color: rgba(255, 255, 255, 0.25);
                transform: translateY(-2px);
            }
        }

        &.copy-btn {
            background: linear-gradient(135deg, #00ffe7 0%, #6366f1 100%);
            color: #0b0e14;
            box-shadow: 0 4px 15px rgba(0, 255, 231, 0.3);

            &:hover {
                background: linear-gradient(135deg, #6366f1 0%, #00ffe7 100%);
                color: #ffffff;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 255, 231, 0.45);
            }

            &.copied {
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: #ffffff;
                box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
            }
        }
    }

    .code-window {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: #0f141c;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);

        .window-chrome {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.6rem 1rem;
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);

            .window-dots {
                display: flex;
                gap: 6px;

                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;

                    &.red { background: #ff5f56; }
                    &.yellow { background: #ffbd2e; }
                    &.green { background: #27c93f; }
                }
            }

            .window-title {
                font-size: 0.75rem;
                color: #64748b;
                font-family: 'Fira Code', monospace;
            }
        }

        pre {
            margin: 0;
            padding: 1.25rem;
            max-height: 420px;
            overflow-y: auto;
            background: transparent;
            font-family: 'Fira Code', monospace;
            font-size: 0.85rem;
            line-height: 1.6;

            scrollbar-width: thin;
            scrollbar-color: rgba(99, 102, 241, 0.4) rgba(15, 20, 28, 0.5);

            &::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }

            &::-webkit-scrollbar-track {
                background: rgba(15, 20, 28, 0.5);
            }

            &::-webkit-scrollbar-thumb {
                background: rgba(99, 102, 241, 0.4);
                border-radius: 4px;

                &:hover {
                    background: rgba(99, 102, 241, 0.7);
                }
            }
        }
    }
</style>
