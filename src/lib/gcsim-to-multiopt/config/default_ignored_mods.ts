export const DEFAULT_IGNORED_EXACT: string[] = ['nahida-a4'];

export const DEFAULT_IGNORED_SUFFIXES: string[] = ['-2pc'];

export function computeDefaultIgnored(mods: string[]): string[] {
    return mods.filter(
        m =>
            DEFAULT_IGNORED_EXACT.includes(m) ||
            DEFAULT_IGNORED_SUFFIXES.some(suf => m.endsWith(suf))
    );
}
