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
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 3840, height: 2160 },
  deviceScaleFactor: 1,
});

const missing = [];
page.on("requestfailed", (r) => missing.push(r.url().split("/").pop()));

console.log(`rendering ${SLIDES.length} slides at 3840x2160…`);
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
  fs.unlinkSync(tmp);
  process.stdout.write(` ${i + 1}`);
}
console.log("\nmissing assets:", missing.length ? [...new Set(missing)] : "none");
await browser.close();
