"use strict";
const fs = require("fs");
const upath = require("upath");
const { parse } = require("csv-parse/sync");

module.exports = function loadGigs() {
    const gigsPath = upath.resolve(
        upath.dirname(__filename),
        "../src/data/gigs.csv",
    );

    try {
        const csvContent = fs.readFileSync(gigsPath, "utf-8");
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
        });

        // Sort gigs by date
        return records.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (err) {
        console.warn("Warning: Could not load gigs data:", err.message);
        return [];
    }
};
