/**
 * Theme Manager - Manage automatic seasonal theme changes
 * Automatically detects October (Halloween) and December (Christmas) and applies the corresponding themes
 */

import type { SeasonalTheme, ThemeManagerType } from './types.d.ts';

class ThemeManager implements ThemeManagerType {
    private currentTheme: SeasonalTheme = 'default';
    private halloweenThemeLoaded = false;
    private christmasThemeLoaded = false;
    private isClient: boolean = typeof window !== 'undefined';
    private originalImageSrc: string | null = null;

    constructor() {
        if (this.isClient) {
            this.init();
        }
    }

    /**
     * Initialize the theme manager
     */
    init(): void {
        if (!this.isClient) return;

        this.checkAndApplySeasonalTheme();
        this.setupDateChecker();
    }

    /**
     * Check if it's Halloween or Christmas season and apply the corresponding theme
     */
    checkAndApplySeasonalTheme(): void {
        if (!this.isClient) return;

        if (this.isHalloweenSeason()) {
            this.applyHalloweenTheme();
        } else if (this.isChristmasSeason()) {
            this.applyChristmasTheme();
        } else {
            this.removeAllThemes();
        }
    }

    /**
     * Apply the Halloween theme
     */
    async applyHalloweenTheme(): Promise<void> {
        if (!this.isClient || this.currentTheme === 'halloween') return;

        try {
            console.log('🎃 Iniciando aplicación del tema de Halloween...');

            if (!this.halloweenThemeLoaded) {
                await this.loadHalloweenCSS();
                this.halloweenThemeLoaded = true;
            }

            console.log('🎃 Applying theme classes...');
            document.documentElement.classList.add('halloween-theme');
            document.body.classList.add('halloween-theme');

            console.log('🎃 Changing main image to Halloween version...');
            this.switchToHalloweenImage();

            this.currentTheme = 'halloween';
            console.log('🎃 Halloween theme applied successfully');
        } catch (error) {
            console.error('❌ Error applying Halloween theme:', error);
        }
    }

    /**
     * Apply the Christmas theme
     */
    async applyChristmasTheme(): Promise<void> {
        if (!this.isClient || this.currentTheme === 'christmas') return;

        try {
            console.log('🎄 Iniciando aplicación del tema de Navidad...');

            if (!this.christmasThemeLoaded) {
                await this.loadChristmasCSS();
                this.christmasThemeLoaded = true;
            }

            console.log('🎄 Applying theme classes...');
            document.documentElement.classList.add('christmas-theme');
            document.body.classList.add('christmas-theme');

            console.log('🎄 Changing main image to Christmas version...');
            this.switchToChristmasImage();

            this.currentTheme = 'christmas';
            console.log('🎄 Christmas theme applied successfully');
        } catch (error) {
            console.error('❌ Error applying Christmas theme:', error);
        }
    }

    /**
     * Remove all seasonal themes
     */
    removeAllThemes(): void {
        if (!this.isClient || this.currentTheme === 'default') return;

        document.documentElement.classList.remove('halloween-theme', 'christmas-theme');
        document.body.classList.remove('halloween-theme', 'christmas-theme');

        this.restoreOriginalImage();
        this.currentTheme = 'default';

        console.log('🔄 All themes removed automatically');
    }

    /**
     * Change the main image to the Halloween version
     */
    switchToHalloweenImage(): void {
        if (!this.isClient) return;

        const uploadImage = document.querySelector('.upload-image');
        if (uploadImage && uploadImage instanceof HTMLImageElement) {
            if (!this.originalImageSrc) {
                this.originalImageSrc = uploadImage.src;
            }
            uploadImage.src = '/gcsim-to-multiopt/GCSim-to-GO_Halloween.png';
            console.log('🎃 Image changed to Halloween version');
        }
    }

    /**
     * Change the main image to the Christmas version
     */
    switchToChristmasImage(): void {
        if (!this.isClient) return;

        const uploadImage = document.querySelector('.upload-image');
        if (uploadImage && uploadImage instanceof HTMLImageElement) {
            if (!this.originalImageSrc) {
                this.originalImageSrc = uploadImage.src;
            }
            uploadImage.src = '/gcsim-to-multiopt/GCSim-to-GO_Navidad.png';
            console.log('🎄 Image changed to Christmas version');
        }
    }

    /**
     * Restore the original image
     */
    restoreOriginalImage(): void {
        if (!this.isClient || !this.originalImageSrc) return;

        const uploadImage = document.querySelector('.upload-image');
        if (uploadImage && uploadImage instanceof HTMLImageElement) {
            uploadImage.src = this.originalImageSrc;
            console.log('👻 Image restored to original version');
        }
    }

    /**
     * Load Christmas theme CSS dynamically
     */
    loadChristmasCSS(): Promise<void> {
        if (!this.isClient) return Promise.resolve();

        return new Promise((resolve, reject) => {
            if (document.getElementById('christmas-theme-css')) {
                console.log('🎄 Christmas theme CSS already loaded');
                resolve();
                return;
            }

            console.log('🎄 Loading Christmas theme CSS...');
            const link = document.createElement('link');
            link.id = 'christmas-theme-css';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = '/gcsim-to-multiopt/christmas-v2.css';

            link.onload = () => {
                console.log('🎄 Christmas theme CSS loaded successfully');
                resolve();
            };
            link.onerror = () => {
                console.error('❌ Error loading Christmas theme CSS');
                reject(new Error('Failed to load Christmas theme CSS'));
            };

            document.head.appendChild(link);
        });
    }

    /**
     * Load Halloween theme CSS dynamically
     */
    loadHalloweenCSS(): Promise<void> {
        if (!this.isClient) return Promise.resolve();

        return new Promise((resolve, reject) => {
            if (document.getElementById('halloween-theme-css')) {
                console.log('🎃 Halloween theme CSS already loaded');
                resolve();
                return;
            }

            console.log('🎃 Loading Halloween theme CSS...');
            const link = document.createElement('link');
            link.id = 'halloween-theme-css';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = '/gcsim-to-multiopt/halloween.css';

            link.onload = () => {
                console.log('🎃 Halloween theme CSS loaded successfully');
                resolve();
            };
            link.onerror = () => {
                console.error('❌ Error loading Halloween theme CSS');
                reject(new Error('Failed to load Halloween theme CSS'));
            };

            document.head.appendChild(link);
        });
    }

    /**
     * Sets up the daily date checker
     */
    setupDateChecker(): void {
        if (!this.isClient) return;

        this.checkAndApplySeasonalTheme();

        setInterval(() => {
            this.checkAndApplySeasonalTheme();
        }, 24 * 60 * 60 * 1000);

        window.addEventListener('focus', () => {
            this.checkAndApplySeasonalTheme();
        });
    }

    /**
     * Public method to force theme check
     */
    forceThemeCheck(): void {
        if (!this.isClient) return;
        this.checkAndApplySeasonalTheme();
    }

    /**
     * Get the current theme
     */
    getCurrentTheme(): SeasonalTheme {
        return this.currentTheme;
    }

    /**
     * Check if it's Halloween season (October)
     */
    isHalloweenSeason(): boolean {
        const now = new Date();
        return now.getMonth() === 9; // October (0-indexed)
    }

    /**
     * Check if it's Christmas season (December)
     */
    isChristmasSeason(): boolean {
        const now = new Date();
        return now.getMonth() === 11; // December (0-indexed)
    }
}

const themeManager = new ThemeManager();

if (typeof window !== 'undefined') {
    window.themeManager = themeManager;
}

export default themeManager;
