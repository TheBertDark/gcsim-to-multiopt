import type { CustomMultiTarget, CustomTarget, TargetResult } from "./go_types";
import type { AbilInfo } from "./types";

import statNameConvert from "./config/stat_name";
import resistNameConvert from "./config/resist_name";
import abilNameConvert, { type AbilsType, defaultAbils, characterAbils } from "./config/abil_name";
import { Character } from "./gcsim_types";

export function statConvert(name: string, value: number): [string, number] | Error {
    if (!statNameConvert[name]) {
        return new Error(`Unknown stat "${name}"`);
    }
    name = statNameConvert[name] ?? name;
    if (name[name.length - 1] == '_') { // percent
        value *= 100;
    }
    return [name, value];
}

export function resistConvert(element: string, value: number): [string, number] | Error {
    if (!resistNameConvert[element]) {
        return new Error(`Unknown element "${element}"`);
    }
    element = resistNameConvert[element] ?? element;
    value *= 100;
    return [element, value];
}

// Used for cases where the ability name on GCSIM stay the same
// But element change and name on GO change with it
function getAbilByEle(abilPath: string[], ele: string): string[] {
    // Arbitrary element order to put in the config (the one on go)
    if (ele === "hydro")
        return [abilPath[0], abilPath[1]];
    else if (ele === "pyro")
        return [abilPath[0], abilPath[2]];
    else if (ele === "cryo")
        return [abilPath[0], abilPath[3]];
    else if (ele === "electro")
        return [abilPath[0], abilPath[4]];
    return [];
}

// Used for cases where abilities have the same name but different elements
// Returns the appropriate ability path based on element
// Example: Ayato's "Normal 0" -> physical: ["normal", "0"], hydro (Active skill): ["skill", "dmg0"]
function getAbilByElementDifferentiation(abilName: string, ele: string, characterAbils: AbilsType, defaultAbils: AbilsType): string[] | undefined {
    // Check if character has specific mapping for this ability
    const charAbil = characterAbils[abilName];
    const defaultAbil = defaultAbils[abilName];
    
    // If both exist, we need to differentiate by element
    if (charAbil && defaultAbil) {
        // For physical damage, prefer default abilities (normal attacks)
        if (ele === "physical") {
            return defaultAbil;
        }
        // For elemental damage, prefer character-specific abilities
        else if (ele === "hydro" || ele === "pyro" || ele === "cryo" || ele === "electro" || ele === "anemo" || ele === "geo" || ele === "dendro") {
            return charAbil;
        }
    }
    
    // If only one exists, return it
    return charAbil || defaultAbil;
}

function getAbilExceptions(abil: AbilInfo, abilPath: string[], allAbils: CustomTarget[], char: Character | undefined): string[] {
    if (char && char.name) {
        if (char.name === "bennett") {
            if (abil.name === "Passion Overload (Level 1)") {
                const found = [...allAbils].reverse().find(target => target.path[0] === "skill");
                if (found && found.path[1] === "hold1_1")
                    return ["skill", "hold1_2"];
            }
            else if (abil.name === "Passion Overload (Level 2)") {
                const found = [...allAbils].reverse().find(target => target.path[0] === "skill");
                if (found && found.path[1] === "hold2_1")
                    return ["skill", "hold2_2"];
                else if (found && found.path[1] === "hold2_2")
                    return ["skill", "explosion"];
            }
        }
        else if (char.name === "raiden") {
            if (abil.name === "Musou Isshin 3") {
                const found = [...allAbils].reverse().find(target => target.path[0] === "burst");
                if (found && found.path[1] === "hit41")
                    return ["burst", "hit42"];
            }
        }
        else if (char.name === "sethos") {
            if (abil.name === "Dusk Bolt 1") {
                const found = [...allAbils].reverse().find(target => target.path[0] === "burst");
                if (found && found.path[1] === "dusk_1")
                    return ["burst", "dusk_2"];
            }
        }
        else if (char.name === "tartaglia") {
            if (abil.name === "Normal 5" && abilPath[0] === "skill") {
                const found = [...allAbils].reverse().
                    find(target => target.path[0] === "skill" && target.path[1] !== "riptideSlash");
                if (found && found.path[1] === "normal61")
                    return ["skill", "normal62"];
            }
        }
        else if (char.name === "travelerelectro") {
            if (abil.name === "Falling Thunder") {
                const founds = [...allAbils].reverse().
                    filter(target => target.path[0] === "burst").slice(0, 2);
                if (founds.length === 2 && founds.every(f => f.path[1] === "thunderDmg"))
                    return ["burst", "thirdThunderDmg"];
            }
        }
    }
    return abilPath;
}

function getAbil(abil: AbilInfo, convert: AbilsType, allAbils: CustomTarget[], char: Character | undefined): string[] {
    let abilPath = convert[abil.name];
    
    // Try element-based differentiation for character-specific abilities
    if (char && char.name) {
        const charAbils: AbilsType = characterAbils[char.name] || {};
        const elementDifferentiatedPath = getAbilByElementDifferentiation(abil.name, abil.ele, charAbils, defaultAbils);
        
        if (elementDifferentiatedPath) {
            abilPath = elementDifferentiatedPath;
        }
    }

    if (abilPath) {
        if (abilPath.length > 2)
            abilPath = getAbilByEle(abilPath, abil.ele);
        abilPath = getAbilExceptions(abil, abilPath, allAbils, char)
    }

    return abilPath
}

function convertAbil(abil: AbilInfo, convert: AbilsType, allAbils: CustomTarget[], char: Character | undefined): TargetResult {
    const abilPath = getAbil(abil, convert, allAbils, char);
    if (!abilPath || !abilPath.length)
        return [undefined, [new Error(`Unknown ability "${abil.name}"`)]];

    let bonusStats: Record<string, number> = {};
    let errors: Error[] = [];
    const addBuff = (name: string, value: number, isResist: boolean = false): void => {
        let result : [string, number] | Error;
        if (isResist) {
            result = resistConvert(name, value);
        } else {
            result = statConvert(name, value);
        }
        if (result instanceof Error) {
            errors.push(result);
            return;
        }
        const [newName, newValue] = result;

        // Modification: If it is an elemental resist (ends with “_enemyRes_”) and a value already exists,
        // add the new value instead of overwriting it.
        if (newName.endsWith("_enemyRes_") && bonusStats[newName] !== undefined) {
            bonusStats[newName] += newValue;
        } else {
            bonusStats[newName] = newValue;
        }
    };
    Object.entries(abil.buffs).forEach(([name, value]) => addBuff(name, value));
    abil.resists.forEach(resist => addBuff(resist.element, resist.amount, true));
    
    if (abil.defShred) {
        bonusStats["enemyDefRed_"] = abil.defShred * 100;
    }

    let description = "";
    if (typeof globalThis.abilityDescriptions === "object") {
        description = globalThis.abilityDescriptions[abil.name] || "No description available.";
    }

    const result: CustomTarget = {
        weight: 1,
        path: abilPath,
        hitMode: "avgHit",
        reaction: abil.reaction,
        infusionAura: abil.infusion,
        bonusStats,
        description,
    };
    return [result, errors];
}

export function mergeCustomTargets(targets: CustomTarget[]): CustomTarget[] {
    const mergedMap = new Map<string, CustomTarget>();
    targets.forEach(target => {
        const pathKey = JSON.stringify({
            path: target.path,
            hitMode: target.hitMode,
            bonusStats: target.bonusStats,
            reaction: target.reaction
        });

        if (mergedMap.has(pathKey)) {
            const existingTarget = mergedMap.get(pathKey)!;
            existingTarget.weight += target.weight;
        } else {
            mergedMap.set(pathKey, { ...target });
        }
    });
    return Array.from(mergedMap.values());
}

export function convertAbils(abils: AbilInfo[], convert: AbilsType, char: Character | undefined): [CustomMultiTarget, Error[]] {
    const result: TargetResult[] = [];
    
    if (char && char.name)
        char.name = char.name.replace(/^(aether|lumine)/, "traveler");
    for (let i = 0; i < abils.length; i++) {
        const customeTargets = result.map(x => x[0]).filter((x): x is CustomTarget => x !== undefined);
        result.push(convertAbil(abils[i], convert, customeTargets, char));
    }
    const targets: CustomTarget[] = mergeCustomTargets(result.
        map(x => x[0]).
        filter((x): x is CustomTarget => x !== undefined)
    );
    const errors = result.map(x => x[1]).reduce((x, current) => [...current, ...x], []);
    return [
        {
            name: "Powered by DarkJake",
            description: "This configuration was generated with --> https://thebertdark.github.io/gcsim-to-multiopt/",
            targets
        },
        errors
    ];
}