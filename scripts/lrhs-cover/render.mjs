/**
 * The Lakewood Ranch card cover on the home page (public/images/lrhs-cover.jpg).
 *
 * A wall of the brand's own marks, tilted away into the dark like a table top,
 * with the LR emblem lifted off it on its own tile: one horse, drawn once, in
 * front of everything else the system makes. It only uses the mark library
 * (src/data/lrhs-marks.json), so it never shows anything that isn't public yet.
 *
 * Two steps:
 *   1. here: the wall is laid out flat as an ordinary page (13 x 11 tiles) and
 *      screenshotted at 2x, and the lifted tile on its own at 6x.
 *   2. compose.py: tilts the flat wall into perspective, adds the depth of
 *      field, the lifted tile (with its edge and shadow), the fog and the grain.
 *      Done in Python because Chrome's own 3D transforms drop tiles when a
 *      layer this big is screenshotted at 2x.
 *
 * Needs Python 3 with numpy and Pillow. Takes CHROME from the environment like
 * the other render scripts.
 *
 * Run: node scripts/lrhs-cover/render.mjs
 */
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lrhs-cover-"));

const { marks } = JSON.parse(fs.readFileSync(path.join(root, "src", "data", "lrhs-marks.json"), "utf8"));
const markUrl = (file) => pathToFileURL(path.join(root, "public", "images", "lrhs-marks", file)).href;

/* The grid. compose.py has the same numbers. */
const COLS = 13, ROWS = 11, TILE = 306, GAP = 26, PAD = 120;
const HERO = { row: 5, col: 6, file: "LRHS Emblem.svg" };
/* The ring around the lifted tile is picked by hand, so the first things you
   see next to the LR are the other families, not more LRs. */
const RING = {
  "-1,-1": "LRHS Grad Mark.svg",
  "-1,0": "LRHS Mustangs Ahead 5.svg",
  "-1,1": "LRHS Academic Powerhouse 2.svg",
  "0,-1": "LRHS Mustang 3.svg",
  "0,1": "LRHS Mustang.svg",
  "1,-1": "LRHS Wordmark 2.svg",
  "1,0": "LRHS Mustangs Ahead.svg",
  "1,1": "LRHS Retro Logo 2.svg",
};

const tiles = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (r === HERO.row && c === HERO.col) {
      tiles.push(`<div class="t" style="visibility:hidden"></div>`);
      continue;
    }
    const i = (r * 7 + c * 11) % marks.length;
    let m = marks[i];
    const ring = RING[`${r - HERO.row},${c - HERO.col}`];
    if (ring) m = marks.find((x) => x.file === ring);
    else if (m.file === HERO.file) m = marks[(i + 1) % marks.length];
    const ground = m.ground === "dark" ? "#033922" : "#F4F4F2";
    tiles.push(`<div class="t" style="background:${ground}"><img src="${markUrl(m.file)}"></div>`);
  }
}

const W = COLS * TILE + (COLS - 1) * GAP + 2 * PAD;
const H = ROWS * TILE + (ROWS - 1) * GAP + 2 * PAD;
const base = `html,body{margin:0;background:transparent}
.t{width:${TILE}px;height:${TILE}px;border-radius:46px;display:flex;align-items:center;justify-content:center}
.t img{max-width:72%;max-height:66%}`;

fs.writeFileSync(
  path.join(tmp, "flat.html"),
  `<!doctype html><html><head><style>${base}
.plane{padding:${PAD}px;display:grid;grid-template-columns:repeat(${COLS},${TILE}px);gap:${GAP}px;width:${W - 2 * PAD}px}
.plane .t{box-shadow:0 18px 40px -10px rgba(0,0,0,.7),0 2px 6px rgba(0,0,0,.4)}
</style></head><body><div class="plane">${tiles.join("")}</div></body></html>`,
);
fs.writeFileSync(
  path.join(tmp, "hero.html"),
  `<!doctype html><html><head><style>${base}
.t{background:linear-gradient(165deg,#FFFFFF 0%,#F6F6F3 55%,#E6E8E3 100%);box-shadow:inset 0 0 0 1.5px #fff}
</style></head><body><div class="t"><img src="${markUrl(HERO.file)}"></div></body></html>`,
);

const browser = await chromium.launch({ executablePath: CHROME, args: ["--allow-file-access-from-files"] });
async function shoot(name, w, h, scale) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(path.join(tmp, `${name}.html`)).href);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(tmp, `${name}.png`), omitBackground: true });
  await page.close();
}
await shoot("flat", W, H, 2);
await shoot("hero", TILE, TILE, 6);
await browser.close();

const out = path.join(root, "public", "images", "lrhs-cover.jpg");
execFileSync(process.env.PYTHON || (process.platform === "win32" ? "python" : "python3"), [path.join(here, "compose.py"), tmp, out], {
  stdio: "inherit",
});
fs.rmSync(tmp, { recursive: true, force: true });
console.log("wrote", path.relative(root, out));
