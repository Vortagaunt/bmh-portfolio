/* Design-pass capture rig.
 *
 *   node scripts/shots-design.mjs before
 *   node scripts/shots-design.mjs after
 *
 * Writes .design-shots/<label>-<name>-<theme>.png so a pass can be compared
 * against itself. Two things bite every time and are handled here:
 *   - IntroOverlay owns the viewport for 5.2s after load; anything captured
 *     before that is a photo of the boot Macintosh, not the page.
 *   - the Next dev overlay (<nextjs-portal>) paints a badge over the corner.
 */
import { chromium } from "playwright-core";
import fs from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const LABEL = process.argv[2] ?? "shot";
const OUT = ".design-shots";
fs.mkdirSync(OUT, { recursive: true });

/** Sections to park the viewport on, by selector — scroll fractions drift as
 *  content changes and quietly photograph the wrong thing. */
const STOPS = [
  { name: "1-hero", sel: null, y: 0 },
  { name: "2-tools", sel: ".tool-carousel" },
  { name: "3-works", sel: "#works" },
  { name: "4-card", sel: "#works .media-elevated" },
  { name: "5-about", sel: "#about-me" },
  { name: "6-footer", sel: "footer" },
];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 120)));

await page.goto(BASE, { waitUntil: "networkidle" });
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await page.evaluate(() => document.fonts.ready);
// let the intro finish rather than photographing it
await page.waitForFunction(
  () => ![...document.querySelectorAll("div")].some((d) => `${d.className}`.includes("z-[9997]")),
  null,
  { timeout: 25000 },
);

for (const theme of ["light", "dark"]) {
  await page.evaluate((t) => document.documentElement.classList.toggle("dark", t === "dark"), theme);
  for (const s of STOPS) {
    const ok = await page.evaluate((stop) => {
      if (!stop.sel) {
        window.scrollTo({ top: 0, behavior: "instant" });
        return true;
      }
      const el = document.querySelector(stop.sel);
      if (!el) return false;
      // sit slightly above the section so the header sits over its content
      const top = el.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top: Math.round(top), behavior: "instant" });
      return true;
    }, s);
    if (!ok) {
      console.log(`  ! ${s.name}: no match for ${s.sel}`);
      continue;
    }
    await page.waitForTimeout(1500); // reveals + lenis settle
    await page.screenshot({ path: `${OUT}/${LABEL}-${s.name}-${theme}.png` });
  }
  console.log(`✓ ${theme}`);
}

const real = errs.filter((e) => !/cloudflareinsights|ERR_FAILED/.test(e));
console.log("page errors:", real.length ? real : "none");
await browser.close();
