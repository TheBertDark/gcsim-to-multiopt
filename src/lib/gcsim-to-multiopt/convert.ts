import type { CustomMultiTarget, CustomTarget } from "./go_types";
import type { AbilInfo } from "./types";

import statNameConvert from "./config/stat_name";
import resistNameConvert from "./config/resist_name";
import abilNameConvert, { type AbilsType } from "./config/abil_name";

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

function convertAbil(abil: AbilInfo, convert: AbilsType): [CustomTarget | undefined, Error[]] {
    const abilPath = convert[abil.name];
    if (!abilPath) {
        return [undefined, [new Error(`Unknown ability "${abil.name}"`)]];
    }

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
        bonusStats[newName] = newValue;
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

export function convertAbils(abils: AbilInfo[], convert: AbilsType): [CustomMultiTarget, Error[]] {
    const result = abils.map(x => convertAbil(x, convert));
    const targets: CustomTarget[] = mergeCustomTargets(result.
        map(x => x[0]).
        filter((x): x is CustomTarget => x !== undefined)
    );
    const errors = result.map(x => x[1]).reduce((x, current) => [...current, ...x], []);
    return [
        {
            name: "Powered by DarkJake",
            description: "This configuration was generated with --> https://dark-jake.github.io/gcsim-to-multiopt/",
            targets
        },
        errors
    ];
}