<script lang="ts">
    export let isPlaying: boolean = false;
    export let currentTrackIndex: number = 0;
    export let totalTracks: number = 4;
    export let isMuted: boolean = false;

    export let onTogglePlay: () => void;
    export let onNextTrack: () => void;
    export let onPrevTrack: () => void;
    export let onToggleMute: () => void;
    export let onExitTheme: () => void;
</script>

<aside class="retro-hud" aria-label="Retro Arcade Audio Player">
    <div class="hud-header">
        <div class="arcade-badge">
            <span class="blinking-dot"></span>
            <span>CHIPTUNE JUKEBOX</span>
        </div>

        <div class="visualizer" class:active={isPlaying}>
            <span class="bar bar-1"></span>
            <span class="bar bar-2"></span>
            <span class="bar bar-3"></span>
            <span class="bar bar-4"></span>
        </div>

        <button
            type="button"
            class="exit-btn"
            on:click={onExitTheme}
            title="Exit Retro Mode"
            aria-label="Exit Retro Mode"
        >
            <span>OFF</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    </div>

    <div class="hud-body">
        <div class="track-indicator">
            <span class="track-label">TRACK</span>
            <span class="track-num">{String(currentTrackIndex + 1).padStart(2, '0')}/{String(totalTracks).padStart(2, '0')}</span>
        </div>

        <div class="controls-group">
            <button
                type="button"
                class="ctrl-btn"
                on:click={onPrevTrack}
                title="Previous track"
                aria-label="Previous track"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polygon points="19 20 9 12 19 4 19 20"></polygon>
                    <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
            </button>

            <button
                type="button"
                class="ctrl-btn play-btn"
                class:playing={isPlaying}
                on:click={onTogglePlay}
                title={isPlaying ? 'Pause music' : 'Play music'}
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
            >
                {#if isPlaying}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                {:else}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                {/if}
            </button>

            <button
                type="button"
                class="ctrl-btn"
                on:click={onNextTrack}
                title="Next track"
                aria-label="Next track"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                    <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
            </button>

            <button
                type="button"
                class="ctrl-btn mute-btn"
                class:muted={isMuted}
                on:click={onToggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
                {#if isMuted}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                    </svg>
                {:else}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                {/if}
            </button>
        </div>
    </div>
</aside>

<style lang="scss">
    .retro-hud {
        position: fixed;
        top: 1.25rem;
        right: 1.25rem;
        z-index: 10001;
        background: rgba(12, 5, 26, 0.94);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 2px solid #ff00ff;
        border-radius: 12px;
        padding: 0.65rem 0.85rem;
        box-shadow:
            0 0 18px rgba(255, 0, 255, 0.45),
            0 0 35px rgba(0, 255, 204, 0.25),
            inset 0 0 12px rgba(255, 0, 255, 0.15);
        color: #00ffcc;
        font-family: 'Press Start 2P', monospace;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        animation: hudSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        user-select: none;
    }

    @keyframes hudSlideDown {
        from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .hud-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        border-bottom: 1px dashed rgba(255, 0, 255, 0.4);
        padding-bottom: 0.45rem;
    }

    .arcade-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.58rem;
        color: #ff00ff;
        text-shadow: 0 0 6px rgba(255, 0, 255, 0.7);

        .blinking-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #00ffcc;
            box-shadow: 0 0 8px #00ffcc;
            animation: blink 1s infinite alternate;
        }
    }

    @keyframes blink {
        from { opacity: 0.3; }
        to { opacity: 1; }
    }

    .visualizer {
        display: flex;
        align-items: flex-end;
        gap: 2px;
        height: 12px;

        .bar {
            width: 3px;
            height: 3px;
            background: #00ffcc;
            border-radius: 1px;
            transition: height 0.15s ease;
        }

        &.active {
            .bar-1 { animation: soundBar 0.5s ease-in-out infinite alternate; }
            .bar-2 { animation: soundBar 0.7s ease-in-out 0.15s infinite alternate; }
            .bar-3 { animation: soundBar 0.4s ease-in-out 0.25s infinite alternate; }
            .bar-4 { animation: soundBar 0.6s ease-in-out 0.05s infinite alternate; }
        }
    }

    @keyframes soundBar {
        0% { height: 3px; background: #00ffcc; }
        50% { background: #ff00ff; }
        100% { height: 12px; background: #ffff00; }
    }

    .exit-btn {
        background: rgba(255, 0, 85, 0.15);
        border: 1px solid rgba(255, 0, 85, 0.5);
        color: #ff0055;
        border-radius: 6px;
        padding: 0.2rem 0.4rem;
        font-size: 0.55rem;
        font-family: inherit;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background: #ff0055;
            color: #ffffff;
            box-shadow: 0 0 10px #ff0055;
            transform: scale(1.05);
        }
    }

    .hud-body {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.85rem;
    }

    .track-indicator {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;

        .track-label {
            font-size: 0.5rem;
            color: #8874a6;
        }

        .track-num {
            font-size: 0.75rem;
            color: #00ffcc;
            text-shadow: 0 0 6px #00ffcc;
        }
    }

    .controls-group {
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }

    .ctrl-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(0, 255, 204, 0.3);
        color: #00ffcc;
        border-radius: 6px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition: all 0.2s ease;

        &:hover {
            background: rgba(0, 255, 204, 0.2);
            border-color: #00ffcc;
            box-shadow: 0 0 10px rgba(0, 255, 204, 0.5);
            transform: scale(1.08);
        }

        &:active {
            transform: scale(0.95);
        }

        &.play-btn {
            background: rgba(255, 0, 255, 0.2);
            border-color: #ff00ff;
            color: #ff00ff;
            width: 32px;
            height: 32px;

            &:hover {
                background: #ff00ff;
                color: #ffffff;
                box-shadow: 0 0 15px #ff00ff;
            }

            &.playing {
                border-color: #00ffcc;
                color: #00ffcc;
                background: rgba(0, 255, 204, 0.2);

                &:hover {
                    background: #00ffcc;
                    color: #0c051a;
                    box-shadow: 0 0 15px #00ffcc;
                }
            }
        }

        &.mute-btn.muted {
            color: #ff0055;
            border-color: #ff0055;
            background: rgba(255, 0, 85, 0.15);
        }
    }

    @media (max-width: 600px) {
        .retro-hud {
            top: auto;
            bottom: 4.5rem;
            right: 0.75rem;
            left: 0.75rem;
        }
    }
</style>
