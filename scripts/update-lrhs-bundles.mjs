/**
 * Swap the new LRHS marks into the two bundled pages on the site:
 *   public/lrhs-brand-refresh.html                 brand guidelines
 *   public/lrhs-brand-system/website-concept.html  the clickable site concept
 *
 * Both are single-file bundler exports. Their images live in a manifest of
 * gzip+base64 blobs (the guidelines page), or as URL-encoded data URIs in one
 * JS module's `window.LRA` map (the concept). Nothing in the page markup changes
 * here — only the artwork behind the ids.
 *
 * Every replacement is layout-neutral: the new mark is fitted, centred, into the
 * exact box the old artwork's ink occupied, inside the old viewBox. The pages
 * size these images with CSS written for the old proportions, and the emblem is
 * now much squarer (1.04:1, was 1.27:1). Swapping the raw file in would change
 * every intrinsic size and reflow the header, the logo grid and the footer;
 * fitting keeps them identical and the emblem simply matches the old height.
 *
 * White and green variants are recolours of single-colour marks only — the
 * script refuses to recolour anything with more than one fill.
 *
 * Run: node scripts/update-lrhs-bundles.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MARKS = path.join(root, "public", "images", "lrhs-marks");
const mark = (f) => fs.readFileSync(path.join(MARKS, f), "utf8");

const BRAND = path.join(root, "public", "lrhs-brand-refresh.html");
const CONCEPT = path.join(root, "public", "lrhs-brand-system", "website-concept.html");

const BRAND_MAP = {
  "8ed97ae0-db2e-4a62-ac96-64a6bce9d7d1": ["LRHS Mustang 4.svg", "#FFFFFF"],   // white horse
  "fff3781b-826f-4784-bd58-cb9b611715e0": ["LRHS Wordmark 2.svg", null],       // stacked lockup
  "4796dda4-9e8b-4b34-83f4-16c8a7d1c2d7": ["LRHS Emblem.svg", null],           // the emblem
  "bcdac385-4bb6-4edf-9c69-cffb8912209f": ["LRHS Wordmark 2.svg", "#FFFFFF"],  // stacked, reversed
};
/* ILoveLakewoodRanch.svg and MustangsAhead.svg are in the concept's map but no
   page ever renders them, so they are left exactly as they are. */
const CONCEPT_MAP = {
  "LREmblem.svg": ["LRHS Emblem.svg", null],
  "LRHSFullLogo.svg": ["LRHS Wordmark 2.svg", null],
  "LRHSFullLogo-white.svg": ["LRHS Wordmark 2.svg", "#FFFFFF"],
  "LRMustang.svg": ["LRHS Mustang 4.svg", "#033922"],      // the concept's own Mustang Green
  "LRMustang-white.svg": ["LRHS Mustang 4.svg", "#FFFFFF"],
};

/* ---------- svg helpers ---------- */
const rootTag = (svg) => svg.match(/<svg\b[^>]*>/)[0];
const viewBox = (svg) => rootTag(svg).match(/viewBox="([^"]+)"/)[1].trim().split(/[\s,]+/).map(Number);
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]+)"`)) || [])[1];
const inner = (svg) => svg.slice(svg.indexOf(rootTag(svg)) + rootTag(svg).length, svg.lastIndexOf("</svg>"));

/** ink bounds in the svg's own viewBox units, from a raster of known scale */
async function inkBox(svg) {
  const [vx, vy, vw, vh] = viewBox(svg);
  const k = 2400 / Math.max(vw, vh);
  const pw = Math.round(vw * k), ph = Math.round(vh * k);
  const sized = svg.replace(rootTag(svg), rootTag(svg)
    .replace(/\s(width|height)="[^"]*"/g, "")
    .replace(/<svg\b/, `<svg width="${pw}" height="${ph}"`));
  const { data, info } = await sharp(Buffer.from(sized), { density: 72 }).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  let x1 = Infinity, y1 = Infinity, x2 = -1, y2 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 32) {
      if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y;
    }
  }
  if (x2 < 0) throw new Error("no ink found");
  const sx = info.width / vw, sy = info.height / vh;
  return { x: vx + x1 / sx, y: vy + y1 / sy, w: (x2 + 1 - x1) / sx, h: (y2 + 1 - y1) / sy };
}

/** recolour a single-colour mark; refuse anything with more than one fill */
function recolour(svg, colour) {
  const fills = [...new Set([...svg.matchAll(/fill\s*[:=]\s*"?\s*(#[0-9a-fA-F]{3,8})/g)]
    .map((m) => m[1].toUpperCase()))];
  if (fills.length !== 1) throw new Error(`refusing to recolour a mark with fills ${fills.join(", ")}`);
  return svg.replace(new RegExp(fills[0].replace("#", "#?"), "gi"), colour);
}

const r = (v) => +v.toFixed(3);

/** the new mark, fitted into the old artwork's ink box inside the old viewBox */
async function fitted(oldSvg, newFile, colour) {
  let fresh = mark(newFile);
  if (colour) fresh = recolour(fresh, colour);
  const oldInk = await inkBox(oldSvg), newInk = await inkBox(fresh);
  const tag = rootTag(oldSvg), w = attr(tag, "width"), h = attr(tag, "height");
  const out =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox(oldSvg).join(" ")}"` +
    (w ? ` width="${w}"` : "") + (h ? ` height="${h}"` : "") + `>` +
    `<svg x="${r(oldInk.x)}" y="${r(oldInk.y)}" width="${r(oldInk.w)}" height="${r(oldInk.h)}" ` +
    `viewBox="${r(newInk.x)} ${r(newInk.y)} ${r(newInk.w)} ${r(newInk.h)}" ` +
    `preserveAspectRatio="xMidYMid meet" overflow="visible">` +
    inner(fresh) + `</svg></svg>`;
  /* the proof it worked: the result's ink must sit inside the old box, and fill
     it on at least one axis (it is "meet", so the other axis may be shorter) */
  const got = await inkBox(out);
  const tol = Math.max(oldInk.w, oldInk.h) * 0.012;
  const inside = got.x >= oldInk.x - tol && got.y >= oldInk.y - tol &&
    got.x + got.w <= oldInk.x + oldInk.w + tol && got.y + got.h <= oldInk.y + oldInk.h + tol;
  const fills = Math.abs(got.w - oldInk.w) < tol || Math.abs(got.h - oldInk.h) < tol;
  if (!inside || !fills) throw new Error(`fit check failed for ${newFile}`);
  return { svg: out, oldInk, got };
}

/* ---------- bundle plumbing ---------- */
const BLOCK = (type) => new RegExp(`(<script[^>]*type="__bundler/${type}"[^>]*>)([\\s\\S]*?)(</script>)`, "i");
const readBlock = (html, type) => JSON.parse(html.match(BLOCK(type))[2].trim());
/* re-encoded the same way the earlier inject scripts do: every "</" escaped so
   no literal </script> can close the block early */
const writeBlock = (html, type, value) =>
  html.replace(BLOCK(type), (_, a, __, c) => a + JSON.stringify(value).replace(/<\//g, "<\\/") + c);
const unpack = (e) => { let b = Buffer.from(e.data, "base64"); if (e.compressed) b = zlib.gunzipSync(b); return b.toString("utf8"); };
const pack = (e, text) => ({ ...e, data: (e.compressed ? zlib.gzipSync(Buffer.from(text, "utf8")) : Buffer.from(text, "utf8")).toString("base64") });
const pct = (a, b) => `${Math.round((100 * a) / b)}%`;

/* ---------- the guidelines page ---------- */
{
  let html = fs.readFileSync(BRAND, "utf8");
  const man = readBlock(html, "manifest");
  for (const [id, [file, colour]] of Object.entries(BRAND_MAP)) {
    if (!man[id]) throw new Error(`brand page: no asset ${id}`);
    const { svg, oldInk, got } = await fitted(unpack(man[id]), file, colour);
    man[id] = pack(man[id], svg);
    console.log(`  brand   ${id.slice(0, 8)} <- ${file}${colour ? " " + colour : ""}` +
      `   ink ${pct(got.w, oldInk.w)} x ${pct(got.h, oldInk.h)} of the old box`);
  }
  html = writeBlock(html, "manifest", man);
  if (JSON.stringify(readBlock(html, "manifest")) !== JSON.stringify(man)) throw new Error("brand manifest round-trip failed");
  fs.writeFileSync(BRAND, html);
}

/* ---------- the concept site ---------- */
{
  let html = fs.readFileSync(CONCEPT, "utf8");
  const man = readBlock(html, "manifest");
  const id = Object.keys(man).find((k) => /window\.LRA\s*=/.test(unpack(man[k])));
  if (!id) throw new Error("concept: no module defines window.LRA");
  let mod = unpack(man[id]);
  const m = mod.match(/window\.LRA\s*=\s*(\{[\s\S]*?\});/);
  const LRA = JSON.parse(m[1]);
  for (const [key, [file, colour]] of Object.entries(CONCEPT_MAP)) {
    const val = LRA[key];
    if (!val) throw new Error(`concept: LRA has no ${key}`);
    const prefix = val.slice(0, val.indexOf(",") + 1);
    const { svg, oldInk, got } = await fitted(decodeURIComponent(val.slice(prefix.length)), file, colour);
    LRA[key] = prefix + encodeURIComponent(svg);
    console.log(`  concept ${key.padEnd(22)} <- ${file}${colour ? " " + colour : ""}` +
      `   ink ${pct(got.w, oldInk.w)} x ${pct(got.h, oldInk.h)} of the old box`);
  }
  /* function form: a string replacement would treat any $ in the data as a pattern */
  mod = mod.replace(m[1], () => JSON.stringify(LRA));
  man[id] = pack(man[id], mod);
  html = writeBlock(html, "manifest", man);
  if (JSON.stringify(readBlock(html, "manifest")) !== JSON.stringify(man)) throw new Error("concept manifest round-trip failed");
  fs.writeFileSync(CONCEPT, html);
}
console.log("done");
