"use strict";
const upath = require("upath");
const sh = require("shelljs");
const renderEJS = require("./render-ejs");

const srcPath = upath.resolve(upath.dirname(__filename), "../src");

async function buildEJS() {
    try {
        const files = sh.find(srcPath);
        const ejsFiles = files.filter(
            (file) =>
                file.match(/\.ejs$/) &&
                !file.match(/include/) &&
                !file.match(/layouts/),
        );

        for (const file of ejsFiles) {
            await renderEJS(file);
        }
    } catch (err) {
        console.error("Error building EJS files:", err);
        process.exit(1);
    }
}

buildEJS();
