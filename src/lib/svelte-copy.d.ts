declare module 'svelte-copy' {
    import { Action } from 'svelte/action';
    export const copy: Action<HTMLElement, string>;
}

declare namespace svelteHTML {
    interface HTMLAttributes<T> {
        'on:svelte-copy'?: (event: CustomEvent) => void;
    }
}
