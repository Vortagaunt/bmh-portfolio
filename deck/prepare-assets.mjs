/**
 * Assemble deck/img from assets that live in the repo.
 *
 * Everything here is derived, never authored: marks are exported from the SVGs
 * in public/images/lrhs-marks, photographs are copied from public/images, and
 * the 4K emblem/horse used by the wallpaper are rendered from the same SVGs.
 * That means deck/img can be deleted and rebuilt at any time — which is the
 * point, after the previous deck was lost with its scratch directory.
 *
 * Run: node deck/prepare-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = path.join(root, "deck", "img");
const pub = (...p) => path.join(root, "public", "images", ...p);

const mk = (d) => fs.mkdirSync(d, { recursive: true });
/* cleared first: the library was renamed, and stale PNGs of removed marks would
   otherwise keep rendering on any slide that still referred to them */
fs.rmSync(path.join(IMG, "marks"), { recursive: true, force: true });
mk(IMG); mk(path.join(IMG, "marks")); mk(path.join(IMG, "audit")); mk(path.join(IMG, "apparel"));

/* ---- 1. marks: SVG -> PNG at deck resolution ---- */
const marksDir = pub("lrhs-marks");

/* Rasterise an SVG with its long side at `px` pixels, then let the caller
   downscale. Density is chosen per file from its viewBox: the new library's
   artboards run up to 4122 units across, and the old fixed density of 400 asked
   sharp for a 274-megapixel crest, past its pixel limit. */
function raster(file, px) {
  const svg = fs.readFileSync(path.join(marksDir, file));
  const [, , vw, vh] = svg.toString().match(/viewBox="([^"]+)"/)[1].trim()
    .split(/[\s,]+/).map(Number);
  const density = Math.max(72, Math.round((72 * px) / Math.max(vw, vh)));
  return sharp(svg, { density });
}
let n = 0;
for (const f of fs.readdirSync(marksDir).filter((f) => f.endsWith(".svg"))) {
  const out = path.join(IMG, "marks", f.replace(/\.svg$/, "").replace(/ /g, "-") + ".png");
  /* 2x oversample then down to 1800 on the long side — a tile on a 4K slide
     is ~600px, so this is three times what any slide needs */
  await raster(f, 3600)
    .resize({ width: 1800, height: 1800, fit: "inside" })
    .png({ compressionLevel: 9 })
    .toFile(out);
  n++;
}
console.log(`marks     : ${n}`);

/* ---- 2. the emblem and horse the wallpaper needs, knocked out to white ---- */
await raster("LRHS Emblem Mono.svg", 4400)
  .resize({ width: 2200 }).png().toFile(path.join(IMG, "emblem-white.png"));
await raster("LRHS Emblem Mono.svg", 6400)
  .resize({ width: 3200 }).png().toFile(path.join(IMG, "emblem-white-4k.png"));
await raster("LRHS Mustang 4.svg", 7200)
  .resize({ width: 3600 }).png().toFile(path.join(IMG, "horse-4k.png"));
console.log("emblem    : emblem-white, emblem-white-4k, horse-4k");

/* ---- 3. photographs already in the repo ---- */
const copies = [
  [pub("lrhs-banner.jpg"), "lrhs-banner.jpg"],
  [pub("lrhs-hero.png"), "lrhs-hero.png"],
  [pub("bronx-portrait.png"), "portrait.png"],
  [path.join(root, "assets", "deck", "lrhs-go-mustangs.jpg"), "lrhs-go-mustangs.jpg"],
];
for (const [from, to] of copies) {
  if (!fs.existsSync(from)) { console.log("  ! missing", from); continue; }
  fs.copyFileSync(from, path.join(IMG, to));
}
console.log(`photos    : ${copies.length}`);

/* ---- 4. campus audit + apparel, straight from the site ---- */
for (const [src, dst] of [["lrhs-audit", "audit"], ["lrhs-apparel", "apparel"]]) {
  const from = pub(src);
  let c = 0;
  for (const f of fs.readdirSync(from)) { fs.copyFileSync(path.join(from, f), path.join(IMG, dst, f)); c++; }
  console.log(`${dst.padEnd(10)}: ${c}`);
}
