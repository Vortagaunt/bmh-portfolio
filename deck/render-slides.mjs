/* Draw every slide in a real browser at 4K, then assemble the deck out of those
   images. Regenerating is just: PITCH=1 node render-slides.mjs */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
delete require.cache[require.resolve("./slides.js")];
const SLIDES = require("./slides-lrhs.js"); // pushes onto the shared array

const OUT = path.join(here, "slides-png");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 3840, height: 2160 },
  deviceScaleFactor: 1,
});

const missing = [];
page.on("requestfailed", (r) => missing.push(r.url().split("/").pop()));

console.log(`rendering ${SLIDES.length} slides at 3840x2160…`);
const links = {};
for (let i = 0; i < SLIDES.length; i++) {
  const tmp = path.join(here, `_slide_${i}.html`);
  fs.writeFileSync(tmp, SLIDES[i]);
  await page.goto("file:///" + tmp.split(path.sep).join("/"), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(260);
  await page.screenshot({
    path: path.join(OUT, `slide-${String(i + 1).padStart(2, "0")}.png`),
    clip: { x: 0, y: 0, width: 3840, height: 2160 },
  });
  /* anything marked data-link becomes a clickable area in the PDF */
  const found = await page.evaluate(() => [...document.querySelectorAll("[data-link]")].map((el) => {
    const r = el.getBoundingClientRect();
    return { href: el.dataset.link, x: r.x, y: r.y, w: r.width, h: r.height };
  }));
  if (found.length) links[i + 1] = found;
  fs.unlinkSync(tmp);
  process.stdout.write(` ${i + 1}`);
}
/* which slides carry a video over their still (see S.motion in slides-lrhs.js),
   and each slide's title and section (alt text, notes, sections, PDF bookmarks) */
fs.writeFileSync(path.join(OUT, "motion.json"), JSON.stringify(SLIDES.motion || {}, null, 2));
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify(SLIDES.meta || [], null, 2));
fs.writeFileSync(path.join(OUT, "links.json"), JSON.stringify(links, null, 2));

/* Slides whose pieces animate in PowerPoint (S.layers). For each one: the slide
   again with those pieces hidden (the ground they land on), and each piece on
   its own — shadow included, on a transparent ground — clipped to where it
   sits. assemble.js lays the pieces back over the ground at exactly these
   rectangles, so in the editor and at rest the slide is the still above. */
const layers = {};
for (const [num, spec] of Object.entries(SLIDES.layers || {})) {
  const i = Number(num) - 1;
  const tmp = path.join(here, `_slide_${i}_layers.html`);
  fs.writeFileSync(tmp, SLIDES[i]);
  await page.goto("file:///" + tmp.split(path.sep).join("/"), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(260);
  const parts = await page.evaluate(() => [...document.querySelectorAll("[data-layer]")].map((el) => {
    const r = el.getBoundingClientRect();
    return { name: el.dataset.layer, x: r.x, y: r.y, w: r.width, h: r.height };
  }));
  const hide = await page.addStyleTag({ content: "[data-layer]{visibility:hidden !important}" });
  const base = `slide-${String(i + 1).padStart(2, "0")}-base.png`;
  await page.screenshot({ path: path.join(OUT, base), clip: { x: 0, y: 0, width: 3840, height: 2160 } });
  await hide.evaluate((el) => el.remove());
  /* the drop shadows reach ~100px out and further below, so each cut-out
     carries a margin; clipped to the slide */
  const PAD = { l: 150, r: 150, t: 120, b: 220 };
  const out = [];
  for (const part of parts) {
    const only = await page.addStyleTag({ content: `html,body{background:transparent !important}
      body *{visibility:hidden !important} [data-layer="${part.name}"]{visibility:visible !important}` });
    const x0 = Math.max(0, Math.floor(part.x - PAD.l)), y0 = Math.max(0, Math.floor(part.y - PAD.t));
    const x1 = Math.min(3840, Math.ceil(part.x + part.w + PAD.r)), y1 = Math.min(2160, Math.ceil(part.y + part.h + PAD.b));
    const file = `slide-${String(i + 1).padStart(2, "0")}-layer-${part.name}.png`;
    await page.screenshot({ path: path.join(OUT, file), omitBackground: true, clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } });
    await only.evaluate((el) => el.remove());
    out.push({ file, x: x0, y: y0, w: x1 - x0, h: y1 - y0, card: { x: part.x, y: part.y, w: part.w, h: part.h } });
  }
  layers[num] = { ...spec, base, parts: out };
  fs.unlinkSync(tmp);
  process.stdout.write(` ${num}:${out.length} layers`);
}
fs.writeFileSync(path.join(OUT, "layers.json"), JSON.stringify(layers, null, 2));
/* pages that live outside the deck — the site's copy of a slide, without its
   number — rendered by the same engine so they cannot drift from the slide */
const EXTRAS = path.join(here, "extras");
fs.mkdirSync(EXTRAS, { recursive: true });
for (const [name, html] of Object.entries(SLIDES.extras || {})) {
  const tmp = path.join(here, `_extra_${name}.html`);
  fs.writeFileSync(tmp, html);
  await page.goto("file:///" + tmp.split(path.sep).join("/"), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(260);
  await page.screenshot({ path: path.join(EXTRAS, `${name}.png`), clip: { x: 0, y: 0, width: 3840, height: 2160 } });
  fs.unlinkSync(tmp);
  process.stdout.write(` +${name}`);
}
console.log("\nmissing assets:", missing.length ? [...new Set(missing)] : "none");
await browser.close();
