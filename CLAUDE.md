# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static marketing website for Career Tomboy, a Chicago-based alternative cover band. Built with Astro (static output), Tailwind CSS v4, and TypeScript. Hosted on Vercel.

## Commands

```bash
pnpm dev        # Start dev server at http://localhost:4321
pnpm build      # Run favicon prebuild + compile to dist/
pnpm preview    # Serve production build locally
pnpm cms        # Start local CMS at http://localhost:4322
```

No test suite exists. The prebuild step (`scripts/generate-favicons.mjs`) runs automatically before `pnpm build`.

## Local CMS

`cms/server.js` is an Express 5 server (port 4322) that provides a browser UI for editing content without touching JSON directly.

**API:** `GET /api/:file` and `PUT /api/:file` read/write `src/data/{file}.json`. Allowed files: `gigs`, `videos`, `songs`, `members`. `POST /api/publish` runs `git add src/data && git commit && git push` and streams output via SSE.

**UI:** `cms/index.html` — self-contained, no build step. Tabs: Gigs, Videos, Songs, Members, Publish.

`cms/package.json` sets `"type": "module"` so the server's ESM imports work without affecting the root package.

## Architecture

Single-page site (`src/pages/index.astro`) composed of sequential sections. All data is JSON-driven from `src/data/`.

**Data flow:**

- `src/data/gigs.json` → processed by `src/lib/gigs.ts` (sort, filter upcoming/past, auto-generate IDs, build Maps URLs) → `GigsList.astro` / `Gig.astro`
- `src/data/videos.json` → `Media.astro`
- `src/data/songs.json` → sorted by artist (ignoring "The" prefix) then title → shown in `Booking.astro`

**Adding content:** Edit the JSON files and rebuild. Gig IDs auto-generate as `gig-YYYY-MM-DD` if not specified.

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

```json
{
    "date": "2026-03-21T19:00:00", // ISO date string; time optional
    "venue": "Venue Name",
    "address": "Full address or null for private",
    "ticketUrl": "https://... or null",
    "supporting": "Other band name or null",
    "notes": "Extra info or null",
    "isPrivate": false // Hides address/details when true
}
```
