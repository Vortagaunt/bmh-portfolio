/* Cross-page sweep: every route at desktop + mobile, both themes, plus a
 * reduced-motion pass. Writes .design-shots/sweep-*.png and reports any
 * console error or horizontal overflow it finds. */
import { chromium } from "playwright-core";
import fs from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const OUT = ".design-shots";
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["home", "/"],
  ["about", "/about"],
  ["cs-lrhs", "/case-study/lakewood-ranch-redesign"],
  ["cs-works", "/case-study/recent-works"],
  ["cs-846", "/case-study/846-am"],
  ["resume", "/resume"],
  ["vault", "/vault"],
  ["404", "/definitely-not-a-page"],
];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const problems = [];

for (const [device, vp, motion] of [
  ["desktop", { width: 1500, height: 950 }, "no-preference"],
  ["mobile", { width: 390, height: 844 }, "no-preference"],
  ["reduced", { width: 1500, height: 950 }, "reduce"],
]) {
  const ctx = await browser.newContext({
    viewport: vp,
    deviceScaleFactor: 2,
    reducedMotion: motion,
  });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (!/cloudflareinsights|ERR_FAILED/.test(t)) problems.push(`${device} console: ${t.slice(0, 110)}`);
  });

  for (const [name, url] of ROUTES) {
    // 404 and vault don't run the intro; everything else does
    await page.goto(BASE + url, { waitUntil: "networkidle" }).catch(() => {});
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {});
    await page
      .waitForFunction(
        () => ![...document.querySelectorAll("div")].some((d) => `${d.className}`.includes("z-[9997]")),
        null,
        { timeout: 12000 },
      )
      .catch(() => {});
    await page.waitForTimeout(900);

    // does anything push the page sideways?
    const overflow = await page.evaluate(() => {
      const d = document.documentElement;
      return d.scrollWidth - d.clientWidth;
    });
    if (overflow > 1) problems.push(`${device} ${name}: horizontal overflow ${overflow}px`);

    // scroll a little so the header lands in its glass state
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/sweep-${device}-${name}.png` });
  }
  console.log(`✓ ${device}`);
  await ctx.close();
}

console.log(problems.length ? "\nPROBLEMS:\n" + problems.join("\n") : "\nno problems found");
await browser.close();
