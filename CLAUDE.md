# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static marketing website for Career Tomboy, a Chicago-based alternative cover band. Built with Astro (static output), Tailwind CSS v4, and TypeScript. Hosted on Vercel.

## Commands

```bash
pnpm dev        # Start dev server at http://localhost:4321
pnpm build      # Run favicon prebuild + compile to dist/
pnpm preview    # Serve production build locally
```

No test suite exists. The prebuild step (`scripts/generate-favicons.mjs`) runs automatically before `pnpm build`.

## Environment

Copy `.env.example` to `.env` and set `WP_API_BASE` before running dev or build:

```
WP_API_BASE=https://<your-wp-domain>/wp-json/wp/v2
```

## WordPress Headless CMS

Content is managed in a WordPress instance (URL in `.env`, not committed). The Astro build fetches all data at build time from the WP REST API via `src/lib/wordpress.ts`.

**Custom Post Types** (registered in the theme's `functions.php`):
- `gig` — fields: `gig_date`, `gig_address`, `gig_ticket_url`, `gig_supporting`, `gig_notes`, `gig_is_private`
- `song` — fields: `song_artist`
- `video` — fields: `video_youtube_id`, `video_description`, `video_is_featured`
- `band_member` — fields: `member_role`, `member_bio`
- `page` (standard) — `booking` page with `booking_form_url` meta and Song List block

**Theme:** `wp-theme/career-tomboy-headless/` — upload to `/wp-content/themes/` on the WP server. Contains `functions.php` (CPT/meta registration, Song List block PHP registration, deploy hook), `blocks.js` (custom Gutenberg block, no build step), `style.css` (theme header), `index.php` (fallback redirect).

**Song List block:** A custom Gutenberg block (`career-tomboy/song-list`) that band members can drag to position the song list within the Booking page content. Registered in both `blocks.js` (editor tile) and `functions.php` (`render_callback` outputs `<div data-ct-block="song-list"></div>`). The PHP registration is required so `content.rendered` contains the marker — without it, WordPress silently drops the block comment.

**Vercel deploy hook:** Add `define( 'CT_VERCEL_DEPLOY_HOOK', 'YOUR_URL' )` to `wp-config.php`. The theme triggers a rebuild whenever a gig, song, video, band_member, or page is published or trashed.

**Adding content:** Edit posts/pages in the WordPress admin. Save/publish triggers an automatic Vercel rebuild.

## Architecture

Single-page site (`src/pages/index.astro`) composed of sequential sections. All data is fetched from the WordPress REST API at build time via `src/lib/wordpress.ts`.

**Data flow:**

- WP REST API (`/gigs`) → `fetchGigInputs()` in `wordpress.ts` → `src/lib/gigs.ts` (sort, filter upcoming/past, auto-generate IDs, build Maps URLs) → `GigsList.astro` / `Gig.astro`
- WP REST API (`/videos`) → `fetchVideos()` → `Media.astro`
- WP REST API (`/songs`) → `fetchSongs()` → sorted by artist (ignoring "The" prefix) then title → shown in `Booking.astro`
- WP REST API (`/pages?slug=booking`) → `fetchBookingPage()` → `Booking.astro` (`content.rendered` split on Song List marker, `booking_form_url` meta)

**Adding content:** Edit in WordPress admin and publish. Gig IDs auto-generate as `gig-YYYY-MM-DD` if not specified.

**Booking page content:** `fetchBookingPage()` splits `content.rendered` on `<div data-ct-block="song-list"></div>` into `contentBefore` / `contentAfter`. Both halves are rendered with `set:html` and styled via scoped `:global()` CSS in `Booking.astro`.

**Section pattern:** Major sections use `Section.astro` which wraps content with a named color token (`papaya`, `lime`, `plum`, `strawberry`) and patterned background via `Bg.astro`.

**Patterned backgrounds:** CSS mask technique using repeating SVG. The pattern offset is updated dynamically via `window.updatePatternOffsets()` to account for scroll position and layout shifts (e.g., when the songs dialog opens in `Booking.astro`).

**Client-side JS:** Minimal and inline. Key behaviors:

- Sticky nav via `IntersectionObserver`
- Pattern offset recalculation on scroll/resize
- `<details>` toggle in Booking section calls `updatePatternOffsets()`

## Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js`). Brand colors defined as CSS custom properties in `src/styles/global.css`:

- `ct-black` (#1f0760), `ct-white` (#fef1db)
- Section accent colors: `ct-papaya`, `ct-lime`, `ct-plum`, `ct-strawberry`

Custom font: Input Serif (Type Network), loaded via `<link>` in `Head.astro`.

## Gig Data Schema

Gigs are created as WordPress posts of type `gig`. The following custom meta fields map to the `GigInput` TypeScript type:

| WP meta key       | TypeScript field | Notes                                  |
| ----------------- | ---------------- | -------------------------------------- |
| `gig_date`        | `date`           | ISO date string; time optional         |
| (post `title`)    | `venue`          | Post title is the venue name           |
| `gig_address`     | `address`        | Full address, or omit for private gigs |
| `gig_ticket_url`  | `ticketUrl`      | Optional                               |
| `gig_supporting`  | `supporting`     | Supporting act name, optional          |
| `gig_notes`       | `notes`          | Extra info, optional                   |
| `gig_is_private`  | `isPrivate`      | Hides address/details when true        |
