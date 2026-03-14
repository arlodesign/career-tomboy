# Career Tomboy Website

Career Tomboy is a Chicago cover band playing what they call "alternative classics and deep cuts". This repo contains the source for **careertomboy.com**, a single-page marketing site built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com). Content is managed via a WordPress headless CMS.

## Features

- **One-page layout** with sections for:
    - Hero / masthead
    - Upcoming gigs
    - Media (featured video + gallery)
    - Booking (Google Form embed + songs dialog)
    - Contact & social links
- **Upcoming gigs** fetched from WordPress and automatically split into upcoming vs. past based on date.
- **YouTube embeds** for videos with lazy loading.
- **Accessible booking dialog** listing songs the band has played.
- **Patterned background system** powered by CSS masks and color tokens.
- Static HTML export suitable for any CDN or static host.

## Tech stack

- [Astro](https://docs.astro.build/) with static output
- [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/vite`
- TypeScript
- WordPress (headless CMS, REST API)
- Package manager: [`pnpm`](https://pnpm.io/)
- Hosting: Vercel

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd career-tomboy-website
pnpm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```
WP_API_BASE=https://<your-wp-domain>/wp-json/wp/v2
```

### 3. Run the development server

```bash
pnpm dev
```

Astro will start a dev server at `http://localhost:4321` with hot reload. All data is fetched live from WordPress on each request.

### 4. Build for production

```bash
pnpm build
```

Runs the favicon prebuild step, fetches all content from WordPress, and outputs a fully static site to `dist/`.

### 5. Preview the production build

```bash
pnpm preview
```

Serves the contents of `dist/` locally so you can smoke-test the production build.

## Project structure

- `astro.config.mjs` – Astro configuration (static output, Tailwind/Vite plugin, site URL)
- `src/pages/index.astro` – main page that assembles all sections
- `src/lib/wordpress.ts` – WordPress REST API fetch layer (gigs, songs, videos, booking page)
- `src/lib/gigs.ts` – gig sorting/filtering helpers
- `src/components/` – UI components:
    - `Masthead.astro` – hero section
    - `GigsList.astro` + `Gig.astro` – upcoming gigs feed
    - `Media.astro` – featured + additional videos
    - `Booking.astro` – booking form embed and songs dialog
    - `Contact.astro` – email + social links
    - `Section.astro` / `Bg.astro` – colored, patterned background sections
- `src/styles/` – global styles and the patterned background CSS
- `wp-theme/career-tomboy-headless/` – WordPress theme (see below)

## Content management (WordPress)

All content is edited in the WordPress admin (URL not published in this repo — set `WP_API_BASE` in `.env`). Publishing or trashing any gig, song, video, band member, or the booking page automatically triggers a Vercel rebuild.

**Content types:**
- **Gigs** – date, venue, address, ticket URL, supporting act, notes, private flag
- **Songs** – title, artist
- **Videos** – YouTube ID, description, featured flag
- **Band Members** – name, role, bio, photo (featured image)
- **Booking page** – rich text in the block editor; drag the Song List block to control where the song list appears on the page

## WordPress theme

The `wp-theme/career-tomboy-headless/` directory contains a minimal WordPress theme that powers the headless setup. To install, upload the folder to `/wp-content/themes/` on the WordPress server and activate it.

The theme:
- Registers all custom post types and meta fields exposed via the REST API
- Registers the Song List custom Gutenberg block (no build step needed)
- Redirects all front-end WordPress traffic to `careertomboy.com`
- Triggers Vercel rebuilds on content changes

To enable Vercel rebuilds, add the following to `wp-config.php`:

```php
define( 'CT_VERCEL_DEPLOY_HOOK', 'https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_URL' );
```

## Deployment

Vercel deploys automatically on push to `main`, or when the WordPress deploy hook fires. The build fetches all content from WordPress and produces a fully static site.

`WP_API_BASE` must be set as an environment variable in the Vercel project settings.

## Accessibility

- Semantic headings and landmarks
- Visible focus states for interactive elements
- Color choices intended to meet WCAG 2.2 AA contrast

## License

MIT
