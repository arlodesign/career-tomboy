import type { Gig, GigsData } from "./types";
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
        .slice()
        .sort(
            (a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
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
