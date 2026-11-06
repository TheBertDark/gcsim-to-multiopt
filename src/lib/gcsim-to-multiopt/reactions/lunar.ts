import type { Character, LogDetails, Sample } from '../gcsim_types';
import type { Buffs } from '../types';
import { getSpecialReactionVariant, isLunarReactionAbil } from './classifiers';

const buffNumberRegex = /(\w+%?):\s*(\S+)/;
const PALE_HYMN_REACTIONS = new Set(['bloom', 'burgeon', 'hyperbloom']);

export interface LunarReactionContext {
    applyForDamageEvent: (
        dmgEvent: LogDetails,
        buffs: Buffs,
        transformative: boolean,
        ignoredMods: string[]
    ) => void;
    registerAvailableMods: (availableMods: Record<string, boolean>) => void;
}

/**
 * Creates a context that tracks Lunar reaction statuses, artifact sets,
 * Moonsign (Ascendant Gleam), and Lauma Pale Hymn / A1 mechanics.
 */
export function createLunarReactionContext(
    sample: Sample,
    charIndex: number,
    hasFlowerEquipped: boolean
): LunarReactionContext {
    const logs = sample.logs ?? [];

    // 1. Silken Moon's Serenade 4pc: gleaming-moon-devotion-reaction (+10% Lunar Reaction DMG when EM buff active)
    const hasGleamingMoonReaction = logs.some(
        (log: LogDetails) =>
            log.event === 'status' && log.logs?.key === 'gleaming-moon-devotion-reaction'
    );
    const gleamingMoonEMWindows: { start: number; expiry: number }[] = [];
    if (hasGleamingMoonReaction) {
        const emStatuses = logs.filter(
            (log: LogDetails) =>
                log.event === 'status' && log.logs?.key === 'gleaming-moon-devotion-em'
        );
        for (const s of emStatuses) {
            gleamingMoonEMWindows.push({ start: s.frame, expiry: s.logs?.expiry ?? s.frame });
        }
    }
    const isGleamingMoonEMActive = (frame: number): boolean =>
        gleamingMoonEMWindows.some(w => frame >= w.start && frame <= w.expiry);

    // 2. Night of the Sky's Unveiling 4pc: gleaming-moon-intent-reaction (+10% Lunar DMG and +15%/30% CR)
    const hasGleamingMoonIntent = logs.some(
        (log: LogDetails) =>
            log.event === 'status' && log.logs?.key === 'gleaming-moon-intent-reaction'
    );
    const gleamingMoonIntentCRWindows: { start: number; expiry: number }[] = [];
    if (hasGleamingMoonIntent) {
        const crStatuses = logs.filter(
            (log: LogDetails) =>
                log.event === 'status' && log.logs?.key === 'gleaming-moon-intent-cr'
        );
        for (const s of crStatuses) {
            gleamingMoonIntentCRWindows.push({ start: s.frame, expiry: s.logs?.expiry ?? s.frame });
        }
    }
    const isGleamingMoonIntentCRActive = (frame: number): boolean =>
        gleamingMoonIntentCRWindows.some(w => frame >= w.start && frame <= w.expiry);

    // 3. Moonsign level: ascendant-gleam status is set when party Moonsign >= 2
    const isAscendantGleam = logs.some(
        (log: LogDetails) =>
            log.event === 'status' && log.logs?.key === 'ascendant-gleam'
    );
    const intentCRBonus = isAscendantGleam ? 0.30 : 0.15;

    // Track Ascendant Gleam non-Moonsign bonus dynamically per frame (capped at 36%, cannot stack)
    const ascendantGleamTimeline: { frame: number; amt: number }[] = [];
    let hasPositiveAscendantGleam = false;
    if (isAscendantGleam) {
        const preDmgMods = logs.filter(
            (log: LogDetails) =>
                log.event === 'pre_damage_mods' &&
                log.msg === 'Adding ascendant gleam react bonus'
        );
        for (const m of preDmgMods) {
            const amt = Math.min(Number(m.logs?.amt ?? 0), 0.36);
            if (amt > 0) hasPositiveAscendantGleam = true;
            ascendantGleamTimeline.push({ frame: m.frame, amt });
        }
    }
    const getAscendantGleamBonusAtFrame = (frame: number): number => {
        if (!hasPositiveAscendantGleam) return 0;
        let currentAmt = 0;
        for (const entry of ascendantGleamTimeline) {
            if (entry.frame <= frame) {
                currentAmt = entry.amt;
            } else {
                break;
            }
        }
        return currentAmt;
    };

    // 3b. Columbina Burst ("columbina-q-buff") Lunar Reaction DMG% bonus
    const columbinaQEvents = logs.filter(
        (log: LogDetails) =>
            log.event === 'status' &&
            log.char_index === charIndex &&
            log.logs?.key === 'columbina-q-buff'
    );
    const hasColumbinaQBuff = columbinaQEvents.length > 0;
    const columbinaQWindows: { start: number; expiry: number }[] = columbinaQEvents.map(
        (s: LogDetails) => ({
            start: s.frame,
            expiry: s.logs?.expiry ?? s.frame,
        })
    );
    const isColumbinaQActive = (frame: number): boolean =>
        columbinaQWindows.some(w => frame >= w.start && frame <= w.expiry);
    let columbinaQBonus = 0;
    if (hasColumbinaQBuff) {
        const columbinaChar = (sample.character_details ?? []).find(
            (c: Character) => c.name === 'columbina'
        );
        const burstLvl = columbinaChar?.talents?.burst ?? 9;
        // Columbina Q Lunar Reaction DMG% scaling by talent level (13% at Lv1 -> 37% at Lv9 -> 40% at Lv10)
        const COLUMBINA_Q_SCALING: Record<number, number> = {
            1: 0.13,
            2: 0.16,
            3: 0.19,
            4: 0.22,
            5: 0.25,
            6: 0.28,
            7: 0.31,
            8: 0.34,
            9: 0.37,
            10: 0.40,
            11: 0.43,
            12: 0.46,
            13: 0.49,
        };
        columbinaQBonus = COLUMBINA_Q_SCALING[burstLvl] ?? 0.37;
    }

    // 3c. Aubade of Morningstar and Moon 4pc ("morningstar-4pc") Lunar Reaction DMG% bonus (+20% always, +40% off-field)
    const hasMorningstar4pc = logs.some(
        (log: LogDetails) =>
            log.event === 'status' &&
            log.char_index === charIndex &&
            log.logs?.key === 'morningstar-4pc'
    );
    const morningstarOnfieldWindows: { start: number; expiry: number }[] = [];
    if (hasMorningstar4pc) {
        const onfieldEvents = logs.filter(
            (log: LogDetails) =>
                log.event === 'status' &&
                log.char_index === charIndex &&
                log.logs?.key === 'morningstar-4pc-onfield'
        );
        for (const s of onfieldEvents) {
            morningstarOnfieldWindows.push({
                start: s.frame,
                expiry: s.logs?.expiry ?? s.frame,
            });
        }
    }
    const isMorningstarOnfield = (frame: number): boolean =>
        morningstarOnfieldWindows.some(w => frame >= w.start && frame <= w.expiry);

    // 4. Lauma Pale Hymn burst flat reaction bonus
    const paleHymnPerFrameBonus: Map<number, Record<string, number>> = new Map();
    let paleHymnActiveFrames: Set<number> = new Set();
    const paleHymnStatus = logs.find(
        (log: LogDetails) => log.event === 'status' && log.logs?.key === 'lauma-pale-hymn-burst'
    );
    const hasPaleHymn = !!paleHymnStatus;

    if (hasPaleHymn) {
        const paleHymnStart = paleHymnStatus!.frame;
        const paleHymnEnd = paleHymnStatus!.logs?.expiry ?? paleHymnStart;

        const calcEvents = logs.filter(
            (log: LogDetails) =>
                log.event === 'calc' &&
                log.char_index === charIndex &&
                PALE_HYMN_REACTIONS.has(log.logs?.abil ?? '') &&
                log.logs?.flat_dmg != null
        );

        const lunarBloomCalcEvents = logs.filter(
            (log: LogDetails) =>
                log.event === 'calc' &&
                log.char_index === charIndex &&
                (log.logs?.abil ?? '').includes('Lunar-Bloom') &&
                log.logs?.flat_dmg != null
        );

        const paleHymnConsumed = logs
            .filter(
                (log: LogDetails) =>
                    log.event === 'character' &&
                    log.logs?.remaining != null &&
                    log.frame >= paleHymnStart &&
                    log.frame <= paleHymnEnd
            )
            .sort((a: LogDetails, b: LogDetails) => a.frame - b.frame);

        const framesWithPaleHymn = new Set(paleHymnConsumed.map(l => l.frame));
        paleHymnActiveFrames = framesWithPaleHymn;

        for (const reaction of PALE_HYMN_REACTIONS) {
            const reactionCalcs = calcEvents.filter(c => c.logs?.abil === reaction);
            if (reactionCalcs.length === 0) continue;

            const withBurst = reactionCalcs.filter(c => framesWithPaleHymn.has(c.frame));
            const withoutBurst = reactionCalcs.filter(
                c => !framesWithPaleHymn.has(c.frame) && c.logs?.damage > 0
            );

            if (withBurst.length > 0 && withoutBurst.length > 0) {
                const refByEM: Map<number, number[]> = new Map();
                for (const c of withoutBurst) {
                    const em = c.logs.em;
                    if (!refByEM.has(em)) refByEM.set(em, []);
                    refByEM.get(em)!.push(c.logs.flat_dmg);
                }
                const refAvgByEM: Map<number, number> = new Map();
                for (const [em, values] of refByEM) {
                    refAvgByEM.set(em, values.reduce((a, b) => a + b, 0) / values.length);
                }
                const getRef = (em: number): number => {
                    if (refAvgByEM.has(em)) return refAvgByEM.get(em)!;
                    let closest = 0;
                    let minDist = Infinity;
                    for (const [refEM, avg] of refAvgByEM) {
                        const dist = Math.abs(refEM - em);
                        if (dist < minDist) {
                            minDist = dist;
                            closest = avg;
                        }
                    }
                    return closest;
                };

                for (const c of withBurst) {
                    const ref = getRef(c.logs.em);
                    const diff = c.logs.flat_dmg - ref;
                    if (diff > 0) {
                        const statKey = `${reaction}_flat`;
                        if (!paleHymnPerFrameBonus.has(c.frame)) {
                            paleHymnPerFrameBonus.set(c.frame, {});
                        }
                        paleHymnPerFrameBonus.get(c.frame)![statKey] = diff;
                    }
                }
            } else if (withBurst.length > 0 && withoutBurst.length === 0) {
                const laumaIndex = sample.character_details!.findIndex(
                    (c: Character) => c.name === 'lauma'
                );
                if (laumaIndex >= 0) {
                    const laumaCharEvent = logs.find(
                        (log: LogDetails) =>
                            log.char_index === laumaIndex &&
                            log.event === 'character' &&
                            log.logs?.em != null
                    );
                    if (laumaCharEvent) {
                        const laumaEM = parseFloat(laumaCharEvent.logs.em);
                        const etherlightStatus = logs.find(
                            (log: LogDetails) =>
                                log.event === 'status' && log.logs?.key === 'etherlight'
                        );
                        let etherlightEM = 0;
                        if (etherlightStatus) {
                            const etherlightDmg = logs.find(
                                (log: LogDetails) =>
                                    log.event === 'damage' && log.logs?.['etherlight'] != null
                            );
                            if (etherlightDmg) {
                                const etherBuff = etherlightDmg.logs['etherlight'];
                                if (Array.isArray(etherBuff)) {
                                    for (const b of etherBuff) {
                                        const m = buffNumberRegex.exec(String(b));
                                        if (m && m[1] === 'em') {
                                            etherlightEM = parseFloat(m[2]);
                                        }
                                    }
                                }
                            }
                        }
                        void (laumaEM + etherlightEM);
                        for (const c of withBurst) {
                            const charEM = c.logs.em;
                            const emFactor = (16 * charEM) / (2000 + charEM);
                            const reactionMult =
                                reaction === 'bloom' ? 2.0 : reaction === 'hyperbloom' ? 3.0 : 3.0;
                            const baseReaction = 1446.85 * (1 + emFactor) * reactionMult;
                            const potentialBurstBonus = c.logs.flat_dmg - baseReaction;
                            let burstBonus = potentialBurstBonus;
                            if (hasFlowerEquipped) {
                                const foplEstimate = baseReaction * 0.4;
                                burstBonus = potentialBurstBonus - foplEstimate;
                            }
                            if (burstBonus > 0) {
                                const statKey = `${reaction}_flat`;
                                if (!paleHymnPerFrameBonus.has(c.frame)) {
                                    paleHymnPerFrameBonus.set(c.frame, {});
                                }
                                paleHymnPerFrameBonus.get(c.frame)![statKey] = burstBonus;
                            }
                        }
                    }
                }
            }
        }

        if (lunarBloomCalcEvents.length > 0) {
            const withBurst = lunarBloomCalcEvents.filter(c => framesWithPaleHymn.has(c.frame));
            const withoutBurst = lunarBloomCalcEvents.filter(
                c => !framesWithPaleHymn.has(c.frame) && c.logs?.damage > 0
            );

            if (withBurst.length > 0 && withoutBurst.length > 0) {
                const refByEM: Map<number, number[]> = new Map();
                for (const c of withoutBurst) {
                    const em = c.logs.em;
                    if (!refByEM.has(em)) refByEM.set(em, []);
                    refByEM.get(em)!.push(c.logs.flat_dmg);
                }
                const refAvgByEM: Map<number, number> = new Map();
                for (const [em, values] of refByEM) {
                    refAvgByEM.set(em, values.reduce((a, b) => a + b, 0) / values.length);
                }
                const getRef = (em: number): number => {
                    if (refAvgByEM.has(em)) return refAvgByEM.get(em)!;
                    let closest = 0;
                    let minDist = Infinity;
                    for (const [refEM, avg] of refAvgByEM) {
                        if (Math.abs(refEM - em) < minDist) {
                            minDist = Math.abs(refEM - em);
                            closest = avg;
                        }
                    }
                    return closest;
                };
                for (const c of withBurst) {
                    const ref = getRef(c.logs.em);
                    const diff = c.logs.flat_dmg - ref;
                    if (diff > 0) {
                        if (!paleHymnPerFrameBonus.has(c.frame)) {
                            paleHymnPerFrameBonus.set(c.frame, {});
                        }
                        paleHymnPerFrameBonus.get(c.frame)!['lunarbloom_flat'] = diff;
                    }
                }
            } else if (withBurst.length > 0) {
                for (const c of withBurst) {
                    if (c.logs.flat_dmg > 0) {
                        if (!paleHymnPerFrameBonus.has(c.frame)) {
                            paleHymnPerFrameBonus.set(c.frame, {});
                        }
                        paleHymnPerFrameBonus.get(c.frame)!['lunarbloom_flat'] = c.logs.flat_dmg;
                    }
                }
            }
        }
    }

    // 5. Lauma A1 "Light for the Frosty Night" — synthetic CR/CD for reactions
    const a1StatusEvents = logs.filter(
        (log: LogDetails) =>
            log.event === 'status' && log.logs?.key === 'light-for-the-frosty-night'
    );
    const hasLaumaA1 = a1StatusEvents.length > 0;
    const a1Windows: { start: number; expiry: number }[] = a1StatusEvents.map((s: LogDetails) => ({
        start: s.frame,
        expiry: s.logs?.expiry ?? s.frame,
    }));
    const isA1Active = (frame: number): boolean =>
        a1Windows.some(w => frame >= w.start && frame <= w.expiry);

    let a1IsNascent = false;
    let a1IsAscendant = false;
    if (hasLaumaA1) {
        if (isAscendantGleam) {
            a1IsAscendant = true;
        } else {
            const reactionCalcsWithA1 = logs.filter(
                (log: LogDetails) =>
                    log.event === 'calc' &&
                    log.char_index === charIndex &&
                    PALE_HYMN_REACTIONS.has(log.logs?.abil ?? '') &&
                    isA1Active(log.frame) &&
                    log.logs?.cr > 0
            );
            if (reactionCalcsWithA1.length > 0) {
                a1IsNascent = true;
            }
        }
    }

    return {
        applyForDamageEvent(
            dmgEvent: LogDetails,
            buffs: Buffs,
            transformative: boolean,
            ignoredMods: string[]
        ): void {
            const name: string = dmgEvent.logs?.['abil'] ?? '';
            const frame = dmgEvent.frame;
            const lunarVariant = getSpecialReactionVariant(name, dmgEvent.logs?.['attack-tag']);
            const lunarStatKey = lunarVariant ? `${lunarVariant}%` : undefined;

            // Lauma Pale Hymn burst flat reaction bonus
            if (
                hasPaleHymn &&
                !ignoredMods.includes('lauma-pale-hymn-burst') &&
                paleHymnActiveFrames.has(frame) &&
                paleHymnPerFrameBonus.has(frame)
            ) {
                const frameBonus = paleHymnPerFrameBonus.get(frame)!;
                for (const [statKey, value] of Object.entries(frameBonus)) {
                    const isMatchingReaction =
                        (transformative &&
                            PALE_HYMN_REACTIONS.has(name) &&
                            statKey === `${name}_flat`) ||
                        (name.includes('Lunar-Bloom') && statKey === 'lunarbloom_flat');
                    if (isMatchingReaction && value > 0) {
                        buffs[statKey] = (buffs[statKey] ?? 0) + value;
                    }
                }
            }

            // Silken Moon's Serenade 4pc (+10% Lunar Reaction DMG)
            if (
                hasGleamingMoonReaction &&
                !ignoredMods.includes('gleaming-moon-devotion-reaction') &&
                isLunarReactionAbil(name) &&
                isGleamingMoonEMActive(frame) &&
                lunarStatKey
            ) {
                buffs[lunarStatKey] = (buffs[lunarStatKey] ?? 0) + 0.1;
            }

            // Night of the Sky's Unveiling 4pc (+10% Lunar Reaction DMG + CR)
            if (
                hasGleamingMoonIntent &&
                !ignoredMods.includes('gleaming-moon-intent-reaction') &&
                isLunarReactionAbil(name) &&
                lunarStatKey
            ) {
                buffs[lunarStatKey] = (buffs[lunarStatKey] ?? 0) + 0.1;
                // Only add synthetic CR if the damage event did not already log 'gleaming-moon-intent-cr'
                // (talent/direct hits already carry 'gleaming-moon-intent-cr' in their stat_mods).
                if (
                    dmgEvent.logs?.['gleaming-moon-intent-cr'] == null &&
                    !ignoredMods.includes('gleaming-moon-intent-cr') &&
                    isGleamingMoonIntentCRActive(frame)
                ) {
                    buffs['cr'] = (buffs['cr'] ?? 0) + intentCRBonus;
                }
            }

            // Ascendant Gleam non-Moonsign Lunar Reaction DMG% bonus
            const currentAscendantBonus = getAscendantGleamBonusAtFrame(frame);
            if (
                isAscendantGleam &&
                currentAscendantBonus > 0 &&
                !ignoredMods.includes('ascendant-gleam') &&
                isLunarReactionAbil(name) &&
                lunarStatKey
            ) {
                buffs[lunarStatKey] = (buffs[lunarStatKey] ?? 0) + currentAscendantBonus;
            }

            // Columbina Burst ("columbina-q-buff") Lunar Reaction DMG% bonus
            if (
                hasColumbinaQBuff &&
                columbinaQBonus > 0 &&
                !ignoredMods.includes('columbina-q-buff') &&
                isLunarReactionAbil(name) &&
                isColumbinaQActive(frame) &&
                lunarStatKey
            ) {
                buffs[lunarStatKey] = (buffs[lunarStatKey] ?? 0) + columbinaQBonus;
            }

            // Aubade of Morningstar and Moon 4pc ("morningstar-4pc") Lunar Reaction DMG% bonus
            if (
                hasMorningstar4pc &&
                !ignoredMods.includes('morningstar-4pc') &&
                isLunarReactionAbil(name) &&
                lunarStatKey
            ) {
                const morningstarBonus = isMorningstarOnfield(frame) ? 0.2 : 0.6;
                buffs[lunarStatKey] = (buffs[lunarStatKey] ?? 0) + morningstarBonus;
            }

            // Lauma A1 "Light for the Frosty Night" synthetic CR/CD
            if (hasLaumaA1 && !ignoredMods.includes('lauma-a1') && isA1Active(frame)) {
                if (a1IsNascent && transformative && PALE_HYMN_REACTIONS.has(name)) {
                    buffs['cr'] = (buffs['cr'] ?? 0) + 0.15;
                    buffs['cd'] = (buffs['cd'] ?? 0) + 1.0;
                }
                if (a1IsAscendant && name.includes('Lunar-Bloom')) {
                    buffs['cr'] = (buffs['cr'] ?? 0) + 0.1;
                    buffs['cd'] = (buffs['cd'] ?? 0) + 0.2;
                }
            }
        },

        registerAvailableMods(availableMods: Record<string, boolean>): void {
            if (hasPaleHymn && paleHymnPerFrameBonus.size > 0) {
                availableMods['lauma-pale-hymn-burst'] = true;
            }
            if (hasGleamingMoonReaction) {
                availableMods['gleaming-moon-devotion-reaction'] = true;
            }
            if (hasGleamingMoonIntent) {
                availableMods['gleaming-moon-intent-reaction'] = true;
            }
            if (isAscendantGleam && hasPositiveAscendantGleam) {
                availableMods['ascendant-gleam'] = true;
            }
            if (hasColumbinaQBuff) {
                availableMods['columbina-q-buff'] = true;
            }
            if (hasMorningstar4pc) {
                availableMods['morningstar-4pc'] = true;
            }
            if (hasLaumaA1) {
                availableMods['lauma-a1'] = true;
            }
        },
    };
}
