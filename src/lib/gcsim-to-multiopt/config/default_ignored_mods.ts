export const DEFAULT_IGNORED_EXACT: string[] = [
    // Char A1/A4/Constel
    'alhaitham-a4',
    'kirara-a4-burst',
    'kirara-a4-skill',
    'nahida-a4',
    'nilou-c1',
    'nilou-c6-cd',
    'nilou-c6-cr',
    'paramita',
    'xingqiu-a4',
    'yelan-a1',

    // Arte sets
    'emblem-4pc', // Not a perfect solution as we won't have the DMG% from ER buffs
    'glad-4pc',

    // Weapons base extra stats
    'elegy-em',
    'homa-atk-buff',
    'homa-hp',
    'khaj-nisut',
    'khaj-nisut-team-buff',
    'wolf-fang',

    // Resonnances
    'hydro-res-hpp',
    'pyro-res',
    'dendro-res-50',
];

export const DEFAULT_IGNORED_SUFFIXES: string[] = ['-2pc'];

export const DEFAULT_EXCEPTIONS: string[] = ['obsidiancodex-2pc'];

export function computeDefaultIgnored(mods: string[]): string[] {
    return mods.filter(
        m =>
            !DEFAULT_EXCEPTIONS.includes(m) &&
            (DEFAULT_IGNORED_EXACT.includes(m) ||
                DEFAULT_IGNORED_SUFFIXES.some(suf => m.endsWith(suf)))
    );
}
