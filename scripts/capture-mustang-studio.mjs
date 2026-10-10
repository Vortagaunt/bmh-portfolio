/**
 * Capture Mustang Studio for the deck: every template exported by the app's own
 * renderer, plus the screens the "Mustang Studio" slides crop from.
 *
 * Writes assets/studio/:
 *   templates.json            id, name, group, size, season and page count of every template
 *   tpl-<id>.jpg              each template (page 1), longest side 1500px
 *   ui-*.jpg                  1440x900 screens at 2x (game day, edit, export, brand check before/after,
 *                             marks, text, icons, templates, sizes — and from 1.6: fill, batch, carousel, seasons)
 *   sheet-staff-ids.jpg       a batch of staff IDs ganged on a Letter sheet with cut marks, as the PDF lays them out
 * Then: node deck/prepare-assets.mjs && node deck/render-slides.mjs && ...
 *
 * Run: node scripts/capture-mustang-studio.mjs "<path to Mustang Studio (Industry Black).html>"
 *   (the Industry Black web build, so headlines render in the real face; the
 *    screenshots are pictures of the app, the font file itself never ships)
 *   optional env: CHROME
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "assets", "studio");
const app = process.argv[2];
if (!app || !fs.existsSync(app)) { console.error("Pass the path to the Mustang Studio HTML file."); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true,
});
const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
// skip the first-run "Who are you?" screen and show the drawer as a coach sees it
await p.addInitScript(() => { try { localStorage.setItem("ms-who-seen", "1"); localStorage.setItem("ms-role", "coach"); } catch { /* storage blocked: the default role is fine */ } });
await p.goto("file:///" + path.resolve(app).replace(/\\/g, "/").replace(/^\//, ""), { waitUntil: "load" });
await p.waitForTimeout(1800);
await p.evaluate(() => closeModal());

const ui = async (name) => {
  await p.mouse.move(2, 898); await p.waitForTimeout(500);
  await sharp(await p.screenshot()).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(OUT, `ui-${name}.jpg`));
};
const load = (id) => p.evaluate(async (id) => {
  if (MS16.isFill()) MS16.fill(false);
  const t = TEMPLATES.find((x) => x.id === id);
  doc = t.build(); doc.name = t.name; sel.clear(); commit(); syncTop(); fitView(); renderInspector(); renderLayers(); scheduleCheck();
  if (doc.pages) MS16.goPage(0);
  await new Promise((r) => setTimeout(r, 700));
}, id);

/* 1. every template, through the app's own export renderer */
const list = await p.evaluate(() => TEMPLATES.map((t) => { const d = t.build(); return { id: t.id, name: t.name, group: t.group, fmt: t.fmt, season: t.season || null, pages: d.pages ? d.pages.length : 1 }; }));
fs.writeFileSync(path.join(OUT, "templates.json"), JSON.stringify(list, null, 1));
for (const t of list) {
  await load(t.id);
  const url = await p.evaluate(async () => {
    const s = Math.max(1, Math.min(4, Math.round(1500 / Math.max(doc.w, doc.h))));
    return (await renderOut(s, false, "image/png")).toDataURL("image/png");
  });
  await sharp(Buffer.from(url.split(",")[1], "base64")).flatten({ background: "#F1F2F0" })
    .resize(1500, 1500, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(OUT, `tpl-${t.id}.jpg`));
}
console.log(`templates : ${list.length}`);

/* 2. the screens */
await load("gameday"); await p.waitForTimeout(800); await ui("gameday");
await p.evaluate(() => { const l = doc.layers.find((l) => l.type === "text" && l.font === "display"); sel.clear(); sel.add(l.id); requestRender(); renderInspector(); renderLayers(); });
await p.waitForTimeout(800); await ui("edit");
await p.evaluate(() => { sel.clear(); requestRender(); renderInspector(); });
await p.click("#exportBtn"); await p.waitForTimeout(1000); await ui("export");
await p.evaluate(() => closeModal()); await p.waitForTimeout(400);

/* the brand check catching two mistakes, then one click per fix */
await load("gameday");
await p.evaluate(() => {
  for (const l of doc.layers) {
    if (l.type === "text" && l.font === "display") l.color = "#1C6E40";
    if (l.type === "mark" && l.file === "LRHS Emblem Mono.svg") l.rot = 8;
  }
  commit(); requestRender(); renderInspector(); runCheck();
});
await p.waitForTimeout(1500); await ui("check-before");
for (let i = 0; i < 4; i++) { const fix = await p.$("#insp .issue .fix"); if (!fix) break; await fix.click(); await p.waitForTimeout(900); }
await p.waitForTimeout(800); await ui("check-after");

for (const [label, name] of [["Marks", "marks"], ["Text", "text"], ["Icons", "icons"], ["Templates", "templates"]]) {
  await p.click(`#rail button:has-text("${label}")`); await p.waitForTimeout(700); await ui(name);
}
await p.click("#fmtBtn"); await p.waitForTimeout(700); await ui("sizes");
await p.evaluate(() => closeModal());

/* 1.6: the seasons in the templates drawer */
await p.evaluate(() => { const d = document.querySelector("#drawer"); const h = [...d.querySelectorAll("h3")].find((x) => x.textContent === "Seasons"); d.scrollTop = h.offsetTop - 60; });
await p.waitForTimeout(600); await ui("seasons");

/* 1.6: fill in the blanks */
await load("gameday");
await p.evaluate(() => MS16.fill(true)); await p.waitForTimeout(700);
await p.evaluate(() => { const b = [...document.querySelectorAll(".blank")].find((x) => /Headline/.test(x.querySelector("label").textContent)); const t = b.querySelector("textarea,input"); t.focus(); t.value = "Mustangs vs.\nLakewood"; t.dispatchEvent(new Event("input")); });
await p.waitForTimeout(800); await ui("fill");
await p.evaluate(() => { document.activeElement.blur(); MS16.fill(false); });

/* 1.6: a carousel, pages along the bottom */
await load("recap"); await p.evaluate(() => { const r = [...document.querySelectorAll("#rail button")].find((b) => b.textContent.includes("Templates")); if (!document.querySelector("#app").classList.contains("drawer-closed")) r.click(); });
await p.waitForTimeout(900); await ui("carousel");
await p.evaluate(() => { const r = [...document.querySelectorAll("#rail button")].find((b) => b.textContent.includes("Templates")); r.click(); });

/* 1.6: a batch from a spreadsheet, and the sheet it makes */
const STAFF = [["Name", "Title"], ["Ms. Rivera", "Math · Mathematics"], ["Mr. Okafor", "Director · Mustang Band"], ["Dr. Patel", "Principal · Administration"], ["Ms. Kim", "Counselor · Student Services"],
  ["Mr. Diaz", "Coach · Athletics"], ["Ms. Lee", "Librarian · Media Center"], ["Mr. Shah", "Teacher · Science"], ["Ms. Burke", "Registrar · Front Office"]];
await load("id-staff-front");
await p.evaluate(() => MS16.batch()); await p.waitForTimeout(500);
await p.fill(".modal textarea", STAFF.map((r) => r.join("\t")).join("\n")); await p.waitForTimeout(1200);
await p.evaluate(() => { const m = document.querySelector(".modal"); m.scrollTop = 260; });
await p.waitForTimeout(500); await ui("batch");
await p.evaluate(() => closeModal());
const sheet = await p.evaluate(async (rows) => {
  const f = FMT_BY_ID[doc.fmt], DPI = 150, b = 0.0625, fit = MS16._.sheetFit(f.inch[0], f.inch[1], b);
  const c = document.createElement("canvas"); c.width = fit.SW * DPI; c.height = fit.SH * DPI;
  const x = c.getContext("2d"); x.fillStyle = "#FFFFFF"; x.fillRect(0, 0, c.width, c.height);
  const gw = fit.cols * f.inch[0] + (fit.cols - 1) * fit.G, gh = fit.rows * f.inch[1] + (fit.rows - 1) * fit.G;
  const x0 = (fit.SW - gw) / 2, y0 = (fit.SH - gh) / 2;
  const base = MS16._.pageDoc(doc.page);
  rows.slice(1, 1 + fit.n).forEach(([name, title], k) => {
    const d = JSON.parse(JSON.stringify(base));
    for (const l of d.layers) { if (l.label === "Name") { l.text = name; MS16._.fitSlot(l); } if (l.label === "Title") { l.text = title; MS16._.fitSlot(l); } }
    const bd = MS16._.bleedDoc(d, b * (d.w / f.inch[0]));
    const pc = MS16._.renderSync(bd, (DPI * (f.inch[0] + 2 * b)) / bd.w);
    const col = k % fit.cols, row = Math.floor(k / fit.cols);
    x.drawImage(pc, (x0 + col * (f.inch[0] + fit.G) - b) * DPI, (y0 + row * (f.inch[1] + fit.G) - b) * DPI);
  });
  x.strokeStyle = "#000"; x.lineWidth = 1; const off = (b + 0.0625) * DPI, L = 0.25 * DPI;
  for (let col = 0; col < fit.cols; col++) for (const xx of [x0 + col * (f.inch[0] + fit.G), x0 + col * (f.inch[0] + fit.G) + f.inch[0]]) { x.beginPath(); x.moveTo(xx * DPI, y0 * DPI - off); x.lineTo(xx * DPI, y0 * DPI - off - L); x.moveTo(xx * DPI, (y0 + gh) * DPI + off); x.lineTo(xx * DPI, (y0 + gh) * DPI + off + L); x.stroke(); }
  for (let row = 0; row < fit.rows; row++) for (const yy of [y0 + row * (f.inch[1] + fit.G), y0 + row * (f.inch[1] + fit.G) + f.inch[1]]) { x.beginPath(); x.moveTo(x0 * DPI - off, yy * DPI); x.lineTo(x0 * DPI - off - L, yy * DPI); x.moveTo((x0 + gw) * DPI + off, yy * DPI); x.lineTo((x0 + gw) * DPI + off + L, yy * DPI); x.stroke(); }
  return c.toDataURL("image/png");
}, STAFF);
await sharp(Buffer.from(sheet.split(",")[1], "base64")).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(OUT, "sheet-staff-ids.jpg"));

const facts = await p.evaluate(() => ({ version: MS16.VERSION, templates: TEMPLATES.length, formats: FORMATS.length, styles: Object.keys(STYLES).length,
  icons: Object.keys(DATA.icons || {}).length, seasons: MS16._.THEMES.length }));
console.log("facts     :", facts, "— keep the numbers on the Mustang Studio slides in step with these");
await browser.close();
