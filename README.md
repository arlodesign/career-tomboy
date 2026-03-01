# Career Tomboy Website

Career Tomboy is a Chicago cover band playing what they call "alternative classics and deep cuts". This repo contains the source for **careertomboy.com**, a single-page marketing site built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com).

## Features

- **One-page layout** with sections for:
    - Hero / masthead
    - Upcoming gigs
    - Media (featured video + gallery)
    - Booking (Google Form embed + songs dialog)
    - Contact & social links
- **Upcoming gigs** are read from JSON and automatically split into upcoming vs. past based on date.
- **YouTube embeds** for videos with lazy loading.
- **Accessible booking dialog** listing songs the band has played.
- **Patterned background system** powered by CSS masks and color tokens.
- Static HTML export suitable for any CDN or static host.

## Tech stack

- [Astro 5](https://docs.astro.build/) with static output
- [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/vite`
- Node.js (see Astro docs for supported versions; Node 18+ is recommended)
- Package manager: [`pnpm`](https://pnpm.io/) (examples below use `pnpm`, but `npm`/`yarn` also work)
- Auxiliary tooling:
    - `sharp` for image processing
    - favicon generation script in `scripts/generate-favicons.mjs`

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd career-tomboy-website

# using pnpm (recommended)
pnpm install

# or with npm
# npm install
```

### 2. Run the development server

```bash
pnpm dev
# or: npm run dev
```

Astro will start a dev server (by default at `http://localhost:4321`) with hot reload.

### 3. Build for production

```bash
pnpm build
# or: npm run build
```

This runs the favicon prebuild step and outputs a static site to `dist/`.

### 4. Preview the production build

```bash
pnpm preview
# or: npm run preview
```

This serves the contents of `dist/` locally so you can smoke-test the production build.

### 5. Run the local CMS (optional)

```bash
pnpm cms
```

Opens a browser UI at `http://localhost:4322` for editing gigs, videos, songs, and members without touching JSON by hand. Use the **Publish** tab to commit and push changes — Vercel will auto-deploy.

## Project structure

Only the most relevant pieces are listed here:

- `astro.config.mjs` – Astro configuration (static output, Tailwind/Vite plugin, site URL).
- `src/pages/index.astro` – main page that assembles all sections.
- `src/layouts/Main.astro` – base layout, shared head, navigation, and footer.
- `src/components/` – UI components such as:
    - `Masthead.astro` – hero section
    - `GigsList.astro` + `Gig.astro` – upcoming gigs feed
    - `Media.astro` – featured + additional videos
    - `Booking.astro` – booking form embed and songs dialog
    - `Contact.astro` – email + social links
    - `Section.astro` / `Bg.astro` – colored, patterned background sections
- `src/data/` – JSON data sources:
    - `gigs.json`
    - `videos.json`
    - `songs.json`
    - `members.json`
- `src/styles/` – global styles and the patterned background CSS.

## Editing content

Most band-specific content lives in JSON files under `src/data/`. The easiest way to edit them is via the local CMS (`pnpm cms`). You can also edit the JSON directly — both approaches are described below.

### Gigs

Upcoming and past shows are stored in `src/data/gigs.json` and typed via `src/lib/types.ts`.

A minimal example (the `id` will be generated automatically from the date if you omit it):

```json
{
    "gigs": [
        {
            "date": "2026-03-21T19:00:00-05:00",
            "venue": "Evanston Post 42",
            "address": "1030 Central St, Evanston, IL",
            "ticketUrl": null,
            "supporting": "With Dad or Alive",
            "notes": null,
            "isPrivate": false
        }
    ]
}
```

- `date` should be an ISO-8601 string; the site uses it to sort gigs and to decide what counts as "upcoming".
- Set `isPrivate` to `true` for shows where the exact location shouldn’t be displayed.

### Videos

`src/data/videos.json` drives the media section. It contains a single featured video and an array of additional videos:

```json
{
    "featured": {
        "youtubeId": "XXXXXXXXXXX",
        "title": "Featured video title",
        "description": "Short description (optional)"
    },
    "videos": [
        {
            "youtubeId": "YYYYYYYYYYY",
            "title": "Another video",
            "description": "Optional description"
        }
    ]
}
```

### Songs (setlist)

`src/data/songs.json` powers the “Songs We've Played” dialog opened from the booking section:

```json
[{ "title": "Song Title", "artist": "Artist Name" }]
```

### Members / other copy

Any structured band member data or additional bios can live in `src/data/members.json` and be consumed by components as needed.

For static text (e.g., headings, intro copy), edit the relevant `.astro` components in `src/components/`.

## Local CMS

`cms/server.js` is a small Express 5 server that exposes a REST API over `src/data/` and serves a self-contained browser UI (`cms/index.html`). Start it with `pnpm cms`.

**Tabs:** Gigs · Videos · Songs · Members · Publish

**Publish tab** runs `git add src/data && git commit -m "<message>" && git push` and streams the output live. Requires that the working directory has a git remote configured and the shell has push access (e.g., SSH key or credential helper).

**CMS files:**
- `cms/server.js` — Express server (port 4322)
- `cms/index.html` — single-file UI, vanilla JS, no build step
- `cms/package.json` — `{"type":"module"}` so ESM imports work

## Accessibility

The site is built with accessibility in mind:

- Semantic headings and landmarks (header, main, footer, sections)
- Visible focus states for interactive elements
- Color choices intended to meet WCAG 2.2 AA contrast where text is involved
- Dialog controls that remain keyboard-accessible

When adding or changing UI, aim to preserve these guarantees:

- Don’t remove focus outlines without providing an equally visible replacement.
- Ensure text has sufficient contrast against its background.
- Keep interactions accessible by keyboard and screen readers.

## Deployment

The project builds to static HTML, CSS, and JS in `dist/`. You can deploy it to any static host or CDN. Currently, this site is hosted with Vercel.

Typical workflow:

1. `pnpm install`
2. `pnpm build`
3. Upload or point your host at the `dist/` directory. (Vercel does this automatically.)

## License

This project is published under the MIT license (see the `license` field in `package.json`). If you add a top-level `LICENSE` file, it should match the MIT terms.
