export const DEFAULT_IGNORED_EXACT: string[] = [
    // Char A1/A4
    'nahida-a4',
    'xingqiu-a4',
    'yelan-a1',

    // Arte sets
    'emblem-4pc', // Not a perfect solution as we won't have the DMG% from ER buffs

    // Weapons base extra stats
    'elegy-em',

    // Resonnances
    'hydro-res-hpp',
    'pyro-res',
];

export const DEFAULT_IGNORED_SUFFIXES: string[] = ['-2pc'];

export const DEFAULT_EXCEPTIONS: string[] = ['obsidiancodex-2pc'];

export function computeDefaultIgnored(mods: string[]): string[] {
    return mods.filter(
        m =>
            !DEFAULT_EXCEPTIONS.includes(m) && (
                DEFAULT_IGNORED_EXACT.includes(m) ||
                DEFAULT_IGNORED_SUFFIXES.some(suf => m.endsWith(suf))
            )
    );
}
