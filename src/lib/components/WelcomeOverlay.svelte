<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';

    const dispatch = createEventDispatcher();

    // [AUTO-GENERATED:START]
    const pendingCharacters = [
        'Aino',
        'Alyosha',
        'Durin',
        'Iansan',
        'Ifa',
        'Jahoda',
        'Kachina',
        'Linnea',
        'Lohen',
        'Mitya',
        'Nefer',
        'Nicole',
        'Odette',
        'Prune',
        'Sandrone',
        'Traveler Cryo',
        'Valeriy',
        'Varka',
        'Vesna',
        'Vodyanitsa',
    ];

    const totalCharacters = 129;
    const mappedCharacters = 109;
    const progressPercent = 84.5;
    // [AUTO-GENERATED:END]

    let overlayElement: HTMLElement;

    function closeOverlay() {
        dispatch('close');
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeOverlay();
        }
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === overlayElement) {
            closeOverlay();
        }
    }

    onMount(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
    class="overlay"
    bind:this={overlayElement}
    on:click={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="welcome-title"
    tabindex="-1"
>
    <div class="modal">
        <div class="header">
            <h2 id="welcome-title">Welcome to GCSim to GO-MultiOpt</h2>
            <button class="close-btn" on:click={closeOverlay} aria-label="Close" title="Close (Esc)">
                <svg
                    width="18"
                    height="18"
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
        </div>

        <div class="content">
            <!-- Section 1: Progress & Pending Characters -->
            <section class="section">
                <div class="section-header">
                    <div class="section-icon progress-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h3>Character Implementation Status</h3>
                        <p class="section-description">
                            Tracking compatibility with all playable characters in the game.
                        </p>
                    </div>
                </div>

                <!-- Progress Bar Card -->
                <div class="progress-box">
                    <div class="progress-meta">
                        <span class="progress-label">Conversion Coverage</span>
                        <div class="progress-counts">
                            <strong>{mappedCharacters}</strong> / {totalCharacters} characters
                            <span class="percent-badge">{progressPercent}%</span>
                        </div>
                    </div>
                    <div class="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                        <div class="progress-fill" style="width: {progressPercent}%;"></div>
                    </div>
                </div>

                <div class="pending-wrapper">
                    <div class="pending-title">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>Currently pending mapping ({pendingCharacters.length}):</span>
                    </div>

                    <div class="character-grid">
                        {#each pendingCharacters as character}
                            <div class="character-chip">
                                <span class="pending-dot"></span>
                                <span class="character-name">{character}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            </section>

            <!-- Section 2: Feedback & Community -->
            <section class="section">
                <div class="section-header">
                    <div class="section-icon bug-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="8" height="14" x="8" y="6" rx="4"></rect>
                            <path d="m19 7-3 2"></path>
                            <path d="m5 7 3 2"></path>
                            <path d="m19 19-3-2"></path>
                            <path d="m5 19 3-2"></path>
                            <path d="M20 13h-4"></path>
                            <path d="M4 13h4"></path>
                            <path d="m10 4 1 2"></path>
                            <path d="m14 4-1 2"></path>
                        </svg>
                    </div>
                    <div>
                        <h3>Report Issues & Suggestions</h3>
                        <p class="section-description">
                            Found a discrepancy or missing ability? Feedback helps keep the tool accurate.
                        </p>
                    </div>
                </div>

                <div class="feedback-grid">
                    <a
                        href="https://github.com/TheBertDark/gcsim-to-multiopt/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="feedback-card"
                    >
                        <div class="card-icon github">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                                ></path>
                            </svg>
                        </div>
                        <div class="card-text">
                            <span class="card-title">GitHub Issues</span>
                            <span class="card-subtitle">Open bug reports & feature requests</span>
                        </div>
                        <svg class="external-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>

                    <a
                        href="https://discord.com/users/723426524585525300"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="feedback-card"
                    >
                        <div class="card-icon discord">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                        </div>
                        <div class="card-text">
                            <span class="card-title">Discord Direct</span>
                            <span class="card-subtitle">Contact @.darkjake</span>
                        </div>
                        <svg class="external-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                </div>
            </section>
        </div>

        <div class="footer">
            <button class="continue-btn" on:click={closeOverlay}>
                <span>Continue to Application</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </button>
        </div>
    </div>
</div>

<style lang="scss">
    .overlay {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(6, 8, 14, 0.78);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        padding: 1.5rem;
        box-sizing: border-box;
        animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .modal {
        background: rgba(18, 23, 34, 0.92);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        box-shadow:
            0 24px 60px rgba(0, 0, 0, 0.6),
            0 0 40px rgba(99, 102, 241, 0.12);
        max-width: 620px;
        width: 100%;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
        overflow: hidden;
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .header {
        position: relative;
        padding: 1.5rem 3rem 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        text-align: center;

        h2 {
            margin: 0;
            color: #f8fafc;
            font-size: 1.35rem;
            font-weight: 700;
            letter-spacing: -0.015em;
            text-align: center;
        }

        .close-btn {
            position: absolute;
            top: 1.25rem;
            right: 1.25rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            cursor: pointer;
            border-radius: 8px;
            color: #94a3b8;
            transition: all 0.2s ease;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
                background-color: rgba(239, 68, 68, 0.15);
                border-color: rgba(239, 68, 68, 0.35);
                color: #fca5a5;
                transform: scale(1.05);
            }
        }
    }

    .content {
        padding: 1.5rem 1.75rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1.75rem;

        scrollbar-width: thin;
        scrollbar-color: rgba(99, 102, 241, 0.3) transparent;

        &::-webkit-scrollbar {
            width: 6px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(99, 102, 241, 0.3);
            border-radius: 999px;

            &:hover {
                background: rgba(99, 102, 241, 0.5);
            }
        }
    }

    .section {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
    }

    .section-header {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;

        .section-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;

            &.progress-icon {
                background: rgba(56, 189, 248, 0.12);
                border: 1px solid rgba(56, 189, 248, 0.25);
                color: #38bdf8;
            }

            &.bug-icon {
                background: rgba(168, 85, 247, 0.12);
                border: 1px solid rgba(168, 85, 247, 0.25);
                color: #c084fc;
            }
        }

        h3 {
            margin: 0;
            color: #f1f5f9;
            font-size: 1.02rem;
            font-weight: 600;
        }

        .section-description {
            margin: 0.2rem 0 0;
            color: #94a3b8;
            font-size: 0.85rem;
            line-height: 1.45;
        }
    }

    .progress-box {
        background: rgba(11, 14, 20, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 0.9rem 1.1rem;
    }

    .progress-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.6rem;
        font-size: 0.82rem;

        .progress-label {
            color: #94a3b8;
            font-weight: 500;
        }

        .progress-counts {
            color: #cbd5e1;

            strong {
                color: #f8fafc;
            }

            .percent-badge {
                display: inline-block;
                margin-left: 0.45rem;
                padding: 0.1rem 0.45rem;
                border-radius: 999px;
                background: rgba(56, 189, 248, 0.15);
                color: #38bdf8;
                font-weight: 700;
                font-size: 0.75rem;
            }
        }
    }

    .progress-track {
        height: 7px;
        width: 100%;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 999px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #6366f1 0%, #38bdf8 100%);
        border-radius: 999px;
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pending-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
    }

    .pending-title {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.8rem;
        color: #94a3b8;
    }

    .character-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .character-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.75rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        font-size: 0.82rem;
        color: #cbd5e1;
        transition: all 0.2s ease;

        &:hover {
            border-color: rgba(99, 102, 241, 0.35);
            background: rgba(99, 102, 241, 0.08);
            transform: translateY(-1px);
        }

        .pending-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #f59e0b;
            box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
        }

        .character-name {
            font-weight: 500;
        }
    }

    .feedback-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    .feedback-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.85rem 1rem;
        background: rgba(11, 14, 20, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            background: rgba(24, 32, 48, 0.7);
            border-color: rgba(99, 102, 241, 0.4);
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);

            .external-arrow {
                color: #38bdf8;
                transform: translateX(2px);
            }
        }

        .card-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            &.github {
                background: rgba(255, 255, 255, 0.06);
                color: #f1f5f9;
            }

            &.discord {
                background: rgba(88, 101, 242, 0.15);
                color: #5865F2;
            }
        }

        .card-text {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;

            .card-title {
                color: #f1f5f9;
                font-size: 0.86rem;
                font-weight: 600;
            }

            .card-subtitle {
                color: #94a3b8;
                font-size: 0.74rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .external-arrow {
            color: #64748b;
            flex-shrink: 0;
            transition: all 0.2s ease;
        }
    }

    .footer {
        padding: 1.1rem 1.75rem 1.4rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: flex-end;
        background: rgba(11, 14, 20, 0.4);
    }

    .continue-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #6366f1 0%, #38bdf8 100%);
        color: #ffffff;
        border: none;
        padding: 0.65rem 1.4rem;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 0.88rem;
        box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
            filter: brightness(1.08);
        }

        &:active {
            transform: translateY(0);
        }
    }

    @media (max-width: 600px) {
        .modal {
            max-height: 90vh;
        }

        .header,
        .content,
        .footer {
            padding-left: 1.25rem;
            padding-right: 1.25rem;
        }

        .feedback-grid {
            grid-template-columns: 1fr;
        }

        .footer {
            justify-content: stretch;

            .continue-btn {
                width: 100%;
                justify-content: center;
            }
        }
    }
</style>
