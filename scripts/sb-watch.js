"use strict";

const chokidar = require("chokidar");
const upath = require("upath");
const renderAssets = require("./render-assets");
const renderPug = require("./render-pug");
const renderScripts = require("./render-scripts");
const renderSCSS = require("./render-scss");

const watcher = chokidar.watch("src", {
    persistent: true,
});

async function handleChange(filePath) {
    const src = upath.resolve(upath.dirname(__filename), "../src");
    const relativeFilePath = upath.relative(src, filePath);

    try {
        if (relativeFilePath.startsWith("pug/")) {
            await renderPug(filePath);
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
