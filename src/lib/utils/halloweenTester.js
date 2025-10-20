/**
 * Halloween Theme Tester - Utility to test the Halloween theme
 * Allows force activation of the theme regardless of the current date
 */

class HalloweenTester {
    constructor() {
        this.originalDate = Date;
        this.isTestMode = false;
    }

    /**
     * Activate test mode by forcing the date to October
     */
    enableTestMode() {
        if (this.isTestMode) return;

        this.isTestMode = true;

        // Override the Date constructor to simulate October
        const originalDate = this.originalDate;

        // @ts-ignore - Temporarily override Date constructor for testing
        window.Date = function (...args) {
            if (args.length === 0) {
                // If no arguments are passed, create a date in October
                const testDate = new originalDate();
                testDate.setMonth(9); // October (0-indexed)
                return testDate;
            } else {
                // If arguments are passed, use the original constructor
                return new originalDate(...args);
            }
        };

        // Copy static methods
        Object.setPrototypeOf(window.Date, originalDate);
        Object.getOwnPropertyNames(originalDate).forEach(name => {
            if (name !== 'prototype' && name !== 'length' && name !== 'name') {
                try {
                    // @ts-ignore - Dynamically copy static properties
                    window.Date[name] = originalDate[name];
                } catch (e) {
                    // Ignore properties that cannot be copied
                }
            }
        });

        console.log('🎃 Test mode activated - Simulating October');

        // Force theme check
        // @ts-ignore - themeManager se agrega dinámicamente al objeto window
        if (window.themeManager) {
            // @ts-ignore - themeManager se agrega dinámicamente al objeto window
            window.themeManager.forceThemeCheck();
        }
    }

    /**
     * Desactivate test mode restoring the normal date
     */
    disableTestMode() {
        if (!this.isTestMode) return;

        this.isTestMode = false;

        // Restore the original Date constructor
        window.Date = this.originalDate;

        console.log('👻 Test mode deactivated - Normal date restored');

        // Force theme check
        // @ts-ignore - themeManager se agrega dinámicamente al objeto window
        if (window.themeManager) {
            // @ts-ignore - themeManager is dynamically added to the window object
            window.themeManager.forceThemeCheck();
        }
    }

    /**
     * Toggle between test mode and normal mode
     */
    toggleTestMode() {
        if (this.isTestMode) {
            this.disableTestMode();
        } else {
            this.enableTestMode();
        }
    }

    /**
     * Check if test mode is active
     */
    isTestModeActive() {
        return this.isTestMode;
    }

    /**
     * Get the current theme status
     */
    getCurrentThemeStatus() {
        const now = new Date();
        const month = now.getMonth();
        const isOctober = month === 9;

        return {
            currentMonth: month + 1,
            isOctober,
            isTestMode: this.isTestMode,
            // @ts-ignore - themeManager is dynamically added to the window object
            currentTheme: window.themeManager ? window.themeManager.getCurrentTheme() : 'unknown',
        };
    }

    /**
     * Show debug information in the console
     */
    debugInfo() {
        const status = this.getCurrentThemeStatus();
        console.group('🎃 Halloween Theme Debug Info');
        console.log('Current month:', status.currentMonth);
        console.log('Is October:', status.isOctober);
        console.log('Test mode active:', status.isTestMode);
        console.log('Current theme:', status.currentTheme);
        // @ts-ignore - themeManager is dynamically added to the window object
        console.log('Theme manager available:', !!window.themeManager);
        console.groupEnd();
    }
}

// Create global instance
const halloweenTester = new HalloweenTester();

// Make available globally for console testing
if (typeof window !== 'undefined') {
    // @ts-ignore - Add properties dynamically to the window object
    window.halloweenTester = halloweenTester;

    // Add useful console commands
    // @ts-ignore - Add properties dynamically to the window object
    window.enableHalloweenTest = () => halloweenTester.enableTestMode();
    // @ts-ignore - Add properties dynamically to the window object
    window.disableHalloweenTest = () => halloweenTester.disableTestMode();
    // @ts-ignore - Add properties dynamically to the window object
    window.toggleHalloweenTest = () => halloweenTester.toggleTestMode();
    // @ts-ignore - Add properties dynamically to the window object
    window.halloweenDebug = () => halloweenTester.debugInfo();

    console.log('🎃 Halloween Tester loaded. Available commands:');
    console.log('- enableHalloweenTest(): Activate test mode');
    console.log('- disableHalloweenTest(): Deactivate test mode');
    console.log('- toggleHalloweenTest(): Toggle test mode');
    console.log('- halloweenDebug(): Show debug information');
}

export default halloweenTester;
