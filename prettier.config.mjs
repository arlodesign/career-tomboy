/** @type {import('prettier').Config} */
export default {
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    semi: true,
    trailingComma: 'all',
    plugins: ['prettier-plugin-astro'],
    overrides: [
        {
            files: '*.astro',
            options: { parser: 'astro' },
        },
    ],
};
