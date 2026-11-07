<script lang="ts">
    export let show: boolean = false;
    export let x: number = 0;
    export let y: number = 0;
</script>

<div
    class="tooltip"
    class:show
    style="left: {x}px; top: {y}px;"
>
    <p><strong>What is this for?</strong></p>
    <p style="text-align: justify">
        Enable or disable specific mods to include or exclude them from the configuration
        used for Genshin Optimizer.
    </p>

    <p class="tooltip-note">
        <strong>Heads up:</strong> Some mods start disabled on purpose. This avoids
        double-counting buffs that Genshin Optimizer already applies by default — for
        example set bonuses with the suffix <code>-2pc</code> or passives tied to non-fixed
        stats like
        <code>nahida-a4</code>.
    </p>
    <p class="tooltip-note">
        You can enable any mod manually. Your choice persists while switching characters for
        the current file and resets when you upload a new file.
    </p>

    <div class="tooltip-color-guide">
        <div>
            <span class="mod-box active"></span> Active Mod (Included)
        </div>
        <div>
            <span class="mod-box inactive"></span> Inactive Mod (Ignored)
        </div>
    </div>
</div>

<style lang="scss">
    .tooltip {
        position: fixed;
        background: linear-gradient(145deg, rgba(25, 25, 35, 0.97), rgba(15, 15, 25, 0.97));
        color: #f5f5f5;
        padding: 1.2rem;
        border-radius: 16px;
        font-size: 0.85rem;
        line-height: 1.6;
        white-space: normal;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: scale(0.3);
        transform-origin: top left;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        width: 320px;
        max-width: 90vw;
        box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(100, 108, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(100, 108, 255, 0.15);

        &.show {
            opacity: 1;
            visibility: visible;
            pointer-events: none;
            transform: scale(1);
        }

        p {
            margin-bottom: 0.8rem;
            color: #e8e8e8;

            &:last-child {
                margin-bottom: 0;
            }
        }

        strong {
            color: #ffffff;
            font-weight: 600;
        }
    }

    .tooltip-note {
        font-size: 0.75rem;
        color: #b8b8b8;
        font-style: italic;
        border-top: 1px solid rgba(100, 108, 255, 0.2);
        padding-top: 0.7rem;
        margin-top: 0.7rem;
        background: rgba(100, 108, 255, 0.05);
        padding: 0.7rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
    }

    .tooltip-color-guide {
        display: flex;
        flex-direction: column;
        margin-top: 0.8rem;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.2);
        padding: 0.8rem;
        border-radius: 8px;
        border: 1px solid rgba(100, 108, 255, 0.1);

        > div {
            display: flex;
            align-items: center;
            font-size: 0.8rem;
            color: #d0d0d0;
        }
    }

    .mod-box {
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        margin-right: 0.7rem;
        vertical-align: middle;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.2s ease;

        &.active {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
        }

        &.inactive {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }
    }
</style>
