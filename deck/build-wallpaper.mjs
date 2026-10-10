/* The Mustang wallpaper. Two desktop sizes plus the deck variant, which raises
   the emblem so the caption scrim on the "One horse, drawn once" slide never
   touches the artwork, plus a no-emblem 12K print master.
   Run: node build-wallpaper.mjs                    (every variant)
        node build-wallpaper.mjs <variant-name>     (just that one) */
import { chromium } from "playwright-core";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "wallpaper");
fs.mkdirSync(OUT, { recursive: true });

/* Mustang Green with a lit corner and a deep one, so the field has somewhere to
   travel instead of sitting flat. */
const field = `
  background:
    radial-gradient(120% 90% at 22% 12%, #0A5733 0%, rgba(10,87,51,0) 62%),
    radial-gradient(110% 100% at 88% 96%, #021A10 0%, rgba(2,26,16,0) 58%),
    linear-gradient(146deg, #04482A 0%, #003C24 44%, #05281A 100%);`;

const page = (w, h, { horseW, horseRight, horseTop, emblemW, emblemTop,
                       emblem = true, horseSrc = "img/horse-4k.png" }) => `
<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${w}px;height:${h}px;overflow:hidden;}
.f{position:relative;width:${w}px;height:${h}px;overflow:hidden;${field}}
.horse{position:absolute;width:${horseW}px;right:${horseRight}px;top:${horseTop}px;
  opacity:.042;filter:brightness(0) invert(1);pointer-events:none;}
.vig{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(130% 105% at 50% 45%, rgba(0,0,0,0) 38%, rgba(0,0,0,.34) 100%);}
.grid{position:absolute;inset:0;pointer-events:none;opacity:.5;
  background-image:
    linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size:calc((100% - ${Math.round(w * 0.16)}px) / 5) 100%, 100% 100%;
  background-position:${Math.round(w * 0.08)}px 0, 0 0;}
.em{position:absolute;left:50%;top:${emblemTop};transform:translate(-50%,-50%);width:${emblemW}px;}
img{display:block;width:100%;height:auto;}
</style></head><body>
<div class="f">
  <img class="horse" src="${horseSrc}">
  <div class="grid"></div>
  <div class="vig"></div>
  ${emblem ? `<div class="em"><img src="img/emblem-white-4k.png"></div>` : ""}
</div></body></html>`;

const VARIANTS = [
  { name: "LRHS-wallpaper-4k", w: 3840, h: 2160,
    horseW: 3200, horseRight: -880, horseTop: 470, emblemW: 1290, emblemTop: "48%" },
  { name: "LRHS-wallpaper-1440p", w: 2560, h: 1440,
    horseW: 2130, horseRight: -585, horseTop: 315, emblemW: 860, emblemTop: "48%" },
  /* Deck variant: emblem raised and a touch smaller so the lower third stays
     clear for the caption scrim. Same field, same horse. */
  { name: "LRHS-wallpaper-slide", w: 3840, h: 2160,
    horseW: 3200, horseRight: -880, horseTop: 270, emblemW: 1092, emblemTop: "35%" },
  /* The field and the ghosted horse on their own, no emblem. It is the 4K
     layout drawn at 3x device scale rather than a bigger layout, so every
     element — gradients, horse, grid hairlines, vignette — grows together and
     the proportions are exactly the 4K wallpaper's: 11520x6480.
     The horse is the vector mark, not horse-4k.png: that raster is 3600px wide
     and would be upscaled 2.7x here, softening its edge.
     300dpi is written into the file. It is only metadata — the detail comes
     from the pixel count — but it tells print software the intended size,
     38.4 x 21.6in, instead of letting it assume 72dpi and 160in. */
  { name: "LRHS-wallpaper-no-emblem-12k", w: 3840, h: 2160, scale: 3, dpi: 300,
    horseW: 3200, horseRight: -880, horseTop: 470, emblem: false,
    horseSrc: "../public/images/lrhs-marks/LRHS%20Mustang%204.svg" },
];

const browser = await chromium.launch({
  executablePath: process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const missing = [];
const only = process.argv.slice(2);
const unknown = only.filter((n) => !VARIANTS.some((v) => v.name === n));
if (unknown.length) { console.error("unknown variant: " + unknown.join(", ")); process.exit(1); }
const todo = only.length ? VARIANTS.filter((v) => only.includes(v.name)) : VARIANTS;

for (const v of todo) {
  const scale = v.scale ?? 1;
  const p = await browser.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: scale });
  p.on("requestfailed", (r) => missing.push(r.url().split("/").pop()));
  const tmp = path.join(here, `_wp_${v.name}.html`);
  fs.writeFileSync(tmp, page(v.w, v.h, v));
  await p.goto("file:///" + tmp.split(path.sep).join("/"), { waitUntil: "load" });
  await p.waitForTimeout(500);
  const out = path.join(OUT, `${v.name}.png`);

  if (scale === 1) {
    await p.screenshot({ path: out, clip: { x: 0, y: 0, width: v.w, height: v.h } });
  } else {
    /* Captured in horizontal bands and stitched. One 74.6MP capture is at the
       mercy of Chrome's screenshot buffer and the size of a single devtools
       message; bands of whole CSS pixels land exactly on the device-pixel grid,
       so they butt together with no seam. */
    const BAND = 540;                                  // CSS px, divides 2160
    const W = v.w * scale, H = v.h * scale;
    const canvas = Buffer.alloc(W * H * 3);
    for (let y = 0; y < v.h; y += BAND) {
      const hh = Math.min(BAND, v.h - y);
      const shot = await p.screenshot({ clip: { x: 0, y, width: v.w, height: hh } });
      const { data, info } = await sharp(shot).removeAlpha().raw()
        .toBuffer({ resolveWithObject: true });
      if (info.width !== W || info.height !== hh * scale) {
        throw new Error(`band at y=${y} came back ${info.width}x${info.height}, ` +
          `expected ${W}x${hh * scale}`);
      }
      data.copy(canvas, y * scale * W * 3);
    }
    let img = sharp(canvas, { raw: { width: W, height: H, channels: 3 } });
    if (v.dpi) img = img.withMetadata({ density: v.dpi });
    await img.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(out);
  }

  fs.unlinkSync(tmp);
  const m = await sharp(out).metadata();
  console.log(`  ${v.name}  ${m.width}x${m.height}` +
    (m.density ? `  ${m.density}dpi` : "") +
    `  ${(fs.statSync(out).size / 1048576).toFixed(2)}MB`);
  await p.close();
}
console.log("missing assets:", missing.length ? [...new Set(missing)] : "none");
await browser.close();
