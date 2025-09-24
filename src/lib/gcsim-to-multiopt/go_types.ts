export interface AbilityInfo {
    name: string;
    description?: string;
    reaction?: string;
    infusionAura?: string;
    bonusStats?: Record<string, number>;
}

export interface CustomTarget {
    weight: number;
    path: string[];
    hitMode: string
    reaction?: string;
    infusionAura?: string;
    bonusStats: Record<string, number>
    description: string
}

export interface CustomMultiTarget {
    name: string;
    description?: string;
    targets: CustomTarget[];
    abilities?: AbilityInfo[];
}

export type TargetResult = [CustomTarget | undefined, Error[]];