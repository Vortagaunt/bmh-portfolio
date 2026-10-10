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
 * Two files come out of one render:
 *   Bronx-Hanratty-LRHS-Presentation-and-Marks.pdf  slides, marks, then the
 *       presenter script at the back (for Bronx — it has the Q&A and the stage
 *       directions in it)
 *   Bronx-Hanratty-LRHS-Leave-Behind.pdf            the same without the script:
 *       the copy to hand the principal
 * Both carry bookmarks (every section, slide, family and mark), a clickable QR
 * code and links (anything marked data-link on a slide, read from
 * slides-png/links.json), and real document properties. The script pages are
 * assets/script/presenter-script.pdf (node ../scripts/build-presenter-script.mjs).
 *
 * Run: node build-pdf.mjs        (after assemble.js — it reads slides-jpg)
 */
import { chromium } from "playwright-core";
import { PDFDocument, PDFName, PDFHexString, PDFString } from "pdf-lib";
import fs from "node:fs";
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "Bronx-Hanratty-LRHS-Presentation-and-Marks.pdf");
const LEAVE = path.join(here, "Bronx-Hanratty-LRHS-Leave-Behind.pdf");
const SCRIPT_PDF = path.join(here, "..", "assets", "script", "presenter-script.pdf");
const readJson = (f, d) => { const p = path.join(here, "slides-png", f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : d; };
const META = readJson("meta.json", []), LINKS = readJson("links.json", {});
const PW = 1056, PH = 594;

const RED = "#A82424", GREEN = "#003C24", GREEN_DEEP = "#05281A";
const PAPER = "#F1F2F0", INK = "#0C0C0C", GREY = "#5A6A61";
const ONGREEN = "#D6E2DA", LR_MUTED = "#7E958A";

/* Read from src/data/lrhs-marks.json — the same catalogue the slides and the site
   use — rather than kept as a second hand-written list here. The old list was a
   copy, and copies are how the deck and the PDF would drift apart.
   Row shape: file slug, display name, category, note, ground, status. */
const CAT = JSON.parse(fs.readFileSync(path.join(here, "..", "src", "data", "lrhs-marks.json"), "utf8"));
const slugOf = (file) => file.replace(/\.svg$/, "").replace(/ /g, "-");
const famName = (id) => CAT.families.find((f) => f.id === id).name;
const MARKS = [
  ...CAT.marks.map((m) => [slugOf(m.file), m.name, `${famName(m.family)} · ${m.use}`, m.note, m.ground, "live", m.family]),
  ...CAT.retired.map((m) => [slugOf(m.file), m.name, "Retired", m.note, "light", "retired", "retired"]),
];
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
  "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const words = (k) => (k < 20 ? ONES[k] : TENS[Math.floor(k / 10)] + (k % 10 ? "-" + ONES[k % 10] : ""));
const capw = (k) => { const w = words(k); return w[0].toUpperCase() + w.slice(1); };
const LIVE = CAT.marks.length, RETIRED = CAT.retired.length, FAMS = CAT.families.length;

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

const slidePage = (f, dir = "slides-jpg") => `<div class="pg"><img class="full" src="${dir}/${f}"></div>`;

const dividerPage = () => `<div class="pg div">
  <div class="kick"><span class="dot">M</span><span class="kt" style="color:${LR_MUTED}">The mark library</span></div>
  <div class="nm">Every mark, one to a page</div>
  <div class="note">The full set at reproduction size, each with the ground it belongs on,
    what it is for, and whether it is live or retired. Supplied as SVG — never redrawn,
    recoloured or stretched.</div>
  <div class="ital">${capw(LIVE)} live marks in ${words(FAMS)} families, and ${words(RETIRED)} retired ones kept for reference.</div>
</div>`;

const scriptDivider = () => `<div class="pg div">
  <div class="kick"><span class="dot">S</span><span class="kt" style="color:${LR_MUTED}">Presenter script</span></div>
  <div class="nm">For Bronx &mdash; not for handing out</div>
  <div class="note">What to say on every slide, what to do while you say it, the questions to
    expect and what to offer if the room goes quiet. The same lines are in the deck's speaker
    notes, so Presenter View shows them slide by slide.</div>
  <div class="ital">The copy for the principal is Bronx-Hanratty-LRHS-Leave-Behind.pdf &mdash; everything before this page.</div>
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
const doc = (pages) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
${pages}
</body></html>`;
const html = doc(`${slides.map((f) => slidePage(f)).join("\n")}
${dividerPage()}
${MARKS.map(markPage).join("\n")}`);

const browser = await chromium.launch({
  executablePath: process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: PW, height: PH } });
const missing = [];
page.on("requestfailed", (r) => missing.push(r.url().split("/").pop()));
async function print(name, content) {
  const tmp = path.join(here, `_pdf_${name}.html`);
  fs.writeFileSync(tmp, content);
  await page.goto("file:///" + tmp.split(path.sep).join("/"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  const buf = await page.pdf({ width: `${PW}px`, height: `${PH}px`, printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  if (process.env.KEEP) console.log("kept:", tmp); else fs.unlinkSync(tmp);
  return buf;
}
const mainPdf = await print("main", html);
/* The leave-behind is the copy that gets emailed, so its slides are lighter:
   2560px across the 11in page is still ~230dpi, and it keeps the file under the
   25MB most mail services allow. The presenter edition keeps the 4K JPGs. */
const LIGHT = path.join(here, "slides-jpg", "light");
fs.mkdirSync(LIGHT, { recursive: true });
for (const f of slides) {
  await sharp(path.join(here, "slides-jpg", f)).resize({ width: 2560, kernel: "lanczos3" })
    .jpeg({ quality: 84, chromaSubsampling: "4:4:4", mozjpeg: true }).toFile(path.join(LIGHT, f));
}
const lightPdf = await print("light", doc(`${slides.map((f) => slidePage(f, "slides-jpg/light")).join("\n")}
${dividerPage()}
${MARKS.map(markPage).join("\n")}`));
const dividerPdf = await print("script", doc(scriptDivider()));
await browser.close();

/* ---- bookmarks: sections → slides, then the library → families → marks ---- */
function addOutline(pdf, items) {
  const ctx = pdf.context, pages = pdf.getPages();
  const rootRef = ctx.nextRef();
  const make = (list, parentRef) => {
    const refs = list.map(() => ctx.nextRef());
    let count = 0;
    list.forEach((it, i) => {
      const f = { Title: PDFHexString.fromText(it.title), Parent: parentRef, Dest: [pages[it.page].ref, "Fit"] };
      if (i > 0) f.Prev = refs[i - 1];
      if (i < list.length - 1) f.Next = refs[i + 1];
      if (it.children && it.children.length) {
        const sub = make(it.children, refs[i]);
        f.First = sub.first; f.Last = sub.last; f.Count = it.open ? sub.count : -sub.count;
        if (it.open) count += sub.count;
      }
      ctx.assign(refs[i], ctx.obj(f));
      count += 1;
    });
    return { first: refs[0], last: refs[refs.length - 1], count };
  };
  const top = make(items, rootRef);
  ctx.assign(rootRef, ctx.obj({ Type: "Outlines", First: top.first, Last: top.last, Count: top.count }));
  pdf.catalog.set(PDFName.of("Outlines"), rootRef);
  pdf.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}
function outlineItems(withScript) {
  const items = [];
  slides.forEach((f, i) => {
    const m = META[i] || { title: `Slide ${i + 1}`, section: "Slides" };
    let sec = items[items.length - 1];
    if (!sec || sec.title !== m.section) items.push((sec = { title: m.section, page: i, open: true, children: [] }));
    sec.children.push({ title: `${i + 1}  ${m.title}`, page: i });
  });
  const lib = { title: "The mark library", page: slides.length, open: false, children: [] };
  MARKS.forEach((row, k) => {
    const famId = row[6], pageNo = slides.length + 1 + k;
    let fam = lib.children[lib.children.length - 1];
    if (!fam || fam.id !== famId) {
      const name = famId === "retired" ? "Retired" : famName(famId);
      lib.children.push((fam = { id: famId, title: name, page: pageNo, children: [] }));
    }
    fam.children.push({ title: row[1], page: pageNo });
  });
  for (const fam of lib.children) fam.title += `  (${fam.children.length})`;
  items.push(lib);
  if (withScript) items.push({ title: "Presenter script", page: slides.length + 1 + MARKS.length });
  return items;
}
/* the QR code and the addresses on the slides, as links */
function addLinks(pdf) {
  const ctx = pdf.context, pages = pdf.getPages();
  let n = 0;
  for (const [num, list] of Object.entries(LINKS)) {
    const pg = pages[Number(num) - 1];
    if (!pg) continue;
    const { width, height } = pg.getSize();
    for (const l of list) {
      const x1 = (l.x / 3840) * width, x2 = ((l.x + l.w) / 3840) * width;
      const y1 = height - ((l.y + l.h) / 2160) * height, y2 = height - (l.y / 2160) * height;
      const annot = ctx.obj({ Type: "Annot", Subtype: "Link", Rect: [x1, y1, x2, y2], Border: [0, 0, 0],
        A: { Type: "Action", S: "URI", URI: PDFString.of(l.href) } });
      pg.node.addAnnot(ctx.register(annot));
      n++;
    }
  }
  return n;
}
async function build(file, withScript) {
  const pdf = await PDFDocument.create();
  const add = async (bytes) => { const src = await PDFDocument.load(bytes); (await pdf.copyPages(src, src.getPageIndices())).forEach((p) => pdf.addPage(p)); };
  await add(withScript ? mainPdf : lightPdf);
  if (withScript) {
    await add(dividerPdf);
    if (fs.existsSync(SCRIPT_PDF)) await add(fs.readFileSync(SCRIPT_PDF));
    else console.log("  ! no presenter-script.pdf — run node ../scripts/build-presenter-script.mjs");
  }
  const links = addLinks(pdf);
  addOutline(pdf, outlineItems(withScript));
  pdf.setTitle(withScript ? "Lakewood Ranch High School — A Mustang Brand System (presenter edition)"
    : "Lakewood Ranch High School — A Mustang Brand System", { showInWindowTitleBar: true });
  pdf.setAuthor("Bronx Hanratty");
  pdf.setSubject(`The presentation for the principal, then all ${LIVE} marks one to a page. Concept work · not affiliated with the school district.`);
  pdf.setKeywords(["Lakewood Ranch High School", "Mustangs", "brand system", "Mustang Studio", "bronxhanratty.me"]);
  pdf.setCreator("deck/build-pdf.mjs");
  pdf.setProducer("Chrome + pdf-lib");
  pdf.setLanguage("en-US");
  fs.writeFileSync(file, await pdf.save());
  const mb = (fs.statSync(file).size / 1048576).toFixed(2);
  console.log(`${path.basename(file)}  ${pdf.getPageCount()} pages, ${links} links, bookmarks  ${mb}MB`);
}

await build(OUT, true);
await build(LEAVE, false);
console.log(`  ${slides.length} slides + 1 divider + ${MARKS.length} marks` + (fs.existsSync(SCRIPT_PDF) ? " (+ script divider + presenter script in the presenter edition)" : ""));
console.log("missing assets:", missing.length ? [...new Set(missing)] : "none");
