/* The Mustang wallpaper. Two desktop sizes plus the deck variant, which raises
   the emblem so the caption scrim on the "One horse, drawn once" slide never
   touches the artwork.
   Run: node build-wallpaper.mjs */
import { chromium } from "playwright-core";
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

const page = (w, h, { horseW, horseRight, horseTop, emblemW, emblemTop }) => `
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
  <img class="horse" src="img/horse-4k.png">
  <div class="grid"></div>
  <div class="vig"></div>
  <div class="em"><img src="img/emblem-white-4k.png"></div>
</div></body></html>`;

const VARIANTS = [
  { name: "LRHS-wallpaper-4k", w: 3840, h: 2160,
    horseW: 3200, horseRight: -880, horseTop: 470, emblemW: 1560, emblemTop: "48%" },
  { name: "LRHS-wallpaper-1440p", w: 2560, h: 1440,
    horseW: 2130, horseRight: -585, horseTop: 315, emblemW: 1040, emblemTop: "48%" },
  /* Deck variant: emblem raised and a touch smaller so the lower third stays
     clear for the caption scrim. Same field, same horse. */
  { name: "LRHS-wallpaper-slide", w: 3840, h: 2160,
    horseW: 3200, horseRight: -880, horseTop: 270, emblemW: 1320, emblemTop: "35%" },
];

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const missing = [];
for (const v of VARIANTS) {
  const p = await browser.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1 });
  p.on("requestfailed", (r) => missing.push(r.url().split("/").pop()));
  const tmp = path.join(here, `_wp_${v.name}.html`);
  fs.writeFileSync(tmp, page(v.w, v.h, v));
  await p.goto("file:///" + tmp.split(path.sep).join("/"), { waitUntil: "load" });
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(OUT, `${v.name}.png`), clip: { x: 0, y: 0, width: v.w, height: v.h } });
  fs.unlinkSync(tmp);
  console.log(`  ${v.name}  ${v.w}x${v.h}  ${(fs.statSync(path.join(OUT, v.name + ".png")).size / 1048576).toFixed(2)}MB`);
  await p.close();
}
console.log("missing assets:", missing.length ? [...new Set(missing)] : "none");
await browser.close();
