# Career Tomboy Website Redesign: Comprehensive Migration Plan

Based on thorough analysis of the current codebase, here is the complete technical migration plan.

---

## 1. Current → Target Architecture

### Current State

| Component           | Current Implementation                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| **CSS Framework**   | Bootstrap 5.3.3 (npm dependency + CDN JS)                                                          |
| **CSS Compilation** | Sass → PostCSS (autoprefixer + PurgeCSS)                                                           |
| **Templating**      | EJS with layouts/partials structure                                                                |
| **Build System**    | Custom Node.js scripts with chokidar file watching                                                 |
| **Dev Server**      | BrowserSync with live reload                                                                       |
| **Gigs Data**       | CSV-based with server-side parsing (`scripts/load-gigs.js`)                                        |
| **Current Colors**  | Blue #314a8b (primary), Orange #f4623a, Brown #5c4d42, Yellow #e5e4a3, Green #0f8073, Pink #c5638c |
| **Typography**      | Poppins (sans-serif body), Rokkitt (serif headings/buttons)                                        |

### Target State (Astro + Tailwind 4)

| Component           | Target Implementation                                  |
| ------------------- | ------------------------------------------------------ |
| **CSS Framework**   | Tailwind CSS 4 (via Vite plugin)                       |
| **CSS Compilation** | Vite + @tailwindcss/vite (automatic)                   |
| **Templating**      | **Astro** with `.astro` components (JSX-like syntax)   |
| **Build System**    | Astro CLI (zero custom scripts)                        |
| **Dev Server**      | Astro dev server with HMR                              |
| **Gigs Data**       | CSV parsed in Astro frontmatter OR Google Calendar API |
| **Output**          | Static HTML (zero JavaScript by default)               |

### Why Astro?

1. **JSX-like syntax** - Familiar component authoring without React runtime
2. **Zero JavaScript output** - Pure static HTML, perfect for a band website
3. **Eliminates custom scripts** - No more `render-ejs.js`, `sb-watch.js`, etc.
4. **First-class Tailwind 4 support** - Seamless Vite integration
5. **Built-in dev server** - Fast HMR replaces BrowserSync + chokidar
6. **Type-safe props** - Optional TypeScript for component interfaces
7. **Image optimization** - Built-in `<Image />` component for band photos

---

## 2. Technical Implementation Plan

### 2.1 Astro Project Setup

#### Initialize Astro Project

```bash
# Create new Astro project in current directory
npm create astro@latest . -- --template minimal --no-git --no-install

# Or manually install
npm install astro
```

#### Project Structure (Astro)

```
src/
├── components/           # Reusable .astro components
│   ├── Head.astro       # <head> content (meta, fonts, CSS)
│   ├── Navigation.astro # Nav bar component
│   ├── Masthead.astro   # Hero section
│   ├── Gig.astro        # Single gig card
│   ├── GigsList.astro   # Gigs container with data loading
│   ├── About.astro      # About section (NEW)
│   ├── Media.astro      # Media section (NEW)
│   ├── Booking.astro    # Booking section (NEW)
│   ├── Contact.astro    # Contact/footer section
│   └── Footer.astro     # Footer with social links
├── layouts/
│   └── Main.astro       # Base HTML layout
├── pages/
│   └── index.astro      # Homepage (assembles components)
├── styles/
│   └── global.css       # Tailwind CSS entry point
├── data/
│   └── gigs.csv         # Gigs data (migrated)
└── assets/
    └── img/             # Images (optimized by Astro)
```

#### Astro Configuration

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    // Output static HTML (default)
    output: "static",
    // Site URL for canonical links
    site: "https://careertomboy.com",
});
```

#### Package.json Scripts (Astro)

```json
{
    "scripts": {
        "dev": "astro dev",
        "build": "astro build",
        "preview": "astro preview"
    }
}
```

**What each script does:**

- `dev` - Start dev server with HMR (replaces BrowserSync + chokidar + custom scripts)
- `build` - Production build with CSS minification (replaces entire build pipeline)
- `preview` - Preview production build locally

### 2.2 Tailwind CSS 4 Integration (Via Vite Plugin)

> **Why Vite plugin over CLI?** Astro uses Vite internally, so the `@tailwindcss/vite` plugin
> provides seamless integration with no additional build steps.

#### Dependencies to Add

```json
{
    "dependencies": {
        "astro": "^5.0.0"
    },
    "devDependencies": {
        "tailwindcss": "^4.1.0",
        "@tailwindcss/vite": "^4.1.0"
    }
}
```

#### Dependencies to Remove

```json
{
    "dependencies": {
        "bootstrap": "^5.3.3",
        "ejs": "^3.1.10"
    },
    "devDependencies": {
        "autoprefixer": "^10.4.19",
        "sass": "^1.77.1",
        "@fullhuman/postcss-purgecss": "^6.0.0",
        "browser-sync": "^3.0.0",
        "chokidar": "^3.6.0",
        "concurrently": "^8.2.2",
        "prettier": "^3.3.0",
        "upath": "^2.0.1"
    }
}
```

#### New File: `src/styles/global.css` (Tailwind CSS 4 Configuration)

```css
@import "tailwindcss";

/* Custom theme configuration */
@theme {
    /* Brand Colors */
    --color-primary: #314a8b;
    --color-orange: #f4623a;
    --color-brown: #5c4d42;
    --color-yellow: #e5e4a3;
    --color-green: #0f8073;
    --color-pink: #c5638c;

    /* Typography */
    --font-sans: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-serif: Rokkitt, ui-serif, Georgia, serif;

    /* Spacing */
    --spacing-navbar: 4.5rem;
}

/* Custom utility classes */
@utility page-section {
    padding: 8rem 0;
}

@utility text-white-75 {
    color: rgb(255 255 255 / 0.75);
}

@utility btn-xl {
    padding: 1.25rem 2.25rem;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    border: none;
    border-radius: 10rem;
}

/* Divider components */
@utility divider {
    height: 0.2rem;
    max-width: 3.25rem;
    margin: 1.5rem auto;
    background-color: var(--color-primary);
    opacity: 1;
}

@utility divider-light {
    background-color: white;
}
```

### 2.3 Astro Component Examples

#### Base Layout Component

```astro
---
// src/layouts/Main.astro
import "../styles/global.css";

interface Props {
    title: string;
    description?: string;
}

const { title, description = "Chicago's favorite 90s/2000s alternative cover band" } = Astro.props;
---

<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={description} />
        <title>{title}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Rokkitt:wght@400;700&display=swap"
            rel="stylesheet"
        />

        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    </head>
    <body class="font-sans">
        <slot />
    </body>
</html>
```

#### Gig Component with Props

> **Note:** See Section 3.1.6 for the complete Gig component with Google Calendar integration
> and private event support.

```astro
---
// src/components/Gig.astro
interface Props {
    id: string;         // Google Calendar event ID
    date: string;       // ISO datetime or date string
    venue: string;      // Event summary from Calendar
    address?: string;   // From location or parsed description
    mapUrl?: string;    // Parsed from description
    ticketUrl?: string; // Parsed from description
    isAllDay?: boolean; // Whether to show time
    isPrivate?: boolean;// Hide venue/address for private events
}

const {
    id,
    date,
    venue,
    address,
    mapUrl,
    ticketUrl,
    isAllDay = false,
    isPrivate = false,
} = Astro.props;

// ... (see Section 3.1.6 for complete implementation with private event handling)
---
```

#### Homepage with Component Composition

> **Note:** Gigs data loading is now handled inside `GigsList.astro` via Google Calendar API.
> See Section 3.1.5 for the complete GigsList component implementation.

```astro
---
// src/pages/index.astro
import Layout from "../layouts/Main.astro";
import Navigation from "../components/Navigation.astro";
import Masthead from "../components/Masthead.astro";
import GigsList from "../components/GigsList.astro";
import About from "../components/About.astro";
import Media from "../components/Media.astro";
import Booking from "../components/Booking.astro";
import Contact from "../components/Contact.astro";
import Footer from "../components/Footer.astro";

// No data loading needed here - GigsList handles its own data
---

<Layout title="Career Tomboy | Chicago Cover Band">
    <Navigation />
    <Masthead />

    <!-- Gigs Section - fetches from Google Calendar API at build time -->
    <GigsList />

    <About />
    <Media />
    <Booking />
    <Contact />
    <Footer />
</Layout>
```

This clean separation means:

- `GigsList.astro` encapsulates all calendar API logic
- Homepage just composes components
- Each component is independently testable

### 2.4 EJS → Astro Migration Mapping

| EJS Pattern                     | Astro Equivalent                             |
| ------------------------------- | -------------------------------------------- |
| `<%- include('partial') %>`     | `<PartialComponent />`                       |
| `<%= variable %>`               | `{variable}`                                 |
| `<%- htmlVariable %>`           | `<Fragment set:html={htmlVariable} />`       |
| `<% if (condition) { %>`        | `{condition && ( ... )}`                     |
| `<% items.forEach(item => { %>` | `{items.map(item => ( ... ))}`               |
| Layout wrapper                  | `<Layout><slot /></Layout>`                  |
| `<% const x = ... %>`           | Frontmatter: `const x = ...`                 |
| Data from `render-ejs.js`       | `await fetch()` in frontmatter               |
| CSV parsing in `load-gigs.js`   | Google Calendar API in `src/lib/calendar.ts` |
| Environment variables           | `import.meta.env.VAR_NAME` in frontmatter    |

### 2.5 Bootstrap Removal Checklist

| Current File                   | Action                                            |
| ------------------------------ | ------------------------------------------------- |
| `package.json`                 | Remove `bootstrap` dependency                     |
| `src/scss/styles.scss`         | **DELETE** (replaced by `src/styles/global.css`)  |
| `src/scss/bootstrap.scss`      | **DELETE**                                        |
| `src/scss/_variables.scss`     | Migrate to `@theme` in CSS                        |
| `src/scss/_global.scss`        | Migrate to CSS utilities                          |
| `src/scss/variables/*`         | Migrate to `@theme` variables                     |
| `src/scss/components/*`        | Migrate to `@utility` definitions                 |
| `src/scss/sections/*`          | Migrate to Astro component styles                 |
| `src/ejs/partials/scripts.ejs` | **DELETE** (Astro handles script injection)       |
| `src/ejs/layouts/main.ejs`     | **DELETE** (replaced by `src/layouts/Main.astro`) |
| `src/js/scripts.js`            | Remove `bootstrap.ScrollSpy`, simplify or remove  |

### 2.6 Bootstrap → Tailwind Class Mapping

| Bootstrap Class          | Tailwind Equivalent                                                    |
| ------------------------ | ---------------------------------------------------------------------- |
| `container`              | `container mx-auto px-4`                                               |
| `row`                    | `flex flex-wrap` or `grid`                                             |
| `col-*`                  | `w-full md:w-1/2 lg:w-1/3` etc.                                        |
| `btn`                    | Custom `@utility btn`                                                  |
| `btn-primary`            | `bg-primary text-white hover:bg-primary/90`                            |
| `btn-outline-primary`    | `border border-primary text-primary hover:bg-primary hover:text-white` |
| `text-center`            | `text-center` ✓                                                        |
| `text-light`             | `text-white` or `text-white/75`                                        |
| `bg-primary`             | `bg-primary` ✓                                                         |
| `bg-warning`             | `bg-yellow` (custom) or `bg-amber-400`                                 |
| `bg-opacity-75`          | `bg-primary/75` (modifier syntax)                                      |
| `position-fixed`         | `fixed`                                                                |
| `top-0`                  | `top-0` ✓                                                              |
| `start-50`               | `left-1/2`                                                             |
| `translate-middle-x`     | `-translate-x-1/2`                                                     |
| `z-3`                    | `z-30`                                                                 |
| `h-100`                  | `h-full`                                                               |
| `px-4 px-lg-5`           | `px-4 lg:px-5`                                                         |
| `mt-0 mb-4`              | `mt-0 mb-4` ✓                                                          |
| `py-5`                   | `py-5` ✓                                                               |
| `d-none d-md-block`      | `hidden md:block`                                                      |
| `d-lg-inline-block`      | `lg:inline-block`                                                      |
| `visually-hidden`        | `sr-only`                                                              |
| `rounded`                | `rounded` ✓                                                            |
| `gx-4 gx-lg-5`           | `gap-x-4 lg:gap-x-5` (in grid/flex context)                            |
| `align-items-center`     | `items-center`                                                         |
| `justify-content-center` | `justify-center`                                                       |
| `text-sm-end`            | `sm:text-right`                                                        |
| `h1` (class)             | `text-4xl font-bold` or custom                                         |
| `h5` (class)             | `text-xl font-semibold` or custom                                      |

---

## 3. Gigs Management Solutions

This section covers two approaches to managing gigs:

| Approach                | When to Use                              | Complexity |
| ----------------------- | ---------------------------------------- | ---------- |
| **3.1 JSON File (MVP)** | MVP launch, simple workflow              | Low        |
| **3.2 Google Calendar** | Enhanced launch, easier for band members | Medium     |

---

### 3.1 JSON-Based Gigs (MVP Approach)

For the MVP launch, gigs are managed via a simple JSON file. This follows the same pattern
as `members.json` and `videos.json`, keeping the architecture consistent and simple.

#### 3.1.1 Gigs Data File

**File:** `src/data/gigs.json`

```json
{
    "gigs": [
        {
            "id": "gig-2025-01-15",
            "date": "2025-01-15T20:00:00",
            "venue": "Double Clutch Brewing",
            "address": "2121 Ashland Ave, Evanston, IL",
            "ticketUrl": "https://www.doubleclutchbrewing.com/live-shows",
            "supporting": "The Neighborhood Kids",
            "notes": "21+ show",
            "isPrivate": false
        },
        {
            "id": "gig-2025-02-01",
            "date": "2025-02-01T19:00:00",
            "venue": "Private Event",
            "address": null,
            "ticketUrl": null,
            "supporting": null,
            "notes": null,
            "isPrivate": true
        }
    ]
}
```

#### 3.1.2 TypeScript Types (MVP)

**File:** `src/lib/types.ts`

```typescript
/**
 * A gig/show entry
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
```

#### 3.1.3 Gigs Utility Functions (MVP)

**File:** `src/lib/gigs.ts`

```typescript
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
    return data.gigs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
        .reverse(); // Most recent first
}
```

#### 3.1.4 GigsList Component (MVP)

**File:** `src/components/GigsList.astro`

```astro
---
import Gig from "./Gig.astro";
import { getUpcomingGigs } from "../lib/gigs";

const upcomingGigs = getUpcomingGigs();
---

<section id="gigs" class="page-section">
    <div class="container mx-auto px-4 lg:px-5">
        <h2 class="mb-8 text-center font-serif text-4xl">Upcoming Shows</h2>

        {upcomingGigs.length > 0 ? (
            <div class="space-y-6">
                {upcomingGigs.map((gig) => (
                    <Gig gig={gig} />
                ))}
            </div>
        ) : (
            <p class="text-center text-lg text-gray-600">
                No upcoming shows scheduled. Check back soon!
            </p>
        )}
    </div>
</section>
```

#### 3.1.5 MVP Workflow

**For Band Members (MVP):**

| Action          | How To Do It                                      |
| --------------- | ------------------------------------------------- |
| Add a gig       | Edit `src/data/gigs.json`, add new entry to array |
| Edit a gig      | Edit the corresponding entry in `gigs.json`       |
| Cancel a gig    | Remove the entry from `gigs.json`                 |
| Mark as private | Set `"isPrivate": true` in the gig entry          |
| **Publish**     | Commit changes and push (triggers deploy)         |

> **Note:** This approach requires git commits to update gigs. For easier management
> by non-technical band members, see Section 3.2 (Google Calendar integration).

---

### 3.2 Google Calendar API Integration (Enhanced Approach)

This implementation uses a **private Google Calendar** with **Service Account authentication**
for maximum security. All data fetching happens at build time—no API credentials are ever
exposed to browsers.

#### Key Security Features

| Feature                 | Implementation                                     |
| ----------------------- | -------------------------------------------------- |
| **Calendar Privacy**    | Calendar remains PRIVATE (not public)              |
| **Authentication**      | Service Account with JSON key (server-side only)   |
| **Credential Exposure** | None—credentials never sent to browser             |
| **Data Filtering**      | Private events sanitized at build time             |
| **Update Mechanism**    | Rebuild triggered manually or via scheduled deploy |

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRIVATE GOOGLE CALENDAR                          │
├─────────────────────────────────────────────────────────────────────┤
│  Shared with:                                                       │
│    • 5 band members (full edit access via Google accounts)          │
│    • Service Account email (read-only access for API)               │
│  NOT public—cannot be viewed without explicit share                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Service Account credentials
                              │ (stored in env vars, never in browser)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ASTRO BUILD (Server-Side Only)                   │
├─────────────────────────────────────────────────────────────────────┤
│  GigsList.astro (frontmatter)                                       │
│       │                                                             │
│       ▼                                                             │
│  fetchGigsFromCalendar() ──► Google Calendar API                    │
│       │                      (OAuth2 via Service Account)           │
│       ▼                                                             │
│  transformCalendarEvent() filters private events:                   │
│       • Public events: all details included                         │
│       • Private events: only date/time, venue hidden                │
│       │                                                             │
│       ▼                                                             │
│  Static HTML generated with sanitized gigs data                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Runtime)                            │
├─────────────────────────────────────────────────────────────────────┤
│  Pure static HTML                                                   │
│  • No API calls                                                     │
│  • No credentials                                                   │
│  • No calendar ID exposed                                           │
│  • Zero JavaScript by default                                       │
└─────────────────────────────────────────────────────────────────────┘
```

#### How Updates Work

Since this is a build-time-only approach, gig updates require a site rebuild:

| Update Method         | How It Works                               | When to Use               |
| --------------------- | ------------------------------------------ | ------------------------- |
| **Manual Deploy**     | Click "Deploy" in Netlify/Vercel dashboard | After booking new gigs    |
| **Git Push**          | Push any change to trigger rebuild         | During active development |
| **Scheduled Rebuild** | Daily cron job triggers build hook         | Automated freshness       |
| **Build Hook URL**    | POST to webhook URL triggers rebuild       | Integrations / IFTTT      |

> **Note:** For a band website where gigs are booked days/weeks in advance, daily scheduled
> rebuilds are typically sufficient. Real-time updates are not necessary.

#### 3.2.1 Google Cloud Console Setup

**Step 1: Create Google Cloud Project**

1. Go to https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name: `Career Tomboy Website`
4. Click "Create"

**Step 2: Enable Google Calendar API**

1. In the project dashboard, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

**Step 3: Create Service Account**

A Service Account is a special Google account that represents your application (not a person).
It can access the calendar without user interaction.

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Fill in:
    - Name: `Career Tomboy Gigs Reader`
    - ID: `gigs-reader` (auto-generated email will be like `gigs-reader@career-tomboy-website.iam.gserviceaccount.com`)
    - Description: `Reads gig calendar for website builds`
4. Click "Create and Continue"
5. Skip the "Grant access" step (no roles needed for Calendar API)
6. Skip the "Grant users access" step
7. Click "Done"

**Step 4: Create Service Account Key**

1. Click on the newly created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Click "Create"
6. **Save the downloaded JSON file securely** (you'll need it for environment variables)

> ⚠️ **Security Warning:** This JSON file contains credentials. Never commit it to git.
> Store it securely and add it to `.gitignore`.

**Step 5: Create and Share the Gigs Calendar**

1. Open Google Calendar (calendar.google.com)
2. Create a new calendar called "Career Tomboy Gigs"
3. Click the three dots next to the calendar → "Settings and sharing"
4. **DO NOT make it public** (leave "Make available to public" unchecked)
5. Under "Share with specific people or groups":
    - Click "Add people and groups"
    - Add each band member's email (they get "Make changes to events" permission)
    - Add the service account email (e.g., `gigs-reader@career-tomboy-website.iam.gserviceaccount.com`)
    - Give the service account "See all event details" permission (read-only)
6. Under "Integrate calendar", copy the **Calendar ID** (looks like `abc123@group.calendar.google.com`)

**Summary of Sharing:**

| Account                          | Permission             | Purpose                    |
| -------------------------------- | ---------------------- | -------------------------- |
| Band member 1 email              | Make changes to events | Add/edit/delete gigs       |
| Band member 2 email              | Make changes to events | Add/edit/delete gigs       |
| Band member 3 email              | Make changes to events | Add/edit/delete gigs       |
| Band member 4 email              | Make changes to events | Add/edit/delete gigs       |
| Band member 5 email              | Make changes to events | Add/edit/delete gigs       |
| `gigs-reader@...gserviceaccount` | See all event details  | API read access for builds |

#### 3.2.2 Environment Variables Configuration

**File: `.env.example`**

```bash
# Google Calendar Service Account Configuration
# =============================================
# These credentials are used at BUILD TIME ONLY.
# They are NEVER exposed to browsers.

# Service Account Email
# Found in: Google Cloud Console → IAM & Admin → Service Accounts
# Format: name@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=gigs-reader@career-tomboy-website.iam.gserviceaccount.com

# Service Account Private Key
# Found in: The downloaded JSON key file, under "private_key"
# IMPORTANT: This is a multi-line value. In Netlify/Vercel, paste as-is.
# For local .env files, keep the \n characters as-is (don't convert to actual newlines)
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvg...your-key-here...\n-----END PRIVATE KEY-----\n"

# Calendar ID from Google Calendar settings
# Found in: Calendar Settings → Integrate calendar → Calendar ID
# This is NOT exposed to browsers (no PUBLIC_ prefix)
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com

# Timezone for date formatting (IANA timezone string)
GOOGLE_CALENDAR_TIMEZONE=America/Chicago
```

> **Security Note:** None of these variables use the `PUBLIC_` prefix, so Astro will
> NOT expose them to client-side code. They are only accessible during build time.

**For Local Development:**

1. Copy `.env.example` to `.env`
2. Open your downloaded service account JSON file
3. Copy the `client_email` value to `GOOGLE_SERVICE_ACCOUNT_EMAIL`
4. Copy the `private_key` value to `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (keep the quotes!)
5. Add your Calendar ID
6. Never commit `.env` to version control

**For Production (Netlify):**

1. Go to Site settings → Environment variables
2. Add each variable:
    - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Paste the email
    - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: Paste the entire private key including `-----BEGIN...` and `-----END...`
    - `GOOGLE_CALENDAR_ID`: Paste the calendar ID
    - `GOOGLE_CALENDAR_TIMEZONE`: `America/Chicago`

**For Production (Vercel):**

1. Go to Project Settings → Environment Variables
2. Add each variable (same as Netlify)
3. For the private key, Vercel handles multi-line values correctly

**Setting Up Scheduled Rebuilds:**

See Section 3.2.9 for detailed instructions on creating deploy hooks and
setting up GitHub Actions for scheduled rebuilds with Vercel or Netlify.

#### 3.2.3 TypeScript Interfaces

**File: `src/lib/types.ts`**

```typescript
/**
 * Gig data structure used throughout the application
 */
export interface Gig {
    /** Unique identifier from Google Calendar event ID */
    id: string;
    /** ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss) */
    date: string;
    /** Venue name (from Calendar event summary) */
    venue: string;
    /** Full address (from Calendar location or description) */
    address?: string;
    /** Google Maps URL (parsed from description) */
    mapUrl?: string;
    /** Ticket purchase URL (parsed from description) */
    ticketUrl?: string;
    /** Opening/supporting acts (parsed from description) */
    supporting?: string;
    /** Additional notes */
    notes?: string;
    /** Whether this is an all-day event */
    isAllDay: boolean;
    /** Whether this is a private event (hide venue/address details) */
    isPrivate: boolean;
}

/**
 * Google Calendar API event structure (partial)
 */
export interface GoogleCalendarEvent {
    id: string;
    summary?: string;
    description?: string;
    location?: string;
    start: { dateTime?: string; date?: string; timeZone?: string };
    end: { dateTime?: string; date?: string; timeZone?: string };
    status?: "confirmed" | "tentative" | "cancelled";
    /** Event visibility: "default", "public", "private", or "confidential" */
    visibility?: "default" | "public" | "private" | "confidential";
    updated?: string;
}

/**
 * Google Calendar API list response
 */
export interface GoogleCalendarListResponse {
    items: GoogleCalendarEvent[];
    updated?: string;
    nextPageToken?: string;
}

/**
 * Parsed fields from event description
 * Note: Address/map URL come from the event's Location field, not description
 */
export interface ParsedEventDescription {
    ticketUrl?: string;
    supporting?: string;
    notes?: string;
}
```

#### 3.2.4 Calendar Utility Functions

**File: `src/lib/calendar.ts`**

```typescript
import type { Gig, GoogleCalendarEvent, GoogleCalendarListResponse, ParsedEventDescription } from "./types";

/**
 * Generate a Google Maps search URL from an address
 */
export function generateMapsUrl(address: string): string {
    const encoded = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

/**
 * Parse event description for structured data
 * Expected format:
 *   Tickets: https://ticketsite.com/...
 *   With: Opening Band Name
 *   Any other text becomes notes
 *
 * Note: Address/map comes from the event's Location field (auto-generates Maps link)
 */
export function parseEventDescription(description?: string): ParsedEventDescription {
    if (!description) return {};

    const result: ParsedEventDescription = {};
    const lines = description.split("\n");
    const noteLines: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        const lowerLine = trimmed.toLowerCase();

        if (lowerLine.startsWith("tickets:")) {
            result.ticketUrl = trimmed.substring(8).trim();
        } else if (lowerLine.startsWith("with:")) {
            result.supporting = trimmed.substring(5).trim();
        } else if (trimmed) {
            noteLines.push(trimmed);
        }
    }

    if (noteLines.length > 0) {
        result.notes = noteLines.join(" ");
    }

    return result;
}

/**
 * Check if an event is marked as private in Google Calendar
 * Uses the event's visibility property (set via "More options" → "Default visibility")
 */
function isEventPrivate(event: GoogleCalendarEvent): boolean {
    // "private" or "confidential" visibility = hide details on website
    return event.visibility === "private" || event.visibility === "confidential";
}

/**
 * Transform Google Calendar event to Gig format
 * For private events (visibility = "private" or "confidential"),
 * sensitive details (address, mapUrl, ticketUrl) are hidden
 */
export function transformCalendarEvent(event: GoogleCalendarEvent): Gig {
    const parsed = parseEventDescription(event.description);
    const startDateTime = event.start.dateTime || event.start.date || "";
    const isAllDay = !event.start.dateTime;
    const isPrivate = isEventPrivate(event);

    // For private events, hide sensitive location details
    // The venue (event title) is shown as-is - band can set it to "Private Event"
    if (isPrivate) {
        return {
            id: event.id,
            date: startDateTime,
            venue: event.summary || "Private Event",
            address: undefined, // Hidden
            mapUrl: undefined, // Hidden
            ticketUrl: undefined, // Hidden
            supporting: undefined, // Hidden
            notes: undefined, // Hidden
            isAllDay,
            isPrivate: true,
        };
    }

    return {
        id: event.id,
        date: startDateTime,
        venue: event.summary || "TBA",
        address: event.location,
        // Auto-generate Google Maps link from Location field
        mapUrl: event.location ? generateMapsUrl(event.location) : undefined,
        ticketUrl: parsed.ticketUrl,
        supporting: parsed.supporting,
        notes: parsed.notes,
        isAllDay,
        isPrivate: false,
    };
}

/**
 * Create a JWT for Google Service Account authentication
 * This allows accessing private calendars without user interaction
 */
async function createServiceAccountJWT(email: string, privateKey: string, scopes: string[]): Promise<string> {
    const header = {
        alg: "RS256",
        typ: "JWT",
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: email,
        scope: scopes.join(" "),
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600, // 1 hour
    };

    // Encode header and payload
    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const signatureInput = `${headerB64}.${payloadB64}`;

    // Import the private key and sign
    const pemContents = privateKey
        .replace(/-----BEGIN PRIVATE KEY-----/, "")
        .replace(/-----END PRIVATE KEY-----/, "")
        .replace(/\\n/g, "")
        .replace(/\n/g, "")
        .trim();

    const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey("pkcs8", binaryKey, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);

    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(signatureInput));

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    return `${signatureInput}.${signatureB64}`;
}

/**
 * Get an access token using Service Account credentials
 */
async function getServiceAccountAccessToken(email: string, privateKey: string): Promise<string> {
    const jwt = await createServiceAccountJWT(email, privateKey, ["https://www.googleapis.com/auth/calendar.readonly"]);

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * Configuration for fetching gigs
 */
export interface FetchGigsConfig {
    serviceAccountEmail: string;
    serviceAccountPrivateKey: string;
    calendarId: string;
    timeZone?: string;
    maxResults?: number;
}

/**
 * Fetch gigs from Google Calendar API using Service Account authentication
 * This only works server-side (build time) - credentials are never exposed to browsers
 */
export async function fetchGigsFromCalendar(config: FetchGigsConfig): Promise<{ gigs: Gig[]; error?: string }> {
    const { serviceAccountEmail, serviceAccountPrivateKey, calendarId, timeZone = "America/Chicago", maxResults = 20 } = config;

    try {
        // Get access token using service account credentials
        const accessToken = await getServiceAccountAccessToken(serviceAccountEmail, serviceAccountPrivateKey);

        const now = new Date().toISOString();
        const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
        url.searchParams.set("timeMin", now);
        url.searchParams.set("maxResults", String(maxResults));
        url.searchParams.set("singleEvents", "true");
        url.searchParams.set("orderBy", "startTime");
        url.searchParams.set("timeZone", timeZone);

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Calendar API error ${response.status}:`, errorText);
            return { gigs: [], error: `API error: ${response.status}` };
        }

        const data: GoogleCalendarListResponse = await response.json();
        const events = data.items || [];

        // Filter out cancelled events and transform (includes private event filtering)
        const gigs = events.filter((event) => event.status !== "cancelled").map(transformCalendarEvent);

        return { gigs };
    } catch (error) {
        console.error("Failed to fetch calendar events:", error);
        return { gigs: [], error: String(error) };
    }
}
```

> **Note:** The JWT creation uses the Web Crypto API which is available in Node.js 18+
> and all modern build environments (Netlify, Vercel, Cloudflare). For older Node.js
> versions, you may need to use the `jsonwebtoken` package instead.

#### 3.2.5 Astro GigsList Component (Build-Time Only)

**File: `src/components/GigsList.astro`**

This component fetches gigs at **build time only**. No client-side JavaScript is needed,
resulting in zero JavaScript shipped to browsers.

```astro
---
// src/components/GigsList.astro
import Gig from "./Gig.astro";
import { fetchGigsFromCalendar } from "../lib/calendar";
import type { Gig as GigType } from "../lib/types";

// Get environment variables (server-side only - never exposed to browser)
const serviceAccountEmail = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const serviceAccountPrivateKey = import.meta.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
const calendarId = import.meta.env.GOOGLE_CALENDAR_ID;
const timeZone = import.meta.env.GOOGLE_CALENDAR_TIMEZONE || "America/Chicago";

// Fetch gigs at build time using Service Account authentication
let gigs: GigType[] = [];
let fetchError: string | undefined;

if (serviceAccountEmail && serviceAccountPrivateKey && calendarId) {
  const result = await fetchGigsFromCalendar({
    serviceAccountEmail,
    serviceAccountPrivateKey,
    calendarId,
    timeZone,
  });
  gigs = result.gigs;
  fetchError = result.error;
} else {
  console.warn("Missing Google Calendar Service Account credentials");
  fetchError = "Calendar not configured";
}

// Build timestamp for debugging (when was this page last built?)
const buildTimestamp = new Date().toISOString();
---

<section id="gigs" class="page-section bg-yellow/75">
  <div class="container mx-auto max-w-3xl px-4 lg:px-5">
    <h2 class="mb-4 mt-0 font-serif text-4xl md:text-center">See us live!</h2>
    <hr class="divider hidden md:block" aria-hidden="true" />

    <div
      id="gigs-list"
      role="feed"
      aria-label="Upcoming shows"
    >
      {gigs.length > 0 ? (
        <div class="space-y-4">
          {gigs.map((gig) => (
            <Gig
              id={gig.id}
              date={gig.date}
              venue={gig.venue}
              address={gig.address}
              mapUrl={gig.mapUrl}
              ticketUrl={gig.ticketUrl}
              isAllDay={gig.isAllDay}
              isPrivate={gig.isPrivate}
            />
          ))}
        </div>
      ) : fetchError ? (
        <p class="py-8 text-center" role="alert">
          Unable to load upcoming shows. Please check back later.
        </p>
      ) : (
        <p class="py-8 text-center">
          No upcoming shows scheduled. Check back soon!
        </p>
      )}
    </div>

    <!-- Build timestamp for debugging (hidden, only visible in source) -->
    <!-- Built: {buildTimestamp} -->
  </div>
</section>
```

**Key Differences from Hybrid Approach:**

| Aspect              | Previous (Hybrid)              | New (Build-Time Only) |
| ------------------- | ------------------------------ | --------------------- |
| JavaScript shipped  | ~2KB hydration script          | 0 bytes               |
| API calls           | Build + every 5 min in browser | Build only            |
| Credentials exposed | Client API key in browser      | None                  |
| Calendar visibility | Must be PUBLIC                 | Stays PRIVATE         |
| Update latency      | ~5 minutes                     | Requires rebuild      |
| Security            | Calendar ID visible in source  | Nothing exposed       |

#### 3.2.6 Updated Gig Component with Private Event Support

**File: `src/components/Gig.astro`**

```astro
---
// src/components/Gig.astro
interface Props {
  id: string;
  date: string;
  venue: string;
  address?: string;
  mapUrl?: string;
  ticketUrl?: string;
  isAllDay?: boolean;
  isPrivate?: boolean;
}

const {
  id,
  date,
  venue,
  address,
  mapUrl,
  ticketUrl,
  isAllDay = false,
  isPrivate = false,
} = Astro.props;

// Format date for display
const dateObj = new Date(date);
const formattedDate = dateObj.toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const formattedTime = isAllDay
  ? null
  : dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
---

<article
  class="group rounded-lg p-4 transition-colors hover:bg-yellow"
  data-gig-id={id}
  data-private={isPrivate ? "true" : undefined}
>
  <h3 class="font-serif text-xl font-semibold">
    <time datetime={date}>
      {formattedDate}
      {formattedTime && <span class="font-normal"> • {formattedTime}</span>}
    </time>
  </h3>
  <div class="flex items-center gap-2">
    <p class="font-medium">{venue}</p>
    {isPrivate && (
      <span
        class="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
        aria-label="Private event - venue details not disclosed"
      >
        Private Event
      </span>
    )}
  </div>
  {/* Address, map, and tickets are hidden for private events */}
  {!isPrivate && address && <p class="text-sm">{address}</p>}

  {!isPrivate && (mapUrl || ticketUrl) && (
    <div class="mt-2 flex gap-2">
      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 rounded border border-primary px-3 py-1 text-sm text-primary transition-colors hover:bg-primary hover:text-white"
          aria-label={`View map for ${venue}`}
        >
          Map
        </a>
      )}
      {ticketUrl && (
        <a
          href={ticketUrl}
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 rounded border border-primary px-3 py-1 text-sm text-primary transition-colors hover:bg-primary hover:text-white"
          aria-label={`Get tickets for ${venue}`}
        >
          Tickets
        </a>
      )}
    </div>
  )}
</article>
```

**How Private Events Display:**

| Visibility Setting | Title Shows                                | Address Shows | Map Link    | Tickets     | Badge           |
| ------------------ | ------------------------------------------ | ------------- | ----------- | ----------- | --------------- |
| Default / Public   | Venue name                                 | ✅ Yes        | ✅ Auto-gen | ✅ If added | None            |
| Private            | Whatever band sets (e.g., "Private Event") | ❌ Hidden     | ❌ Hidden   | ❌ Hidden   | "Private Event" |

> **Note:** The Google Maps link is automatically generated from the Location field.
> The band controls what appears as the venue name (event title). For corporate gigs,
> they might use "Private Event", "Corporate Function", or even a generic title
> like "Special Engagement". The visibility is set using Google Calendar's built-in
> visibility dropdown (More options → Default visibility → Private).

#### 3.2.7 Build & Error Handling Strategy

Since this is a build-time-only approach, there's no client-side caching or runtime API calls.

| Scenario                         | Behavior                                              |
| -------------------------------- | ----------------------------------------------------- |
| **Build time: API success**      | Gigs rendered to static HTML                          |
| **Build time: API failure**      | Warning logged, empty gigs array, error message shown |
| **Build time: Missing env vars** | Warning logged, fallback message displayed            |
| **Build time: Auth failure**     | Check service account email and key format            |

**Troubleshooting Build Failures:**

| Error                        | Cause                                    | Solution                                    |
| ---------------------------- | ---------------------------------------- | ------------------------------------------- |
| `Failed to get access token` | Invalid service account credentials      | Re-download JSON key, update env vars       |
| `API error: 403`             | Calendar not shared with service account | Add service account email to calendar share |
| `API error: 404`             | Wrong calendar ID                        | Copy correct ID from calendar settings      |
| `Missing ... credentials`    | Environment variables not set            | Check Netlify/Vercel env var configuration  |

#### 3.2.8 Rate Limiting Considerations

Google Calendar API free tier: **1,000,000 requests/day**

With build-time-only approach, API usage is minimal:

| Request Type       | Estimated Volume | Daily Total  |
| ------------------ | ---------------- | ------------ |
| Build (production) | 1 per deploy     | ~5/day       |
| Build (dev)        | 1 per page load  | ~100/day     |
| Scheduled rebuilds | 1 per day (cron) | 1/day        |
| **Total**          |                  | **~106/day** |

This is well within the free tier. No additional rate limiting needed.

#### 3.2.9 Triggering Rebuilds

**Option A: Manual Deploy (Simplest)**

After booking a new gig, any band member can trigger a rebuild:

| Platform | Steps                                                     |
| -------- | --------------------------------------------------------- |
| Vercel   | Dashboard → Deployments → "Redeploy" on latest deployment |
| Netlify  | Dashboard → Deploys → "Trigger deploy" → "Deploy site"    |

**Option B: Daily Scheduled Rebuild (Recommended)**

Set up a GitHub Action to rebuild daily using a Deploy Hook:

**Creating a Vercel Deploy Hook:**

1. Go to your project's **Settings** → **Git**
2. Scroll to **Deploy Hooks** section
3. Enter a name: `Daily Gigs Refresh`
4. Select branch: `main` (or your production branch)
5. Click **Create Hook**
6. Copy the URL (looks like: `https://api.vercel.com/v1/integrations/deploy/prj_xxxx/xxxxx`)

**Creating a Netlify Build Hook:**

1. Go to **Site settings** → **Build & deploy** → **Build hooks**
2. Click **Add build hook**
3. Name it: `Daily Gigs Refresh`
4. Select branch: `main`
5. Click **Save**
6. Copy the webhook URL

**GitHub Action for Scheduled Rebuilds:**

```yaml
# .github/workflows/daily-rebuild.yml
name: Daily Site Rebuild
on:
    schedule:
        - cron: "0 6 * * *" # 6 AM UTC daily (midnight CST)
    workflow_dispatch: # Allow manual trigger from GitHub UI

jobs:
    rebuild:
        runs-on: ubuntu-latest
        steps:
            - name: Trigger Vercel Deploy
              run: curl -X POST "${{ secrets.DEPLOY_HOOK_URL }}"
```

**Setup:**

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `DEPLOY_HOOK_URL`
4. Value: Paste your Vercel (or Netlify) deploy hook URL
5. The workflow will run daily at 6 AM UTC

**Option C: Deploy Hook with Bookmark**

Create a browser bookmark that triggers a rebuild with one click:

1. Get your Vercel/Netlify deploy hook URL
2. Create a bookmarklet: `javascript:fetch('YOUR_DEPLOY_HOOK_URL',{method:'POST'}).then(()=>alert('Rebuild triggered!'))`
3. Band members can click the bookmark to update the site immediately

**Option D: Vercel CLI (For Developers)**

```bash
# Install Vercel CLI globally
npm i -g vercel

# Trigger a production deployment
vercel --prod
```

### 3.3 Alternative Approaches (Not Recommended)

#### 3.3.1 Google Calendar Embed

A styled embed is simpler but has significant drawbacks:

```html
<iframe src="https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID..." />
```

**Why we don't recommend this:**

- Calendar must be PUBLIC (same security issue)
- Limited styling options
- Doesn't match site design
- Can't filter private events

#### 3.3.2 Hybrid with Client-Side Hydration

The previous approach used client-side JavaScript to refresh gigs:

**Why we don't recommend this:**

- Requires PUBLIC calendar (security issue)
- Calendar ID exposed in browser
- More JavaScript shipped to users
- More complex implementation

### 3.4 Gigs Management Workflow (Google Calendar)

**For Non-Technical Band Members:**

| Action             | How To Do It                                                             |
| ------------------ | ------------------------------------------------------------------------ |
| Add a public gig   | Create event in Google Calendar with venue as title, address in location |
| Add a private gig  | Same as above, but set visibility to "Private" (see below)               |
| Edit a gig         | Edit the Google Calendar event                                           |
| Cancel a gig       | Delete or mark as cancelled in Calendar                                  |
| Add ticket link    | Include `Tickets: https://...` in event description                      |
| Add other bands    | Include `With: Band Name` in event description                           |
| **Update website** | Trigger rebuild (see Section 3.2.9) or wait for daily scheduled rebuild  |

#### Creating a Gig Event

Use the standard Google Calendar fields:

| Google Calendar Field | Website Display                 | Example                          |
| --------------------- | ------------------------------- | -------------------------------- |
| **Title**             | Venue name                      | "Double Clutch Brewing"          |
| **Date/Time**         | Date and time                   | Jan 15, 2025 at 8:00 PM          |
| **Location**          | Address + auto Google Maps link | "2121 Ashland Ave, Evanston, IL" |
| **Visibility**        | Private badge (if Private)      | Default or Private               |
| **Description**       | Optional extras (see below)     | Ticket link, opening act, notes  |

The **Google Maps link is generated automatically** from the Location field—no need to copy/paste map URLs!

#### Optional Description Fields

Add any of these to the event description for extra details:

```
Tickets: https://www.doubleclutchbrewing.com/live-shows
With: The Neighborhood Kids
```

All other text in the description becomes notes (shown on the website).

#### Making an Event Private

For corporate events, private parties, or gigs where you don't want to reveal venue/client details,
use Google Calendar's built-in **visibility setting**:

**On Desktop (Google Calendar web):**

1. Create or edit the event
2. Click **"More options"** to open the full editor
3. Find **"Default visibility"** dropdown (usually says "Default")
4. Change it to **"Private"**
5. Save the event

**On Mobile (Google Calendar app):**

1. Create or edit the event
2. Tap **"More options"** or scroll down
3. Find **"Privacy"** or **"Visibility"**
4. Select **"Private"**
5. Save

When an event is set to **Private** visibility:

- The event **still appears** on the website's gig list
- The **date and time** are shown normally
- The **venue name** shows whatever you put as the event title (e.g., "Private Event", "Corporate Gig")
- **Address, map link, and ticket link are hidden** from the website
- A **"Private Event" badge** appears next to the venue name

**Example Calendar Events:**

| Event Title   | Location Field      | Visibility | What Website Shows                      |
| ------------- | ------------------- | ---------- | --------------------------------------- |
| Double Clutch | 2121 Ashland Ave... | Default    | Full details with address and all links |
| Private Event | (any or empty)      | Private    | "Private Event" with badge, no details  |
| Corporate Gig | 123 Corporate Dr... | Private    | "Corporate Gig" with badge, no address  |
| Smith Wedding | The Grand Ballroom  | Private    | "Smith Wedding" with badge, no address  |

> **Tip:** You can still fill in the Location field in Google Calendar for your own reference
> (e.g., so you know where to go!). The website will hide this from public display when
> visibility is set to Private.

---

## 4. Content Structure Expansion

### 4.1 New Section: About

**File:** `src/components/About.astro`

```astro
---
// Load member data
import members from "../data/members.json";

interface Member {
    name: string;
    role: string;
    photo: string;
    bio?: string;
}
---

<section id="about" class="page-section bg-primary text-white">
    <div class="container mx-auto max-w-5xl px-4 lg:px-5">
        <h2 class="mb-8 text-center font-serif text-4xl">About the Band</h2>

        <!-- Band Bio -->
        <div class="prose prose-invert mx-auto mb-12 max-w-3xl text-center">
            <p class="text-xl text-white-75">
                [Band biography - 2-3 paragraphs about formation, style, mission]
            </p>
        </div>

        <!-- Member Cards -->
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member: Member) => (
                <article class="group text-center">
                    <div class="mx-auto mb-4 aspect-square w-48 overflow-hidden rounded-full">
                        <img
                            src={`/assets/img/members/${member.photo}`}
                            alt={member.name}
                            class="h-full w-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                            width="192"
                            height="192"
                        />
                    </div>
                    <h3 class="font-serif text-xl">{member.name}</h3>
                    <p class="text-white-75">{member.role}</p>
                </article>
            ))}
        </div>
    </div>
</section>
```

**Data File:** `src/data/members.json`

```json
[
    {
        "name": "Member Name",
        "role": "Vocals/Guitar",
        "photo": "member1.jpg",
        "bio": "Short bio"
    }
]
```

### 4.2 New Section: Media

#### 4.2.1 Video Data File

**File:** `src/data/videos.json`

```json
{
    "featured": {
        "youtubeId": "dQw4w9WgXcQ",
        "title": "Career Tomboy - Live at Double Clutch",
        "description": "Full set from our December 2024 show"
    },
    "videos": [
        {
            "youtubeId": "VIDEO_ID_1",
            "title": "Glycerine (Bush cover)",
            "description": "Live at Martyrs' - October 2024"
        },
        {
            "youtubeId": "VIDEO_ID_2",
            "title": "Say It Ain't So (Weezer cover)",
            "description": "Rehearsal footage"
        },
        {
            "youtubeId": "VIDEO_ID_3",
            "title": "Zombie (Cranberries cover)",
            "description": "Live at FitzGerald's - Summer 2024"
        }
    ]
}
```

#### 4.2.2 Media Component

**File:** `src/components/Media.astro`

```astro
---
import videoData from "../data/videos.json";

interface Video {
    youtubeId: string;
    title: string;
    description?: string;
}

const featured: Video = videoData.featured;
const videos: Video[] = videoData.videos;
---

<section id="media" class="page-section bg-brown text-white">
    <div class="container mx-auto px-4 lg:px-5">
        <h2 class="mb-8 text-center font-serif text-4xl">Watch & Listen</h2>

        <!-- Featured Video -->
        <div class="mx-auto mb-12 max-w-4xl">
            <div class="aspect-video overflow-hidden rounded-lg shadow-xl">
                <iframe
                    src={`https://www.youtube.com/embed/${featured.youtubeId}`}
                    title={featured.title}
                    class="h-full w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
            </div>
            <p class="mt-4 text-center text-lg">{featured.title}</p>
            {featured.description && (
                <p class="text-center text-white/70">{featured.description}</p>
            )}
        </div>

        <!-- More Videos -->
        {videos.length > 0 && (
            <>
                <h3 class="mb-6 text-center font-serif text-2xl">More Videos</h3>
                <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => (
                        <article class="overflow-hidden rounded-lg bg-white/10">
                            <div class="aspect-video">
                                <iframe
                                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                    title={video.title}
                                    class="h-full w-full"
                                    loading="lazy"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen
                                ></iframe>
                            </div>
                            <div class="p-4">
                                <h4 class="font-serif text-lg">{video.title}</h4>
                                {video.description && (
                                    <p class="text-sm text-white/70">{video.description}</p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </>
        )}
    </div>
</section>
```

> **Note:** Photo gallery functionality is planned for a future phase. See Phase 5 in
> the timeline for details on the deferred photo gallery implementation.

### 4.3 Enhanced Section: Booking

**File:** `src/components/Booking.astro`

```astro
---
// No frontmatter needed for static content
---

<section id="booking" class="page-section bg-pink/75">
    <div class="container mx-auto max-w-4xl px-4 lg:px-5">
        <h2 class="mb-8 text-center font-serif text-4xl">Book Us</h2>

        <div class="grid gap-12 lg:grid-cols-2">
            <!-- Booking Info -->
            <div>
                <h3 class="mb-4 font-serif text-2xl">Why Book Career Tomboy?</h3>
                <ul class="space-y-2">
                    <li class="flex gap-2">
                        <span class="text-primary">✓</span>
                        90s/2000s alternative rock crowd favorites
                    </li>
                    <li class="flex gap-2">
                        <span class="text-primary">✓</span>
                        Professional, reliable, easy to work with
                    </li>
                    <li class="flex gap-2">
                        <span class="text-primary">✓</span>
                        Full production or minimal setup available
                    </li>
                </ul>

                <h3 class="mb-4 mt-8 font-serif text-2xl">Technical Requirements</h3>
                <ul class="space-y-1 text-sm">
                    <li>• Minimum stage size: 12' x 10'</li>
                    <li>• 4-piece band (drums, bass, 2 guitars, vocals)</li>
                    <li>• Standard backline or full PA available</li>
                    <li>
                        •
                        <a href="/assets/docs/stage-plot.pdf" class="underline">
                            Download Stage Plot (PDF)
                        </a>
                    </li>
                </ul>

                <h3 class="mb-4 mt-8 font-serif text-2xl">Setlist Options</h3>
                <p>1-hour, 2-hour, or 3-set evening packages available</p>
                <a href="/assets/docs/setlist.pdf" class="mt-2 inline-block underline">
                    View Sample Setlist
                </a>
            </div>

            <!-- Contact Form or CTA -->
            <div class="rounded-lg bg-white/20 p-6">
                <h3 class="mb-4 font-serif text-2xl">Get a Quote</h3>
                <p class="mb-6">
                    Interested in booking Career Tomboy for your venue, event, or private party?
                </p>

                <a
                    href="mailto:booking@careertomboy.com?subject=Booking%20Inquiry"
                    class="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-serif text-lg text-white transition-colors hover:bg-primary/90"
                >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z"
                        ></path>
                    </svg>
                    Email for Booking
                </a>

                <p class="mt-4 text-sm">
                    Or call: <a href="tel:+1234567890" class="underline">(123) 456-7890</a>
                </p>
            </div>
        </div>
    </div>
</section>
```

### 4.4 Updated Navigation

**File:** `src/components/Navigation.astro`

```astro
---
const navItems = [
    { href: "#about", label: "About" },
    { href: "#gigs", label: "Gigs" },
    { href: "#media", label: "Media" },
    { href: "#booking", label: "Booking" },
    { href: "#contact", label: "Contact" },
];
---

<nav
    id="mainNav"
    class="fixed left-1/2 top-3 z-50 -translate-x-1/2"
    aria-label="Main navigation"
>
    <ul class="flex gap-1 rounded-full bg-primary/75 px-2 py-1 text-sm backdrop-blur">
        {navItems.map((item) => (
            <li>
                <a
                    href={item.href}
                    class="rounded-full px-3 py-2 text-white transition-colors hover:text-white/75 focus:ring-2 focus:ring-white"
                >
                    {item.label}
                </a>
            </li>
        ))}
    </ul>
</nav>
```

---

## 5. Phased Migration Strategy

### Phase 1: Astro + Tailwind Setup (Week 1)

| Task                                           | Priority | Effort   |
| ---------------------------------------------- | -------- | -------- |
| Initialize Astro project                       | Critical | 0.5 day  |
| Install Tailwind CSS 4 and @tailwindcss/vite   | Critical | 0.25 day |
| Create `astro.config.mjs` with Tailwind plugin | Critical | 0.25 day |
| Create `src/styles/global.css` with `@theme`   | Critical | 0.5 day  |
| Create base layout (`src/layouts/Main.astro`)  | Critical | 0.5 day  |
| Migrate data loading (CSV → Astro frontmatter) | Critical | 0.5 day  |
| Update `package.json` scripts                  | Critical | 0.25 day |
| Verify dev server works (`npm run dev`)        | Critical | 0.25 day |

**Checkpoint:** Empty Astro site running with Tailwind CSS

### Phase 2: Component Migration (Week 2)

| Task                                                           | Priority | Effort   |
| -------------------------------------------------------------- | -------- | -------- |
| Convert `head.ejs` → `Head.astro` component                    | Critical | 0.5 day  |
| Convert `navigation.ejs` → `Navigation.astro`                  | Critical | 0.5 day  |
| Convert `masthead.ejs` → `Masthead.astro`                      | Critical | 0.5 day  |
| Convert `gigs.csv` → `gigs.json` (see Section 3.1)             | Critical | 0.25 day |
| Create `src/lib/gigs.ts` utility functions                     | Critical | 0.25 day |
| Convert `gigs.ejs` → `Gig.astro` + `GigsList.astro`            | Critical | 1 day    |
| Convert `contact.ejs` → `Contact.astro`                        | Critical | 0.5 day  |
| Convert `footer.ejs` → `Footer.astro`                          | Critical | 0.5 day  |
| Create `src/pages/index.astro` assembling all components       | Critical | 0.5 day  |
| Update all classes from Bootstrap → Tailwind                   | Critical | 1-2 day  |
| Remove Bootstrap ScrollSpy (use CSS `scroll-behavior: smooth`) | Medium   | 0.25 day |
| Test all responsive breakpoints                                | Critical | 0.5 day  |

**Checkpoint:** Site looks identical to current version, running on Astro

### Phase 3: New Sections + MVP Launch (Week 3)

| Task                                     | Priority | Effort                  |
| ---------------------------------------- | -------- | ----------------------- |
| Create `About.astro` component           | High     | 1 day                   |
| Create `members.json` data file          | High     | 0.5 day                 |
| Create `Media.astro` component           | High     | 0.5 day                 |
| Create `videos.json` data file           | High     | 0.25 day                |
| Create `Booking.astro` component         | High     | 1 day                   |
| Update `Navigation.astro` with new links | High     | 0.25 day                |
| Gather content and assets                | Critical | **Requires your input** |
| Responsive testing for all sections      | High     | 0.5 day                 |
| Accessibility audit (WCAG 2.2 AA)        | Critical | 1 day                   |
| Cross-browser testing                    | High     | 0.5 day                 |
| **MVP Launch deploy**                    | Critical | 0.5 day                 |

**🚀 MVP LAUNCH CHECKPOINT**

At this point, the site is fully functional with:

- ✅ Modern Astro + Tailwind architecture
- ✅ All new sections (About, Media, Booking)
- ✅ Gigs managed via `gigs.json` file
- ✅ Accessibility compliant (WCAG 2.2 AA)

**MVP Gig Management:** Band members update gigs by editing `src/data/gigs.json`
and committing changes (or requesting updates from a technical member).

---

### Phase 4: Google Calendar API Integration (Post-MVP Enhancement)

> **Note:** This phase is **optional** and can be done after MVP launch.
> It implements the comprehensive Google Calendar API integration described in Section 3.2
> to enable non-technical band members to update gigs without git commits.

| Task                                                | Priority | Effort   |
| --------------------------------------------------- | -------- | -------- |
| Create Google Cloud project and enable Calendar API | High     | 0.5 day  |
| Create Service Account and download JSON key        | High     | 0.25 day |
| Create private Google Calendar for gigs             | High     | 0.5 day  |
| Share calendar with band members + service account  | High     | 0.25 day |
| Create `src/lib/calendar.ts` with API functions     | High     | 0.5 day  |
| Update `GigsList.astro` to use calendar API         | High     | 0.5 day  |
| Create `.env.example` and configure env vars        | High     | 0.25 day |
| Test build-time fetching (`astro build`)            | High     | 0.25 day |
| Migrate existing gigs from `gigs.json` to Calendar  | High     | 0.5 day  |
| Set up scheduled rebuilds (daily cron via host)     | Medium   | 0.25 day |
| Document event description format for band          | Medium   | 0.25 day |

**🚀 ENHANCED LAUNCH CHECKPOINT**

At this point, gig management is streamlined:

- ✅ Band members update gigs in Google Calendar (no git needed)
- ✅ Website rebuilds daily or on-demand
- ✅ Private events supported
- ✅ Calendar remains private (not publicly accessible)

---

### Phase 5: Cleanup (Post-Launch)

| Task                                    | Priority | Effort   |
| --------------------------------------- | -------- | -------- |
| Delete old EJS files (`src/ejs/`)       | Medium   | 0.25 day |
| Delete old SCSS files (`src/scss/`)     | Medium   | 0.25 day |
| Delete old scripts (`scripts/`)         | Medium   | 0.25 day |
| Remove unused dependencies              | Medium   | 0.25 day |
| Performance optimization (Astro images) | High     | 0.5 day  |
| SEO meta tags and Open Graph            | Medium   | 0.5 day  |
| Post-launch monitoring                  | Medium   | Ongoing  |

**Checkpoint:** Codebase is clean and optimized

---

### Phase 6: Future Enhancements (Post-Launch)

These features are deferred to post-launch to keep the initial migration focused:

| Task                                   | Priority | Notes                                      |
| -------------------------------------- | -------- | ------------------------------------------ |
| Photo gallery with lightbox            | Medium   | Consider Cloudinary or similar for hosting |
| Additional video sources (Vimeo, etc.) | Low      | Extend `videos.json` schema                |
| Band merchandise section               | Low      | If selling merch online                    |
| Mailing list signup integration        | Medium   | Mailchimp, ConvertKit, etc.                |
| Analytics integration                  | Medium   | Plausible, Fathom, or Google Analytics     |

---

## 6. Information Gathering Checklist

### Brand System (Need from you)

- [ ] **Color palette confirmation** - Are current colors staying or changing?
- [ ] **Typography confirmation** - Keep Poppins/Rokkitt or new fonts?
- [ ] **Logo variations** - Do you have SVG logo files for different contexts?
- [ ] **Brand guidelines** - Any documented style rules?

### Band Content (Need from you)

- [ ] **Member names and roles** - Full list of current members
- [ ] **Member photos** - Minimum 400x400px, consistent style preferred
- [ ] **Band biography** - 2-3 paragraphs for About section
- [ ] **Band history highlights** - Key dates/milestones (optional)

### Media Assets (Need from you)

- [ ] **YouTube video selection** - Which videos to feature?
- [ ] **Photo gallery images** - 10-20 best photos
- [ ] **Photo credits** - Any attribution needed?

### Booking Information (Need from you)

- [ ] **Technical requirements** - Stage plot available?
- [ ] **Setlist options** - What packages do you offer?
- [ ] **Pricing structure** - General ranges or "contact for quote"?
- [ ] **Booking contact** - Email and/or phone?

### Gigs Management (Need from you)

- [ ] **Google account** - Which account will host the calendar?
- [ ] **Calendar manager** - Who will be responsible for updates?
- [ ] **Existing gigs** - Should I migrate current CSV data?

---

## 7. File Structure Changes

### New Astro Project Structure

```
/
├── .env                      # Environment variables (git-ignored)
├── .env.example              # Template for env vars (committed)
├── astro.config.mjs          # Astro + Tailwind configuration
├── package.json              # Simplified scripts (dev, build, preview)
├── public/                   # Static assets (copied as-is)
│   ├── favicon.ico
│   └── assets/
│       ├── img/
│       │   ├── members/      # Member photos
│       │   └── gallery/      # Gallery photos
│       └── docs/             # PDFs (stage plot, setlist)
└── src/
    ├── components/           # Astro components
    │   ├── Navigation.astro
    │   ├── Masthead.astro
    │   ├── Gig.astro         # Individual gig display
    │   ├── GigsList.astro    # Gigs section with Calendar API
    │   ├── About.astro
    │   ├── Media.astro
    │   ├── Booking.astro
    │   ├── Contact.astro
    │   └── Footer.astro
    ├── layouts/
    │   └── Main.astro        # Base HTML layout
    ├── lib/                  # Shared utilities (NEW)
    │   ├── types.ts          # TypeScript interfaces
    │   └── calendar.ts       # Google Calendar API functions
    ├── pages/
    │   └── index.astro       # Homepage
    ├── styles/
    │   └── global.css        # Tailwind CSS entry point
    └── data/
        └── members.json      # Band member data
```

> **Note:** `gigs.csv` is no longer needed - gigs are fetched from Google Calendar API.

### Files to Delete (After Migration Complete)

```
# EJS Templating (replaced by Astro)
src/ejs/                      # Entire directory

# SCSS/CSS (replaced by Tailwind)
src/scss/                     # Entire directory

# Custom Build Scripts (replaced by Astro CLI)
scripts/                      # Entire directory
  ├── render-ejs.js
  ├── render-scss.js
  ├── build-scss.js
  ├── render-assets.js
  ├── render-scripts.js
  ├── sb-watch.js
  └── load-gigs.js

# Data Files (replaced by Google Calendar API)
src/data/gigs.csv             # Migrated to Google Calendar

# Config Files (no longer needed)
postcss.config.mjs            # Tailwind via Vite handles this

# Old Output (Astro uses dist/)
dist/                         # Will be recreated by Astro
```

### Dependencies Comparison

| Current                       | After Migration              |
| ----------------------------- | ---------------------------- |
| `bootstrap`                   | ❌ Removed                   |
| `ejs`                         | ❌ Removed                   |
| `sass`                        | ❌ Removed                   |
| `autoprefixer`                | ❌ Removed                   |
| `@fullhuman/postcss-purgecss` | ❌ Removed                   |
| `browser-sync`                | ❌ Removed                   |
| `chokidar`                    | ❌ Removed                   |
| `concurrently`                | ❌ Removed                   |
| `upath`                       | ❌ Removed                   |
| `csv-parse`                   | ❌ Removed (Calendar API)    |
| `prettier`                    | Optional (keep if wanted)    |
| -                             | `astro` ✅ Added             |
| -                             | `tailwindcss` ✅ Added       |
| -                             | `@tailwindcss/vite` ✅ Added |
| -                             | `typescript` ✅ Added        |

---

## 8. Risk Mitigation

| Risk                                | Mitigation Strategy                                                      |
| ----------------------------------- | ------------------------------------------------------------------------ |
| Breaking changes during migration   | Work in feature branch; keep old code until Astro version is complete    |
| Learning curve with Astro           | Astro syntax is similar to JSX; extensive documentation available        |
| Build output differences            | Compare old `dist/` with new `dist/` to verify visual parity             |
| Google Calendar API quota limits    | 1M requests/day free tier is sufficient; see Section 3.1.8 for analysis  |
| Calendar API unavailable at build   | Log warning, show user-friendly error message in gigs section            |
| Calendar API unavailable at runtime | Silent fail, static content remains visible (graceful degradation)       |
| API key security                    | Two keys: unrestricted for server, referrer-restricted for client        |
| Browser compatibility               | Tailwind 4 + Astro target modern browsers; document minimum requirements |
| Image paths change                  | Astro's `public/` folder serves static assets at same paths              |
| Band member can't update calendar   | Provide documentation with screenshots (Section 3.3)                     |

---

## 9. Next Steps

**Before implementation begins, the following is needed:**

1. **Confirm the migration approach** - Does Astro + Tailwind 4 + Google Calendar API align with your vision?
2. **Provide brand assets** - Colors, fonts, logo files if changing
3. **Set up Google Cloud account** - Which Google account for API keys and Calendar?
4. **Create public calendar** - Follow setup in Section 3.1.1
5. **Gather content** - Member info, photos, bio, booking details

Phase 1 (framework migration) can begin while content assets are being gathered.
Phase 4 (Calendar API) requires Google Cloud setup to be completed first.
