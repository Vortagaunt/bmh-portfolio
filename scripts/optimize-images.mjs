/**
 * One-time (re-runnable) image weight pass for /public/images.
 *
 * Every top-level PNG/JPG gets resized to a max 2000px longest edge and
 * converted to WebP (q83, alpha preserved). Originals are deleted and the
 * old→new mapping is printed so references can be updated.
 *
 * Skips: /og (share cards stay JPG for scraper compatibility), /cover-flow
 * and /cascade (already WebP), /lrhs-marks (SVGs), /arrows (small, alpha),
 * anything already .webp, and anything under 150KB.
 *
 * Run: node scripts/optimize-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "public", "images");

const entries = fs
  .readdirSync(dir, { withFileTypes: true })
  .filter((e) => e.isFile() && /\.(png|jpe?g)$/i.test(e.name));

let before = 0, after = 0;
const mapping = [];

const locked = [];
for (const e of entries) {
  const full = path.join(dir, e.name);
  const size = fs.statSync(full).size;
  if (size < 150 * 1024) { console.log(`skip (small): ${e.name}`); continue; }

  const base = e.name.replace(/\.(png|jpe?g)$/i, "");
  const outName = `${base}.webp`;
  const out = path.join(dir, outName);

  if (!fs.existsSync(out)) {
    const img = sharp(full);
    const meta = await img.metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
    const pipeline = longest > 2000 ? img.resize({ width: meta.width >= meta.height ? 2000 : undefined, height: meta.height > meta.width ? 2000 : undefined }) : img;
    await pipeline.webp({ quality: 83, alphaQuality: 90, effort: 5 }).toFile(out);
  }
  const newSize = fs.statSync(out).size;

  before += size;
  after += newSize;
  try {
    fs.unlinkSync(full);
  } catch {
    locked.push(e.name); // delete on a later pass — conversion still counts
  }
  mapping.push([e.name, outName]);
  console.log(`${e.name}  ${(size / 1048576).toFixed(1)}MB → ${outName}  ${(newSize / 1024).toFixed(0)}KB`);
}
if (locked.length) console.log("\nLOCKED (re-run or delete manually): " + locked.join(", "));

console.log(`\nTOTAL ${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB`);
console.log("\nMAPPING=" + JSON.stringify(mapping));
