/**
 * The "Go Mustangs" closing splash, in the current design language.
 *
 * Renders two sizes from one source of truth:
 *   public/images/lrhs-go-mustangs.jpg   16:9, used in the case-study gallery
 *   assets/deck/lrhs-go-mustangs.jpg     3840x1330 band, for the pitch deck
 *
 * Lives in the repo on purpose. The previous version of this renderer lived
 * only in a scratch directory and was lost when that directory was cleaned up;
 * anything that produces a committed asset belongs next to the asset.
 *
 * Industry Black is licensed and deliberately not committed, so it is read from
 * wherever it is installed and inlined into the throwaway render HTML — it
 * never lands in the repo or in the output as anything but outlines.
 *
 * Run: node scripts/render-lrhs-splash.mjs
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const marks = path.join(root, "public", "images", "lrhs-marks");

const FONTS = [
  path.join(root, "public", "fonts", "industry-black.otf"),
  path.join(process.env.LOCALAPPDATA || "", "Microsoft", "Windows", "Fonts", "industry-black.otf"),
];
const fontPath = FONTS.find((p) => p && fs.existsSync(p));
if (!fontPath) {
  console.error("Industry Black not found. Looked in:\n  " + FONTS.join("\n  "));
  process.exit(1);
}
const fontB64 = fs.readFileSync(fontPath).toString("base64");

/** inline the artwork so the render never depends on a server or a file:// path */
const svg = (name) =>
  "data:image/svg+xml;base64," +
  fs.readFileSync(path.join(marks, name)).toString("base64");

const LOCKUP = svg("LRHS Full Logo 3.svg");   // the wide horizontal lockup
const HORSE = svg("LRHS Horse.svg");

/* Mustang Green with a lit corner and a deep one, so the field has somewhere to
   travel instead of sitting flat. Same recipe as the deck's hero slide. */
const page = ({ w, h, lockupW, goSize, gap, cardScale, horseH, horseRight }) => `
<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Industry';src:url(data:font/otf;base64,${fontB64}) format('opentype');font-weight:900;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${w}px;height:${h}px;overflow:hidden;}
body{font-family:-apple-system,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;
     text-rendering:geometricPrecision;}
.f{position:relative;width:${w}px;height:${h}px;overflow:hidden;
   display:flex;flex-direction:column;align-items:center;justify-content:center;
   background:
     radial-gradient(120% 150% at 20% 8%, #0A5733 0%, rgba(10,87,51,0) 62%),
     radial-gradient(110% 160% at 86% 96%, #021A10 0%, rgba(2,26,16,0) 58%),
     linear-gradient(146deg, #04482A 0%, #003C24 46%, #05281A 100%);}
.horse{position:absolute;right:${horseRight}px;top:50%;transform:translateY(-50%);
  height:${horseH}%;opacity:.05;filter:brightness(0) invert(1);pointer-events:none;}
.vig{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(130% 120% at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,.30) 100%);}
/* the lockup is dark green artwork; knock it out to white */
.lk{position:relative;width:${lockupW}px;filter:brightness(0) invert(1);
    margin-bottom:${gap}px;display:block;}
.go{position:relative;font-family:'Industry',sans-serif;font-weight:900;
    font-size:${goSize}px;line-height:.92;letter-spacing:.012em;color:#FCFCFC;}
.card{position:relative;margin-top:${Math.round(64 * cardScale)}px;
  display:inline-flex;flex-direction:column;
  padding:${Math.round(38 * cardScale)}px ${Math.round(56 * cardScale)}px;
  border-radius:${Math.round(24 * cardScale)}px;
  background-color:rgba(255,255,255,.10);
  background-image:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.03) 55%,rgba(255,255,255,0));
  border:1px solid rgba(255,255,255,.20);
  box-shadow:0 ${Math.round(26 * cardScale)}px ${Math.round(60 * cardScale)}px ${Math.round(-22 * cardScale)}px rgba(0,0,0,.7),
             inset 0 1px 0 rgba(255,255,255,.34);}
.k{font-size:${Math.round(26 * cardScale)}px;letter-spacing:.24em;text-transform:uppercase;
   color:#8FC7A9;font-weight:600;}
.v{font-size:${Math.round(52 * cardScale)}px;font-weight:600;letter-spacing:-.01em;
   color:#FCFCFC;margin-top:${Math.round(14 * cardScale)}px;}
</style></head><body><div class="f">
  <img class="horse" src="${HORSE}">
  <div class="vig"></div>
  <img class="lk" src="${LOCKUP}">
  <div class="go">GO MUSTANGS</div>
  <div class="card">
    <span class="k">Brand system</span>
    <span class="v">One source of truth</span>
  </div>
</div></body></html>`;

const VARIANTS = [
  /* JPEG, not PNG: a full-bleed gradient is the worst case for PNG — the
     lossless version of this frame is 1.3MB against ~300KB here, for no
     visible difference on a smooth field. */
  { name: "site", w: 2400, h: 1350, out: path.join(root, "public", "images", "lrhs-go-mustangs.jpg"),
    lockupW: 1420, goSize: 208, gap: 54, cardScale: 0.72, horseH: 150, horseRight: -110 },
  { name: "deck", w: 3840, h: 1330, out: path.join(root, "assets", "deck", "lrhs-go-mustangs.jpg"),
    lockupW: 1560, goSize: 236, gap: 44, cardScale: 0.82, horseH: 150, horseRight: -180 },
];

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const missing = [];

for (const v of VARIANTS) {
  fs.mkdirSync(path.dirname(v.out), { recursive: true });
  const p = await browser.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1 });
  p.on("requestfailed", (r) => missing.push(r.url().slice(0, 40)));
  await p.setContent(page(v), { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(450);
  await p.screenshot({
    path: v.out,
    ...(v.out.endsWith(".jpg") ? { type: "jpeg", quality: 94 } : {}),
    clip: { x: 0, y: 0, width: v.w, height: v.h },
  });
  const kb = (fs.statSync(v.out).size / 1024).toFixed(0);
  console.log(`  ${v.name.padEnd(5)} ${v.w}x${v.h}  ${kb}KB  ${path.relative(root, v.out)}`);
  await p.close();
}
console.log("font   :", fontPath);
console.log("missing:", missing.length ? [...new Set(missing)] : "none");
await browser.close();
