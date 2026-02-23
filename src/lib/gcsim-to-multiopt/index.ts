import * as fs from 'fs';
import * as zlib from 'zlib';

import type { Character, LogDetails, Sample } from './gcsim_types';
import type { AbilInfo, Buffs, Mods, Resist } from './types';
import type { CustomMultiTarget } from './go_types';

import getAbilities from './config/abil_name';
import { convertAbils } from './convert';

export function readJSON(input: string): Sample {
    const data = fs.readFileSync(input, 'utf-8');
    return JSON.parse(data) as Sample;
}

export function readGZ(input: string): Sample {
    const data = fs.readFileSync(input);
    const unzip = zlib.inflateSync(data);
    return JSON.parse(unzip.toString('utf-8')) as Sample;
}

const buffNumberRegex = /(\w+%?):\s*(\S+)/;

function getSubMods(mods: (string | string[])[]): Mods {
    if (!mods) {
        return {};
    }

    let result: Mods = {};
    for (let i = 0; i < mods.length; i += 2) {
        const key = mods[i] as string;
        const value = mods[i + 1] as string[];
        result[key] = value;
    }
    return result;
}

function isTransformativeReaction(name: string): boolean {
    const reactions: string[] = [
        'overload',
        'superconduct',
        'swirl-electro',
        'swirl-hydro',
        'swirl-pyro',
        'swirl-cryo',
        'electrocharged',
        'shatter',
        'burning',
        'bloom',
        'burgeon',
        'hyperbloom',
    ];
    return reactions.includes(name);
}

export function getCharacterAbils(
    sample: Sample,
    charName: string,
    ignoredMods: string[]
): [AbilInfo[], string[], Character | undefined] {
    if (!sample.character_details || !sample.logs) {
        return [[], [], undefined];
    }

    const charIndex: number =
        sample.character_details.findIndex((char: Character) => char.name == charName) ?? 0;
    const char: Character = sample.character_details[charIndex];
    const damages: LogDetails[] =
        sample.logs.filter(
            (log: LogDetails) =>
                log.char_index == charIndex && log.event == 'damage' && log.logs.damage != 0
        ) ?? [];

    let availabledMods: Record<string, boolean> = {};

    // Detect Flower of Paradise Lost 4pc from hitlag events (buff/icd markers)
    // GCSIM records these under 'mods affected' but not in damage mods
    const hasFlower4pc: boolean = (sample.logs ?? []).some((log: LogDetails) => {
        if (log.char_index !== charIndex || log.event !== 'hitlag') return false;
        const serialized = JSON.stringify(log.logs ?? {});
        return serialized.includes('flower-4pc-buff') || serialized.includes('flower-4pc-icd');
    });
    // Detect Flower set from character details (4pc equipped)
    const hasFlowerSetFromChar: boolean = Object.entries(char?.sets ?? {}).some(([key, count]) => {
        const k = String(key).toLowerCase();
        return count >= 4 && k.includes('paradise') && k.includes('lost');
    });
    const hasFlowerEquipped = hasFlower4pc || hasFlowerSetFromChar;

    // Helper: check if ability is a Lunar reaction
    const isLunarReactionAbil = (abilName: string): boolean =>
        abilName === 'lunarcharged' || abilName === 'lunarcrystallize' || abilName.includes('Lunar-Bloom');

    // Detect Silken Moon's Serenade 4pc: gleaming-moon-devotion-reaction
    // This provides +10% ReactBonusMod for Lunar attacks when gleaming-moon-devotion-em is active.
    // Like FoPL 4pc, it uses AddReactBonusMod which is NOT exposed as a mod on damage events.
    const hasGleamingMoonReaction = (sample.logs ?? []).some(
        (log: LogDetails) =>
            log.event === 'status' && log.logs?.key === 'gleaming-moon-devotion-reaction'
    );
    // Build a map of frames where gleaming-moon-devotion-em was active
    // The EM buff has an expiry, so we track its active windows
    const gleamingMoonEMWindows: { start: number; expiry: number }[] = [];
    if (hasGleamingMoonReaction) {
        const emStatuses = (sample.logs ?? []).filter(
            (log: LogDetails) =>
                log.event === 'status' && log.logs?.key === 'gleaming-moon-devotion-em'
        );
        for (const s of emStatuses) {
            gleamingMoonEMWindows.push({ start: s.frame, expiry: s.logs?.expiry ?? s.frame });
        }
    }
    const isGleamingMoonEMActive = (frame: number): boolean =>
        gleamingMoonEMWindows.some(w => frame >= w.start && frame <= w.expiry);

    // Detect Night of the Sky's Unveiling 4pc: gleaming-moon-intent-reaction
    // Provides +10% Lunar Reaction DMG and +15%/30% CR for Lunar reactions.
    // gleaming-moon-intent-cr tracks the CR buff windows (4s after Lunar Reaction).
    const hasGleamingMoonIntent = (sample.logs ?? []).some(
        (log: LogDetails) =>
            log.event === 'status' && log.logs?.key === 'gleaming-moon-intent-reaction'
    );
    const gleamingMoonIntentCRWindows: { start: number; expiry: number }[] = [];
    if (hasGleamingMoonIntent) {
        const crStatuses = (sample.logs ?? []).filter(
            (log: LogDetails) =>
                log.event === 'status' && log.logs?.key === 'gleaming-moon-intent-cr'
        );
        for (const s of crStatuses) {
            gleamingMoonIntentCRWindows.push({ start: s.frame, expiry: s.logs?.expiry ?? s.frame });
        }
    }
    const isGleamingMoonIntentCRActive = (frame: number): boolean =>
        gleamingMoonIntentCRWindows.some(w => frame >= w.start && frame <= w.expiry);

    // Detect Moonsign level: ascendant-gleam status is set when party Moonsign >= 2
    // Nascent Gleam (Moonsign < 2): Night of Sky's Unveiling 4pc gives +15% CR
    // Ascendant Gleam (Moonsign >= 2): Night of Sky's Unveiling 4pc gives +30% CR
    const isAscendantGleam = (sample.logs ?? []).some(
        (log: LogDetails) =>
            log.event === 'status' && log.logs?.key === 'ascendant-gleam'
    );
    const intentCRBonus = isAscendantGleam ? 0.30 : 0.15;

    // Detect Ascendant Gleam non-Moonsign character Lunar Reaction DMG% bonus
    // When Moonsign >= 2, non-Moonsign chars buff Lunar Reaction DMG after using Skill/Burst.
    // gcsim logs these via 'pre_damage_mods' events with { amt: value } per contributing char.
    // We collect the max amt per source char and sum them for the total bonus.
    let ascendantGleamBonus = 0;
    if (isAscendantGleam) {
        const preDmgMods = (sample.logs ?? []).filter(
            (log: LogDetails) => log.event === 'pre_damage_mods'
        );
        // Get max amt per source char_index (since amt can vary as buffs change)
        const maxAmtByChar: Map<number, number> = new Map();
        for (const m of preDmgMods) {
            const amt = m.logs?.amt ?? 0;
            const charIdx = m.char_index;
            if (amt > 0 && charIdx !== undefined) {
                maxAmtByChar.set(charIdx, Math.max(maxAmtByChar.get(charIdx) ?? 0, amt));
            }
        }
        for (const amt of maxAmtByChar.values()) {
            ascendantGleamBonus += amt;
        }
    }

    // Detect Lauma Pale Hymn burst flat reaction bonus
    // Lauma's burst adds FlatDmg to bloom/hyperbloom/burgeon AND Lunar-Bloom reactions.
    // This bonus is baked into gcsim's flat_dmg in calc events, not exposed as a mod.
    // We compute the bonus PER-FRAME so each target gets its own precise _dmgInc value.
    const paleHymnReactions = new Set(['bloom', 'burgeon', 'hyperbloom']);
    // Per-frame bonus: frame → { 'hyperbloom_flat': value, 'bloom_flat': value, ... }
    const paleHymnPerFrameBonus: Map<number, Record<string, number>> = new Map();
    let paleHymnActiveFrames: Set<number> = new Set(); // frames where stacks were consumed

    const paleHymnStatus = (sample.logs ?? []).find(
        (log: LogDetails) => log.event === 'status' && log.logs?.key === 'lauma-pale-hymn-burst'
    );
    const hasPaleHymn = !!paleHymnStatus;

    if (hasPaleHymn) {
        const paleHymnStart = paleHymnStatus!.frame;
        const paleHymnEnd = paleHymnStatus!.logs?.expiry ?? paleHymnStart;

        // Collect calc events for bloom/hyperbloom/burgeon on this character
        const calcEvents = (sample.logs ?? []).filter(
            (log: LogDetails) =>
                log.event === 'calc' &&
                log.char_index === charIndex &&
                paleHymnReactions.has(log.logs?.abil ?? '') &&
                log.logs?.flat_dmg != null
        );

        // Also collect calc events for Lunar-Bloom (which is a skill, not a reaction)
        const lunarBloomCalcEvents = (sample.logs ?? []).filter(
            (log: LogDetails) =>
                log.event === 'calc' &&
                log.char_index === charIndex &&
                (log.logs?.abil ?? '').includes('Lunar-Bloom') &&
                log.logs?.flat_dmg != null
        );

        // Track Pale Hymn remaining stacks via character events
        const paleHymnConsumed = (sample.logs ?? [])
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

        // Per-frame bonus for transformative reactions (bloom/hyperbloom/burgeon)
        for (const reaction of paleHymnReactions) {
            const reactionCalcs = calcEvents.filter(c => c.logs?.abil === reaction);
            if (reactionCalcs.length === 0) continue;

            const withBurst = reactionCalcs.filter(c => framesWithPaleHymn.has(c.frame));
            const withoutBurst = reactionCalcs.filter(
                c => !framesWithPaleHymn.has(c.frame) && c.logs?.damage > 0
            );

            if (withBurst.length > 0 && withoutBurst.length > 0) {
                // Group "without burst" by EM to build reference baselines
                const refByEM: Map<number, number[]> = new Map();
                for (const c of withoutBurst) {
                    const em = c.logs.em;
                    if (!refByEM.has(em)) refByEM.set(em, []);
                    refByEM.get(em)!.push(c.logs.flat_dmg);
                }
                // Average each EM group
                const refAvgByEM: Map<number, number> = new Map();
                for (const [em, values] of refByEM) {
                    refAvgByEM.set(em, values.reduce((a, b) => a + b, 0) / values.length);
                }
                // Helper: find closest EM reference
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

                // Compute per-frame diff
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
                // All events have burst active — use manual formula as fallback
                const laumaIndex = sample.character_details!.findIndex(
                    (c: Character) => c.name === 'lauma'
                );
                if (laumaIndex >= 0) {
                    const laumaCharEvent = (sample.logs ?? []).find(
                        (log: LogDetails) =>
                            log.char_index === laumaIndex &&
                            log.event === 'character' &&
                            log.logs?.em != null
                    );
                    if (laumaCharEvent) {
                        const laumaEM = parseFloat(laumaCharEvent.logs.em);
                        const etherlightStatus = (sample.logs ?? []).find(
                            (log: LogDetails) =>
                                log.event === 'status' && log.logs?.key === 'etherlight'
                        );
                        let etherlightEM = 0;
                        if (etherlightStatus) {
                            const etherlightDmg = (sample.logs ?? []).find(
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
                        const totalLaumaEM = laumaEM + etherlightEM;
                        // Compute per-frame using formula
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

        // Handle Lunar-Bloom separately (it's a skill hit, not a transformative reaction)
        if (lunarBloomCalcEvents.length > 0) {
            const withBurst = lunarBloomCalcEvents.filter(c => framesWithPaleHymn.has(c.frame));
            const withoutBurst = lunarBloomCalcEvents.filter(
                c => !framesWithPaleHymn.has(c.frame) && c.logs?.damage > 0
            );

            if (withBurst.length > 0 && withoutBurst.length > 0) {
                // Group without-burst by EM for per-frame matching
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
                // Fallback: flat_dmg IS purely the burst bonus for Lunar-Bloom
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

    // Detect Lauma A1 "Light for the Frosty Night" — synthetic CR/CD for reactions
    // Nascent Gleam (Moonsign < 2): +15% CR, CD=100% on bloom/hyperbloom/burgeon
    // Ascendant Gleam (Moonsign >= 2): +10% CR, +20% CD on Lunar-Bloom
    // These are injected directly into ae.Snapshot.Stats, NOT exposed as mods.
    const a1StatusEvents = (sample.logs ?? []).filter(
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

    // Determine Nascent vs Ascendant from calc events
    // Nascent: bloom/hyperbloom/burgeon with A1 active have cr > 0
    // Ascendant: only Lunar-Bloom gets crit bonus
    let a1IsNascent = false;
    let a1IsAscendant = false;
    if (hasLaumaA1) {
        // Check if any bloom/hyperbloom/burgeon calc event with A1 active has cr > 0
        const reactionCalcsWithA1 = (sample.logs ?? []).filter(
            (log: LogDetails) =>
                log.event === 'calc' &&
                log.char_index === charIndex &&
                paleHymnReactions.has(log.logs?.abil ?? '') &&
                isA1Active(log.frame) &&
                log.logs?.cr > 0
        );
        if (reactionCalcsWithA1.length > 0) {
            a1IsNascent = true;
        }
        // Check Lunar-Bloom calc events with A1 active
        const lunarCalcsWithA1 = (sample.logs ?? []).filter(
            (log: LogDetails) =>
                log.event === 'calc' &&
                log.char_index === charIndex &&
                (log.logs?.abil ?? '').includes('Lunar-Bloom') &&
                isA1Active(log.frame) &&
                log.logs?.cr > 0
        );
        if (lunarCalcsWithA1.length > 0) {
            a1IsAscendant = true;
        }
    }

    const filterMods = (mods: Mods): [string, string[]][] =>
        Object.entries(mods).filter(([key, modBuffs]) => {
            if (
                !(modBuffs instanceof Array) ||
                key == 'pre_damage_mods' ||
                key == 'resist_mods' ||
                key == 'def_mods'
            ) {
                return false;
            }
            availabledMods[key] = true;
            if (ignoredMods.includes(key)) {
                return false;
            }
            return true;
        });

    const applyBuffs = (mods: Mods, buffs: Buffs): void => {
        for (const [_, modBuffs] of filterMods(mods)) {
            for (const buff of modBuffs) {
                const result = buffNumberRegex.exec(buff);
                if (!result) {
                    continue;
                }
                const [_, stat, value] = result;
                if (stat == 'status' || stat == 'expiry_frame') {
                    continue;
                }
                const amount = Number(value);
                if (!Number.isNaN(amount)) {
                    buffs[stat] = (buffs[stat] ?? 0) + Number(value);
                }
            }
        }
    };

    const applyResists = (mods: Mods, resists: Resist[]): void => {
        for (const [_, modBuffs] of filterMods(mods)) {
            let resist: Resist = { element: '', amount: 0 };
            for (const buff of modBuffs) {
                const result = buffNumberRegex.exec(buff);
                if (!result) {
                    continue;
                }
                const [_, stat, value] = result;
                if (stat == 'ele') {
                    resist.element = value;
                } else if (stat == 'amount') {
                    resist.amount = Number(value);
                    resists.push(resist);
                    resist = { element: '', amount: 0 };
                }
            }
        }
    };

    // Parse an array like ["cryo: 19.965", "hydro: 0.000"] into a map
    const parseGaugeLines = (lines: unknown): Record<string, number> => {
        const map: Record<string, number> = {};
        const arr = Array.isArray(lines) ? lines : [];
        for (const line of arr) {
            const m = /([a-z]+):\s*([\d.]+)/i.exec(String(line));
            if (m) {
                map[m[1].toLowerCase()] = parseFloat(m[2]);
            }
        }
        return map;
    };

    // Detección genérica de auras del objetivo alrededor del frame del golpe
    // Busca en eventos "element" y, como refuerzo para "frozen", en eventos "reaction: freeze"
    const hasTargetAura = (frame: number, target: number, auraNames: string[]): boolean => {
        const window = 60; // ~1s
        const names = auraNames.map(a => a.toLowerCase());

        const inWindow = (l: LogDetails) => l.frame >= frame - window && l.frame <= frame + window;

        // 1) Preferimos el último evento de elementos antes del golpe
        const beforeCandidate = (sample.logs || [])
            .filter(
                (l: LogDetails) =>
                    l.event === 'element' &&
                    (l.logs?.target ?? -1) === target &&
                    l.frame <= frame &&
                    l.frame > frame - window
            )
            .sort((a: LogDetails, b: LogDetails) => b.frame - a.frame)[0];
        if (beforeCandidate && beforeCandidate.logs) {
            const existing = parseGaugeLines(beforeCandidate.logs['existing']);
            for (const n of names) {
                if ((existing[n] ?? 0) > 0) return true;
                // Algunos builds registran "frozen" como texto; comprobamos el blob
                const blob = JSON.stringify(beforeCandidate.logs).toLowerCase();
                if (n === 'frozen' && (blob.includes('frozen') || blob.includes('freeze')))
                    return true;
            }
        }

        // 2) Primer evento de elementos tras el golpe dentro de ventana
        const afterCandidate = (sample.logs || [])
            .filter(
                (l: LogDetails) =>
                    l.event === 'element' &&
                    (l.logs?.target ?? -1) === target &&
                    l.frame >= frame &&
                    l.frame <= frame + window
            )
            .sort((a: LogDetails, b: LogDetails) => a.frame - b.frame)[0];
        if (afterCandidate && afterCandidate.logs) {
            const existing = parseGaugeLines(afterCandidate.logs['existing']);
            for (const n of names) {
                if ((existing[n] ?? 0) > 0) return true;
                const blob = JSON.stringify(afterCandidate.logs).toLowerCase();
                if (n === 'frozen' && (blob.includes('frozen') || blob.includes('freeze')))
                    return true;
            }
        }

        // 3) Refuerzo para Frozen: reacción "freeze" en ventana y mismo target
        if (names.includes('frozen') || names.includes('freeze')) {
            const reactionHit = (sample.logs || [])
                .filter(
                    (l: LogDetails) =>
                        l.event === 'reaction' && inWindow(l) && (l.logs?.target ?? -1) === target
                )
                .some(l => {
                    const blob = JSON.stringify(l.logs ?? {}).toLowerCase();
                    return blob.includes('freeze') || blob.includes('frozen');
                });
            if (reactionHit) return true;
        }

        return false;
    };

    const getDefShred = (mods: Mods): number | undefined => {
        let defshred: number | undefined = undefined;
        for (const [_, modBuffs] of filterMods(mods)) {
            for (const buff of modBuffs) {
                const result = buffNumberRegex.exec(buff);
                if (!result) {
                    continue;
                }
                const [_, stat, value] = result;
                if (stat == 'amount') {
                    defshred = (defshred ?? 0) + -Number(value);
                }
            }
        }
        return defshred;
    };

    let lastBuffs: Buffs = {};
    const reactionWindow = 600; // 10s ≈ 600 frames
    const flowerReactions = new Set(['bloom', 'burgeon', 'hyperbloom']);
    const abils: AbilInfo[] = damages.map(x => {
        const name = x.logs['abil'];
        const ele = x.logs['ele'];
        const reaction = x.logs['amp'] || x.logs['cata'] || undefined;
        const defShred = getDefShred(getSubMods(x.logs['def_mods']));

        let buffs: Buffs = {};
        let resists: Resist[] = [];
        let infusion: string | undefined = undefined;

        const transformative = isTransformativeReaction(name);
        if (transformative && lastBuffs['em']) {
            buffs['em'] = lastBuffs['em'];
        }

        // TODO: use "self infusion applied" and "executed swap" events
        if (!transformative && x.logs['ele'] != char.element && x.logs['ele'] != 'physical') {
            infusion = x.logs['ele'];
        }

        applyBuffs(x.logs, buffs);
        applyBuffs(getSubMods(x.logs['pre_damage_mods']), buffs);
        applyResists(getSubMods(x.logs['resist_mods']), resists);

        // Klee Hexerei Logic
        // Check if Klee is in Hexerei state and has Boom Badges
        // Boom Badge stacks affect Charged Attack scaling:
        // 1 stack: 115%, 2 stacks: 130%, 3 stacks: 150%
        if (char.name.toLowerCase() === 'klee' && name.includes('Boom-Boom')) {
            const currentFrame = x.frame;
            const badgeKeys = ['boombadge-normal', 'boombadge-skill', 'boombadge-burst'];
            let stackCount = 0;

            for (const key of badgeKeys) {
                // Find the latest status event for this key before or at currentFrame
                const latestStatus = (sample.logs || [])
                    .filter(
                        l => l.event === 'status' && l.logs?.key === key && l.frame <= currentFrame
                    )
                    .sort((a, b) => b.frame - a.frame)[0];

                if (latestStatus && latestStatus.logs) {
                    // Check if it's still active
                    // expiry is the absolute frame number when it expires
                    if (latestStatus.logs.expiry > currentFrame) {
                        stackCount++;
                    }
                }
            }

            if (stackCount > 0) {
                // buffs['boom_badge_stacks'] = stackCount; // Removed: Invalid stat

                let bonus = 0;
                if (stackCount === 1) bonus = 0.15;
                if (stackCount === 2) bonus = 0.3;
                if (stackCount === 3) bonus = 0.5;

                // We add it as a generic DMG bonus for now.
                // "dmg%" is a valid stat key that maps to "all_dmg_" in stat_name.ts
                buffs['dmg%'] = (buffs['dmg%'] ?? 0) + bonus;
            }
        }

        // Infer and apply Flower of Paradise Lost 4pc reaction bonus when not ignored
        // Applies to Bloom, Burgeon, Hyperbloom (transformative reactions)
        // Apply only if the set is equipped (hitlag markers or character sets) and toggle not ignored
        if (
            transformative &&
            hasFlowerEquipped &&
            !ignoredMods.includes('flower-4pc') &&
            flowerReactions.has(name)
        ) {
            // Baseline 40% (Default in Genshin Optimizer) + stacks: +10% per trigger within last 10s, up to 4 stacks, capped at 40%
            const currentFrame = x.frame;
            const stacks = damages.filter(
                d =>
                    d.char_index === x.char_index &&
                    flowerReactions.has(d.logs['abil']) &&
                    d.frame >= currentFrame - reactionWindow &&
                    d.frame < currentFrame
            ).length;
            const stackBonus = Math.min(stacks, 4) * 0.1;
            const totalBonus = Math.min(stackBonus, 0.4);
            const reactionStat = `${name}%`; // e.g., "hyperbloom%" -> maps to "hyperbloom_dmg_"
            buffs[reactionStat] = (buffs[reactionStat] ?? 0) + totalBonus;
        }

        // Infer and apply Lauma Pale Hymn burst flat reaction bonus when not ignored
        // Per-frame: each event gets its own precise _dmgInc value
        if (
            hasPaleHymn &&
            !ignoredMods.includes('lauma-pale-hymn-burst') &&
            paleHymnActiveFrames.has(x.frame) &&
            paleHymnPerFrameBonus.has(x.frame)
        ) {
            const frameBonus = paleHymnPerFrameBonus.get(x.frame)!;
            for (const [statKey, value] of Object.entries(frameBonus)) {
                // statKey is e.g. 'hyperbloom_flat', 'bloom_flat', 'lunarbloom_flat'
                // Check if this event matches the stat (reaction name or Lunar-Bloom)
                const isMatchingReaction =
                    (transformative && paleHymnReactions.has(name) && statKey === `${name}_flat`) ||
                    (name.includes('Lunar-Bloom') && statKey === 'lunarbloom_flat');
                if (isMatchingReaction && value > 0) {
                    buffs[statKey] = (buffs[statKey] ?? 0) + value;
                }
            }
        }

        // Apply Silken Moon's Serenade 4pc: +10% Lunar Reaction DMG bonus
        // Applies to ALL lunar reactions (Lunar-Bloom, lunarcharged, lunarcrystallize)
        if (
            hasGleamingMoonReaction &&
            !ignoredMods.includes('gleaming-moon-devotion-reaction') &&
            isLunarReactionAbil(name) &&
            isGleamingMoonEMActive(x.frame)
        ) {
            if (name.includes('Lunar-Bloom')) {
                buffs['lunarbloom%'] = (buffs['lunarbloom%'] ?? 0) + 0.1;
            } else if (name === 'lunarcharged') {
                buffs['lunarcharged%'] = (buffs['lunarcharged%'] ?? 0) + 0.1;
            } else if (name === 'lunarcrystallize') {
                buffs['lunarcrystallize%'] = (buffs['lunarcrystallize%'] ?? 0) + 0.1;
            }
        }

        // Apply Night of the Sky's Unveiling 4pc: +10% Lunar Reaction DMG + CR bonus
        // Applies to ALL lunar reactions when gleaming-moon-intent is active
        if (
            hasGleamingMoonIntent &&
            !ignoredMods.includes('gleaming-moon-intent-reaction') &&
            isLunarReactionAbil(name)
        ) {
            // +10% Lunar Reaction DMG (always active, permanent status)
            if (name.includes('Lunar-Bloom')) {
                buffs['lunarbloom%'] = (buffs['lunarbloom%'] ?? 0) + 0.1;
            } else if (name === 'lunarcharged') {
                buffs['lunarcharged%'] = (buffs['lunarcharged%'] ?? 0) + 0.1;
            } else if (name === 'lunarcrystallize') {
                buffs['lunarcrystallize%'] = (buffs['lunarcrystallize%'] ?? 0) + 0.1;
            }
            // CR when gleaming-moon-intent-cr is active (4s after Lunar Reaction)
            // +15% Nascent (Moonsign < 2) or +30% Ascendant (Moonsign >= 2)
            if (isGleamingMoonIntentCRActive(x.frame)) {
                buffs['cr'] = (buffs['cr'] ?? 0) + intentCRBonus;
            }
        }

        // Apply Ascendant Gleam non-Moonsign Lunar Reaction DMG% bonus
        if (
            isAscendantGleam &&
            ascendantGleamBonus > 0 &&
            !ignoredMods.includes('ascendant-gleam') &&
            isLunarReactionAbil(name)
        ) {
            if (name.includes('Lunar-Bloom')) {
                buffs['lunarbloom%'] = (buffs['lunarbloom%'] ?? 0) + ascendantGleamBonus;
            } else if (name === 'lunarcharged') {
                buffs['lunarcharged%'] = (buffs['lunarcharged%'] ?? 0) + ascendantGleamBonus;
            } else if (name === 'lunarcrystallize') {
                buffs['lunarcrystallize%'] = (buffs['lunarcrystallize%'] ?? 0) + ascendantGleamBonus;
            }
        }

        // Apply Lauma A1 "Light for the Frosty Night" synthetic CR/CD
        if (hasLaumaA1 && !ignoredMods.includes('lauma-a1') && isA1Active(x.frame)) {
            // Nascent Gleam: +15% CR, CD=100% on bloom/hyperbloom/burgeon
            if (a1IsNascent && transformative && paleHymnReactions.has(name)) {
                buffs['cr'] = (buffs['cr'] ?? 0) + 0.15;
                buffs['cd'] = (buffs['cd'] ?? 0) + 1.0;
            }
            // Ascendant Gleam: +10% CR, +20% CD on Lunar-Bloom
            if (a1IsAscendant && name.includes('Lunar-Bloom')) {
                buffs['cr'] = (buffs['cr'] ?? 0) + 0.1;
                buffs['cd'] = (buffs['cd'] ?? 0) + 0.2;
            }
        }

        lastBuffs = { ...buffs };
        const targetIndex: number = Number(x.logs['target'] ?? 0);
        // Calculamos auras relevantes; empezamos con elementos base y "frozen"
        const auraList = [
            'anemo',
            'geo',
            'electro',
            'hydro',
            'pyro',
            'cryo',
            'dendro',
            'frozen',
        ] as const;
        const auras: Record<string, boolean> = {};
        for (const a of auraList) {
            auras[a] = hasTargetAura(x.frame, targetIndex, [a]);
        }
        // Para procs "afectado por Cryo" tomamos cry o frozen
        const cryAffected = !!(auras['cryo'] || auras['frozen']);
        return {
            name,
            reaction,
            buffs,
            defShred,
            infusion,
            resists,
            ele,
            auras,
            cryAffected,
            frame: x.frame,
            target: targetIndex,
        };
    });
    // Expose synthetic mod in UI for toggle support only if the set is equipped
    if (hasFlowerEquipped) {
        availabledMods['flower-4pc'] = true;
    }
    // Expose Lauma Pale Hymn burst as toggleable mod when detected
    if (hasPaleHymn && paleHymnPerFrameBonus.size > 0) {
        availabledMods['lauma-pale-hymn-burst'] = true;
    }
    // Expose Silken Moon's Serenade 4pc reaction bonus as toggleable mod
    if (hasGleamingMoonReaction) {
        availabledMods['gleaming-moon-devotion-reaction'] = true;
    }
    // Expose Night of the Sky's Unveiling 4pc as toggleable mod
    if (hasGleamingMoonIntent) {
        availabledMods['gleaming-moon-intent-reaction'] = true;
    }
    // Expose Ascendant Gleam non-Moonsign bonus as toggleable mod
    if (isAscendantGleam && ascendantGleamBonus > 0) {
        availabledMods['ascendant-gleam'] = true;
    }
    // Expose Lauma A1 as toggleable mod when detected
    if (hasLaumaA1) {
        availabledMods['lauma-a1'] = true;
    }
    return [abils, Object.keys(availabledMods), char];
}

import { getCustomDescriptionFor, type NoteItem } from './config/custom_descriptions';

export function getCustomDescription(
    char: Character | undefined,
    activeBuffs: string[] = []
): NoteItem[] {
    return getCustomDescriptionFor(char, activeBuffs);
}

// USAGE:
// const sample: Sample = readGZ('./sample.gz'); // or readJSON
// const charName: string = "kokomi";
// const ignoredMods: string[] = ["kokomi-passive", "moonglow-heal-bonus", "ohc-2pc"];
// const [abils, availabledMods]: [AbilInfo[], string[]] = getCharacterAbils(sample, charName, ignoredMods);
// const [target, errors]: [CustomMultiTarget, Error[]] = convertAbils(abils, getAbilities(charName));

// console.log(JSON.stringify(target));
// console.log([...new Set(errors.map(x => x.message))]);
// console.log(availabledMods);
