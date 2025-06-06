"use strict";

const chokidar = require("chokidar");
const upath = require("upath");
const renderAssets = require("./render-assets");
const renderEJS = require("./render-ejs");
const renderScripts = require("./render-scripts");
const renderSCSS = require("./render-scss");

const watcher = chokidar.watch("src", {
    persistent: true,
});

async function handleChange(filePath) {
    const src = upath.resolve(upath.dirname(__filename), "../src");
    const relativeFilePath = upath.relative(src, filePath);

    try {
        if (relativeFilePath.startsWith("ejs/")) {
            // Skip partials and layouts
            if (
                !relativeFilePath.includes("/partials/") &&
                !relativeFilePath.includes("/layouts/")
            ) {
                await renderEJS(filePath);
            } else {
                // If a partial or layout changes, render the main index.ejs
                const indexPath = upath.resolve(src, "ejs/index.ejs");
                await renderEJS(indexPath);
            }
        } else if (relativeFilePath.startsWith("scss/")) {
            renderSCSS();
        } else if (relativeFilePath.startsWith("js/")) {
            renderScripts();
        } else if (relativeFilePath.startsWith("assets/")) {
            renderAssets();
        }
    } catch (err) {
        console.error("Error processing file:", err);
    }
}

watcher
    .on("add", handleChange)
    .on("change", handleChange)
    .on("unlink", handleChange);

console.log("Watching src directory for changes...");
