import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    // Output static HTML (default)
    output: 'static',
    // Site URL for canonical links
    site: 'https://careertomboy.com',
});
