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
            let gigDateTime;

            if (gig.timezone) {
                // Create the date in the specified timezone
                // This ensures the time is interpreted correctly regardless of server timezone
                const dateTimeString = `${gig.date}T${gig.time}`;
                gigDateTime = new Date(dateTimeString);

                // Get the current date in the gig's timezone for comparison
                const now = new Date();
                const gigTimezoneDate = new Date(
                    now.toLocaleString("en-US", { timeZone: gig.timezone }),
                );
                const gigLocalDateString = gigTimezoneDate
                    .toISOString()
                    .split("T")[0];

                // Compare the gig date with today's date in the gig's timezone
                const isIncluded = gig.date >= gigLocalDateString;
                return isIncluded;
            } else {
                // Fallback to simple date string comparison if no timezone
                gigDateTime = new Date(`${gig.date}T${gig.time}`);
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
            // The key insight: the time in CSV (e.g., "19:00") represents the local time
            // in the event's timezone. We need to create a Date object that, when formatted
            // with the timezone option, will display that exact time.

            // Parse the date and time components
            const [year, month, day] = gig.date.split("-").map(Number);

            // Handle empty time values for private events
            let hour = 0,
                minute = 0;
            if (gig.time && gig.time.trim() !== "") {
                [hour, minute] = gig.time.split(":").map(Number);
            }

            let gigDateTime;
            if (gig.timezone) {
                // Create a date that represents the specified time in the target timezone
                // We'll construct it in a way that accounts for timezone differences

                // First, create the date/time as if it were UTC
                const utcDateTime = new Date(
                    Date.UTC(year, month - 1, day, hour, minute, 0, 0),
                );

                // Now we need to adjust this so that when formatted with the target timezone,
                // it shows the correct local time. We do this by finding the offset difference.

                // Get what time this UTC date would show in the target timezone
                const targetTzTime = new Intl.DateTimeFormat("en-CA", {
                    timeZone: gig.timezone,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }).format(utcDateTime);

                // Parse the result to see what time it shows
                const [targetDate, targetTime] = targetTzTime.split(", ");
                const [targetHour, targetMinute] = targetTime
                    .split(":")
                    .map(Number);

                // Calculate the difference between what we want and what we got
                const wantedMinutes = hour * 60 + minute;
                const gotMinutes = targetHour * 60 + targetMinute;
                const offsetMinutes = wantedMinutes - gotMinutes;

                // Adjust the UTC time by this offset
                gigDateTime = new Date(
                    utcDateTime.getTime() + offsetMinutes * 60 * 1000,
                );
            } else {
                gigDateTime = new Date(`${gig.date}T${gig.time}`);
            }

            // Set timezone options for formatting
            const tzOptions = gig.timezone ? { timeZone: gig.timezone } : {};

            // Format the date in the specified timezone
            const dateOptions = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                ...tzOptions,
            };

            // Format the time in the specified timezone
            const timeOptions = {
                hour: "numeric",
                minute: "2-digit",
                ...tzOptions,
            };

            // Add formatted date and time to the gig object
            // Create a proper ISO 8601 datetime string with timezone information
            let isoDateTime;
            if (gig.time && gig.time.trim() !== "") {
                isoDateTime = `${gig.date}T${gig.time}`;
            } else {
                // For events without time, just use the date
                isoDateTime = gig.date;
            }

            // Add timezone information if available
            if (gig.timezone && gig.time && gig.time.trim() !== "") {
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

            // Format the date and time using the timezone-aware options
            // This will display the time as specified in the CSV (e.g., 7:00 PM)
            // in the correct timezone regardless of the server's timezone
            const formattedDate = new Intl.DateTimeFormat(
                "en-US",
                dateOptions,
            ).format(gigDateTime);

            // Handle empty time values - don't show "12:00 AM" for private events
            let formattedTime;
            if (gig.time && gig.time.trim() !== "") {
                formattedTime = new Intl.DateTimeFormat(
                    "en-US",
                    timeOptions,
                ).format(gigDateTime);
            } else {
                formattedTime = ""; // Empty string for events without specified time
            }

            return {
                ...gig,
                formattedDate: formattedDate,
                formattedTime: formattedTime,
                isoDateTime: isoDateTime,
            };
        });
    } catch (err) {
        console.warn("Warning: Could not load gigs data:", err.message);
        return [];
    }
};
