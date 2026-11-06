/**
 * Halloween Theme Tester - Utility to test the Halloween theme
 * Allows force activation of the theme regardless of the current date
 */

import type { HalloweenTesterType } from './types.d.ts';

class HalloweenTester implements HalloweenTesterType {
    private originalDate: DateConstructor = Date;
    private isTestMode: boolean = false;

    /**
     * Activate test mode by forcing the date to October
     */
    enableTestMode(): void {
        if (this.isTestMode || typeof window === 'undefined') return;

        this.isTestMode = true;
        const originalDate = this.originalDate;

        // Custom Date Constructor for simulation
        function FakeDate(this: Date, ...args: any[]) {
            if (!(this instanceof FakeDate)) {
                return (new (FakeDate as any)(...args)).toString();
            }
            if (args.length === 0) {
                const testDate = new originalDate();
                testDate.setMonth(9); // October (0-indexed)
                return testDate;
            }
            return new (originalDate as any)(...args);
        }

        FakeDate.prototype = originalDate.prototype;
        Object.setPrototypeOf(FakeDate, originalDate);

        Object.getOwnPropertyNames(originalDate).forEach(name => {
            if (name !== 'prototype' && name !== 'length' && name !== 'name') {
                try {
                    (FakeDate as any)[name] = (originalDate as any)[name];
                } catch {
                    // Ignore non-configurable properties
                }
            }
        });

        (window as any).Date = FakeDate;

        console.log('🎃 Test mode activated - Simulating October');

        if (window.themeManager) {
            window.themeManager.forceThemeCheck();
        }
    }

    activateTestMode(): void {
        this.enableTestMode();
    }

    /**
     * Deactivate test mode restoring the normal date
     */
    disableTestMode(): void {
        if (!this.isTestMode || typeof window === 'undefined') return;

        this.isTestMode = false;
        window.Date = this.originalDate;

        console.log('👻 Test mode deactivated - Normal date restored');

        if (window.themeManager) {
            window.themeManager.forceThemeCheck();
        }
    }

    deactivateTestMode(): void {
        this.disableTestMode();
    }

    /**
     * Toggle between test mode and normal mode
     */
    toggleTestMode(): void {
        if (this.isTestMode) {
            this.disableTestMode();
        } else {
            this.enableTestMode();
        }
    }

    /**
     * Check if test mode is active
     */
    isTestModeActive(): boolean {
        return this.isTestMode;
    }

    isActive(): boolean {
        return this.isTestMode;
    }

    printDebugInfo(): void {
        this.debugInfo();
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
            currentTheme: typeof window !== 'undefined' && window.themeManager
                ? window.themeManager.getCurrentTheme()
                : 'unknown',
        };
    }

    /**
     * Show debug information in the console
     */
    debugInfo(): void {
        const status = this.getCurrentThemeStatus();
        console.group('🎃 Halloween Theme Debug Info');
        console.log('Current month:', status.currentMonth);
        console.log('Is October:', status.isOctober);
        console.log('Test mode active:', status.isTestMode);
        console.log('Current theme:', status.currentTheme);
        console.log('Theme manager available:', typeof window !== 'undefined' && !!window.themeManager);
        console.groupEnd();
    }
}

const halloweenTester = new HalloweenTester();

if (typeof window !== 'undefined') {
    window.halloweenTester = halloweenTester;
    window.enableHalloweenTest = () => halloweenTester.enableTestMode();
    window.activateHalloweenTheme = () => halloweenTester.enableTestMode();
    window.disableHalloweenTest = () => halloweenTester.disableTestMode();
    window.deactivateHalloweenTheme = () => halloweenTester.disableTestMode();
    window.toggleHalloweenTest = () => halloweenTester.toggleTestMode();
    window.halloweenDebug = () => halloweenTester.debugInfo();

    console.log('🎃 Halloween Tester loaded. Available commands:');
    console.log('- enableHalloweenTest() / halloweenTester.enableTestMode(): Activate test mode');
    console.log('- disableHalloweenTest() / halloweenTester.disableTestMode(): Deactivate test mode');
    console.log('- toggleHalloweenTest(): Toggle test mode');
    console.log('- halloweenDebug(): Show debug information');
}

export default halloweenTester;
