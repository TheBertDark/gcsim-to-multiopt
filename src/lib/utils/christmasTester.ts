/**
 * Christmas Theme Tester - Utility to test the Christmas theme
 * Forces the date to December to activate the Christmas theme
 */

import type { ChristmasTesterType } from './types.d.ts';

interface ThemeManager {
    forceThemeCheck(): void;
    getCurrentTheme(): string;
}

interface DebugStatus {
    testModeActive: boolean;
    currentDate: string;
    currentMonth: number;
    isDecember: boolean;
    themeManagerAvailable: boolean;
    currentTheme: string;
}

class ChristmasTester implements ChristmasTesterType {
    private originalDate: DateConstructor | null = null;
    private isTestModeActiveState: boolean = false;

    constructor() {
        this.originalDate = null;
        this.isTestModeActiveState = false;
    }

    /**
     * Enable test mode alias
     */
    enableTestMode(): void {
        this.activateTestMode();
    }

    /**
     * Disable test mode alias
     */
    disableTestMode(): void {
        this.deactivateTestMode();
    }

    /**
     * Activate test mode by forcing the date to December
     */
    activateTestMode(): void {
        if (this.isTestModeActiveState) {
            console.log('🎄 Christmas test mode is already active');
            return;
        }

        // Store the original Date constructor
        this.originalDate = window.Date;

        // Create a custom Date constructor that simulates December
        const originalDateRef = this.originalDate;
        
        const ChristmasDate = function(...args: any[]): Date {
            if (!originalDateRef) return new Date();
            
            // If no arguments are passed, create a date in December
            if (args.length === 0) {
                const testDate = new originalDateRef();
                testDate.setMonth(11); // December (0-indexed)
                testDate.setDate(25); // Christmas Day
                return testDate;
            }
            
            // Otherwise, create date with provided arguments
            return new (originalDateRef as any)(...args);
        } as any;

        // Copy static methods from the original Date
        if (this.originalDate) {
            Object.setPrototypeOf(ChristmasDate, this.originalDate);
            
            // Copy static properties and methods
            const staticProps = ['parse', 'UTC', 'now'];
            staticProps.forEach(prop => {
                if (this.originalDate && (this.originalDate as any)[prop]) {
                    (ChristmasDate as any)[prop] = (this.originalDate as any)[prop];
                }
            });
        }

        // Replace the global Date constructor
        window.Date = ChristmasDate as DateConstructor;

        this.isTestModeActiveState = true;

        console.log('🎄 Test mode activated - Simulating December');
        console.log('🎄 Current simulated date:', new Date().toString());

        // Force theme check if themeManager is available
        if (window.themeManager && typeof window.themeManager.forceThemeCheck === 'function') {
            setTimeout(() => {
                window.themeManager!.forceThemeCheck();
            }, 100);
        }
    }

    /**
     * Deactivate test mode and restore the original Date constructor
     */
    deactivateTestMode(): void {
        if (!this.isTestModeActiveState) {
            console.log('🎄 Christmas test mode is not active');
            return;
        }

        // Restore the original Date constructor
        if (this.originalDate) {
            window.Date = this.originalDate;
        }

        this.isTestModeActiveState = false;

        console.log('🎄 Test mode deactivated - Restored original date');
        console.log('🎄 Current real date:', new Date().toString());

        // Force theme check if themeManager is available
        if (window.themeManager && typeof window.themeManager.forceThemeCheck === 'function') {
            setTimeout(() => {
                window.themeManager!.forceThemeCheck();
            }, 100);
        }
    }

    /**
     * Toggle test mode on/off
     */
    toggleTestMode(): void {
        if (this.isTestModeActiveState) {
            this.deactivateTestMode();
        } else {
            this.activateTestMode();
        }
    }

    /**
     * Check if test mode is active
     */
    isActive(): boolean {
        return this.isTestModeActiveState;
    }

    isTestModeActive(): boolean {
        return this.isTestModeActiveState;
    }

    debugInfo(): DebugStatus {
        return this.printDebugInfo();
    }

    /**
     * Get debug information about the current state
     */
    getDebugInfo(): DebugStatus {
        const now = new Date();
        const month = now.getMonth();
        const isDecember = month === 11;

        const status: DebugStatus = {
            testModeActive: this.isTestModeActiveState,
            currentDate: now.toString(),
            currentMonth: month + 1, // 1-indexed for display
            isDecember,
            themeManagerAvailable: !!(window.themeManager),
            currentTheme: (window.themeManager && typeof window.themeManager.getCurrentTheme === 'function') 
                ? window.themeManager.getCurrentTheme() 
                : 'unknown'
        };

        return status;
    }

    /**
     * Print debug information to console
     */
    printDebugInfo(): DebugStatus {
        const status = this.getDebugInfo();

        console.group('🎄 Christmas Theme Debug Info');
        console.log('Test Mode Active:', status.testModeActive);
        console.log('Is December:', status.isDecember);
        console.log('Current Date:', status.currentDate);
        console.log('Current Month:', status.currentMonth);
        console.log('Theme Manager Available:', status.themeManagerAvailable);
        console.log('Current Theme:', status.currentTheme);
        console.groupEnd();

        return status;
    }
}

// Create global instance
const christmasTester = new ChristmasTester();

// Export for use in modules
export default christmasTester;

// Make available globally for console access
if (typeof window !== 'undefined') {
    window.christmasTester = christmasTester;
    
    // Add convenient global functions
    window.activateChristmasTheme = () => christmasTester.activateTestMode();
    window.enableChristmasTest = () => christmasTester.activateTestMode();
    window.deactivateChristmasTheme = () => christmasTester.deactivateTestMode();
    window.disableChristmasTest = () => christmasTester.deactivateTestMode();
    window.toggleChristmasTheme = () => christmasTester.toggleTestMode();
    window.christmasDebug = () => christmasTester.printDebugInfo();
}

console.log('🎄 Christmas Theme Tester loaded');
console.log('🎄 Available commands:');
console.log('  - activateChristmasTheme() / christmasTester.enableTestMode() - Force Christmas theme');
console.log('  - deactivateChristmasTheme() / christmasTester.disableTestMode() - Disable Christmas theme');
console.log('  - toggleChristmasTheme() - Toggle Christmas theme');
console.log('  - christmasDebug() - Show debug information');