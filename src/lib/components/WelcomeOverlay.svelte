<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';

    const dispatch = createEventDispatcher();

    // List of pending characters (extracted from TODO.md)
    const pendingCharacters = [
        'Aino',
        'Durin',
        'Flins',
        'Iansan',
        'Ifa',
        'Jahoda',
        'Kachina',
        'Lauma',
        'Nefer',
    ];

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
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="welcome-title"
    tabindex="-1"
>
    <div class="modal">
        <div class="header">
            <h2 id="welcome-title">Welcome to GCSim to GO-MultiOpt!</h2>
            <button class="close-btn" on:click={closeOverlay} aria-label="Close">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        <div class="content">
            <div class="section">
                <h3>📋 Pending Characters to Implement</h3>
                <p class="section-description">
                    The following characters are not yet fully implemented in the converter:
                </p>
                <div class="character-grid">
                    {#each pendingCharacters as character}
                        <div class="character-item">
                            <span class="character-icon">⬜</span>
                            <span class="character-name">{character}</span>
                        </div>
                    {/each}
                </div>
                <p class="completion-info">
                    <strong>Current progress:</strong> 103/113 characters implemented (91.2% completed)
                </p>
            </div>

            <div class="section">
                <h3>🐛 Report Issues</h3>
                <p class="section-description">
                    Found a bug or technical issue? Your feedback is very valuable to improve the
                    tool.
                </p>
                <div class="report-options">
                    <a
                        href="https://github.com/TheBertDark/gcsim-to-multiopt/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="report-btn github"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                            ></path>
                        </svg>
                        Report on GitHub
                    </a>
                    <div class="contact-info">
                        <p>Or contact directly:</p>
                        <p>
                            <strong>Discord:</strong>
                            <a
                                href="https://discord.com/users/723426524585525300"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="discord-link">@.darkjake</a
                            >
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <button class="continue-btn" on:click={closeOverlay}> Continue to application </button>
        </div>
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(8px);
    }

    .modal {
        background: linear-gradient(135deg, #1a1b1e 0%, #2c2c2c 100%);
        border: 2px solid #646cff;
        border-radius: 16px;
        box-shadow:
            0 20px 60px rgba(100, 108, 255, 0.3),
            0 0 40px rgba(100, 108, 255, 0.1);
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 20px 16px;
        border-bottom: 1px solid #646cff;
        background: linear-gradient(90deg, rgba(30, 30, 60, 0.3) 0%, rgba(40, 20, 60, 0.3) 100%);
        position: relative;
    }

    .header h2 {
        margin: 0;
        color: #e4e5e7;
        font-size: 1.5rem;
        font-weight: 600;
        text-shadow: 0 0 10px rgba(100, 108, 255, 0.3);
        text-align: center;
        width: 100%;
    }

    .close-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 1px;
        border-radius: 6px;
        color: #a1a1aa;
        transition: all 0.2s;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-btn:hover {
        background-color: rgb(150, 41, 41);
        color: #e4e5e7;
        transform: scale(1.05);
        box-shadow: 0 0 8px rgb(150, 41, 41);
    }

    .content {
        padding: 24px;
        background: #1a1b1e;
    }

    .section {
        margin-bottom: 32px;
    }

    .section:last-child {
        margin-bottom: 0;
    }

    .section h3 {
        margin: 0 0 12px 0;
        color: #00ffe7;
        font-size: 1.25rem;
        font-weight: 600;
        text-shadow: 0 0 10px rgba(0, 255, 231, 0.3);
    }

    .section-description {
        margin: 0 0 16px 0;
        color: #d1d5db;
        line-height: 1.6;
    }

    .character-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
    }

    .character-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: linear-gradient(135deg, #2c2c2c 0%, #1a1b1e 100%);
        border-radius: 8px;
        border: 1px solid #646cff;
        transition: all 0.2s;
    }

    .character-item:hover {
        border-color: #00ffe7;
        box-shadow: 0 0 15px rgba(0, 255, 231, 0.2);
        transform: translateY(-1px);
    }

    .character-icon {
        font-size: 16px;
        color: #ff00cc;
    }

    .character-name {
        font-weight: 500;
        color: #e4e5e7;
    }

    .completion-info {
        margin: 0;
        padding: 12px 16px;
        background: linear-gradient(
            135deg,
            rgba(0, 255, 231, 0.1) 0%,
            rgba(100, 108, 255, 0.1) 100%
        );
        border: 1px solid #00ffe7;
        border-radius: 8px;
        color: #00ffe7;
        font-size: 0.9rem;
        box-shadow: 0 0 20px rgba(0, 255, 231, 0.1);
    }

    .report-options {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .report-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #646cff 0%, #747bff 100%);
        color: #e4e5e7;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.2s;
        align-self: flex-start;
        border: 1px solid #646cff;
    }

    .report-btn:hover {
        background: linear-gradient(135deg, #747bff 0%, #646cff 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(100, 108, 255, 0.3);
        border-color: #00ffe7;
    }

    .contact-info {
        padding: 16px;
        background: linear-gradient(135deg, #2c2c2c 0%, #1a1b1e 100%);
        border-radius: 8px;
        border: 1px solid #646cff;
    }

    .contact-info p {
        margin: 0 0 4px 0;
        color: #d1d5db;
        font-size: 0.9rem;
    }

    .contact-info p:last-child {
        margin-bottom: 0;
        color: #00ffe7;
        font-weight: 600;
    }

    .discord-link {
        color: #00ffe7;
        text-decoration: none;
        transition: all 0.2s;
        border-bottom: 1px solid transparent;
    }

    .discord-link:hover {
        color: #646cff;
        text-shadow: 0 0 8px rgba(100, 108, 255, 0.4);
        border-bottom-color: #646cff;
    }

    .footer {
        padding: 16px 24px 24px;
        border-top: 1px solid #646cff;
        display: flex;
        justify-content: center;
        background: linear-gradient(90deg, rgba(30, 30, 60, 0.3) 0%, rgba(40, 20, 60, 0.3) 100%);
    }

    .continue-btn {
        background: linear-gradient(135deg, #00ffe7 0%, #646cff 100%);
        color: #1a1b1e;
        border: none;
        padding: 12px 32px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 1rem;
        border: 1px solid #00ffe7;
        text-shadow: none;
    }

    .continue-btn:hover {
        background: linear-gradient(135deg, #646cff 0%, #00ffe7 100%);
        color: #e4e5e7;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 255, 231, 0.4);
    }

    /* Custom Scrollbar Styles */
    .modal {
        scrollbar-width: thin;
        scrollbar-color: #646cff #1a1b1e;
    }

    .modal::-webkit-scrollbar {
        width: 12px;
    }

    .modal::-webkit-scrollbar-track {
        background: linear-gradient(180deg, #1a1b1e 0%, #2c2c2c 100%);
        border-radius: 10px;
        border: 1px solid rgba(100, 108, 255, 0.2);
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
    }

    .modal::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #646cff 0%, #00ffe7 100%);
        border-radius: 10px;
        border: 2px solid #1a1b1e;
        box-shadow:
            0 0 15px rgba(100, 108, 255, 0.4),
            inset 0 0 5px rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    }

    .modal::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #00ffe7 0%, #646cff 100%);
        box-shadow:
            0 0 25px rgba(0, 255, 231, 0.6),
            inset 0 0 8px rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
    }

    .modal::-webkit-scrollbar-thumb:active {
        background: linear-gradient(180deg, #ff00cc 0%, #646cff 100%);
        box-shadow:
            0 0 30px rgba(255, 0, 204, 0.8),
            inset 0 0 10px rgba(255, 255, 255, 0.3);
    }

    .modal::-webkit-scrollbar-corner {
        background: #1a1b1e;
        border-radius: 10px;
    }

    /* Responsive design */
    @media (max-width: 640px) {
        .modal {
            width: 95%;
            margin: 20px;
        }

        .modal::-webkit-scrollbar {
            width: 8px;
        }

        .header {
            padding: 20px 20px 12px;
        }

        .content {
            padding: 20px;
        }

        .character-grid {
            grid-template-columns: 1fr;
        }

        .header h2 {
            font-size: 1.25rem;
        }
    }
</style>
