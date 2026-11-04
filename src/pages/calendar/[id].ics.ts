import type { APIRoute, GetStaticPaths } from 'astro';
import { getGigs } from '../../lib/gigs';
import { buildCalendar } from '../../lib/calendar';
import type { Gig } from '../../lib/types';

/** One static .ics per gig, for the "Add to calendar" download (Apple, Outlook, etc.). */
export const getStaticPaths = (async () => {
    const gigs = await getGigs();
    return gigs.map((gig) => ({ params: { id: gig.id }, props: { gig } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
    const { gig } = props as { gig: Gig };

    return new Response(buildCalendar([gig]), {
        headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
    });
};
