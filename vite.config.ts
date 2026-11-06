/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	base: '/gcsim-to-multiopt/',
	test: {
		include: ['tests/**/*.{test,spec}.{js,ts}']
	}
});
