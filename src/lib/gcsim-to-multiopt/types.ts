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
};