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

export function getCharacterAbils(sample: Sample, charName: string, ignoredMods: string[]): [AbilInfo[], string[]] {
    if (!sample.character_details || !sample.logs) {
        return [[], []];
    }

    const charIndex: number = sample.character_details.findIndex((char: Character) => char.name == charName) ?? 0;
    const char: Character = sample.character_details[charIndex];
    const damages: LogDetails[] = sample.logs.filter((log: LogDetails) => log.char_index == charIndex && log.event == "damage" && log.logs.damage != 0) ?? [];

    let availabledMods: Record<string, boolean> = {};

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
        
        lastBuffs = { ...buffs };
        return { name, reaction, buffs, defShred, infusion, resists, ele };
    });
    return [abils, Object.keys(availabledMods)];
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