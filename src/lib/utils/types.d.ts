// Type declarations for global objects and window extensions

export type SeasonalTheme = 'default' | 'halloween' | 'christmas';

export interface ThemeManagerType {
    init(): void;
    forceThemeCheck(): void;
    getCurrentTheme(): SeasonalTheme;
    applyHalloweenTheme(): Promise<void>;
    applyChristmasTheme(): Promise<void>;
    removeAllThemes(): void;
}

export interface HalloweenTesterType {
    enableTestMode(): void;
    activateTestMode(): void;
    disableTestMode(): void;
    deactivateTestMode(): void;
    toggleTestMode(): void;
    isTestModeActive(): boolean;
    isActive(): boolean;
    debugInfo(): void;
    printDebugInfo(): void;
}

export interface ChristmasTesterType {
    activateTestMode(): void;
    enableTestMode(): void;
    deactivateTestMode(): void;
    disableTestMode(): void;
    toggleTestMode(): void;
    isActive(): boolean;
    isTestModeActive(): boolean;
    printDebugInfo(): any;
    debugInfo(): any;
}

declare global {
    interface Window {
        themeManager?: ThemeManagerType;
        halloweenTester?: HalloweenTesterType;
        christmasTester?: ChristmasTesterType;
        enableHalloweenTest?: () => void;
        disableHalloweenTest?: () => void;
        toggleHalloweenTest?: () => void;
        halloweenDebug?: () => void;
        activateHalloweenTheme?: () => void;
        deactivateHalloweenTheme?: () => void;
        activateChristmasTheme?: () => void;
        deactivateChristmasTheme?: () => void;
        toggleChristmasTheme?: () => void;
        enableChristmasTest?: () => void;
        disableChristmasTest?: () => void;
        christmasDebug?: () => any;
    }
}

export {};
