# Bronx Hanratty — Portfolio

Personal design portfolio for **Bronx Hanratty**, a digital and brand designer at Lakewood Ranch High School (Class of 2030) in Sarasota, FL.

🌐 **Live:** [bronxhanratty.me](https://bronxhanratty.me)

---

## About

A motion-driven portfolio built to feel like a printed editorial spread: off-white paper, ink-black type, italic serif accents, and a vintage-Macintosh "hello" intro on first visit. It's the home for Bronx's yearbook design, short documentary work, brand systems and a rolling gallery of recent experiments.

## What's on the site

### Home `/`
- **Intro animation** — a vintage Mac draws `hello` on its MacPaint screen, flies the word to the nav and settles into the hero. Plays once per session.
- **Auto-fitting hero** — "Bronx Hanratty" is measured and scaled live to fill the viewport, with scroll parallax on the Mac (reduced motion respected).
- **Works** — cards into each case study.
- **In the news** — a press card that switches on from `src/data/press.json`.
- **Tool stack, Digital Archive, the Dalí Museum feature, the Mona Jain block, About and Resume.**
- **Footer iPod** — Cover Flow, a Brick game and 118 tracks, played as legal 30-second iTunes previews (no music files are hosted here).

### Case studies `/case-study/<slug>`
| Slug | What it is |
|---|---|
| `lakewood-ranch-redesign` | **Mustangs Ahead** — an unofficial brand system for Lakewood Ranch High School. Logos approved by the principal, October 2026. |
| `846-am` | **8:46 AM** — a 7-minute 9/11 documentary. Winner, Manatee Film Rush · Jim Harbin Student Festival. |
| `dirty-sara-soda` | Brand identity for a mobile dirty-soda trailer. |
| `yearbook-2025` | Yearbook 2025 — in "Coming soon" mode until the book is out. |
| `recent-works` | Masonry gallery of posters, album-cover concepts, marks and illustrations. |

### Other pages
- `/lrhs-brand-guidelines` — the Mustangs Ahead guidelines as full-screen, scroll-snapping scenes.
- `/about`, `/resume` (plus a PDF version), and a System 7–style 404.
- There may be a secret or two. 🖱️

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, React 19, TypeScript strict), static export to `out/`
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Smooth scroll:** [Lenis](https://github.com/darkroomengineering/lenis)
- **Fonts:** Inter, Bricolage Grotesque, Instrument Serif; Hanken Grotesk on the LRHS pages
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com/), auto-deploys on every push to `master`

## Local development

Node 24 (see `.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:3000
```

```bash
npm run build      # static export → out/
npm run lint       # must stay at zero warnings
npm run typecheck
npm run check      # lint + typecheck + build
```

If something looks broken on localhost, clear the browser cache before anything else.

## Repo layout

```
src/
├── app/                 # routes (home, case studies, brand guidelines, about, resume…)
├── components/          # shared UI; LRHS pieces live in components/lrhs/
└── data/                # JSON that drives content (marks catalogue, press, holidays…)
public/                  # images, video and static pages
deck/                    # build for the LRHS presentation + marks PDF (outputs are git-ignored)
scripts/                 # image, bento, motion and validation scripts
assets/                  # source files for social, signature, podcast and flyer work
```

### The LRHS mark catalogue
`src/data/lrhs-marks.json` is the single source of truth for the Mustangs Ahead marks. The site, the deck, the PDF and every board read from it, so counts are never hard-coded. Check it with:

```bash
node scripts/check-lrhs-marks.mjs
```

The LRHS display face (Industry Black) is licensed and is **not** in this repo. Lettering on public pages is outlined to paths.

## Editing case-study copy

Each case study is a `page.tsx` under `src/app/case-study/<slug>/` with its text in a plain `data` object at the top. Wrap a word in `*asterisks*` to set it in italic serif.

## Deploying

Cloudflare Pages builds from `master`:

```
Build command:  npm run build
Output dir:     out
```

If a build fails at "Install dependencies" with a 404, check `npm view <package>` — a package may have been unpublished from npm.

## Credits

- Designed by **Bronx Hanratty**, built with **James Hanratty** and **Claude**.
- Visual inspiration: [sahor.work](https://sahor.work) (intro), [jameshanratty.design](https://jameshanratty.design) (case-study scaffold).
- Built with [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/) and [Lenis](https://github.com/darkroomengineering/lenis).

---

© 2026 Bronx Hanratty. All artwork and writing on the site are the author's own. Code is under the MIT licence (see `LICENSE`). The Mustangs Ahead work is concept work and is not affiliated with the school district.
