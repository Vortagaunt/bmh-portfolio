import { chromium } from "playwright-core";
import fs from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "docs/screenshots"; // refresh README shots: node scripts/screenshots.mjs
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1500, height: 950 },
  deviceScaleFactor: 1.5,
});
const page = await ctx.newPage();

async function shot(file, url, { wait = 2500, scrollTo = null, settle = 1600 } = {}) {
  await page.goto(BASE + url, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(wait);
  if (scrollTo !== null) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollTo);
    await page.waitForTimeout(settle);
  }
  await page.screenshot({ path: file });
  console.log("✓", file);
}

/* ---- README set ---- */
// 1. The intro moment — mac + hello mid-animation (~2.4s in, hello drawn)
await page.goto(BASE + "/?s=intro", { waitUntil: "commit" }).catch(() => {});
await page.waitForTimeout(2450);
await page.screenshot({ path: `${OUT}/intro.png` });
console.log("✓ intro.png");

// 2. Home hero after the intro finishes
await page.waitForTimeout(6000);
await page.screenshot({ path: `${OUT}/home.png` });
console.log("✓ home.png");

// 3. LRHS case study top
await shot(`${OUT}/case-study.png`, "/case-study/lakewood-ranch-redesign", { wait: 3200 });

// 4. Recent works grid (scrolled into the gallery)
await shot(`${OUT}/recent-works.png`, "/case-study/recent-works", { wait: 2500, scrollTo: 900, settle: 2000 });

await browser.close();
console.log("done");
