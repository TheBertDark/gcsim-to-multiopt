import type { Character, LogDetails, Sample } from './gcsim_types';
import type { AbilInfo, Buffs, Mods, Resist } from './types';

import { isTransformativeReaction } from './reactions/classifiers';
import { createReactBonusTracker } from './reactions/react_bonus';
import { createLunarReactionContext } from './reactions/lunar';
import { createStellarReactionContext } from './reactions/stellar';
import { getCustomDescriptionFor, type NoteItem } from './config/custom_descriptions';

const buffNumberRegex = /(\w+%?):\s*(\S+)/;
const FLOWER_REACTIONS = new Set(['bloom', 'burgeon', 'hyperbloom']);

function getSubMods(mods: (string | string[])[]): Mods {
    if (!mods) {
        return {};
    }

    const result: Mods = {};
    for (let i = 0; i < mods.length; i += 2) {
        const key = mods[i] as string;
        const value = mods[i + 1] as string[];
        result[key] = value;
    }
    return result;
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
    if (!char) {
        return [[], [], undefined];
    }

    const damages: LogDetails[] =
        sample.logs.filter(
            (log: LogDetails) =>
                log.char_index == charIndex && log.event == 'damage' && log.logs.damage != 0
        ) ?? [];

    const availabledMods: Record<string, boolean> = {};

    // Detect Flower of Paradise Lost 4pc from hitlag events or character sets
    const hasFlower4pc: boolean = (sample.logs ?? []).some((log: LogDetails) => {
        if (log.char_index !== charIndex || log.event !== 'hitlag') return false;
        const serialized = JSON.stringify(log.logs ?? {});
        return serialized.includes('flower-4pc-buff') || serialized.includes('flower-4pc-icd');
    });
    const hasFlowerSetFromChar: boolean = Object.entries(char?.sets ?? {}).some(([key, count]) => {
        const k = String(key).toLowerCase();
        return count >= 4 && k.includes('paradise') && k.includes('lost');
    });
    const hasFlowerEquipped = hasFlower4pc || hasFlowerSetFromChar;

    // Initialize modular reaction contexts
    const reactBonusTracker = createReactBonusTracker(sample.logs, charIndex);
    const lunarContext = createLunarReactionContext(sample, charIndex, hasFlowerEquipped);
    const stellarContext = createStellarReactionContext(sample, charIndex);

    const filterMods = (mods: Mods): [string, string[]][] =>
        Object.entries(mods).filter(([key, modBuffs]) => {
            if (
                !(modBuffs instanceof Array) ||
                key == 'pre_damage_mods' ||
                key == 'resist_mods' ||
                key == 'def_mods' ||
                key == 'final_stats'
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

    // Pre-group element and freeze reaction events by target for fast aura lookup
    const elementEventsByTarget = new Map<
        number,
        { frame: number; existing: Record<string, number>; hasFrozenText: boolean }[]
    >();
    const freezeReactionFramesByTarget = new Map<number, number[]>();

    for (const l of sample.logs ?? []) {
        if (l.event === 'element' && l.logs) {
            const t = Number(l.logs['target'] ?? -1);
            let arr = elementEventsByTarget.get(t);
            if (!arr) {
                arr = [];
                elementEventsByTarget.set(t, arr);
            }
            const existing = parseGaugeLines(l.logs['existing']);
            const blob = JSON.stringify(l.logs).toLowerCase();
            const hasFrozenText = blob.includes('frozen') || blob.includes('freeze');
            arr.push({ frame: l.frame, existing, hasFrozenText });
        } else if (l.event === 'reaction' && l.logs) {
            const blob = JSON.stringify(l.logs).toLowerCase();
            if (blob.includes('freeze') || blob.includes('frozen')) {
                const t = Number(l.logs['target'] ?? -1);
                let arr = freezeReactionFramesByTarget.get(t);
                if (!arr) {
                    arr = [];
                    freezeReactionFramesByTarget.set(t, arr);
                }
                arr.push(l.frame);
            }
        }
    }

    // Generic target aura detection around the hit frame using binary search on pre-indexed target events
    const hasTargetAura = (frame: number, target: number, auraNames: string[]): boolean => {
        const window = 60; // ~1s
        const names = auraNames.map(a => a.toLowerCase());
        const targetElements = elementEventsByTarget.get(target);

        if (targetElements && targetElements.length > 0) {
            // Binary search for the last event with frame <= hit frame
            let lo = 0;
            let hi = targetElements.length - 1;
            let beforeIdx = -1;
            while (lo <= hi) {
                const mid = (lo + hi) >> 1;
                if (targetElements[mid].frame <= frame) {
                    beforeIdx = mid;
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }

            // 1) Latest element event before or at the hit within window
            if (beforeIdx >= 0 && targetElements[beforeIdx].frame > frame - window) {
                const cand = targetElements[beforeIdx];
                for (const n of names) {
                    if ((cand.existing[n] ?? 0) > 0) return true;
                    if (n === 'frozen' && cand.hasFrozenText) return true;
                }
            }

            // 2) First element event after or at the hit within window
            // Find first index with frame >= hit frame
            let afterIdx = beforeIdx;
            while (afterIdx >= 0 && afterIdx > 0 && targetElements[afterIdx - 1].frame === frame) {
                afterIdx--;
            }
            if (afterIdx < 0 || targetElements[afterIdx].frame < frame) {
                afterIdx = beforeIdx + 1;
            }
            if (afterIdx < targetElements.length && targetElements[afterIdx].frame <= frame + window) {
                const cand = targetElements[afterIdx];
                for (const n of names) {
                    if ((cand.existing[n] ?? 0) > 0) return true;
                    if (n === 'frozen' && cand.hasFrozenText) return true;
                }
            }
        }

        // 3) Fallback for Frozen: reaction "freeze" in window on same target
        if (names.includes('frozen') || names.includes('freeze')) {
            const freezeFrames = freezeReactionFramesByTarget.get(target);
            if (freezeFrames) {
                for (let i = 0; i < freezeFrames.length; i++) {
                    const f = freezeFrames[i];
                    if (f >= frame - window && f <= frame + window) return true;
                    if (f > frame + window) break;
                }
            }
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

    const abils: AbilInfo[] = damages.map(x => {
        const rawName: string = x.logs['abil'];
        const name = stellarContext.resolveAbilName(x, char.name);
        const ele = x.logs['ele'];
        const reaction = x.logs['amp'] || x.logs['cata'] || undefined;
        const defShred = getDefShred(getSubMods(x.logs['def_mods']));

        const buffs: Buffs = {};
        const resists: Resist[] = [];
        let infusion: string | undefined = undefined;

        const transformative = isTransformativeReaction(rawName);

        // If this is a Stellar reaction (whose damage event lacks character stat_mods),
        // read its snapshot event first so we capture exact active EM / CR / CD buffs.
        const reactionSnap = stellarContext.findReactionSnapshot(x);
        if (reactionSnap && reactionSnap.logs) {
            applyBuffs(reactionSnap.logs, buffs);
            applyBuffs(getSubMods(reactionSnap.logs['pre_damage_mods']), buffs);
        } else if (transformative && lastBuffs['em']) {
            buffs['em'] = lastBuffs['em'];
        }

        // TODO: use "self infusion applied" and "executed swap" events
        if (!transformative && x.logs['ele'] != char.element && x.logs['ele'] != 'physical') {
            infusion = x.logs['ele'];
        }

        applyBuffs(x.logs, buffs);
        applyBuffs(getSubMods(x.logs['pre_damage_mods']), buffs);
        applyResists(getSubMods(x.logs['resist_mods']), resists);

        // Apply universal [React Bonus] pre_damage_mods (artifacts, weapons, passives/constellations)
        reactBonusTracker.applyForDamageEvent(x, buffs, availabledMods, ignoredMods);

        // Apply Lunar reaction buffs (Silken Moon, Night of Sky's Unveiling, Ascendant Gleam, Lauma Pale Hymn & A1)
        lunarContext.applyForDamageEvent(x, buffs, transformative, ignoredMods);

        // Apply Stellar reaction buffs (Stellar Base DMG, Elevation, Mizuki C1 flat proc)
        stellarContext.applyForDamageEvent(x, buffs, availabledMods, ignoredMods);

        // Klee Hexerei Logic: Boom Badge stacks affect Charged Attack scaling
        if (char.name.toLowerCase() === 'klee' && rawName.includes('Boom-Boom')) {
            const currentFrame = x.frame;
            const badgeKeys = ['boombadge-normal', 'boombadge-skill', 'boombadge-burst'];
            let stackCount = 0;

            for (const key of badgeKeys) {
                const latestStatus = (sample.logs || [])
                    .filter(
                        l => l.event === 'status' && l.logs?.key === key && l.frame <= currentFrame
                    )
                    .sort((a, b) => b.frame - a.frame)[0];

                if (latestStatus && latestStatus.logs && latestStatus.logs.expiry > currentFrame) {
                    stackCount++;
                }
            }

            if (stackCount > 0) {
                let bonus = 0;
                if (stackCount === 1) bonus = 0.15;
                if (stackCount === 2) bonus = 0.3;
                if (stackCount === 3) bonus = 0.5;
                buffs['dmg%'] = (buffs['dmg%'] ?? 0) + bonus;
            }
        }

        // Flower of Paradise Lost 4pc reaction bonus for Bloom, Burgeon, Hyperbloom
        if (
            transformative &&
            hasFlowerEquipped &&
            !ignoredMods.includes('flower-4pc') &&
            FLOWER_REACTIONS.has(rawName)
        ) {
            const currentFrame = x.frame;
            const stacks = damages.filter(
                d =>
                    d.char_index === x.char_index &&
                    FLOWER_REACTIONS.has(d.logs['abil']) &&
                    d.frame >= currentFrame - reactionWindow &&
                    d.frame < currentFrame
            ).length;
            const stackBonus = Math.min(stacks, 4) * 0.1;
            const totalBonus = Math.min(stackBonus, 0.4);
            const reactionStat = `${rawName}%`;
            buffs[reactionStat] = (buffs[reactionStat] ?? 0) + totalBonus;
        }

        lastBuffs = { ...buffs };
        const targetIndex: number = Number(x.logs['target'] ?? 0);
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

    if (hasFlowerEquipped) {
        availabledMods['flower-4pc'] = true;
    }
    lunarContext.registerAvailableMods(availabledMods);

    return [abils, Object.keys(availabledMods), char];
}

export function getCustomDescription(
    char: Character | undefined,
    activeBuffs: string[] = []
): NoteItem[] {
    return getCustomDescriptionFor(char, activeBuffs);
}
