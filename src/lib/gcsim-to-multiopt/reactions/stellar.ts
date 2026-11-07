import type { LogDetails, Sample } from '../gcsim_types';
import type { Buffs } from '../types';
import { getSpecialReactionVariant, isStellarReactionAbil } from './classifiers';

export interface StellarReactionContext {
    /**
     * Resolves dynamic ability names for Stellar reactions and characters
     * (e.g. Stellar Swirl Detonation 1-2 vs 3-6 stacks, or Yae Miko Sesshou Sakura level).
     */
    resolveAbilName: (dmgEvent: LogDetails, charName: string) => string;

    /**
     * Finds the matching `snapshot` event for a Stellar reaction trigger
     * (since gcsim's `Stellar Swirl` and `Stellar Swirl Detonation` `damage` events
     * omit character stat_mods and put them on the `snapshot` event instead).
     */
    findReactionSnapshot: (dmgEvent: LogDetails) => LogDetails | undefined;

    /**
     * Applies Stellar-specific buffs (such as base damage bonus `stellarconduct_base%` / `stellarswirl_base%`
     * and elevation `stellarconduct_special%` / `stellarswirl_special%`) and exposes toggleable mods.
     */
    applyForDamageEvent: (
        dmgEvent: LogDetails,
        buffs: Buffs,
        availableMods: Record<string, boolean>,
        ignoredMods: string[]
    ) => void;
}

const LEVEL_MULTIPLIERS_90 = 1446.853458;

/**
 * Creates a context that tracks Stellar reactions (`Stellar-Conduct` and `Stellar Swirl`),
 * including Frost Vortex stack detonation tiers, Stellar Base DMG bonuses, and Elevation bonuses.
 */
export function createStellarReactionContext(
    sample: Sample,
    charIndex: number
): StellarReactionContext {
    const logs = sample.logs ?? [];

    // Pre-filter snapshots for this character
    const charSnapshots = logs.filter(
        (log: LogDetails) => log.char_index === charIndex && log.event === 'snapshot'
    );

    // Pre-filter calc events for this character
    const charCalcs = logs.filter(
        (log: LogDetails) => log.char_index === charIndex && log.event === 'calc'
    );

    // Pre-filter stellar swirl contributor 1 events (used to infer Frost Vortex stack tier)
    const contributor1Events = logs.filter(
        (log: LogDetails) =>
            log.event === 'element' && log.msg === 'stellar swirl contributor 1'
    );

    // Pre-filter Yae Miko's "sky kitsune tick at level" character events
    const yaeKitsuneLevelEvents = logs.filter(
        (log: LogDetails) =>
            log.char_index === charIndex &&
            log.event === 'character' &&
            log.msg === 'sky kitsune tick at level'
    );

    // Pre-filter Mizuki C1 flat proc events for this character
    const mizukiC1ProcEvents = logs.filter(
        (log: LogDetails) =>
            log.char_index === charIndex &&
            log.event === 'pre_damage_mods' &&
            log.msg === 'mizuki c1 proc'
    );

    const findMatchingCalc = (dmgEvent: LogDetails): LogDetails | undefined => {
        const abil = dmgEvent.logs?.['abil'] ?? '';
        const frame = dmgEvent.frame;
        return charCalcs.find(c => c.frame === frame && c.logs?.['abil'] === abil);
    };

    /**
     * Infers whether a "Stellar Swirl Detonation" at `frame` consumed 1-2 stacks (2.0x)
     * or 3-6 stacks (3.0x) of Frost Vortex.
     */
    const getDetonationVariantName = (dmgEvent: LogDetails): string => {
        const frame = dmgEvent.frame;
        const srcFrame = dmgEvent.logs?.['source_frame'] ?? frame;

        // Find the last contributor 1 event at `frame` or `srcFrame` (since if both Stellar Swirl
        // and Stellar Swirl Detonation happen on the same frame, Detonation is evaluated second).
        const candidates = contributor1Events.filter(
            e => e.frame === frame || e.frame === srcFrame
        );
        const c1 = candidates[candidates.length - 1];
        if (!c1 || !c1.logs) {
            return 'Stellar Swirl Detonation (1-2 Stacks)';
        }

        const L = c1.logs;
        const em = Number(L.em ?? 0);
        const baseDmgBonus = Number(L.base_damage_bonus ?? 0);
        const reactBonus = Number(L.react_bonus ?? 0);
        const elevation = Number(L.elevation ?? 0);
        const critMult = L.crit ? 1 + Number(L.cd ?? 0) : 1;
        const emBonus = (6 * em) / (2000 + em);

        const denom =
            (1 + baseDmgBonus) * (1 + emBonus + reactBonus) * critMult * (1 + elevation);
        if (denom > 0 && Number(L.damage) > 0) {
            const impliedBase = Number(L.damage) / denom;
            const ratio = impliedBase / LEVEL_MULTIPLIERS_90;
            if (ratio >= 2.5) {
                return 'Stellar Swirl Detonation (3-6 Stacks)';
            }
        }
        return 'Stellar Swirl Detonation (1-2 Stacks)';
    };

    /**
     * Finds the Sesshou Sakura level (1..4) for Yae Miko at `frame`.
     */
    const getYaeSakuraLevel = (frame: number): number | undefined => {
        const candidate = yaeKitsuneLevelEvents
            .filter(e => e.frame <= frame && e.frame >= frame - 5)
            .sort((a, b) => b.frame - a.frame)[0];
        const lvl = Number(candidate?.logs?.['sakura level']);
        if (!Number.isNaN(lvl) && lvl >= 1 && lvl <= 4) {
            return lvl;
        }
        return undefined;
    };

    return {
        resolveAbilName(dmgEvent: LogDetails, charName: string): string {
            const rawAbil: string = dmgEvent.logs?.['abil'] ?? '';

            if (rawAbil === 'Stellar Swirl Detonation') {
                return getDetonationVariantName(dmgEvent);
            }

            if (
                charName.toLowerCase() === 'yaemiko' &&
                rawAbil === 'Sesshou Sakura Tick'
            ) {
                const lvl = getYaeSakuraLevel(dmgEvent.frame);
                if (lvl) {
                    return `Sesshou Sakura Tick (Lvl ${lvl})`;
                }
            }

            return rawAbil;
        },

        findReactionSnapshot(dmgEvent: LogDetails): LogDetails | undefined {
            const rawAbil: string = dmgEvent.logs?.['abil'] ?? '';
            if (!isStellarReactionAbil(rawAbil)) return undefined;

            const baseAbil = rawAbil.replace(' (Mizuki C1)', '');
            const frame = dmgEvent.frame;
            const srcFrame = dmgEvent.logs?.['source_frame'];

            if (typeof srcFrame === 'number') {
                const snapAtSrc = charSnapshots.find(
                    s =>
                        s.frame === srcFrame &&
                        (s.logs?.['abil'] === rawAbil || s.logs?.['abil'] === baseAbil)
                );
                if (snapAtSrc) return snapAtSrc;
            }

            return charSnapshots.find(
                s =>
                    s.frame === frame &&
                    (s.logs?.['abil'] === rawAbil || s.logs?.['abil'] === baseAbil)
            );
        },

        applyForDamageEvent(
            dmgEvent: LogDetails,
            buffs: Buffs,
            availableMods: Record<string, boolean>,
            ignoredMods: string[]
        ): void {
            const rawAbil: string = dmgEvent.logs?.['abil'] ?? '';
            const attackTag: number | undefined = dmgEvent.logs?.['attack-tag'];
            const variant = getSpecialReactionVariant(rawAbil, attackTag);
            if (variant !== 'stellarconduct' && variant !== 'stellarswirl') {
                return;
            }

            const frame = dmgEvent.frame;
            const srcFrame = dmgEvent.logs?.['source_frame'] ?? frame;
            const calc = findMatchingCalc(dmgEvent);

            // Check for Stellar Base DMG bonus (e.g. Odette A0 +14%, Traveler Cryo A0 +7%)
            let baseDmgBonus = Number(calc?.logs?.['react_base_dmg_bonus'] ?? 0);
            if (baseDmgBonus === 0 && isStellarReactionAbil(rawAbil)) {
                const c1 = contributor1Events.find(
                    e => e.frame === frame || e.frame === srcFrame
                );
                baseDmgBonus = Number(c1?.logs?.['base_damage_bonus'] ?? 0);
            }

            if (baseDmgBonus > 0) {
                const modKey = 'stellar-base-dmg';
                availableMods[modKey] = true;
                if (!ignoredMods.includes(modKey)) {
                    const statKey = `${variant}_base%`;
                    buffs[statKey] = (buffs[statKey] ?? 0) + baseDmgBonus;
                }
            }

            // Check for Stellar Elevation / Special DMG bonus (e.g. Odette C6)
            let elevationBonus = Number(calc?.logs?.['elevation_bonus'] ?? 0);
            if (elevationBonus === 0 && isStellarReactionAbil(rawAbil)) {
                const c1 = contributor1Events.find(
                    e => e.frame === frame || e.frame === srcFrame
                );
                elevationBonus = Number(c1?.logs?.['elevation'] ?? 0);
            }

            if (elevationBonus > 0) {
                const modKey = 'stellar-elevation-dmg';
                availableMods[modKey] = true;
                if (!ignoredMods.includes(modKey)) {
                    const statKey = `${variant}_special%`;
                    buffs[statKey] = (buffs[statKey] ?? 0) + elevationBonus;
                }
            }

            // Check for Mizuki C1 flat damage proc on Stellar Swirl / Swirl
            if (rawAbil.includes('(Mizuki C1)')) {
                const c1Proc = mizukiC1ProcEvents.find(
                    l => l.frame === frame || l.frame === srcFrame
                );
                const addition = Number(c1Proc?.logs?.['addition'] ?? 0);
                if (addition > 0) {
                    const modKey = 'mizuki-c1-flat';
                    availableMods[modKey] = true;
                    if (!ignoredMods.includes(modKey)) {
                        buffs['stellarswirl_flat'] =
                            (buffs['stellarswirl_flat'] ?? 0) + addition;
                    }
                }
            }
        },
    };
}
