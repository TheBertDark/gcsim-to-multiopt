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
    'dragonsbane': 'You must deselect the option <emphasis>Enemy is affected by Hydro or Pyro</emphasis> in the weapon condition located in the <highlight>Overview</highlight> tab of the Genshin Optimizer.', 
    // Should we really precise that ? everything need to be unselect except the one we precise
    // And by default on GO everything is unselected
};


// Artifact set help texts (data)
const setTexts: Record<string, string> = {
    'flower of paradise lost': 'Using 4pc Flower: This configuration is only valid for 4pc FoPL equipment; any other configuration will not be accurate due to the 4-piece set bonus. If you want to use it for general builds, disable the ‘flower-4pc’ buff.',
    'crimson witch of flames': '<warning>Using 4pc Crimson Witch of Flames</warning>: This configuration is only valid for 4pc CW equipment; any other configuration will not be accurate due to the 4-piece set bonus (only stacks). If you want to use it for general builds, disable the ‘crimson-4pc-stacks’ buff.',
};

// === Text styling tags parser ===
// Allows you to use custom tags in notes, for example:
// <strong>text</strong>, <important>text</important>, <emphasis>text</emphasis>
// Compatible with combinations and nesting of tags.

export type NoteTag = 'strong' | 'important' | 'emphasis' | 'highlight' | 'warning' | 'underline';

const tagClassMap: Record<NoteTag, string> = {
    strong: 'note-strong',
    important: 'note-important',
    emphasis: 'note-emphasis',
    highlight: 'note-highlight',
    warning: 'note-warning',
    underline: 'note-underline',
};

/**
 * Converts custom tags into styled spans with corresponding classes.
 * - Recognizes <strong>, <important>, <emphasis>, <highlight>, <warning>, <underline>
 * - Supports multiple tags in the same word/phrase and nesting.
 * - Maintains compatibility: if no tags are found, returns the text as is.
 */
export function applyNoteStyling(text: string): string {
    if (!text) return '';

    let processed = text;

    // Iterative replacements to support nesting: repeat until no changes are made.
    const tags = Object.keys(tagClassMap) as NoteTag[];
    let changed = true;
    while (changed) {
        changed = false;
        for (const tag of tags) {
            const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'gi');
            processed = processed.replace(re, (_m, inner: string) => {
                changed = true;
                return `<span class="${tagClassMap[tag]}">${inner}</span>`;
            });
        }
    }

    // Compatibility with common HTML tags: <b>, <em>, <u>
    processed = processed
        .replace(/<b>([\s\S]*?)<\/b>/gi, '<span class="note-strong">$1</span>')
        .replace(/<em>([\s\S]*?)<\/em>/gi, '<span class="note-emphasis">$1</span>')
        .replace(/<u>([\s\S]*?)<\/u>/gi, '<span class="note-underline">$1</span>');

    return processed;
}

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
