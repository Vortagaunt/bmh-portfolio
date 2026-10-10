# LRHS presentation for the principal

Lives in the repo on purpose: an earlier copy existed only in a scratch
directory and was lost when that directory was cleaned up.

Everything under `img/`, `slides-png/`, `slides-jpg/`, `wallpaper/` and the
built `.pptx` / `.pdf` is generated and gitignored. The inputs are the marks,
photographs and mockups in `public/images/`, plus the fonts here.

## The mark library

`src/data/lrhs-marks.json` is the one list of marks. The slides, the boards,
the PDF's mark pages and the site's case study all read it, so the three
surfaces cannot list different marks. After replacing or renaming any SVG in
`public/images/lrhs-marks/`, run the validator first:

```bash
node scripts/check-lrhs-marks.mjs "C:/Users/B M H/Downloads/SVG"
```

It fails on a file that is missing, uncatalogued or listed twice, a mark on a
ground it cannot be seen on, and — given the export folder — any file that no
longer matches it byte for byte.

## Build

```bash
cd deck
npm install                          # once — qrcode, jsqr, pptxgenjs, pdf-lib
node ../scripts/render-lrhs-splash.mjs   # first: prepare-assets copies it in
node ../scripts/build-presenter-script.mjs   # the script PDF that goes at the back
node prepare-assets.mjs              # img/ from public/images
node render-boards.mjs               # the seven brand-system boards
node build-wallpaper.mjs             # wallpapers, incl. the deck variant
node build-qr.mjs                    # site QR, decode-verified before it is kept
node render-slides.mjs               # every slide at 3840x2160, plus extras/ for the site
node assemble.js                     # -> Bronx-Hanratty-LRHS-Presentation.pptx
node build-pdf.mjs                   # -> ...-Presentation-and-Marks.pdf and ...-Leave-Behind.pdf
```

Every script finds Chrome at its Windows install path; set `CHROME` to use
another browser binary.

### What the PowerPoint does by itself

- **Two bentos build themselves in.** "Mustang Studio, on one page" closes the
  Studio section and the system bento follows "One more thing…". `assemble.js`
  lays each video over its still and sets it to start on its own, then hold.
  The videos come from `node ../scripts/render-bento-motion.mjs lrhs` and
  `... studio-wide` (run before `prepare-assets.mjs` whenever a bento changes).
  `S.motion` in `slides-lrhs.js` says which slides move.
- **The ID cards fan in.** Anything marked `data-layer` on a slide listed in
  `S.layers` is cut out by `render-slides.mjs` (shadow and all, on a
  transparent ground), the slide is rendered again without it, and
  `assemble.js` puts the cards back in place as separate pictures with a
  native entrance: they rise in as one stack and spread to where they sit.
- **Speaker notes** on every slide come from
  `assets/script/presenter-script.html` (`notes.js` reads it). Bold lines are
  to say, italic lines are what to do. The last slide also carries the Q&A.
  Edit the script, rebuild, and the notes follow.
- **Sections and titles**: each `ORDER` entry has a title and a section; they
  become PowerPoint sections, the slides' alt text and the PDF's bookmarks.
- **Transitions**: a fade between slides, a slow fade through black into
  "One more thing…", and a straight cut from it into the bento.

After changing anything in `assemble.js`, check the file with the pptx skill's
`validate.py`.

### The two PDFs

`Bronx-Hanratty-LRHS-Presentation-and-Marks.pdf` is the presenter edition: the
slides, the mark library one to a page, then the presenter script.
`Bronx-Hanratty-LRHS-Leave-Behind.pdf` is the same without the script — the
copy to hand over. Its slides are 2560px JPGs (still ~230dpi on the page), so it
stays under the 25MB most mail services accept; the presenter edition keeps 4K. Both have bookmarks (sections, slides, families, marks),
document properties, and links: anything marked `data-link` on a slide (the QR
code, bronxhanratty.me, bronxhanratty.me/studio) is clickable.

`build-pdf.mjs` must run **after** `assemble.js` — it reads the JPGs that step
writes. The slide order is the `ORDER` list at the bottom of `slides-lrhs.js`;
badge numbers are derived from it.

Industry Black is licensed and is not committed. The scripts look for it in
`public/fonts/industry-black.otf`, then where Windows installs per-user fonts.

## Keeping the three surfaces in step

A change to the deck also belongs in the printable PDF and on the site
(`/case-study/lakewood-ranch-redesign`, `public/lrhs-brand-refresh.html` and
`public/lrhs-brand-system/website-concept.html`). The two bundled pages take
new marks through `scripts/update-lrhs-bundles.mjs`.
