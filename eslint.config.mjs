import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astroPlugin from 'eslint-plugin-astro';
import globals from 'globals';

export default [
    // Base JS rules for all files
    js.configs.recommended,

    // TypeScript rules for .ts files
    ...tseslint.configs.recommended,

    // Astro rules for .astro files
    ...astroPlugin.configs.recommended,

    // Use @typescript-eslint/parser for <script> blocks inside .astro files
    {
        files: ['**/*.astro'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
            },
        },
    },

    // CMS browser scripts: browser globals + allow functions called from inline HTML
    {
        files: ['cms/app.js'],
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            // Functions like openGigModal, saveGig, etc. are called from inline
            // onclick attributes in index.html so ESLint can't see them as used
            '@typescript-eslint/no-unused-vars': 'off',
            'no-unused-vars': 'off',
        },
    },

    // Node.js scripts: Node globals
    {
        files: ['cms/server.js', 'scripts/**/*.mjs'],
        languageOptions: {
            globals: globals.node,
        },
    },

    // Global ignores
    {
        ignores: ['dist/', 'node_modules/', '.astro/'],
    },
];
