import type { LogDetails } from '../gcsim_types';
import type { Buffs } from '../types';
import { getReactionBonusStatKey } from './classifiers';

export interface ReactBonusTracker {
    /**
     * Applies any `[React Bonus]` modifiers logged for the given damage event
     * into `buffs` and records discovered mod keys into `availableMods`.
     */
    applyForDamageEvent: (
        dmgEvent: LogDetails,
        buffs: Buffs,
        availableMods: Record<string, boolean>,
        ignoredMods: string[]
    ) => void;
}

/**
 * Builds a tracker that indexes `pre_damage_mods` events ending in `" [React Bonus]"`
 * emitted by `CharWrapper.ReactBonus` in gcsim (`pkg/core/player/character/mods.go`).
 */
export function createReactBonusTracker(
    allLogs: LogDetails[],
    charIndex: number
): ReactBonusTracker {
    // Filter all [React Bonus] events for this character
    const reactBonusEvents = (allLogs ?? []).filter(
        (log: LogDetails) =>
            log.char_index === charIndex &&
            log.event === 'pre_damage_mods' &&
            typeof log.msg === 'string' &&
            log.msg.endsWith(' [React Bonus]')
    );

    const findMatchingReactBonus = (dmgEvent: LogDetails): LogDetails | undefined => {
        const abil: string = dmgEvent.logs?.['abil'] ?? '';
        const baseAbil = abil.replace(' (Mizuki C1)', '');
        const frame = dmgEvent.frame;
        const srcFrame = dmgEvent.logs?.['source_frame'];

        const expectedMsg = `${abil} [React Bonus]`;
        const expectedBaseMsg = `${baseAbil} [React Bonus]`;

        // 1. Exact frame match on damage frame
        const onFrame = reactBonusEvents.find(
            e =>
                e.frame === frame &&
                (e.msg === expectedMsg || e.msg === expectedBaseMsg)
        );
        if (onFrame) return onFrame;

        // 2. Match on source_frame (e.g. Stellar Swirl queued 3 frames after snapshot)
        if (typeof srcFrame === 'number') {
            const onSrcFrame = reactBonusEvents.find(
                e =>
                    e.frame === srcFrame &&
                    (e.msg === expectedMsg || e.msg === expectedBaseMsg)
            );
            if (onSrcFrame) return onSrcFrame;
        }

        // 3. Fallback: within 3 frames before the damage event
        return reactBonusEvents.find(
            e =>
                e.frame >= frame - 3 &&
                e.frame <= frame &&
                (e.msg === expectedMsg || e.msg === expectedBaseMsg)
        );
    };

    return {
        applyForDamageEvent(
            dmgEvent: LogDetails,
            buffs: Buffs,
            availableMods: Record<string, boolean>,
            ignoredMods: string[]
        ): void {
            const rbEvent = findMatchingReactBonus(dmgEvent);
            if (!rbEvent || !rbEvent.logs) return;

            const abil: string = dmgEvent.logs?.['abil'] ?? '';
            const attackTag: number | undefined = dmgEvent.logs?.['attack-tag'];
            const statKey = getReactionBonusStatKey(abil, attackTag);
            if (!statKey) return;

            for (const [modKey, rawVal] of Object.entries(rbEvent.logs)) {
                const val = Number(rawVal);
                if (Number.isNaN(val) || val === 0) continue;

                availableMods[modKey] = true;
                if (ignoredMods.includes(modKey)) continue;

                buffs[statKey] = (buffs[statKey] ?? 0) + val;
            }
        },
    };
}
