import type { APIRoute } from 'astro';
import { getGigs } from '../lib/gigs';
import type { Gig } from '../lib/types';

function escape(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

/** iCal lines must not exceed 75 octets; fold longer lines with CRLF + space. */
function fold(line: string): string {
    if (line.length <= 75) return line;
    const chunks: string[] = [];
    chunks.push(line.slice(0, 75));
    let pos = 75;
    while (pos < line.length) {
        chunks.push(' ' + line.slice(pos, pos + 74));
        pos += 74;
    }
    return chunks.join('\r\n');
}

/**
 * Parse a date string directly (no Date object) to avoid timezone conversion.
 * Returns an iCal DTSTART property string and a corresponding DTEND.
 */
function buildDateProps(dateStr: string): { start: string; end: string } {
    const hasTime = dateStr.includes('T');

    if (hasTime) {
        const [datePart, timePart] = dateStr.split('T');
        const [year, month, day] = datePart.split('-');
        const [hh, mm] = timePart.split(':');
        const startVal = `${year}${month}${day}T${hh}${mm}00`;
        // Compute DTEND as 2 hours later (simple arithmetic on hours)
        const endHour = String(Number(hh) + 2).padStart(2, '0');
        const endVal = `${year}${month}${day}T${endHour}${mm}00`;
        return {
            start: `DTSTART;TZID=America/Chicago:${startVal}`,
            end: `DTEND;TZID=America/Chicago:${endVal}`,
        };
    } else {
        const [year, month, day] = dateStr.split('-');
        // All-day event; DTEND is the next calendar day
        const nextDay = String(Number(day) + 1).padStart(2, '0');
        return {
            start: `DTSTART;VALUE=DATE:${year}${month}${day}`,
            end: `DTEND;VALUE=DATE:${year}${month}${nextDay}`,
        };
    }
}

function gigToVEvent(gig: Gig, dtstamp: string): string {
    const { start, end } = buildDateProps(gig.date);

    const isPrivate = gig.isPrivate;
    const summary = isPrivate ? 'Career Tomboy (Private Event)' : `Career Tomboy at ${gig.venue}`;

    const lines: string[] = [
        'BEGIN:VEVENT',
        fold(`UID:${gig.id}@careertomboy.com`),
        fold(`DTSTAMP:${dtstamp}`),
        fold(start),
        fold(end),
        fold(`SUMMARY:${escape(summary)}`),
    ];

    if (!isPrivate && gig.address) {
        lines.push(fold(`LOCATION:${escape(gig.address)}`));
    }

    // Build description from supporting acts and notes
    const descParts: string[] = [];
    if (!isPrivate && gig.supporting) descParts.push(`w/ ${gig.supporting}`);
    if (!isPrivate && gig.notes) descParts.push(gig.notes);
    if (descParts.length > 0) {
        lines.push(fold(`DESCRIPTION:${escape(descParts.join('\\n'))}`));
    }

    if (!isPrivate && gig.ticketUrl) {
        lines.push(fold(`URL:${gig.ticketUrl}`));
    }

    lines.push('END:VEVENT');
    return lines.join('\r\n');
}

export const GET: APIRoute = () => {
    const gigs = getGigs();

    // Build DTSTAMP once for all events (build time, UTC)
    const now = new Date();
    const dtstamp =
        `${now.getUTCFullYear()}` +
        String(now.getUTCMonth() + 1).padStart(2, '0') +
        String(now.getUTCDate()).padStart(2, '0') +
        `T` +
        String(now.getUTCHours()).padStart(2, '0') +
        String(now.getUTCMinutes()).padStart(2, '0') +
        String(now.getUTCSeconds()).padStart(2, '0') +
        `Z`;

    const vtimezone = [
        'BEGIN:VTIMEZONE',
        'TZID:America/Chicago',
        'BEGIN:DAYLIGHT',
        'TZOFFSETFROM:-0600',
        'TZOFFSETTO:-0500',
        'TZNAME:CDT',
        'DTSTART:19700308T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
        'END:DAYLIGHT',
        'BEGIN:STANDARD',
        'TZOFFSETFROM:-0500',
        'TZOFFSETTO:-0600',
        'TZNAME:CST',
        'DTSTART:19701101T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
        'END:STANDARD',
        'END:VTIMEZONE',
    ].join('\r\n');

    const vevents = gigs.map((gig) => gigToVEvent(gig, dtstamp)).join('\r\n');

    const calendar = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Career Tomboy//Gig Calendar//EN',
        'X-WR-CALNAME:Career Tomboy',
        'X-WR-CALDESC:Upcoming shows for Career Tomboy\\, a Chicago alternative cover band',
        'X-WR-TIMEZONE:America/Chicago',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        vtimezone,
        vevents,
        'END:VCALENDAR',
    ].join('\r\n');

    return new Response(calendar, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'attachment; filename="career-tomboy-gigs.ics"',
        },
    });
};
