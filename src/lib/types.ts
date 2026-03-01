/**
 * Raw gig data as stored in JSON / CMS. The `id` field is optional; if
 * omitted, we derive a stable ID from the date when building the site.
 */
export interface GigInput {
    id?: string | null;
    date: string;
    venue: string;
    address?: string | null;
    ticketUrl?: string | null;
    supporting?: string | null;
    notes?: string | null;
    isPrivate: boolean;
}

/**
 * Normalized gig used throughout the UI – always has a concrete `id`.
 */
export interface Gig extends Omit<GigInput, "id"> {
    id: string;
}

export interface GigsData {
    gigs: GigInput[];
}
