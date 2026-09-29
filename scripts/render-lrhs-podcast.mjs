/**
 * LRHS Podcasts — Mustangs Ahead. A circular badge, 1:1.
 *
 * The existing "LRHS Mustangs Ahead 2" mark is already this badge — a flat black
 * circle with a dark green horse — so this is that mark redrawn in the
 * wallpaper's language: the Mustang Green field lit from the top left, the
 * horse ghosted across it, a vignette to pull the eye in. The lettering and its
 * hierarchy are kept from the original: Industry Black, MUSTANGS and AHEAD set
 * to one shared width, LRHS PODCASTS as the eyebrow over them.
 *
 * Emits:
 *   assets/podcast/lrhs-podcasts-mustangs-ahead.svg        the vector master
 *   assets/podcast/lrhs-podcasts-mustangs-ahead-3000.png   3000x3000 raster
 *
 * The SVG is fully self-contained so it renders the same anywhere it is opened:
 *   - every letter is outlined to a path — no <text>, no font dependency, and
 *     Industry Black (licensed, not committed) never ships as a font
 *   - the horse is the mark's own vector paths, recoloured, not an embedded image
 *   - gradients, clip and opacity are plain presentation attributes, no <style>
 *     and no filters, because design tools and image libraries disagree on both
 *
 * Run: node scripts/render-lrhs-podcast.mjs
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import opentype from "opentype.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "assets", "podcast");
fs.mkdirSync(OUT, { recursive: true });
const NAME = "lrhs-podcasts-mustangs-ahead";

/* ---- type ---- */
const FONTS = [
  path.join(root, "public", "fonts", "industry-black.otf"),
  path.join(process.env.LOCALAPPDATA || "", "Microsoft", "Windows", "Fonts", "industry-black.otf"),
  path.join(root, "deck", "fonts", "industry-black.otf"),
];
const fontPath = FONTS.find((p) => p && fs.existsSync(p));
if (!fontPath) { console.error("Industry Black not found in:\n  " + FONTS.join("\n  ")); process.exit(1); }
const fbuf = fs.readFileSync(fontPath);
const font = opentype.parse(fbuf.buffer.slice(fbuf.byteOffset, fbuf.byteOffset + fbuf.byteLength));

/** set a line glyph by glyph so tracking and kerning are both under control */
function linePath(text, size, trackEm, x0 = 0, baseline = 0) {
  const glyphs = font.stringToGlyphs(text);
  const k = size / font.unitsPerEm;
  const out = new opentype.Path();
  let x = x0;
  glyphs.forEach((g, i) => {
    out.extend(g.getPath(x, baseline, size));
    x += g.advanceWidth * k + trackEm * size;
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * k;
  });
  return out;
}
const bbox = (p) => p.getBoundingBox();

/* Serialised by hand rather than with Path.toPathData. opentype.js 2.0 runs an
   optimisation pass inside toPathData by default, and on AHEAD it emitted
   "MNaN" for the very first point even though every command it was given was
   finite. One NaN makes a browser drop the whole path, so the word simply
   vanished. Writing M/L/C/Q/Z out directly is ten lines, does not change
   behaviour between library versions, and refuses to write a non-finite
   number at all. */
function pathData(p) {
  const f = (v) => {
    if (!Number.isFinite(v)) throw new Error(`non-finite coordinate in glyph path: ${v}`);
    return +v.toFixed(2);
  };
  return p.commands.map((c) => {
    switch (c.type) {
      case "M": return `M${f(c.x)} ${f(c.y)}`;
      case "L": return `L${f(c.x)} ${f(c.y)}`;
      case "C": return `C${f(c.x1)} ${f(c.y1)} ${f(c.x2)} ${f(c.y2)} ${f(c.x)} ${f(c.y)}`;
      case "Q": return `Q${f(c.x1)} ${f(c.y1)} ${f(c.x)} ${f(c.y)}`;
      case "Z": return "Z";
      default: throw new Error(`unexpected path command ${c.type}`);
    }
  }).join("");
}

/** size a line so its INK (not its advance box) is exactly `width` wide */
function fitWidth(text, width, trackEm) {
  const b = bbox(linePath(text, 100, trackEm));
  return (100 * width) / (b.x2 - b.x1);
}

/** place a line with its ink centred on cx and its cap top at `top` */
function place(text, size, trackEm, cx, top) {
  const probe = bbox(linePath(text, size, trackEm));
  const dx = cx - (probe.x1 + probe.x2) / 2;
  const dy = top - probe.y1;
  const p = linePath(text, size, trackEm, dx, dy);
  const b = bbox(p);
  return { d: pathData(p), top: b.y1, bottom: b.y2, left: b.x1, right: b.x2 };
}

/* ---- geometry: a 1000 unit circle ---- */
const S = 1000, C = S / 2, R = S / 2;

const HEAD_W = 640;          // shared ink width of MUSTANGS and AHEAD
const HEAD_TRACK = 0.012;
const EYE_TRACK = 0.2;

const sizeM = fitWidth("MUSTANGS", HEAD_W, HEAD_TRACK);
const sizeA = fitWidth("AHEAD", HEAD_W, HEAD_TRACK);
const capM = (() => { const b = bbox(linePath("MUSTANGS", sizeM, HEAD_TRACK)); return b.y2 - b.y1; })();
const capA = (() => { const b = bbox(linePath("AHEAD", sizeA, HEAD_TRACK)); return b.y2 - b.y1; })();

/* eyebrow sized off the headline, as on the original: roughly a third of
   MUSTANGS' cap height, tracked open so it reads as a label, not a title */
const eyeCapTarget = capM * 0.34;
const eyeSize = (() => {
  const b = bbox(linePath("LRHS PODCASTS", 100, EYE_TRACK));
  return (100 * eyeCapTarget) / (b.y2 - b.y1);
})();
const capE = eyeCapTarget;

const gapE = capM * 0.46;
const gapH = capA * 0.16;
const blockH = capE + gapE + capM + gapH + capA;
const top0 = C - blockH / 2 + 6;   // a touch below true centre reads as centred

const eye = place("LRHS PODCASTS", eyeSize, EYE_TRACK, C, top0);
const mus = place("MUSTANGS", sizeM, HEAD_TRACK, C, eye.bottom + gapE);
const ahd = place("AHEAD", sizeA, HEAD_TRACK, C, mus.bottom + gapH);

/* every point of the lettering has to sit inside the circle with margin — an
   SVG will happily draw type straight off the edge of its own clip */
const inset = (x, y) => R - Math.hypot(x - C, y - C);
const corners = [eye, mus, ahd].flatMap((t) => [
  [t.left, t.top], [t.right, t.top], [t.left, t.bottom], [t.right, t.bottom]]);
const tightest = Math.min(...corners.map(([x, y]) => inset(x, y)));
if (!Number.isFinite(tightest) || tightest < 90) {
  console.error(`FAIL: lettering comes within ${tightest.toFixed(0)} units of the rim`);
  process.exit(1);
}

/* ---- the horse: the mark's own paths, recoloured ---- */
const horseSrc = fs.readFileSync(
  path.join(root, "public", "images", "lrhs-marks", "LRHS Horse.svg"), "utf8");
if (/transform=/.test(horseSrc)) {
  console.error("FAIL: horse SVG carries transforms this script does not apply");
  process.exit(1);
}
const [, , hvw, hvh] = horseSrc.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const horsePaths = [...horseSrc.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
if (!horsePaths.length) { console.error("FAIL: no paths found in horse SVG"); process.exit(1); }

/* Placed as on the original badge: far bigger than the circle, the head inside
   it on the right and the mane and neck running off the top left edge. */
const HORSE_W = 1320;
const hs = HORSE_W / hvw;
const noseX = 915, noseY = 600;              // where the muzzle lands
const htx = noseX - hvw * hs, hty = noseY - hvh * 0.56 * hs;

const n = (v) => +v.toFixed(2);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img" aria-labelledby="t">
  <title id="t">LRHS Podcasts — Mustangs Ahead</title>
  <defs>
    <clipPath id="disc"><circle cx="${C}" cy="${C}" r="${R}"/></clipPath>
    <!-- base: the wallpaper's 146deg sweep, lit top left to deep bottom right -->
    <linearGradient id="base" gradientUnits="userSpaceOnUse" x1="112" y1="-75" x2="888" y2="1075">
      <stop offset="0" stop-color="#04482A"/>
      <stop offset="0.44" stop-color="#003C24"/>
      <stop offset="1" stop-color="#05281A"/>
    </linearGradient>
    <radialGradient id="lit" gradientUnits="userSpaceOnUse" cx="220" cy="120" r="1200"
                    gradientTransform="translate(220 120) scale(1 0.75) translate(-220 -120)">
      <stop offset="0" stop-color="#0A5733"/>
      <stop offset="0.62" stop-color="#0A5733" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="deep" gradientUnits="userSpaceOnUse" cx="880" cy="960" r="1100"
                    gradientTransform="translate(880 960) scale(1 0.91) translate(-880 -960)">
      <stop offset="0" stop-color="#021A10"/>
      <stop offset="0.58" stop-color="#021A10" stop-opacity="0"/>
    </radialGradient>
    <!-- sized to the disc rather than copied from the 16:9 wallpaper, where the
         same numbers would never reach the rim of a circle -->
    <radialGradient id="vig" gradientUnits="userSpaceOnUse" cx="${C}" cy="470" r="545">
      <stop offset="0.42" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.4"/>
    </radialGradient>
  </defs>

  <g clip-path="url(#disc)">
    <rect width="${S}" height="${S}" fill="url(#base)"/>
    <rect width="${S}" height="${S}" fill="url(#lit)"/>
    <rect width="${S}" height="${S}" fill="url(#deep)"/>
    <g fill="#FFFFFF" fill-opacity="0.075" transform="translate(${n(htx)} ${n(hty)}) scale(${n(hs)})">
${horsePaths.map((d) => `      <path d="${d}"/>`).join("\n")}
    </g>
    <rect width="${S}" height="${S}" fill="url(#vig)"/>
  </g>

  <circle cx="${C}" cy="${C}" r="${R - 20}" fill="none" stroke="#FFFFFF" stroke-opacity="0.13" stroke-width="2"/>

  <path fill="#84C9A2" d="${eye.d}"/>
  <path fill="#FFFFFF" d="${mus.d}"/>
  <path fill="#FFFFFF" d="${ahd.d}"/>
</svg>
`;

const svgOut = path.join(OUT, `${NAME}.svg`);
fs.writeFileSync(svgOut, svg);

/* self-containment, checked on the file as written rather than assumed */
const problems = [];
if (/<text[\s>]/.test(svg)) problems.push("contains <text>");
if (/font-family|@font-face/.test(svg)) problems.push("references a font");
if (/<image[\s>]|href="(?!#)/.test(svg)) problems.push("references an external or embedded image");
if (/<style|filter=/.test(svg)) problems.push("uses <style> or filters");
if (/NaN|Infinity/.test(svg)) problems.push("contains a non-finite number");
if (problems.length) { console.error("FAIL: " + problems.join(", ")); process.exit(1); }
console.log(`  svg  ${(fs.statSync(svgOut).size / 1024).toFixed(1)}KB  ${NAME}.svg  ` +
  `(type ${tightest.toFixed(0)}u clear of the rim)`);

/* ---- raster at podcast-directory size ---- */
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await browser.newPage({ viewport: { width: S, height: S }, deviceScaleFactor: 3 });
await p.setContent(
  `<!doctype html><html><head><style>*{margin:0;padding:0}html,body{background:transparent}
   svg{display:block}</style></head><body>${svg}</body></html>`, { waitUntil: "load" });
const shot = await p.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: S, height: S } });
await browser.close();

const pngOut = path.join(OUT, `${NAME}-3000.png`);
await sharp(shot).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(pngOut);
const m = await sharp(pngOut).metadata();
console.log(`  png  ${m.width}x${m.height}  ${(fs.statSync(pngOut).size / 1024).toFixed(0)}KB  ` +
  `${NAME}-3000.png`);
