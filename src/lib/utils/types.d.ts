// Type declarations for global objects and window extensions

declare global {
    interface Window {
        themeManager?: {
            forceThemeCheck(): void;
            getCurrentTheme(): string;
        };
        activateChristmasTheme?: () => void;
        deactivateChristmasTheme?: () => void;
        toggleChristmasTheme?: () => void;
    }
}

export {};