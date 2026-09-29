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
npm install                          # once — qrcode, jsqr, pptxgenjs
node ../scripts/render-lrhs-splash.mjs   # first: prepare-assets copies it in
node prepare-assets.mjs              # img/ from public/images
node render-boards.mjs               # the seven brand-system boards
node build-wallpaper.mjs             # wallpapers, incl. the deck variant
node build-qr.mjs                    # site QR, decode-verified before it is kept
node render-slides.mjs               # 21 slides at 3840x2160
node assemble.js                     # -> Bronx-Hanratty-LRHS-Principal.pptx
node build-pdf.mjs                   # -> ...-Principal-and-Marks.pdf (reads slides-jpg)
```

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
