/* Printable PDF: every pitch slide, then one page per mark.
 *
 * Pages are 11 x 6.1875in — exactly 16:9 and exactly Letter width, so slides sit
 * full-bleed with no white bands and it prints on Letter landscape without
 * scaling. The CSS canvas is authored at the page's own pixel size (1056 x 594 =
 * 11in at 96dpi) and page.pdf() takes NO scale option: an earlier version
 * authored at 1600x900 and passed scale:0.66, which Chrome applied on top of its
 * own layout width, and every page came out two-thirds size in the corner.
 *
 * Slides go in as the JPGs assemble.js already wrote — 3840px across an 11in
 * page is ~350dpi. Mark pages are real HTML so their type stays vector.
 *
 * Run: node build-pdf.mjs        (after assemble.js — it reads slides-jpg)
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "Bronx-Hanratty-LRHS-Pitch-and-Marks.pdf");
const PW = 1056, PH = 594;

const RED = "#A82424", GREEN = "#003C24", GREEN_DEEP = "#05281A";
const PAPER = "#F1F2F0", INK = "#0C0C0C", GREY = "#5A6A61";
const ONGREEN = "#D6E2DA", LR_MUTED = "#7E958A";

/* file, display name, category, note, ground, status */
const MARKS = [
  ["LRHS-Full-Logo-1","Full Logo 1","Primary lockup","The stacked lockup. Default for official and formal use — letterheads, programmes, anything that speaks for the school as a whole.","light","live"],
  ["LRHS-Full-Logo-2","Full Logo 2","Horizontal lockup","The horizontal alternative, for wide and shallow spaces: banners, web headers, the top of a form.","light","live"],
  ["LRHS-Full-Logo-3","Full Logo 3","Horizontal — wide","The widest lockup. For the shallowest spaces, where even the horizontal is too tall.","light","live"],
  ["LRHS-Emblem","Emblem","Athletics","The everyday mark, and the one most people will recognise. Full colour, on light grounds.","light","live"],
  ["LRHS-Emblem-Black","Emblem — Black","One colour","Single-colour reproduction: embroidery, etching, laser, and any print that cannot hold two inks.","light","live"],
  ["LRHS-Emblem-White","Emblem — White","Reversed","For dark and green grounds only. Never place the reversed mark on a light background.","dark","live"],
  ["LRHS-Emblem-No-Horse","Emblem — No Horse","Reduction","For sizes where the horse would not survive — small embroidery, favicons, stitched tags.","light","live"],
  ["LRHS-Horse","Horse","Icon / watermark","The mustang alone. App icons, award glyphs, and large-scale watermarks behind other artwork.","light","live"],
  ["LRHS-Band-1","Band 1","Programme lockup","The band programme lockup. Uniforms, trailers, concert programmes, travel cases.","light","live"],
  ["LRHS-Band-2","Band 2","Programme — short","A shorter band lockup for narrow applications where the full version will not fit.","light","live"],
  ["LRHS-Mustangs-Ahead-1","Mustangs Ahead I","Spirit mark","Square spirit mark. Social avatars, stickers, spirit wear, anywhere a badge is wanted.","light","live"],
  ["LRHS-Mustangs-Ahead-2","Mustangs Ahead II","Spirit mark","The circular cut of the same mark, for round crops and stamps.","light","live"],
  ["LRHS-Retro","Retro","Heritage","Heritage wordmark. Occasional and throwback use — reunions, anniversaries, vintage spirit wear.","light","live"],
  ["I-Love-LRHS","I ♥ LRHS","Community","Community and spirit use only. Not a substitute for the emblem on official material.","light","live"],
  ["Old-LRHS-Emblem","Old Emblem","Retired","The previous emblem. Kept on file so it can be recognised and replaced — not for use in new work.","light","retired"],
  ["Old-LRHS-Horse","Old Horse","Retired","A previous horse drawing. Reference only.","light","retired"],
  ["Old-LRHS-Horse-2","Old Horse II","Retired","A previous horse drawing. Reference only.","light","retired"],
  ["Old-LRHS-Horse-3","Old Horse III","Retired","A previous horse drawing. Reference only.","light","retired"],
];

const CSS = `
@font-face{font-family:'Bricolage';src:url('fonts/BricolageGrotesque.ttf');font-weight:200 800;}
@font-face{font-family:'InterV';src:url('fonts/Inter.ttf');font-weight:100 900;}
@font-face{font-family:'Instrument';src:url('fonts/InstrumentSerifItalic.ttf');font-style:italic;}
*{margin:0;padding:0;box-sizing:border-box;}
@page{size:${PW}px ${PH}px;margin:0;}
html,body{width:${PW}px;}
body{font-family:'InterV',sans-serif;-webkit-font-smoothing:antialiased;}
.pg{width:${PW}px;height:${PH}px;position:relative;overflow:hidden;
    page-break-after:always;break-after:page;}
.pg:last-child{page-break-after:auto;break-after:auto;}
.pg img.full{width:${PW}px;height:${PH}px;object-fit:cover;display:block;}
.mk{display:flex;gap:38px;padding:42px 56px;align-items:center;}
.mk.light{background:${PAPER};color:${INK};}
.mk.dark{background:${GREEN_DEEP};color:#FCFCFC;}
.col{flex:0 0 320px;display:flex;flex-direction:column;height:100%;padding:10px 0;}
.kick{display:flex;align-items:center;gap:10px;margin-bottom:auto;}
.dot{width:24px;height:24px;border-radius:50%;background:${RED};color:#fff;font-size:9px;
     font-weight:700;display:flex;align-items:center;justify-content:center;
     font-variant-numeric:tabular-nums;flex:0 0 auto;}
.kt{font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;}
.mk.light .kt{color:${GREY};} .mk.dark .kt{color:${LR_MUTED};}
.nm{font-family:'Bricolage',sans-serif;font-weight:700;letter-spacing:-.03em;
    font-size:44px;line-height:1.02;margin-bottom:10px;}
.cat{font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;
     color:${RED};margin-bottom:16px;}
.note{font-size:14px;line-height:1.55;max-width:300px;}
.mk.light .note{color:${GREY};} .mk.dark .note{color:${ONGREEN};}
.meta{margin-top:26px;padding-top:18px;display:flex;flex-direction:column;gap:9px;}
.mk.light .meta{border-top:1px solid rgba(12,12,12,.14);}
.mk.dark .meta{border-top:1px solid rgba(255,255,255,.16);}
.file{font-size:11.5px;letter-spacing:.01em;}
.mk.light .file{color:${INK};} .mk.dark .file{color:#FCFCFC;}
.pill{align-self:flex-start;font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;
      font-weight:700;border-radius:999px;padding:5px 11px;}
.pill.live{background:${GREEN};color:#fff;}
.mk.dark .pill.live{background:#2EA866;color:#04231A;}
.pill.retired{background:rgba(168,36,36,.12);color:${RED};border:1px solid ${RED};}
.mk.dark .pill.retired{background:rgba(226,96,78,.14);color:#E2604E;border-color:#E2604E;}
.panel{flex:1;height:100%;border-radius:15px;display:flex;align-items:center;
       justify-content:center;padding:42px;}
.mk.light .panel{background:#FFFFFF;box-shadow:0 1px 2px rgba(12,12,12,.06),
       0 14px 32px -18px rgba(12,12,12,.3);}
.mk.dark .panel{background:${GREEN};box-shadow:0 16px 40px -20px rgba(0,0,0,.8),
       inset 0 0 0 1px rgba(255,255,255,.1);}
.panel img{max-width:100%;max-height:100%;object-fit:contain;}
.div{background:${GREEN_DEEP};color:#FCFCFC;display:flex;flex-direction:column;
     justify-content:center;padding:42px 56px;}
.div .nm{font-size:60px;margin-bottom:18px;}
.div .note{color:${ONGREEN};font-size:17px;max-width:620px;}
.div .ital{font-family:'Instrument',serif;font-style:italic;font-size:15px;
     color:${LR_MUTED};margin-top:20px;}
.div .kick{margin:0 0 24px;}
`;

const slidePage = (f) => `<div class="pg"><img class="full" src="slides-jpg/${f}"></div>`;

const dividerPage = () => `<div class="pg div">
  <div class="kick"><span class="dot">M</span><span class="kt" style="color:${LR_MUTED}">The mark library</span></div>
  <div class="nm">Every mark, one to a page</div>
  <div class="note">The full set at reproduction size, each with the ground it belongs on,
    what it is for, and whether it is live or retired. Supplied as SVG — never redrawn,
    recoloured or stretched.</div>
  <div class="ital">Eighteen marks. Thirteen live, five retired and kept for reference.</div>
</div>`;

const markPage = ([file, name, cat, note, ground, status], i) => `
<div class="pg mk ${ground}">
  <div class="col">
    <div class="kick">
      <span class="dot">${String(i + 1).padStart(2, "0")}</span>
      <span class="kt">Mark ${i + 1} of ${MARKS.length}</span>
    </div>
    <div class="nm">${name}</div>
    <div class="cat">${cat}</div>
    <div class="note">${note}</div>
    <div class="meta">
      <span class="file">${file.replace(/-/g, " ")}.svg</span>
      <span class="pill ${status}">${status === "live" ? "Approved for use" : "Retired — reference only"}</span>
    </div>
  </div>
  <div class="panel"><img src="img/marks/${file}.png" alt="${name}"></div>
</div>`;

const slides = fs.readdirSync(path.join(here, "slides-jpg")).filter((f) => f.endsWith(".jpg")).sort();
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
${slides.map(slidePage).join("\n")}
${dividerPage()}
${MARKS.map(markPage).join("\n")}
</body></html>`;

const tmp = path.join(here, "_pdf.html");
fs.writeFileSync(tmp, html);

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: PW, height: PH } });
const missing = [];
page.on("requestfailed", (r) => missing.push(r.url().split("/").pop()));

await page.goto("file:///" + tmp.split(path.sep).join("/"), { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(700);

await page.pdf({
  path: OUT, width: `${PW}px`, height: `${PH}px`, printBackground: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});

if (process.env.KEEP) console.log("kept:", tmp); else fs.unlinkSync(tmp);
const mb = (fs.statSync(OUT).size / 1048576).toFixed(2);
console.log(`${path.basename(OUT)}  ${slides.length} slides + 1 divider + ${MARKS.length} marks = ${slides.length + 1 + MARKS.length} pages  ${mb}MB`);
console.log("missing assets:", missing.length ? [...new Set(missing)] : "none");
await browser.close();
