import type { Gig, GigInput, GigsData } from "./types";
import gigsData from "../data/gigs.json";

/**
 * Generate a Google Maps search URL from an address
 */
export function generateMapsUrl(address: string): string {
    const encoded = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

/**
 * Get all gigs, sorted by date (upcoming first)
 */
export function getGigs(): Gig[] {
    const data = gigsData as GigsData;
    return data.gigs
        .map(normalizeGig)
        .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
}

/**
 * Derive a stable gig ID. If an explicit `id` is provided in content, we use
 * that; otherwise we generate one from the date (e.g. "gig-2025-08-23").
 */
function buildGigId(input: GigInput): string {
    if (input.id && input.id.trim().length > 0) return input.id;

    const date = new Date(input.date);
    if (!Number.isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `gig-${year}-${month}-${day}`;
    }

    // Fallback: sanitize the raw date string so we still get a stable ID.
    const safe = input.date.replace(/[^0-9a-z]+/gi, "-").toLowerCase();
    return `gig-${safe}`;
}

function normalizeGig(input: GigInput): Gig {
    return {
        ...input,
        id: buildGigId(input),
    };
}

/**
 * Get only upcoming gigs (today or later)
 */
export function getUpcomingGigs(): Gig[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return getGigs().filter((gig) => new Date(gig.date) >= now);
}

/**
 * Get only past gigs
 */
export function getPastGigs(): Gig[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return getGigs()
        .filter((gig) => new Date(gig.date) < now)
        .reverse();
}
