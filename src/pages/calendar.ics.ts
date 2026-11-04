import type { APIRoute } from 'astro';
import { getGigs } from '../lib/gigs';
import { buildCalendar } from '../lib/calendar';

/** Full-schedule feed that calendar apps subscribe to via webcal://. */
export const GET: APIRoute = async () => {
    const gigs = await getGigs();

    return new Response(buildCalendar(gigs, { subscription: true }), {
        headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
    });
};
