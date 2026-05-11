# Bronx Hanratty — Portfolio 2026

Personal design portfolio for **Bronx Hanratty**, a 9th-grade digital designer based in Sarasota, FL.

🌐 **Live:** [bronxhanratty.me](https://bronxhanratty.me)

---

## About

A minimal, motion-driven portfolio built to feel like a printed editorial spread rather than a typical tech site. Off-white paper, ink-black type, italic serif accents for emphasis, and a vintage-Macintosh "hello" intro that animates on first visit.

The site doubles as a personal home for Bronx's work — yearbook design, short documentaries, and a rolling gallery of recent illustration / brand / album-cover experiments.

## What's on the site

### `/` — Home

- **Custom intro animation** — black screen → vintage Macintosh fades in → hand-drawn `hello` script draws onto its MacPaint screen → flies up to the nav corner → Mac glides into the hero position. Plays once per browser session.
- **Auto-fitting hero typography** — "Bronx Hanratty" measured and scaled live to fill the viewport edge-to-edge, no matter the screen width.
- **Scroll-driven parallax** on the hero Mac (with `prefers-reduced-motion` honored).
- **Three project cards** linking into case studies, with hover lift, image zoom, and a gentle gradient overlay.
- **About section** with portrait, italicized accents, and a CTA.
- **Footer** with a Phone.obj mockup, contact links (Email / LinkedIn / X), and an animated outline "Let's Talk" backdrop.

### `/case-study/yearbook-2025` — Yearbook 2025

Currently in **Coming Soon** mode while the book is under wraps. Flips back to the full case study via a single boolean (`COMING_SOON = false`) once the yearbook is officially out.

### `/case-study/846-am` — 8:46 AM

Short-documentary case study. Numbered chapter sections (Research / Edit & Pacing / Interviews), sticky chapter labels, a 4-column metadata grid (Year / Role / Tools / Runtime), full-bleed hero stills, gallery grid, and a "Next Project" jump card.

### `/case-study/recent-works` — Recent Works

A masonry-style photo gallery of recent design work: posters (Raized Wrong, 8:46 AM, YARG, Earth Cost), album-cover concepts (Yeezus, Northwest, Kanye Bear, MiniDisc, Red Portrait), brand marks (Dirty Sara-Soda, Guitar Hero 20), and illustrations (Skydive, Vorty, Brothers). Sorted from tallest aspect ratio to widest.

## Features

| Feature | Detail |
|---|---|
| **Intro overlay** | One-shot SVG-stroke animation, persisted via `sessionStorage` |
| **Page transitions** | Paper-fade overlay on every internal link click |
| **Persistent audio** | Background music loads muted to bypass autoplay block, unmutes on first user gesture; survives client-side navigation |
| **Smooth scroll** | Lenis-powered scroll with custom easing |
| **Reveal-on-scroll** | Custom `<Reveal>` IntersectionObserver wrapper with `up` / `fade` / `scale` / `blur` variants |
| **Inline italic markup** | Case study text supports `*word*` markers that render as italic-serif spans |
| **Responsive grid** | 12-col grid with sane mobile fallbacks throughout |
| **Static export** | Builds to a flat `out/` directory; deploys anywhere |

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, React 19, TypeScript strict)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with oklch design tokens
- **Smooth scroll:** [Lenis](https://github.com/darkroomengineering/lenis)
- **Fonts:** [Inter](https://rsms.me/inter/) (sans), [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) (display), [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (italic accents)
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com/) (auto-deploys on push to `master`)

## Project structure

```
src/
├── app/
│   ├── case-study/
│   │   ├── 846-am/page.tsx           # Short doc case study
│   │   ├── recent-works/page.tsx     # Photo gallery
│   │   └── yearbook-2025/page.tsx    # Yearbook (Coming Soon toggle)
│   ├── icon.png                      # Browser favicon (BMH on light)
│   ├── apple-icon.png                # iOS home-screen icon (BMH on black)
│   ├── globals.css                   # Tokens + custom animations
│   ├── layout.tsx                    # Root layout (audio + transitions)
│   └── page.tsx                      # Home
├── components/
│   ├── About.tsx
│   ├── Archive.tsx
│   ├── BackgroundMusic.tsx           # Autoplay-muted-then-unmute audio
│   ├── CaseStudyLayout.tsx           # Shared case-study scaffold
│   ├── Footer.tsx
│   ├── GridBackdrop.tsx              # Subtle grid lines behind content
│   ├── Hero.tsx                      # Full-width name + parallax Mac
│   ├── IntroOverlay.tsx              # First-visit animation
│   ├── PageTransition.tsx            # Paper-fade between routes
│   ├── Reveal.tsx                    # IO-based reveal wrapper
│   ├── SiteHeader.tsx                # Sticky nav (mix-blend-difference)
│   ├── SmoothScroll.tsx              # Lenis bootstrapper
│   ├── Works.tsx                     # Home page projects grid
│   └── icons.tsx                     # Inline SVG icons
├── lib/utils.ts                      # cn() helper
└── types/index.ts                    # CaseStudy interface
public/
├── audio/background.mp3
├── images/                           # All artwork and photography
└── seo/                              # Legacy favicon copies (kept for fallback)
```

## Local development

Requires Node 18+.

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000/`. The dev server hot-reloads on every save.

### Other scripts

```bash
npm run build       # Production build → `out/`
npm run lint        # ESLint
npm run typecheck   # TypeScript --noEmit
npm run check       # Lint + typecheck + build
```

## Editing case study copy

Each case study lives in its own `page.tsx` under `src/app/case-study/<slug>/`. The text content is exposed as a plain `data` object at the top of the file:

```ts
const data: CaseStudyData = {
  title: "8:46 AM",
  subtitle: "A short documentary about *September 11, 2001* — ...",
  meta: [
    { label: "Year", value: "2026" },
    { label: "Tools", value: "*Premiere Pro*, *After Effects*" },
    // ...
  ],
  overview: "...",
  sections: [
    { heading: "Research", body: "...", image: "/images/846am.png" },
    // ...
  ],
  gallery: [{ src: "/images/846am.png", alt: "..." }],
  next: { slug: "recent-works", title: "Recent Works" },
};
```

**Tip:** wrap any proper noun, brand, or term-of-art in `*asterisks*` to render it as italic serif — same pattern the home page uses for "roots / exploring / building".

## Deploying

Cloudflare Pages is configured to build from the `master` branch:

```
Build command:  npm run build
Output dir:     out
Node version:   18+
```

Pushing to `master` triggers a redeploy automatically. The custom domain `bronxhanratty.me` is wired up via CNAME.

## Screenshots

> Add PNGs to `docs/screenshots/` with the filenames below and they'll render inline on GitHub. Suggested set: `home.png` (full hero), `case-study.png` (a section from 8:46 AM), and `recent-works.png` (the gallery grid).

<!--
| | |
|---|---|
| ![Home](docs/screenshots/home.png) | ![Hero detail](docs/screenshots/hero-detail.png) |
| ![Case study](docs/screenshots/case-study.png) | ![Recent Works](docs/screenshots/recent-works.png) |
-->


## Credits

- Visual inspiration: [sahor.work](https://sahor.work) (intro animation), [jameshanratty.design](https://jameshanratty.design) (case study scaffold)
- Built with [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), and [Lenis](https://github.com/darkroomengineering/lenis)
- Designed and developed by **Bronx Hanratty**

---

© 2026 Bronx Hanratty. All artwork and writing on the site are the author's own.
