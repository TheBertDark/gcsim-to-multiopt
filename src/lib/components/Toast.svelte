<script lang="ts">
    export let show: boolean = false;
    export let message: string = 'Copied to clipboard!';
    export let icon: string = '✓';
</script>

<div class="toast-container">
    <div class="toast" class:show>
        <span class="check-icon">{icon}</span>
        <span class="toast-message">{message}</span>
    </div>
</div>

<style lang="scss">
    .toast-container {
        position: fixed;
        bottom: 2rem;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        pointer-events: none;
        z-index: 10000;
    }

    .toast {
        background: rgba(18, 23, 34, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 0.75rem 1.4rem;
        border-radius: 12px;
        color: #f1f5f9;
        font-size: 0.88rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.2);
        opacity: 0;
        transform: translateY(1rem) scale(0.96);
        transition:
            opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

        &.show {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        .check-icon {
            color: #38bdf8;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
        }

        .toast-message {
            white-space: nowrap;
        }
    }

    :global(body.neon-retro-theme) .toast {
        background: rgba(13, 6, 26, 0.95);
        border: 2px solid #00ffcc;
        box-shadow: 0 0 20px rgba(0, 255, 204, 0.5), 0 0 35px rgba(255, 0, 255, 0.3);
        color: #00ffcc;
        font-family: 'Press Start 2P', monospace;
        font-size: 0.75rem;

        .check-icon {
            color: #ff00ff;
            text-shadow: 0 0 8px #ff00ff;
        }
    }
</style>
