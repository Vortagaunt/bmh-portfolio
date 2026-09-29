/**
 * Validate the LRHS mark library against its catalogue.
 *
 * src/data/lrhs-marks.json is the one list the deck, the PDF and the site all
 * read, so a mistake in it propagates to all three at once. This fails loud on:
 *   - a catalogued file that is not on disk, or a file on disk not catalogued
 *   - the same file catalogued twice
 *   - a mark pointing at a family that does not exist, or a family whose hero
 *     is not one of its own marks
 *   - a mark assigned to a ground it cannot be seen on (white ink on paper,
 *     dark ink on green), measured from the rendered artwork
 *
 * Optional: pass the source folder the marks were exported to, and it will also
 * check the library matches it byte for byte — the marks were renamed in that
 * folder mid-rebuild once already, and a stale copy would otherwise ship.
 *
 * Run: node scripts/check-lrhs-marks.mjs ["C:/Users/B M H/Downloads/SVG"]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(root, "public", "images", "lrhs-marks");
const cat = JSON.parse(fs.readFileSync(path.join(root, "src", "data", "lrhs-marks.json"), "utf8"));

const problems = [];
const onDisk = fs.readdirSync(DIR).filter((f) => f.endsWith(".svg")).sort();
const listed = [...cat.marks, ...cat.retired].map((m) => m.file);

for (const f of listed) if (!onDisk.includes(f)) problems.push(`catalogued but missing: ${f}`);
for (const f of onDisk) if (!listed.includes(f)) problems.push(`on disk but not catalogued: ${f}`);
listed.forEach((f, i) => { if (listed.indexOf(f) !== i) problems.push(`catalogued twice: ${f}`); });

const fams = new Set(cat.families.map((f) => f.id));
for (const m of cat.marks) if (!fams.has(m.family)) problems.push(`${m.file}: unknown family "${m.family}"`);
for (const f of cat.families) {
  const hero = cat.marks.find((m) => m.file === f.hero);
  if (!hero) problems.push(`family ${f.id}: hero ${f.hero} is not a live mark`);
  else if (hero.family !== f.id) problems.push(`family ${f.id}: hero ${f.hero} belongs to ${hero.family}`);
}

/* ground check: mean luminance of the opaque ink against the assigned ground */
for (const m of cat.marks) {
  if (!onDisk.includes(m.file)) continue;
  const { data } = await sharp(fs.readFileSync(path.join(DIR, m.file)), { density: 72 })
    .resize(300).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let s = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 200) { s += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; n++; }
  }
  const L = s / n / 255, ground = m.ground === "dark" ? 0.1 : 0.94;
  if (Math.abs(L - ground) < 0.3) problems.push(`${m.file}: ink (L=${L.toFixed(2)}) barely shows on ${m.ground}`);
}

/* optional byte-for-byte comparison with the export folder */
const source = process.argv[2];
if (source) {
  const hash = (p) => crypto.createHash("sha1").update(fs.readFileSync(p)).digest("hex");
  const src = fs.readdirSync(source).filter((f) => f.endsWith(".svg"));
  for (const f of src) {
    if (!onDisk.includes(f)) problems.push(`in source folder, not in library: ${f}`);
    else if (hash(path.join(source, f)) !== hash(path.join(DIR, f))) problems.push(`differs from source: ${f}`);
  }
  for (const m of cat.marks) if (!src.includes(m.file)) problems.push(`live mark not in source folder: ${m.file}`);
}

const byFam = {};
for (const m of cat.marks) byFam[m.family] = (byFam[m.family] || 0) + 1;
console.log(`library: ${cat.marks.length} live + ${cat.retired.length} retired  ${JSON.stringify(byFam)}` +
  (source ? `  (checked against ${source})` : ""));
if (problems.length) { console.error("FAIL:\n  " + problems.join("\n  ")); process.exit(1); }
console.log("ok: folder, catalogue, families and grounds all agree");
