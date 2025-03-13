"use strict";
const fs = require("fs").promises;
const ejs = require("ejs");
const upath = require("upath");
const sh = require("shelljs");
const prettier = require("prettier");
const loadGigs = require("./load-gigs");

module.exports = async function renderEJS(filePath) {
    try {
        const destPath = filePath
            .replace(/src\/ejs\//, "dist/")
            .replace(/\.ejs$/, ".html");
        const srcPath = upath.resolve(upath.dirname(__filename), "../src");

        console.log(`### INFO: Rendering ${filePath} to ${destPath}`);

        const html = await ejs.renderFile(filePath, {
            doctype: "html",
            filename: filePath,
            gigs: loadGigs(),
        });

        const destPathDirname = upath.dirname(destPath);
        if (!sh.test("-e", destPathDirname)) {
            sh.mkdir("-p", destPathDirname);
        }

        const prettified = await prettier.format(html, {
            printWidth: 1000,
            tabWidth: 4,
            singleQuote: true,
            proseWrap: "preserve",
            endOfLine: "lf",
            parser: "html",
            htmlWhitespaceSensitivity: "ignore",
        });

        await fs.writeFile(destPath, prettified);
    } catch (err) {
        console.error(`Error rendering ${filePath}:`, err);
        throw err;
    }
};
