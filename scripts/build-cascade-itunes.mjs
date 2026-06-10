/**
 * Build the Cascade Creations playlist from a plain song list using Apple's
 * iTunes Search API — real album art + metadata + a legal 30-second preview
 * clip per track (streamed from Apple's CDN, nothing copyrighted is hosted).
 *
 * Input: scripts/cascade-songs.txt — one song per line, e.g.
 *     Heartless - Kanye West
 *     Runaway - Kanye West
 *     # lines starting with # are ignored
 *
 * Run: node scripts/build-cascade-itunes.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const listFile = path.join(__dirname, "cascade-songs.txt");
const outFile = path.join(root, "src", "data", "cascade.json");

if (!fs.existsSync(listFile)) {
  console.error("Missing scripts/cascade-songs.txt — add one song per line first.");
  process.exit(1);
}

const lines = fs
  .readFileSync(listFile, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

const hi = (url) => (url ? url.replace(/\/\d+x\d+bb\./, "/600x600bb.") : url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tracks = [];
for (const q of lines) {
  const term = encodeURIComponent(q.replace(/\s*[-–—]\s*/g, " ").trim());
  const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const r = data.results && data.results[0];
    if (!r) {
      console.warn(`  ? no match: ${q}`);
      continue;
    }
    if (!r.previewUrl) {
      console.warn(`  ? no preview: ${r.trackName} — ${r.artistName}`);
      continue;
    }
    tracks.push({
      title: r.trackName,
      artist: r.artistName,
      album: r.collectionName || "",
      art: hi(r.artworkUrl100),
      src: r.previewUrl,
    });
    console.log(`  + ${r.trackName} — ${r.artistName}`);
  } catch (e) {
    console.warn(`  ! error for "${q}": ${e.message}`);
  }
  await sleep(250); // be polite to the API
}

if (!tracks.length) {
  console.error("No tracks resolved — nothing written.");
  process.exit(1);
}

fs.writeFileSync(outFile, JSON.stringify(tracks, null, 2) + "\n");
console.log(`\nWrote ${tracks.length} track(s) → src/data/cascade.json`);
