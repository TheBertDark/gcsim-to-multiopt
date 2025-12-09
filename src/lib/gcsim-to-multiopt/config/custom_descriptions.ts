import type { Character } from '../gcsim_types';

// Help texts by character (data)
export interface DescriptionRule {
    text: string;
    condition?: {
        minCons?: number;
        always?: boolean;
    };
    image?: string; // Optional image path for tooltip
}

export const characterDescriptions: Record<string, DescriptionRule[]> = {
    albedo: [
        {
            text: 'You must select the Opening of Phanerozoic consumed on Q settings',
            condition: { minCons: 2 },
        },
    ],
    kazuha: [
        {
            text: 'You must select the A1 and Q elemental absorption on E and Q settings',
            condition: { always: true },
        },
    ],
    mavuika: [
        {
            text: 'You must select the fighting spirit consumed on Q settings',
            condition: { always: true },
            image: '/gcsim-to-multiopt/visual-help/burningskies.png',
        },
        {
            text: 'You must change the <emphasis>A4 Kiongozi</emphasis> to <highlight>Not active</highlight> in the Q settings.',
            condition: { always: true },
            image: '/gcsim-to-multiopt/visual-help/kiongozi.png',
        },
        {
            text: 'Be sure to deselect the <emphasis>A1 Gift of Flaming Flowers</emphasis> in the Talents settings.',
            condition: { always: true },
        },
        {
            text: 'Cuando acabare con esta mrd T_T',
            condition: { minCons: 2 },
        },
    ],
    nahida: [
        {
            text: 'You must select the <highlight>Opponent is marked by Seed of Skandha</highlight> option in the <emphasis>C2 settings</emphasis> of the Genshin Optimizer.',
            condition: { minCons: 2 },
        },
    ],
};

function normalizeName(name?: string): string {
    return (name || '').toLowerCase().trim();
}

// Weapon help texts (data)
const weaponTexts: Record<string, DescriptionRule> = {
    dragonsbane: {
        text: 'You must deselect the option <emphasis>Enemy is affected by Hydro or Pyro</emphasis> in the weapon condition located in the <highlight>Overview</highlight> tab of the Genshin Optimizer.',
        image: '/gcsim-to-multiopt/visual-help/dbpassive.png',
    },
    // Should we really precise that ? everything need to be unselect except the one we precise
    // And by default on GO everything is unselected
};

// Artifact set help texts (data)
// Now using DescriptionRule format to support images
const setTexts: Record<string, DescriptionRule> = {
    'crimson witch of flames': {
        text: '<warning>Using 4pc Crimson Witch of Flames:</warning> This configuration is only valid for 4pc CW equipment; any other configuration will not be accurate due to the 4-piece set bonus (only stacks). If you want to use it for general builds, disable the ‘crimson-4pc-stacks’ buff.',
        image: '/gcsim-to-multiopt/visual-help/crimsonwitch.png',
    },
    'flower of paradise lost': {
        text: '<warning>Using 4pc Flower:</warning> This configuration is only valid for 4pc FoPL equipment; any other configuration will not be accurate due to the 4-piece set bonus. If you want to use it for general builds, disable the ‘flower-4pc’ buff.',
    },
    'obsidian codex': {
        text: '<warning>Using 4pc Obsidian Codex:</warning> This configuration is only valid for 4pc Obsidian Codex equipment; any other configuration will not be accurate due to the 4-piece set bonus. If you want to use it for general builds, disable the <highlight>obsidiancodex-2pc</highlight> and <highlight>obsidiancodex-4pc</highlight> buff.',
        image: '/gcsim-to-multiopt/visual-help/obsidian.png',
    },
};

// Buff help texts (data)
// Keys should match the mod/buff name found in GCSim logs (e.g., 'kazuha-a4', 'key-of-khaj-nisut-passive')
const buffTexts: Record<string, DescriptionRule> = {
    'kazuha-a4': {
        text: "<warning>Kazuha A4 buff detected:</warning> Ensure that your <emphasis>Kazuha's Elemental Mastery</emphasis> is the same as the one shown in the simulation.",
    },
    'khaj-nisut-team-buff': {
        text: '<warning>Key of Khaj-Nisut passive detected:</warning> Make sure that the <underline>character holding the weapon has the same HP</underline> as the one used in the simulation.',
    },
    'khaj-nisut-buff': {
        text: '<warning>Key of Khaj-Nisut passive detected:</warning> The weapon’s passive has been disabled due to its relation to the character’s max HP.',
    },
};

// Optional buff conditions (logic)
// We can specify conditions like 'always: true' or custom logic if needed in the future.
// Currently, if a key exists in buffTexts, we check activeBuffs for it.
// This object is reserved for future advanced conditions if necessary.
// const buffConds: Record<string, { always?: boolean }> = {};

// === Text styling tags parser ===
// Allows you to use custom tags in notes, for example:
// <strong>text</strong>, <important>text</important>, <emphasis>text</emphasis>
// Compatible with combinations and nesting of tags.

export type NoteTag =
    | 'strong'
    | 'important'
    | 'emphasis'
    | 'highlight'
    | 'warning'
    | 'underline'
    | 'pyro'
    | 'hydro'
    | 'electro'
    | 'geo'
    | 'cryo'
    | 'anemo'
    | 'dendro'
    | 'physical';

const tagClassMap: Record<NoteTag, string> = {
    strong: 'note-strong',
    important: 'note-important',
    emphasis: 'note-emphasis',
    highlight: 'note-highlight',
    warning: 'note-warning',
    underline: 'note-underline',
    pyro: 'note-pyro',
    hydro: 'note-hydro',
    electro: 'note-electro',
    geo: 'note-geo',
    cryo: 'note-cryo',
    anemo: 'note-anemo',
    dendro: 'note-dendro',
    physical: 'note-physical',
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
    'obsidian codex': { keyIncludes: ['obsidian', 'codex'], minPieces: 4 },
};

function hasSetPieces(char: Character, tokens: string[], minPieces = 4): boolean {
    const entries = Object.entries(char.sets || {});
    return entries.some(([key, count]) => {
        const k = normalizeName(key);
        const allTokensMatch = tokens.every(t => k.includes(t));
        return allTokensMatch && count >= minPieces;
    });
}

export interface NoteItem {
    text: string;
    image?: string;
}

export function getCustomDescriptionFor(
    char: Character | undefined,
    activeBuffs: string[] = []
): NoteItem[] {
    if (!char) return [];

    const notes: NoteItem[] = [];

    // Character-based notes
    const cname = normalizeName(char.name);
    const rules = characterDescriptions[cname];
    if (rules) {
        for (const rule of rules) {
            const cond = rule.condition;

            if (!cond || (cond.always ?? false) || (cond.minCons ?? 0) <= (char.cons ?? 0)) {
                notes.push({ text: rule.text, image: rule.image });
            }
        }
    }

    // Weapon-based notes
    const wname = normalizeName(char.weapon?.name);
    const wRule = weaponTexts[wname];
    if (wRule) {
        notes.push({ text: wRule.text, image: wRule.image });
    }

    // Set-based notes
    for (const [setKey, rule] of Object.entries(setTexts)) {
        const sCond = setConds[setKey];
        if (!sCond) continue;
        if (hasSetPieces(char, sCond.keyIncludes, sCond.minPieces ?? 4)) {
            notes.push({ text: rule.text, image: rule.image });
        }
    }

    // Buff-based notes
    // console.log('Checking active buffs for notes:', activeBuffs);
    for (const [buffKey, bRule] of Object.entries(buffTexts)) {
        // Check for exact match or prefix match (e.g., "kazuha-a4" matches "kazuha-a4-hydro")
        if (activeBuffs.some(buff => buff === buffKey || buff.startsWith(`${buffKey}-`))) {
            notes.push({ text: bRule.text, image: bRule.image });
        }
    }

    return notes;
}
