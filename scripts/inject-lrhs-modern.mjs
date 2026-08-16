/**
 * The modern surface layer for the LRHS brand system page — the same glass
 * recipe as the main site.
 *
 * Injected before </body> rather than </head> on purpose: the page's restyle
 * block is the last <style> in the body, and a head rule of equal specificity
 * would lose to it. Anything that has to beat `.bar{background:...}` must come
 * after it.
 *
 * Idempotent via MARKER, and it also strips the one-off block that was first
 * appended by hand so re-running upgrades cleanly.
 *
 * Run: node scripts/inject-lrhs-modern.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const MARKER = "lrhs-modern-v2";
const FILES = ["public/lrhs-brand-refresh.html"];

const ENH = `
<style id="${MARKER}">
/* ---- modern surface pass — same glass recipe as the main site ---------- */

/* Ambient field, in Mustang green rather than the site's blue and pink.
   Fixed, so it holds still while the document scrolls. */
body{
  background-color:var(--bk);
  background-image:
    radial-gradient(38% 42% at 12% 8%,rgba(46,168,102,.16),transparent 70%),
    radial-gradient(32% 38% at 88% 16%,rgba(46,168,102,.09),transparent 70%),
    radial-gradient(44% 46% at 64% 96%,rgba(60,150,190,.10),transparent 72%);
  background-attachment:fixed;
}

/* Header: the site's floating capsule instead of a bar welded to the top.

   The inset lives on .bar as PADDING, not as margin on .bar .in. With no
   padding on the sticky parent the child's margin-top collapsed straight out
   of it — .bar ended up exactly as tall as .in — so once the bar stuck, its
   border box pinned to top:0 and the capsule sat flush against the viewport
   edge with its top corners clipped. Padding cannot collapse. */
.bar{
  background:transparent;border-bottom:none;backdrop-filter:none;
  padding:8px 16px;
}
.bar .in{
  max-width:none;margin:0;padding:13px 26px;border-radius:20px;
  background-color:rgba(44,44,52,.55);
  background-image:linear-gradient(180deg,rgba(255,255,255,.13),rgba(255,255,255,.03) 45%,rgba(255,255,255,0));
  border:1px solid rgba(255,255,255,.10);
  box-shadow:0 16px 44px -16px rgba(0,0,0,.8),0 3px 12px -5px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.22);
}
@supports (backdrop-filter:blur(20px)){
  .bar .in{backdrop-filter:blur(20px) saturate(180%);}
}

/* The hairline tables keep their internal rules — that scored grid is the
   point of a spec sheet — but each block now has a rounded edge and sits
   above the page instead of being cut into it. */
.pillars,.logos,.voicegrid,.cols,.typeblock{
  border-radius:22px;overflow:hidden;
  border:1px solid rgba(255,255,255,.10);
  box-shadow:0 18px 48px -20px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,255,255,.10);
}
.typeblock{border-radius:20px;margin-bottom:16px;}

/* colour chips read as swatches rather than table cells */
.chip{border-radius:14px;}

/* the closing CTA gets the same soft corner */
.door{border-radius:26px;overflow:hidden;}

/* the responsive rules below set .bar .in left/right padding — that is the
   capsule's inner padding now, which is what we want; the outer inset stays
   on .bar. Restated here so it survives being overridden above. */
@media (max-width:700px){
  .bar{padding:6px 10px;}
  .bar .in{padding-top:11px;padding-bottom:11px;}
}
</style>
`;

function inject(fileAbs) {
  let file = fs.readFileSync(fileAbs, "utf8");
  const re = /(<script[^>]*type="__bundler\/template"[^>]*>)([\s\S]*?)(<\/script>)/i;
  const m = file.match(re);
  if (!m) { console.log("  ! no template script found, skipping"); return false; }
  const open = m[1], close = m[3];
  let payload = JSON.parse(m[2].trim());

  if (!/<\/body>/i.test(payload)) { console.log("  ! payload has no </body>, skipping"); return false; }

  // Drop a previous run of this layer.
  const b1 = payload.length;
  payload = payload.replace(/<style id="lrhs-modern[^"]*">[\s\S]*?<\/style>/gi, "");
  if (payload.length !== b1) console.log("  ~ removed prior modern block");

  // Drop the original hand-appended block, which lived inside the restyle
  // <style> rather than in a tagged one of its own.
  const b2 = payload.length;
  payload = payload.replace(/\n*\/\* ---- modern surface pass[\s\S]*?(?=\n*<\/style>)/, "");
  if (payload.length !== b2) console.log("  ~ removed hand-appended block");

  payload = payload.replace(/<\/body>/i, ENH + "</body>");

  const newBody = JSON.stringify(payload).replace(/<\//g, "<\\/");
  file = file.replace(re, () => open + newBody + close);
  fs.writeFileSync(fileAbs, file);

  const check = fs.readFileSync(fileAbs, "utf8").match(re);
  if (/<\//.test(check[2])) throw new Error("raw </ survived in payload — would break the page");
  const parsed = JSON.parse(check[2].trim());
  if (!parsed.includes(MARKER)) throw new Error("marker missing after write");
  if ((parsed.match(/modern surface pass/g) || []).length !== 1)
    throw new Error("modern layer is duplicated");
  return true;
}

let n = 0;
for (const rel of FILES) {
  const abs = path.join(root, rel);
  console.log(rel);
  if (!fs.existsSync(abs)) { console.log("  ! missing"); continue; }
  if (inject(abs)) { n++; console.log("  + modern surface layer"); }
}
console.log(`\ndone — patched ${n} file(s).`);
