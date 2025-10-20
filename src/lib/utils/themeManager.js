/**
 * Theme Manager - Manage automatic seasonal theme changes
 * Automatically detects October and applies the Halloween theme
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.halloweenThemeLoaded = false;
        this.isClient = typeof window !== 'undefined';
        this.originalImageSrc = null; // To save the original image

        if (this.isClient) {
            this.init();
        }
    }

    /**
     * Initialize the theme manager
     */
    init() {
        if (!this.isClient) return;

        this.checkAndApplySeasonalTheme();
        this.setupDateChecker();
    }

    /**
     * Check if it's Halloween season and apply the corresponding theme
     */
    checkAndApplySeasonalTheme() {
        if (!this.isClient) return;

        if (this.isHalloweenSeason()) {
            this.applyHalloweenTheme();
        } else {
            this.removeHalloweenTheme();
        }
    }

    /**
     * Apply the Halloween theme
     */
    async applyHalloweenTheme() {
        if (!this.isClient || this.currentTheme === 'halloween') return;

        try {
            console.log('🎃 Iniciando aplicación del tema de Halloween...');

            // Load the Halloween theme CSS if it is not loaded
            if (!this.halloweenThemeLoaded) {
                await this.loadHalloweenCSS();
                this.halloweenThemeLoaded = true;
            }

            // Apply the theme classes
            console.log('🎃 Applying theme classes...');
            document.documentElement.classList.add('halloween-theme');
            document.body.classList.add('halloween-theme');

            // Change the main image to the Halloween version
            console.log('🎃 Changing main image to Halloween version...');
            this.switchToHalloweenImage();

            this.currentTheme = 'halloween';

            console.log('🎃 Halloween theme applied successfully');
        } catch (error) {
            console.error('❌ Error applying Halloween theme:', error);
        }
    }

    /**
     * Remove the Halloween theme
     */
    removeHalloweenTheme() {
        if (!this.isClient || this.currentTheme === 'default') return;

        // Remove the theme classes
        document.documentElement.classList.remove('halloween-theme');
        document.body.classList.remove('halloween-theme');

        // Restore the original image
        this.restoreOriginalImage();

        this.currentTheme = 'default';

        console.log('👻 Halloween theme removed automatically');
    }

    /**
     * Change the main image to the Halloween version
     */
    switchToHalloweenImage() {
        if (!this.isClient) return;

        const uploadImage = document.querySelector('.upload-image');
        if (uploadImage && uploadImage instanceof HTMLImageElement) {
            // Save the original image if it hasn't been saved yet
            if (!this.originalImageSrc) {
                this.originalImageSrc = uploadImage.src;
            }

            // Change to the Halloween image
            uploadImage.src = '/gcsim-to-multiopt/GCSim-to-GO_Halloween.png';
            console.log('🎃 Image changed to Halloween version');
        }
    }

    /**
     * Restore the original image
     */
    restoreOriginalImage() {
        if (!this.isClient || !this.originalImageSrc) return;

        const uploadImage = document.querySelector('.upload-image');
        if (uploadImage && uploadImage instanceof HTMLImageElement) {
            uploadImage.src = this.originalImageSrc;
            console.log('👻 Image restored to original version');
        }
    }

    /**
     * Load the Halloween theme CSS dynamically
     * @returns {Promise<void>}
     */
    loadHalloweenCSS() {
        if (!this.isClient) return Promise.resolve();

        return new Promise((resolve, reject) => {
            // Check if the link already exists
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
     * Configures the daily date checker that runs every 24 hours
     */
    setupDateChecker() {
        if (!this.isClient) return;

        // Check immediately
        this.checkAndApplySeasonalTheme();

        // Set up daily check (every 24 hours)
        setInterval(() => {
            this.checkAndApplySeasonalTheme();
        }, 24 * 60 * 60 * 1000);

        // Also check when the page regains focus
        window.addEventListener('focus', () => {
            this.checkAndApplySeasonalTheme();
        });
    }

    /**
     * Public method to force theme check (useful for testing)
     */
    forceThemeCheck() {
        if (!this.isClient) return;

        this.checkAndApplySeasonalTheme();
    }

    /**
     * Get the current theme
     * @returns {string} - The current theme ('default' or 'halloween')
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Check if it's Halloween season (October)
     * @returns {boolean} - True if it's October
     */
    isHalloweenSeason() {
        const now = new Date();
        // Temporarily enabled for testing - change to: return now.getMonth() === 9;
        return true; // October
    }
}

// Create global instance of theme manager
const themeManager = new ThemeManager();

// Export for use in modules
export default themeManager;

// Also make available globally
if (typeof window !== 'undefined') {
    // @ts-ignore - Add themeManager to the global window object
    window.themeManager = themeManager;
}
