export type Mods = Record<string, string[]>;
export type Buffs = Record<string, number>;

export type Resist = {
    element: string;
    amount: number;
};

export interface InfusionInfo {
    from: number;
    to: number;
    element: string;
};

export interface AbilInfo {
    name: string;
    reaction?: string;
    buffs: Buffs;
    defShred?: number;
    infusion?: string;
    resists: Resist[];
    ele: string;
    // Active auras on the target around the time of the hit
    // Keys in lowercase (e.g., "cryo", "hydro", "frozen") and boolean value
    auras?: Record<string, boolean>;
    // Whether the target was affected by Cryo aura at the time of hit
    cryAffected?: boolean;
    // Optional context for more advanced heuristics if needed later
    frame?: number;
    target?: number;
};