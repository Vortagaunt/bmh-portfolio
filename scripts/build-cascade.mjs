/**
 * Build the Cascade Creations playlist from the .m4a files in
 * /public/audio/cascade. Reads embedded metadata (title, artist, album,
 * track number, cover art) with music-metadata, extracts + optimizes each
 * cover to /public/images/cascade, and writes the manifest the iPod player
 * imports at /src/data/cascade.json.
 *
 * Run: node scripts/build-cascade.mjs   (or: npm run build:cascade)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFile } from "music-metadata";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const audioDir = path.join(root, "public", "audio", "cascade");
const artDir = path.join(root, "public", "images", "cascade");
const outFile = path.join(root, "src", "data", "cascade.json");

const FALLBACK_ART = "/images/dali-bear.jpg";

fs.mkdirSync(artDir, { recursive: true });

const files = fs
  .readdirSync(audioDir)
  .filter((f) => /\.m4a$/i.test(f))
  .filter((f) => !f.startsWith("."));

if (!files.length) {
  console.log("No .m4a files in public/audio/cascade — nothing to do.");
  process.exit(0);
}

const slugify = (s) =>
  s.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

const tracks = [];
for (const file of files) {
  const full = path.join(audioDir, file);
  let meta;
  try {
    meta = await parseFile(full);
  } catch (e) {
    console.warn(`  ! could not parse ${file}: ${e.message}`);
    continue;
  }
  const c = meta.common;
  const slug = slugify(file);

  // Extract + optimize cover art, if present
  let art = FALLBACK_ART;
  if (c.picture && c.picture[0] && c.picture[0].data) {
    try {
      const outName = `${slug}.webp`;
      await sharp(Buffer.from(c.picture[0].data))
        .resize(640, 640, { fit: "cover" })
        .webp({ quality: 84 })
        .toFile(path.join(artDir, outName));
      art = `/images/cascade/${outName}`;
    } catch (e) {
      console.warn(`  ! cover failed for ${file}: ${e.message}`);
    }
  }

  tracks.push({
    title: c.title || file.replace(/\.[^.]+$/, ""),
    artist: c.artist || c.albumartist || "Bronx Hanratty",
    album: c.album || "Cascade Creations",
    art,
    src: `/audio/cascade/${encodeURIComponent(file)}`,
    duration: meta.format.duration ? Math.round(meta.format.duration) : 0,
    _disk: c.disk?.no ?? 1,
    _track: c.track?.no ?? 9999,
  });
  console.log(`  + ${c.title || file}  —  ${c.artist || "?"}  ${art === FALLBACK_ART ? "(no art)" : "♪art"}`);
}

// Order by disk → track number → title
tracks.sort((a, b) => a._disk - b._disk || a._track - b._track || a.title.localeCompare(b.title));
const out = tracks.map(({ _disk, _track, ...t }) => t);

fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + "\n");
console.log(`\nWrote ${out.length} track(s) → src/data/cascade.json`);
