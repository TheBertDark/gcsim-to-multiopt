/**
 * Reaction classification utilities for gcsim-to-multiopt.
 * Centralizes detection of Transformative, Lunar, and Stellar reactions
 * as well as mapping abilities to their Genshin Optimizer reaction keys.
 */

export type ReactionCategory =
    | 'transformative'
    | 'lunar_reaction'
    | 'lunar_direct'
    | 'stellar_reaction'
    | 'stellar_direct'
    | 'none';

export type SpecialReactionVariant =
    | 'lunarcharged'
    | 'lunarbloom'
    | 'lunarcrystallize'
    | 'stellarconduct'
    | 'stellarswirl';

const STANDARD_TRANSFORMATIVE_REACTIONS = new Set<string>([
    'overload',
    'superconduct',
    'swirl-electro',
    'swirl-hydro',
    'swirl-pyro',
    'swirl-cryo',
    'swirl-electro (aoe)',
    'swirl-hydro (aoe)',
    'swirl-pyro (aoe)',
    'swirl-cryo (aoe)',
    'electrocharged',
    'shatter',
    'burning',
    'bloom',
    'burgeon',
    'hyperbloom',
]);

/**
 * Checks if an ability name is a standard transformative reaction
 * (or a Stellar Swirl reaction attack that scales off character stats/EM rather than talent%).
 */
export function isTransformativeReaction(name: string): boolean {
    if (STANDARD_TRANSFORMATIVE_REACTIONS.has(name)) {
        return true;
    }
    return isStellarReactionAbil(name) || isLunarReactionOnlyAbil(name);
}

/**
 * Checks if an ability is a pure Lunar reaction trigger (lunarcharged / lunarcrystallize).
 */
export function isLunarReactionOnlyAbil(name: string): boolean {
    return name === 'lunarcharged' || name === 'lunarcrystallize';
}

/**
 * Checks if an ability is any Lunar reaction or direct Lunar talent hit.
 */
export function isLunarReactionAbil(name: string): boolean {
    return (
        name === 'lunarcharged' ||
        name === 'lunarcrystallize' ||
        name.includes('Lunar-Charged') ||
        name.includes('Lunar-Bloom') ||
        name.includes('Lunar-Crystallize')
    );
}

/**
 * Checks if an ability is a pure Stellar reaction trigger
 * (e.g., "Stellar Swirl", "Stellar Swirl (Mizuki C1)", "Stellar Swirl Detonation").
 */
export function isStellarReactionAbil(name: string): boolean {
    return (
        name === 'Stellar Swirl' ||
        name === 'Stellar Swirl (Mizuki C1)' ||
        name.startsWith('Stellar Swirl Detonation')
    );
}

/**
 * Checks if an ability is a direct talent hit considered Stellar-Conduct or Stellar Swirl DMG.
 */
export function isStellarDirectAbil(name: string): boolean {
    return (
        name.includes('(Stellar-Conduct)') ||
        (name.includes('(Stellar Swirl)') && !isStellarReactionAbil(name))
    );
}

/**
 * Checks if an ability is any Stellar reaction or direct Stellar talent hit.
 */
export function isStellarAbil(name: string): boolean {
    return isStellarReactionAbil(name) || isStellarDirectAbil(name);
}

/**
 * Resolves the special reaction variant (Lunar or Stellar) for a given ability name or attack tag.
 */
export function getSpecialReactionVariant(
    abilName: string,
    attackTag?: number
): SpecialReactionVariant | undefined {
    if (
        abilName === 'lunarcharged' ||
        abilName.includes('(Lunar-Charged)') ||
        abilName === 'Thunderous Symphony' ||
        abilName === 'Birgitta (A1)'
    ) {
        return 'lunarcharged';
    }
    if (abilName.includes('Lunar-Bloom')) {
        return 'lunarbloom';
    }
    if (abilName === 'lunarcrystallize' || abilName.includes('Lunar-Crystallize')) {
        return 'lunarcrystallize';
    }
    if (abilName.includes('(Stellar-Conduct)') || attackTag === 35) {
        return 'stellarconduct';
    }
    if (
        isStellarReactionAbil(abilName) ||
        abilName.includes('(Stellar Swirl)') ||
        attackTag === 34 ||
        attackTag === 36
    ) {
        return 'stellarswirl';
    }
    return undefined;
}

/**
 * Maps an ability name (and optional attack tag) to the internal stat key in `stat_name.ts`
 * used for `[React Bonus]` percentage damage bonuses (e.g. `stellarconduct%`, `stellarswirl%`, `swirl%`).
 */
export function getReactionBonusStatKey(
    abilName: string,
    attackTag?: number
): string | undefined {
    const specialVariant = getSpecialReactionVariant(abilName, attackTag);
    if (specialVariant) {
        return `${specialVariant}%`;
    }
    if (abilName.startsWith('swirl-')) {
        return 'swirl%';
    }
    if (STANDARD_TRANSFORMATIVE_REACTIONS.has(abilName)) {
        return `${abilName}%`;
    }
    return undefined;
}
