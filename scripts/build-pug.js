"use strict";
const upath = require("upath");
const sh = require("shelljs");
const renderPug = require("./render-pug");

const srcPath = upath.resolve(upath.dirname(__filename), "../src");

async function buildPug() {
    try {
        const files = sh.find(srcPath);
        const pugFiles = files.filter(
            (file) =>
                file.match(/\.pug$/) &&
                !file.match(/include/) &&
                !file.match(/mixin/) &&
                !file.match(/\/pug\/layouts\//),
        );

        for (const file of pugFiles) {
            await renderPug(file);
        }
    } catch (err) {
        console.error("Error building Pug files:", err);
        process.exit(1);
    }
}

buildPug();
