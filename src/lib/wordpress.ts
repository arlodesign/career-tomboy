import { decode } from 'html-entities';
import type { GigInput } from './types';

const BASE = import.meta.env.WP_API_BASE as string | undefined;

function getBase(): string {
    if (!BASE) {
        throw new Error(
            'WP_API_BASE is not set. Add it to .env (local) or Vercel environment variables.',
        );
    }
    return BASE.replace(/\/$/, '');
}

// ---------------------------------------------------------------------------
// Internal WP REST response shapes
// ---------------------------------------------------------------------------

interface WpPost {
    title: { rendered: string };
    meta: Record<string, string | boolean | null>;
}

interface WpPage {
    content: { rendered: string };
    meta: Record<string, string | null>;
}

// ---------------------------------------------------------------------------
// Gigs
// ---------------------------------------------------------------------------

export async function fetchGigInputs(): Promise<GigInput[]> {
    const res = await fetch(`${getBase()}/gigs?_fields=title,meta&per_page=100`);
    if (!res.ok) throw new Error(`WP gigs fetch failed: ${res.status}`);
    const items = (await res.json()) as WpPost[];
    return items.map((item) => ({
        venue: decode(item.title.rendered),
        date: (item.meta?.gig_date as string) ?? '',
        address: (item.meta?.gig_address as string) || null,
        ticketUrl: (item.meta?.gig_ticket_url as string) || null,
        supporting: (item.meta?.gig_supporting as string) || null,
        notes: (item.meta?.gig_notes as string) || null,
        isPrivate: Boolean(item.meta?.gig_is_private),
    }));
}

// ---------------------------------------------------------------------------
// Songs
// ---------------------------------------------------------------------------

export interface Song {
    title: string;
    artist: string;
}

export async function fetchSongs(): Promise<Song[]> {
    const res = await fetch(`${getBase()}/songs?_fields=title,meta&per_page=100`);
    if (!res.ok) throw new Error(`WP songs fetch failed: ${res.status}`);
    const items = (await res.json()) as WpPost[];
    return items.map((item) => ({
        title: decode(item.title.rendered),
        artist: decode((item.meta?.song_artist as string) ?? ''),
    }));
}

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

export interface Video {
    youtubeId: string;
    title: string;
    description?: string;
}

export interface VideoData {
    featured: Video;
    videos: Video[];
}

export async function fetchVideos(): Promise<VideoData> {
    const res = await fetch(`${getBase()}/videos?_fields=title,meta&per_page=100`);
    if (!res.ok) throw new Error(`WP videos fetch failed: ${res.status}`);
    const items = (await res.json()) as WpPost[];
    const all = items.map((item) => ({
        youtubeId: (item.meta?.video_youtube_id as string) ?? '',
        title: decode(item.title.rendered),
        description: (item.meta?.video_description as string) || undefined,
        isFeatured: Boolean(item.meta?.video_is_featured),
    }));
    const featured = all.find((v) => v.isFeatured) ?? all[0];
    const videos = all.filter((v) => !v.isFeatured);
    return { featured, videos };
}

// ---------------------------------------------------------------------------
// Photos
//
// Images are served straight from WordPress. The srcset is assembled from the
// sizes WordPress generated on upload, so the browser picks the file and Astro
// never touches the image.
// ---------------------------------------------------------------------------

interface WpImageSize {
    width: number;
    height: number;
    source_url: string;
}

interface WpMedia {
    id: number;
    alt_text: string;
    caption: { rendered: string };
    source_url: string;
    media_details: {
        width: number;
        height: number;
        sizes?: Record<string, WpImageSize>;
    };
}

export interface Photo {
    id: number;
    src: string;
    srcset: string;
    width: number;
    height: number;
    alt: string;
    caption: string;
}

// Cropped sizes (e.g. the 150×150 "thumbnail") share the list with scaled
// ones. srcset candidates must all have the original's aspect ratio or the
// browser would swap in a crop, so anything off by more than a rounding
// pixel is dropped.
function srcsetFor(media: WpMedia): string {
    const { width, height, sizes = {} } = media.media_details;
    const byWidth = new Map<number, string>();
    for (const size of Object.values(sizes)) {
        if (Math.abs(size.height - (size.width * height) / width) > 1) continue;
        byWidth.set(size.width, size.source_url);
    }
    byWidth.set(width, media.source_url);
    return [...byWidth]
        .sort(([a], [b]) => a - b)
        .map(([w, url]) => `${url} ${w}w`)
        .join(', ');
}

export async function fetchPhotos(): Promise<Photo[]> {
    const res = await fetch(
        `${getBase()}/media?ct_photo=1&media_type=image&per_page=100&_fields=id,alt_text,caption,source_url,media_details`,
    );
    if (!res.ok) throw new Error(`WP photos fetch failed: ${res.status}`);
    const items = (await res.json()) as WpMedia[];
    return items.map((item) => ({
        id: item.id,
        src: item.media_details.sizes?.large?.source_url ?? item.source_url,
        srcset: srcsetFor(item),
        width: item.media_details.width,
        height: item.media_details.height,
        alt: item.alt_text,
        caption: item.caption.rendered.trim(),
    }));
}

// ---------------------------------------------------------------------------
// Booking page
//
// The Song List block's PHP render_callback outputs this marker, which
// survives content.rendered so Astro can split the HTML around it.
// ---------------------------------------------------------------------------

const SONG_LIST_MARKER = '<div data-ct-block="song-list"></div>';

export interface BookingPage {
    contentBefore: string;
    contentAfter: string;
    formUrl: string;
}

export async function fetchBookingPage(): Promise<BookingPage> {
    const res = await fetch(`${getBase()}/pages?slug=booking&_fields=content,meta`);
    if (!res.ok) throw new Error(`WP booking page fetch failed: ${res.status}`);
    const items = (await res.json()) as WpPage[];
    const page = items[0];
    const rendered = page?.content?.rendered ?? '';
    const [contentBefore = '', contentAfter = ''] = rendered.split(SONG_LIST_MARKER);
    return {
        contentBefore,
        contentAfter,
        formUrl: (page?.meta?.booking_form_url as string) ?? '',
    };
}
