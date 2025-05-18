"use strict";
const fs = require("fs");
const path = require("path");
const CleanCSS = require("clean-css");
const htmlMinifier = require("html-minifier-terser");

function minifyCSS() {
    const cssFile = path.join(__dirname, "../dist/css/styles.css");
    const css = fs.readFileSync(cssFile, "utf8");

    const minifier = new CleanCSS({
        level: {
            1: {
                specialComments: 0,
            },
            2: {
                mergeSemantically: true,
                restructureRules: true,
            },
        },
    });

    const minified = minifier.minify(css);

    if (minified.errors.length) {
        console.error("CSS Minification errors:", minified.errors);
        return;
    }

    fs.writeFileSync(cssFile, minified.styles);
    console.log("CSS minified successfully");
}

async function minifyHTML() {
    const distDir = path.join(__dirname, "../dist");
    const files = fs.readdirSync(distDir);

    for (const file of files) {
        if (file.endsWith(".html")) {
            const filePath = path.join(distDir, file);
            const html = fs.readFileSync(filePath, "utf8");

            try {
                const minified = await htmlMinifier.minify(html, {
                    collapseWhitespace: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true,
                    minifyJS: true,
                    minifyCSS: true,
                });

                fs.writeFileSync(filePath, minified);
                console.log(`HTML minified successfully: ${file}`);
            } catch (error) {
                console.error(`Error minifying ${file}:`, error);
            }
        }
    }
}

// Run minification
async function run() {
    minifyCSS();
    await minifyHTML();
}

run().catch((err) => {
    console.error("Error during minification:", err);
    process.exit(1);
});
