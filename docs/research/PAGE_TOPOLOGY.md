# Sahor.work Page Topology

Target: https://sahor.work/ (Sahor Debbarma portfolio, built with Framer)
Total scroll height: ~7796px desktop @ 1440x900

## Visual order (top → bottom)

1. **Header / Nav** (sticky, h=64px)
   - Logo "sahor.dzn" (left, ~120px wide)
   - Nav links centered: `(Works)` `(About)` `(Contact)` — each shown with parentheses prefix/suffix
   - "✱ Open to work" badge with sparkle icon (right)

2. **Hero (~h=800px)**
   - Massive title: italic "Sahor" (Instrument Serif) + bold "Debbarma" (Bricolage Grotesque) — ~123px @ desktop, color #181818
   - Bio: "Seasoned designer with *strengths* in motion and interaction design. Currently *exploring* AI + Design Systems workflows" — Inter 16px with Instrument Serif italic spans
   - Vintage Macintosh image with handwritten "hello" SVG overlay (centered)
   - Tagline "SaaS UX · Motion Design" right
   - Caption "Based in Bangalore, moving pixels since 2019. Currently navigating life and design while sipping my specialty coffee"

3. **Works heading area**
   - Tiny date label: `2022-2025`
   - Big "Works" h2 (Bricolage Grotesque ~80-100px)
   - Outline italic "Selected" backdrop (Instrument Serif outline)

4. **3 Case study cards (each ~h=710px)**
   - Card 1: "Email Emily" — "AI email builder for advancement professionals"
   - Card 2: "Navigation Redesign" — "Designing SaaS navigation with scalable information architecture"
   - Card 3: "Fund Catalogue" — "Designing high-volume fundraising experience"
   - 3 muted-autoloop videos as hover/idle previews

5. **Archive section (DARK, ~h=1200px)**
   - Dark bg via circular mask reveal
   - Outline italic "Digital" backdrop
   - White "Archive" h2
   - Floating mockups (PS5 grid, gallery UI)

6. **About** — dark blob with outline italic "About" → reveals into bio + portrait
   - Portrait of Sahor with laptop
   - Body: "I'm a Digital Product Designer specializing in AI design workflows..."
   - "(Learn More)" pill with "Coming Soon" subtitle

7. **Footer (~h=816px) — Light**
   - "Let's Talk" outline italic backdrop (Instrument Serif)
   - phone.obj 3D flip phone (rendered as image)
   - "If you've scrolled this far, we should probably talk."
   - 3 contact links: `(Email)` `(LinkedIn)` `(x.com)`

8. **Bottom status bar (h=36px, black)**
   - "Sahor Debbarma ✤ (WIP 2019 - Present)" centered

## Layout grid

- Body bg: `#F1F1F1` (rgb(241, 241, 241))
- Text primary: `#181818` (rgb(24, 24, 24))
- Grid lines: `rgba(0, 0, 0, 0.1)` (light sections), `rgba(255, 255, 255, 0.2)` (dark)
- 5-col vertical grid (~360px columns) with 160px outer gutters
- Side padding `0 32px` for nav content
- Sticky 64px nav

## Fonts

- Inter (primary sans, body) — 400, 500
- Bricolage Grotesque (display sans, headlines) — 600
- Instrument Serif (italic accents, decorative outlines) — 400 italic

## Page behaviors

- Smooth scroll (Framer-native or Lenis)
- Sticky nav with backdrop
- Dark/light transitions via circular `clip-path: circle()` mask reveals
- Outline italic decorative texts under each section heading
- "+" plus markers in left margin (decorative grid intersections)
- Bottom status bar fixed/sticky to viewport bottom
