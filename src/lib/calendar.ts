import type { Gig } from './types';

export const CALENDAR_TZ = 'America/Chicago';

/** Assumed show length when a gig has a start time but no end time. */
const GIG_DURATION_HOURS = 2;

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

interface GigTimes {
    allDay: boolean;
    /** Wall-clock start/end in Chicago, as `YYYYMMDD` (all-day) or `YYYYMMDDTHHMMSS`. */
    start: string;
    end: string;
}

/**
 * Compute a gig's start/end as Chicago wall-clock strings. We parse the date string
 * directly (no timezone conversion) and use Date.UTC purely as a calendar calculator, so
 * adding a day or two hours rolls over month ends and midnight correctly.
 */
function gigTimes(dateStr: string): GigTimes {
    const [datePart, timePart] = dateStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);

    if (!timePart) {
        const next = new Date(Date.UTC(year, month - 1, day + 1));
        return {
            allDay: true,
            start: formatDate(new Date(Date.UTC(year, month - 1, day))),
            end: formatDate(next),
        };
    }

    const [hh, mm] = timePart.split(':').map(Number);
    const start = new Date(Date.UTC(year, month - 1, day, hh, mm));
    const end = new Date(Date.UTC(year, month - 1, day, hh + GIG_DURATION_HOURS, mm));
    return { allDay: false, start: formatDateTime(start), end: formatDateTime(end) };
}

function formatDate(d: Date): string {
    return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function formatDateTime(d: Date): string {
    return `${formatDate(d)}T${d.toISOString().slice(11, 19).replace(/:/g, '')}`;
}

function gigSummary(gig: Gig): string {
    return gig.isPrivate ? 'Career Tomboy (Private Event)' : `Career Tomboy at ${gig.venue}`;
}

/** Plain-text details shared by the .ics DESCRIPTION and the Google link. Empty for private gigs. */
function gigDetails(gig: Gig): string[] {
    if (gig.isPrivate) return [];
    const parts: string[] = [];
    if (gig.supporting) parts.push(`w/ ${gig.supporting}`);
    if (gig.notes) parts.push(gig.notes);
    return parts;
}

export function gigToVEvent(gig: Gig, dtstamp: string): string {
    const { allDay, start, end } = gigTimes(gig.date);

    const lines: string[] = [
        'BEGIN:VEVENT',
        fold(`UID:${gig.id}@careertomboy.com`),
        fold(`DTSTAMP:${dtstamp}`),
        fold(allDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART;TZID=${CALENDAR_TZ}:${start}`),
        fold(allDay ? `DTEND;VALUE=DATE:${end}` : `DTEND;TZID=${CALENDAR_TZ}:${end}`),
        fold(`SUMMARY:${escape(gigSummary(gig))}`),
    ];

    if (!gig.isPrivate && gig.address) {
        lines.push(fold(`LOCATION:${escape(gig.address)}`));
    }

    const details = gigDetails(gig);
    if (details.length > 0) {
        lines.push(fold(`DESCRIPTION:${escape(details.join('\n'))}`));
    }

    if (!gig.isPrivate && gig.ticketUrl) {
        lines.push(fold(`URL:${gig.ticketUrl}`));
    }

    lines.push('END:VEVENT');
    return lines.join('\r\n');
}

function icsTimestamp(now: Date): string {
    return `${formatDateTime(now)}Z`;
}

const VTIMEZONE = [
    'BEGIN:VTIMEZONE',
    `TZID:${CALENDAR_TZ}`,
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

/**
 * Build a complete VCALENDAR. `subscription` adds the feed-level name and refresh hints
 * used by the full-schedule feed; single-gig downloads omit them so importing one show
 * doesn't create a new named calendar in the user's app.
 */
export function buildCalendar(gigs: Gig[], options: { subscription?: boolean } = {}): string {
    const dtstamp = icsTimestamp(new Date());

    const header = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Career Tomboy//Gig Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
    ];

    if (options.subscription) {
        header.push(
            'X-WR-CALNAME:Career Tomboy',
            'X-WR-CALDESC:Upcoming shows for Career Tomboy\\, a Chicago alternative cover band',
            `X-WR-TIMEZONE:${CALENDAR_TZ}`,
            // Hints for subscribers: Apple/Outlook read REFRESH-INTERVAL, Google ignores both.
            'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
            'X-PUBLISHED-TTL:PT1H',
        );
    }

    return [
        ...header,
        VTIMEZONE,
        ...gigs.map((gig) => gigToVEvent(gig, dtstamp)),
        'END:VCALENDAR',
    ].join('\r\n');
}

/** Pre-filled "new event" link for Google Calendar. Times are Chicago-local via `ctz`. */
export function googleCalendarUrl(gig: Gig): string {
    const { start, end } = gigTimes(gig.date);
    const details = [...gigDetails(gig), gig.ticketUrl ? `Tickets: ${gig.ticketUrl}` : null]
        .filter(Boolean)
        .join('\n');

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: gigSummary(gig),
        dates: `${start}/${end}`,
        ctz: CALENDAR_TZ,
    });
    if (details && !gig.isPrivate) params.set('details', details);
    if (!gig.isPrivate && gig.address) params.set('location', gig.address);

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Site-relative path of the single-gig .ics download. */
export function gigIcsPath(gig: Gig): string {
    return `/calendar/${gig.id}.ics`;
}
