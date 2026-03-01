/**
 * A gig/show entry (JSON-based MVP)
 */
export interface Gig {
    id: string;
    date: string;
    venue: string;
    address?: string | null;
    ticketUrl?: string | null;
    supporting?: string | null;
    notes?: string | null;
    isPrivate: boolean;
}

export interface GigsData {
    gigs: Gig[];
}
