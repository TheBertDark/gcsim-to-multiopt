// src/lib/utils/konamiCode.ts

/**
 * Initializes listener for the classic Konami Code sequence:
 * ↑ ↑ ↓ ↓ ← → ← → B A
 *
 * @param callback - Function to execute when Konami Code is triggered
 * @returns Cleanup function to remove event listener
 */
export function initKonamiCode(callback: () => void): () => void {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const KONAMI_CODE: string[] = [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a',
    ];

    let inputSequence: string[] = [];

    const handleKeyDown = (event: KeyboardEvent) => {
        // Do not intercept keystrokes while the user is actively typing in text inputs
        const target = event.target as HTMLElement | null;
        if (
            target &&
            (target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable)
        ) {
            return;
        }

        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        inputSequence.push(key);

        // Keep only the trailing N entries
        inputSequence = inputSequence.slice(-KONAMI_CODE.length);

        // Match sequence
        if (inputSequence.join(',') === KONAMI_CODE.join(',')) {
            inputSequence = [];
            callback();
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
}
