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
        return { name, reaction, buffs, defShred, infusion, resists, ele };
    });
    // Expose synthetic mod in UI for toggle support only if the set is equipped
    if (hasFlowerEquipped) {
        availabledMods["flower-4pc"] = true;
    }
    return [abils, Object.keys(availabledMods), char];
}

function getCustomDescription(char: Character | undefined): string {
    if (!char) 
        return "";

    switch (char.name) {
        case "albedo":
            if (char.cons >= 2)
                return "You must select the Opening of Phanerozoic consumed on Q settings";
        case "mavuika":
            return "You must select the fighting spirit consumed on Q settings";
        case "nahida":
            if (char.cons >= 2)
                return "You must click the \"Opponent is marked by Seed of Skandha\" on C2 settings";
    }

    return "";
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