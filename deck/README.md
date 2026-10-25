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

### The Clawed family, and the one PNG

Added Oct 12: `LRHS Clawed.svg` (claw marks through the R) and
`LRHS Claw Emblem.png` (the claws across both letters). The PNG is the
library's only raster mark, a 4000 px export, so everything that reads the
catalogue accepts `.png` as well as `.svg`, and the validator compares only the
SVGs with the export folder. The family has its own page in the deck, after
Academic Powerhouse. The same evening Bronx's new exports replaced the
Academics pair: `LRHS Powerhouse 1.svg` and `LRHS Powerhouse 2.svg`.

### Holiday emblems

`src/data/lrhs-holidays.json` lists the holiday editions of the LR, in
school-year order (October Pink to the Fourth of July); the files are in
`public/images/lrhs-holidays`. They are editions of the emblem, not extra marks,
so the mark counts leave them out. The deck's "Holiday emblems" slide (after
Apparel, before Game day), the case study's Applied chapter and the guidelines
page all read that list. The validator checks the SVGs against the export folder
too. The Halloween photo version is a WebP (2000 px), since it is a picture.

## Build

```bash
cd deck
npm install                          # once — qrcode, jsqr, pptxgenjs, pdf-lib
node ../scripts/render-lrhs-splash.mjs   # first: prepare-assets copies it in
node ../scripts/build-presenter-script.mjs   # the script PDF (the speaker notes read the HTML)
node prepare-assets.mjs              # img/ from public/images
node render-boards.mjs               # the seven brand-system boards
node build-wallpaper.mjs             # wallpapers, incl. the deck variant
node build-qr.mjs                    # site QR, decode-verified before it is kept
node render-slides.mjs               # every slide at 3840x2160, plus extras/ for the site
node assemble.js                     # -> Bronx-Hanratty-LRHS-Presentation.pptx
node build-pdf.mjs                   # -> Bronx-Hanratty-LRHS-Marks.pdf (the mark pages only)
```

Every script finds Chrome at its Windows install path; set `CHROME` to use
another browser binary.

### Mustang Studio is the surprise

The principal hasn't seen the app. Nothing before slide 24, "One more thing…",
mentions it — not the slides, not the speaker notes, and not the section names
(the reveal's section is called "One more thing"). The Studio slides follow the
black slide, then "Mustang Studio, on one page", then the system bento (which
has a Studio tile, so it has to come after) and the QR. Keep it that way when
adding slides.

### What the PowerPoint does by itself

- **Two bentos build themselves in.** "Mustang Studio, on one page" closes the
  Studio reveal and the system bento follows it, just before the QR. `assemble.js`
  lays each video over its still and sets it to start on its own, then hold.
  The videos come from `node ../scripts/render-bento-motion.mjs lrhs` and
  `... studio-wide` (run before `prepare-assets.mjs` whenever a bento changes).
  `S.motion` in `slides-lrhs.js` says which slides move.
- **The ID cards are cut (Oct 15).** The district makes the student and staff
  IDs, so the school can't change them, and their two slides are out of
  `ORDER`, the slim deck, the script, the site and Mustang Studio. Their code
  (`studentIds`, `staffIds`) and the `S.layers` fan-in hook that cut out
  anything marked `data-layer` are still in `slides-lrhs.js`, switched off,
  in case that ever changes.
- **Speaker notes** on every slide come from
  `assets/script/presenter-script.html` (`notes.js` reads it). Bold lines are
  to say, italic lines are what to do. The last slide also carries the Q&A.
  Edit the script, rebuild, and the notes follow.
- **Sections and titles**: each `ORDER` entry has a title and a section; they
  become PowerPoint sections and the slides' alt text.
- **Transitions**: a fade between slides, a slow fade through black into
  "One more thing…", and a straight cut from it into Mustang Studio.

After changing anything in `assemble.js`, check the file with the pptx skill's
`validate.py`.

### The PDF

`Bronx-Hanratty-LRHS-Marks.pdf` is the mark library and nothing else: one mark
to a page, live marks first by family, then the retired ones (Oct 12 — Bronx
asked for "just the pages where it is only the marks"). No slides, no divider,
no script. Bookmarks go family → mark. It only needs `img/marks` from
`prepare-assets.mjs`, so it can be rebuilt without rendering the slides.

The two older editions are still in `build-pdf.mjs`, behind `EDITIONS=1`
(`EDITIONS=1 node build-pdf.mjs`, after `assemble.js`, since they read its JPGs):
`Bronx-Hanratty-LRHS-Presentation-and-Marks.pdf` (slides, marks, then the
presenter script — never hand it over) and `Bronx-Hanratty-LRHS-Leave-Behind.pdf`
(the same without the script, 2560px slides to stay under 25MB). Those have
bookmarks for every section and slide, and the QR code and addresses
(`data-link` on a slide) are clickable.

The slide order is the `ORDER` list at the bottom of `slides-lrhs.js`;
badge numbers are derived from it.

Industry Black is licensed and is not committed. The scripts look for it in
`public/fonts/industry-black.otf`, then where Windows installs per-user fonts.

### Mustang Studio's pictures

Everything on the Studio slides, the Studio bentos and the case study's Studio
section is the app's own output. After a new Mustang Studio build:

```bash
node scripts/capture-mustang-studio.mjs "<path to Mustang Studio (Industry Black).html>"   # assets/studio
node scripts/studio-site-images.mjs ui-templates ui-sizes          # the site's copies + the template wall's list
node scripts/render-studio-bento.mjs && BENTO_LAYOUT=wide node scripts/render-studio-bento.mjs
node scripts/render-bento-motion.mjs studio-wide                    # then studio, and vertical for the LRHS bento
```

The template count is read from `assets/studio/templates.json` everywhere it can
be. Hand-kept: the sizes (27) and brand-check rules (45) of Mustang Studio 1.1 in
`slides-lrhs.js`, `scripts/render-studio-bento.mjs` and `LrhsCaseStudy.tsx`.

## Keeping the three surfaces in step

A change to the deck also belongs in the printable PDF and on the site
(`/case-study/lakewood-ranch-redesign`, the brand guidelines at
`/lrhs-brand-guidelines` and `public/lrhs-brand-system/website-concept.html`).
The guidelines page is built from the deck's own words and reads the mark
catalogue, so new marks show up there by themselves; its text lives in
`src/components/lrhs/guidelines/BrandGuidelines.tsx`. The website concept is
still a bundled page and takes new marks through
`scripts/update-lrhs-bundles.mjs`. (`public/lrhs-brand-refresh.html`, the old
bundled guidelines, now just forwards to the new page.)
