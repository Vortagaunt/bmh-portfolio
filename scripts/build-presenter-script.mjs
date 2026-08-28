/**
 * The presenter script, as a standalone HTML file and a printable PDF.
 *
 * assets/script/presenter-script.html is the source of truth. It was first
 * extracted from the published artifact (stripping the artifact frame runtime
 * so the HTML stands alone), and is edited directly from then on — running this
 * script again only re-prints the PDF. Pass --extract to pull a fresh copy out
 * of an artifact export, which OVERWRITES the HTML.
 *
 * The PDF is produced the way the resume's is: print the page in a real browser
 * rather than re-laying it out for paper. Print rules do three things the screen
 * version doesn't need — force the light palette (a dark page wastes ink and
 * reads badly on paper), keep each beat and Q&A card whole rather than letting
 * one split across a page break, and hand margins to @page.
 *
 * Run: node scripts/build-presenter-script.mjs
 *      node scripts/build-presenter-script.mjs --extract <artifact-export.html>
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(root, "assets", "script");
const HTML_OUT = path.join(OUT_DIR, "presenter-script.html");
const PDF_OUT = path.join(OUT_DIR, "presenter-script.pdf");
fs.mkdirSync(OUT_DIR, { recursive: true });

const extract = process.argv.includes("--extract");
const exportPath =
  process.argv[process.argv.indexOf("--extract") + 1] ||
  path.join(OUT_DIR, ".artifact-source.html");

const PRINT_CSS = `
<style>
@page { size: Letter portrait; margin: 14mm 15mm; }
@media print {
  /* paper is white and light, whatever theme the reader's screen was in */
  :root, :root[data-theme="dark"] {
    --ground:#FFFFFF; --surface:#FFFFFF;
    --ink:#12201A; --muted:#4A5A52;
    --rule:rgba(18,32,26,.22); --rule-soft:rgba(18,32,26,.13);
    --green:#0F5A34; --red:#A82424; --shadow:none;
  }
  body { background:#fff; font-size:10.5pt; }
  .wrap { max-width:none; padding:0; }

  /* a beat split across a page break is unusable while presenting */
  .beat, .q, .primer { break-inside:avoid; page-break-inside:avoid; }
  h1, .beat h3, .sec { break-after:avoid; page-break-after:avoid; }

  header { padding-bottom:14pt; margin-bottom:0; }
  h1 { font-size:28pt; }
  .standfirst { font-size:10.5pt; }
  .runtime { margin-top:10pt; }
  .runtime span { padding:3px 9px; font-size:8.5pt; }
  .primer { margin:16pt 0 0; padding:12pt 14pt; box-shadow:none;
            border:1px solid var(--rule-soft); }
  .primer h2 { font-size:8.5pt; margin-bottom:8pt; }
  .primer ol { gap:6pt; }
  .beat { padding:14pt 0 0; }
  .beat h3 { font-size:14pt; }
  .say { font-size:11.5pt; padding-left:10pt; border-left-width:2px; }
  .do  { font-size:9.5pt; padding-left:13pt; }
  .say + .say { margin-top:6pt; }
  section > h2.sec { margin:20pt 0 0; padding-top:14pt; font-size:8.5pt; }
  .qa { gap:10pt; }
  .q { padding:11pt 13pt; }
  .q p:first-child { font-size:10.5pt; }
  .q p:last-child { font-size:10pt; }
  footer { margin-top:20pt; padding-top:12pt; font-size:10pt; }
  a { color:var(--ink); text-decoration:none; }
}
</style>`;

if (extract || !fs.existsSync(HTML_OUT)) {
  if (!fs.existsSync(exportPath)) {
    console.error("No artifact export to extract from:\n  " + exportPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(exportPath, "utf8");
  const START = "<title>Mustangs Ahead Run-Through</title>";
  const i = raw.indexOf(START);
  if (i < 0) { console.error("Title marker not found — wrong file?"); process.exit(1); }
  const j = raw.lastIndexOf("</body>");
  const inner = raw.slice(i, j > i ? j : undefined).trim();
  const cut = inner.indexOf("</style>") + 8;

  fs.writeFileSync(HTML_OUT, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${inner.slice(0, cut)}
${PRINT_CSS}
</head>
<body>
${inner.slice(cut).trim()}
</body>
</html>`);
  console.log("html : extracted from artifact export");
} else {
  console.log("html : using existing presenter-script.html");
}
console.log(`       ${path.relative(root, HTML_OUT)}  ${(fs.statSync(HTML_OUT).size / 1024).toFixed(0)}KB`);

/* ---- print it, the way the resume is printed ---- */
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
await page.goto("file:///" + HTML_OUT.split(path.sep).join("/"), { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.emulateMedia({ media: "print" });
await page.waitForTimeout(500);

await page.pdf({
  path: PDF_OUT,
  format: "Letter",
  printBackground: true,
  margin: { top: "14mm", right: "15mm", bottom: "16mm", left: "15mm" },
  displayHeaderFooter: true,
  headerTemplate: "<div></div>",
  footerTemplate: `<div style="width:100%;font-family:-apple-system,sans-serif;font-size:8pt;
    color:#7A8A82;padding:0 15mm;display:flex;justify-content:space-between;">
    <span>Mustangs Ahead &mdash; presenter script</span>
    <span class="pageNumber"></span></div>`,
});
await browser.close();

const pdfRaw = fs.readFileSync(PDF_OUT, "latin1");
console.log(`pdf  : ${path.relative(root, PDF_OUT)}  ${(fs.statSync(PDF_OUT).size / 1024).toFixed(0)}KB  ` +
            `${(pdfRaw.match(/\/Type\s*\/Page[^s]/g) || []).length} pages`);
