import * as fs from "fs";
import * as zlib from "zlib";

import type { Character, LogDetails, Sample } from './gcsim_types';
import type { AbilInfo, Buffs, Mods, Resist } from './types';
import type { CustomMultiTarget } from "./go_types";

import getAbilities from "./config/abil_name";
import { convertAbils } from "./convert";

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
        "overload", "superconduct", "swirl-electro", "swirl-hydro", "swirl-pyro",
        "swirl-cryo", "electrocharged", "shatter", "burning", "bloom", "burgeon",
        "hyperbloom"
    ];
    return reactions.includes(name);
}

export function getCharacterAbils(sample: Sample, charName: string, ignoredMods: string[]): [AbilInfo[], string[], Character | undefined] {
    if (!sample.character_details || !sample.logs) {
        return [[], [], undefined];
    }

    const charIndex: number = sample.character_details.findIndex((char: Character) => char.name == charName) ?? 0;
    const char: Character = sample.character_details[charIndex];
    const damages: LogDetails[] = sample.logs.filter((log: LogDetails) => log.char_index == charIndex && log.event == "damage" && log.logs.damage != 0) ?? [];

    let availabledMods: Record<string, boolean> = {};

    // Detect Flower of Paradise Lost 4pc from hitlag events (buff/icd markers)
    // GCSIM records these under 'mods affected' but not in damage mods
    const hasFlower4pc: boolean = (sample.logs ?? []).some((log: LogDetails) => {
        if (log.char_index !== charIndex || log.event !== "hitlag") return false;
        const serialized = JSON.stringify(log.logs ?? {});
        return serialized.includes("flower-4pc-buff") || serialized.includes("flower-4pc-icd");
    });
    // Detect Flower set from character details (4pc equipped)
    const hasFlowerSetFromChar: boolean = Object.entries(char?.sets ?? {}).some(([key, count]) => {
        const k = String(key).toLowerCase();
        return count >= 4 && k.includes("paradise") && k.includes("lost");
    });
    const hasFlowerEquipped = hasFlower4pc || hasFlowerSetFromChar;

    const filterMods = (mods: Mods): [string, string[]][] => Object.entries(mods).
        filter(([key, modBuffs]) => {
            if (!(modBuffs instanceof Array) || key == "pre_damage_mods" || key == "resist_mods" || key == "def_mods") {
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
            let resist: Resist = { element: "", amount: 0 };
            for (const buff of modBuffs) {
                const result = buffNumberRegex.exec(buff);
                if (!result) {
                    continue;
                }
                const [_, stat, value] = result;
                if (stat == "ele") {
                    resist.element = value;
                } else if (stat == "amount") {
                    resist.amount = Number(value);
                    resists.push(resist);
                    resist = { element: "", amount: 0 };
                }
            }
        }
    }

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
            .filter((l: LogDetails) => l.event === 'element' && (l.logs?.target ?? -1) === target && l.frame <= frame && l.frame > frame - window)
            .sort((a: LogDetails, b: LogDetails) => b.frame - a.frame)[0];
        if (beforeCandidate && beforeCandidate.logs) {
            const existing = parseGaugeLines(beforeCandidate.logs["existing"]);
            for (const n of names) {
                if ((existing[n] ?? 0) > 0) return true;
                // Algunos builds registran "frozen" como texto; comprobamos el blob
                const blob = JSON.stringify(beforeCandidate.logs).toLowerCase();
                if (n === "frozen" && (blob.includes("frozen") || blob.includes("freeze"))) return true;
            }
        }

        // 2) Primer evento de elementos tras el golpe dentro de ventana
        const afterCandidate = (sample.logs || [])
            .filter((l: LogDetails) => l.event === 'element' && (l.logs?.target ?? -1) === target && l.frame >= frame && l.frame <= frame + window)
            .sort((a: LogDetails, b: LogDetails) => a.frame - b.frame)[0];
        if (afterCandidate && afterCandidate.logs) {
            const existing = parseGaugeLines(afterCandidate.logs["existing"]);
            for (const n of names) {
                if ((existing[n] ?? 0) > 0) return true;
                const blob = JSON.stringify(afterCandidate.logs).toLowerCase();
                if (n === "frozen" && (blob.includes("frozen") || blob.includes("freeze"))) return true;
            }
        }

        // 3) Refuerzo para Frozen: reacción "freeze" en ventana y mismo target
        if (names.includes("frozen") || names.includes("freeze")) {
            const reactionHit = (sample.logs || [])
                .filter((l: LogDetails) => l.event === 'reaction' && inWindow(l) && (l.logs?.target ?? -1) === target)
                .some(l => {
                    const blob = JSON.stringify(l.logs ?? {}).toLowerCase();
                    return blob.includes("freeze") || blob.includes("frozen");
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
                if (stat == "amount") {
                    defshred = (defshred ?? 0) + -Number(value);
                }
            }
        }
        return defshred;
    }

    let lastBuffs: Buffs = {};
    const reactionWindow = 600; // 10s ≈ 600 frames
    const flowerReactions = new Set(["bloom", "burgeon", "hyperbloom"]);
    const abils: AbilInfo[] = damages.map(x => {
        const name = x.logs["abil"];
        const ele = x.logs["ele"];
        const reaction = x.logs["amp"] || x.logs["cata"] || undefined;
        const defShred = getDefShred(getSubMods(x.logs["def_mods"]))

        let buffs: Buffs = {};
        let resists: Resist[] = [];
        let infusion: string | undefined = undefined;

        const transformative = isTransformativeReaction(name)
        if (transformative && lastBuffs["em"]) {
            buffs["em"] = lastBuffs["em"];
        }

        // TODO: use "self infusion applied" and "executed swap" events
        if (!transformative && x.logs["ele"] != char.element && x.logs["ele"] != "physical") {
            infusion = x.logs["ele"];
        }

        applyBuffs(x.logs, buffs);
        applyBuffs(getSubMods(x.logs["pre_damage_mods"]), buffs);
        applyResists(getSubMods(x.logs["resist_mods"]), resists);

        // Infer and apply Flower of Paradise Lost 4pc reaction bonus when not ignored
        // Applies to Bloom, Burgeon, Hyperbloom (transformative reactions)
        // Apply only if the set is equipped (hitlag markers or character sets) and toggle not ignored
        if (transformative && hasFlowerEquipped && !ignoredMods.includes("flower-4pc") && flowerReactions.has(name)) {
            // Baseline 40% (Default in Genshin Optimizer) + stacks: +10% per trigger within last 10s, up to 4 stacks, capped at 40%
            const currentFrame = x.frame;
            const stacks = damages
                .filter(d => d.char_index === x.char_index && flowerReactions.has(d.logs["abil"]) && d.frame >= currentFrame - reactionWindow && d.frame < currentFrame)
                .length;
            const stackBonus = Math.min(stacks, 4) * 0.1;
            const totalBonus = Math.min(stackBonus, 0.4);
            const reactionStat = `${name}%`; // e.g., "hyperbloom%" -> maps to "hyperbloom_dmg_"
            buffs[reactionStat] = (buffs[reactionStat] ?? 0) + totalBonus;
        }
        
        lastBuffs = { ...buffs };
        const targetIndex: number = Number(x.logs["target"] ?? 0);
        // Calculamos auras relevantes; empezamos con elementos base y "frozen"
        const auraList = ["anemo","geo","electro","hydro","pyro","cryo","dendro","frozen"] as const;
        const auras: Record<string, boolean> = {};
        for (const a of auraList) {
            auras[a] = hasTargetAura(x.frame, targetIndex, [a]);
        }
        // Para procs "afectado por Cryo" tomamos cry o frozen
        const cryAffected = !!(auras["cryo"] || auras["frozen"]);
        return { name, reaction, buffs, defShred, infusion, resists, ele, auras, cryAffected, frame: x.frame, target: targetIndex };
    });
    // Expose synthetic mod in UI for toggle support only if the set is equipped
    if (hasFlowerEquipped) {
        availabledMods["flower-4pc"] = true;
    }
    return [abils, Object.keys(availabledMods), char];
}

import { getCustomDescriptionFor, type NoteItem } from './config/custom_descriptions';

export function getCustomDescription(char: Character | undefined, activeBuffs: string[] = []): NoteItem[] {
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