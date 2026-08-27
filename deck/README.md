# LRHS pitch deck

Lives in the repo on purpose: an earlier copy existed only in a scratch
directory and was lost when that directory was cleaned up.

Everything under `img/`, `slides-png/`, `slides-jpg/`, `wallpaper/` and the
built `.pptx` / `.pdf` is generated and gitignored. The inputs are the marks,
photographs and mockups in `public/images/`, plus the fonts here.

## Build

```bash
cd deck
npm install                  # once — qrcode, jsqr, pptxgenjs
node prepare-assets.mjs      # img/ from public/images
node render-boards.mjs       # the seven brand-system boards
node build-wallpaper.mjs     # desktop wallpapers + the deck variant
node build-qr.mjs            # site QR, decode-verified before it is kept
PITCH=1 node render-slides.mjs
node assemble.js             # -> Bronx-Hanratty-LRHS-Pitch.pptx
node build-pdf.mjs           # -> ...-Pitch-and-Marks.pdf  (reads slides-jpg)
```

`build-pdf.mjs` must run **after** `assemble.js` — it reads the JPGs that step
writes. `PITCH=1` selects the pitch cut (no website slides).

Industry Black is licensed and is not committed. The scripts look for it in
`public/fonts/industry-black.otf`, then where Windows installs per-user fonts.

## Keeping the three surfaces in step

A change to the deck also belongs in the printable PDF and on the site
(`/case-study/lakewood-ranch-redesign` and `public/lrhs-brand-refresh.html`).
