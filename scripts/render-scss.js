"use strict";
const autoprefixer = require("autoprefixer");
const fs = require("fs");
const packageJSON = require("../package.json");
const upath = require("upath");
const postcss = require("postcss");
const sass = require("sass");
const sh = require("shelljs");
const purgecss = require("@fullhuman/postcss-purgecss");

const stylesPath = "../src/scss/styles.scss";
const destPath = upath.resolve(
    upath.dirname(__filename),
    "../dist/css/styles.css",
);

module.exports = function renderSCSS() {
    const results = sass.compile(
        upath.resolve(upath.dirname(__filename), stylesPath),
        {
            loadPaths: [
                upath.resolve(upath.dirname(__filename), "../node_modules"),
            ],
            style: "expanded",
            sourceMap: true,
        },
    );

    const destPathDirname = upath.dirname(destPath);
    if (!sh.test("-e", destPathDirname)) {
        sh.mkdir("-p", destPathDirname);
    }

    postcss([
        autoprefixer,
        purgecss({
            content: ["./dist/**/*.html"],
            safelist: {
                standard: ["active", "show", "collapse", "collapsing"],
                deep: [/^bs-/, /^navbar-/],
                greedy: [/^modal/, /^show$/],
            },
        }),
    ])
        .process(results.css, {
            from: "styles.css",
            to: "styles.css",
            map: { inline: false },
        })
        .then((result) => {
            result.warnings().forEach((warn) => {
                console.warn(warn.toString());
            });

            fs.writeFileSync(destPath, result.css);
            if (result.map) {
                fs.writeFileSync(destPath + ".map", result.map.toString());
            }
        });
};

const entryPoint = `/*!
* Start Bootstrap - ${packageJSON.title} v${packageJSON.version} (${
    packageJSON.homepage
})
* Copyright 2013-${new Date().getFullYear()} ${packageJSON.author}
* Licensed under ${packageJSON.license} (https://github.com/StartBootstrap/${
    packageJSON.name
}/blob/master/LICENSE)
*/
@import "${stylesPath}"
`;
