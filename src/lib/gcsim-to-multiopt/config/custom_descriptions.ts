import type { Character } from '../gcsim_types';

// Help texts by character (data)
export const descriptionTexts: Record<string, string> = {
    albedo: 'You must select the Opening of Phanerozoic consumed on Q settings',
    mavuika: 'You must select the fighting spirit consumed on Q settings',
    nahida: 'You must click on «Opponent is marked by Seed of Skandha» in the C2 settings of the Genshin Optimizer.',
};

// Conditions by character (logic)
// Example: minCons = minimum required constellation; always = always show
export const descriptionConditions: Record<string, { minCons?: number; always?: boolean }> = {
    albedo: { minCons: 2 },
    mavuika: { always: true },
    nahida: { minCons: 2 },
};

function normalizeName(name?: string): string {
    return (name || '').toLowerCase().trim();
}

export function getCustomDescriptionFor(char: Character | undefined): string {
    if (!char) return '';
    const name = normalizeName(char.name);
    const text = descriptionTexts[name];
    if (!text) return '';
    const cond = descriptionConditions[name];
    const passes =
        cond?.always ||
        (cond?.minCons !== undefined ? char.cons >= (cond.minCons as number) : true);
    return passes ? text : '';
}
