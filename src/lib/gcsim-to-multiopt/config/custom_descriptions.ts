import type { Character } from '../gcsim_types';

// Help texts by character (data)
export const descriptionTexts: Record<string, string> = {
    albedo: 'You must select the Opening of Phanerozoic consumed on Q settings',
    kazuha: 'You must select the A1 and Q elemental absorption on E and Q settings',
    mavuika: 'You must select the fighting spirit consumed on Q settings',
    nahida: 'You must select the «Opponent is marked by Seed of Skandha» option in the C2 settings of the Genshin Optimizer.',
};

// Conditions by character (logic)
// Example: minCons = minimum required constellation; always = always show
export const descriptionConditions: Record<string, { minCons?: number; always?: boolean }> = {
    albedo: { minCons: 2 },
    kazuha: { always: true },
    mavuika: { always: true },
    nahida: { minCons: 2 },
};

function normalizeName(name?: string): string {
    return (name || '').toLowerCase().trim();
}

// Weapon help texts (data)
const weaponTexts: Record<string, string> = {
    'dragonsbane': 'You must deselect the option «Enemy is affected by Hydro or Pyro» in the weapon condition located in the [Overview] tab of the Genshin Optimizer.', 
    // Should we really precise that ? everything need to be unselect except the one we precise
    // And by default on GO everything is unselected
};


// Artifact set help texts (data)
const setTexts: Record<string, string> = {
    'flower of paradise lost': 'Using 4pc Flower: This configuration is only valid for 4pc FoPL equipment; any other configuration will not be accurate due to the 4-piece set bonus. If you want to use it for general builds, disable the ‘flower-4pc’ buff.',
    'crimson witch of flames': 'Using 4pc Crimson Witch of Flames: This configuration is only valid for 4pc CW equipment; any other configuration will not be accurate due to the 4-piece set bonus (only stacks). If you want to use it for general builds, disable the ‘crimson-4pc-stacks’ buff.',
};

// Artifact set conditions (logic)
// keyIncludes: tokens expected in the set key; minPieces: minimum required pieces
const setConds: Record<string, { keyIncludes: string[]; minPieces?: number }> = {
    'flower of paradise lost': { keyIncludes: ['paradise', 'lost'], minPieces: 4 },
    'crimson witch of flames': { keyIncludes: ['witch', 'flames'], minPieces: 4 },
};

function hasSetPieces(char: Character, tokens: string[], minPieces = 4): boolean {
    const entries = Object.entries(char.sets || {});
    return entries.some(([key, count]) => {
        const k = normalizeName(key);
        const allTokensMatch = tokens.every(t => k.includes(t));
        return allTokensMatch && count >= minPieces;
    });
}

export function getCustomDescriptionFor(char: Character | undefined): string {
    if (!char) return '';

    const notes: string[] = [];

    // Character-based notes
    const cname = normalizeName(char.name);
    const cText = descriptionTexts[cname];
    const cCond = descriptionConditions[cname];
    if (cText && cCond && ((cCond.always ?? false) || (cCond.minCons ?? 0) <= (char.cons ?? 0))) {
        notes.push(cText);
    }

    // Weapon-based notes
    const wname = normalizeName(char.weapon?.name);
    const wText = weaponTexts[wname];
    if (wText) {
        notes.push(wText);
    }

    // Set-based notes
    for (const [setKey, sText] of Object.entries(setTexts)) {
        const sCond = setConds[setKey];
        if (!sCond) continue;
        if (hasSetPieces(char, sCond.keyIncludes, sCond.minPieces ?? 4)) {
            notes.push(sText);
        }
    }

    return notes.join('\n');
}
