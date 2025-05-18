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

        // Get current date (without time)
        const today = new Date();

        // Filter out past gigs and sort by date
        const filteredGigs = records.filter((gig) => {
            // Create a date object for the gig in its local timezone
            const gigDateTime = new Date(`${gig.date}T${gig.time}`);

            // If timezone is specified, adjust the date
            if (gig.timezone) {
                // Format the date with the specified timezone for comparison
                const gigDateOptions = {
                    timeZone: gig.timezone,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                };

                // Get the date string in YYYY-MM-DD format in the gig's timezone
                const gigLocalDate = gigDateTime.toLocaleDateString(
                    "en-CA",
                    gigDateOptions,
                );

                // Compare with today's date
                const todayString = today.toISOString().split("T")[0];
                const isIncluded = gigLocalDate >= todayString;

                return isIncluded;
            } else {
                // Fallback to simple date string comparison if no timezone
                const isIncluded =
                    gig.date >= today.toISOString().split("T")[0];

                return isIncluded;
            }
        });

        // Sort gigs by date
        const sortedGigs = filteredGigs.sort(
            (a, b) => new Date(a.date) - new Date(b.date),
        );

        // Format dates and times for each gig
        return sortedGigs.map((gig) => {
            // Create a date object for the gig
            const gigDateTime = new Date(`${gig.date}T${gig.time}`);

            // Set timezone options if available
            const tzOptions = gig.timezone ? { timeZone: gig.timezone } : {};

            // Format the date
            const dateOptions = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                ...tzOptions,
            };

            // Format the time
            const timeOptions = {
                hour: "numeric",
                minute: "2-digit",
                ...tzOptions,
            };

            // Add formatted date and time to the gig object
            // Create a proper ISO 8601 datetime string with timezone information
            let isoDateTime = `${gig.date}T${gig.time}`;

            // Add timezone information if available
            if (gig.timezone) {
                // Use the Intl.DateTimeFormat API to get the timezone offset for the specific date
                // This handles any timezone, not just America/Chicago
                const gigDate = new Date(`${gig.date}T${gig.time}`);

                // Format the date with the timezone to get the offset
                const formatter = new Intl.DateTimeFormat("en-US", {
                    timeZone: gig.timezone,
                    timeZoneName: "short",
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                });

                // Get the formatted parts
                const parts = formatter.formatToParts(gigDate);

                // Extract the timezone name (e.g., "EDT", "CDT", "PST")
                const timeZonePart = parts.find(
                    (part) => part.type === "timeZoneName",
                );
                const timeZoneName = timeZonePart ? timeZonePart.value : "";

                // Map common US timezone abbreviations to their UTC offsets
                // This is a more comprehensive approach that works for any US timezone
                const timezoneMap = {
                    EST: "-05:00",
                    EDT: "-04:00",
                    CST: "-06:00",
                    CDT: "-05:00",
                    MST: "-07:00",
                    MDT: "-06:00",
                    PST: "-08:00",
                    PDT: "-07:00",
                    AKST: "-09:00",
                    AKDT: "-08:00",
                    HST: "-10:00",
                    HDT: "-09:00",
                };

                // Get the offset from the map, or use a default if not found
                let tzOffset = timezoneMap[timeZoneName];

                // If we couldn't determine the offset from the abbreviation,
                // use a more direct approach with the Date object
                if (!tzOffset) {
                    // Create a date in the local timezone and in the target timezone
                    const localDate = new Date(gigDate);

                    // Use the Intl API to format the date in the target timezone
                    const targetTzDate = new Date(formatter.format(gigDate));

                    // Calculate the offset in minutes
                    const offsetMinutes =
                        (targetTzDate.getTime() - localDate.getTime()) / 60000;
                    const offsetHours = Math.floor(
                        Math.abs(offsetMinutes) / 60,
                    );
                    const offsetMins = Math.abs(offsetMinutes) % 60;

                    // Format the offset string
                    const sign = offsetMinutes <= 0 ? "-" : "+";
                    tzOffset = `${sign}${String(offsetHours).padStart(2, "0")}:${String(offsetMins).padStart(2, "0")}`;
                }

                // Add the timezone offset to the ISO datetime string
                isoDateTime = `${isoDateTime}${tzOffset}`;
            }

            return {
                ...gig,
                formattedDate: gigDateTime.toLocaleDateString(
                    "en-US",
                    dateOptions,
                ),
                formattedTime: gigDateTime.toLocaleTimeString(
                    "en-US",
                    timeOptions,
                ),
                isoDateTime: isoDateTime,
            };
        });
    } catch (err) {
        console.warn("Warning: Could not load gigs data:", err.message);
        return [];
    }
};
