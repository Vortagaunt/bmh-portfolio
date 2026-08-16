/**
 * Make the hand-off between the Next.js site and the two static LRHS pages
 * feel like one continuous document.
 *
 * Three things were breaking it:
 *
 *  1. Neither static page set a background on <html>, only on <body>. Between
 *     the outgoing page unloading and the new one painting, the browser shows
 *     its own white — a hard flash in the middle of an otherwise soft fade.
 *     That is very visible going into the brand system, which is near-black.
 *
 *  2. Every fade went to the colour of the page you were LEAVING. Since the
 *     case study is paper (#f1f1f1 or #0e0e10 by theme), the brand system is
 *     #0e0e10 and the website concept is #fbfbf9, at least one end of every
 *     journey cut to a different colour. Fades now go to the colour of the
 *     page you are ARRIVING at, so the cut lands on a matching frame.
 *
 *  3. There was no way back. Once on the brand system you could only use the
 *     browser's back button — the page had no link into the site at all.
 *
 * Like the animation layer, this has to live INSIDE the bundler template
 * payload: the loader does documentElement.replaceWith(payload), so anything
 * in the outer document is discarded on swap. Idempotent via MARKER.
 *
 * Run: node scripts/inject-lrhs-continuity.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const MARKER = "lrhs-cont-v1";

/** Per-page: the colour it paints, and where it should offer a way back. */
const PAGES = [
  {
    rel: "public/lrhs-brand-refresh.html",
    bg: "#0e0e10",
    dark: true,
    back: { href: "/case-study/lakewood-ranch-redesign", label: "Case study", place: "bar" },
  },
  {
    rel: "public/lrhs-brand-system/website-concept.html",
    bg: "#fbfbf9",
    dark: false,
    back: { href: "/lrhs-brand-refresh.html", label: "Brand system", place: "float" },
  },
];

const block = ({ bg, dark, back }) => {
  const glass = dark
    ? `background-color:rgba(44,44,52,.62);color:#ececee;border:1px solid rgba(255,255,255,.12);
       box-shadow:0 10px 30px -12px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.22);`
    : `background-color:rgba(255,255,255,.7);color:#181818;border:1px solid rgba(24,24,24,.1);
       box-shadow:0 10px 30px -14px rgba(16,16,20,.3),inset 0 1px 0 rgba(255,255,255,.9);`;

  return `
<style id="${MARKER}">
/* first paint is already this page's colour — no white frame mid-fade */
html { background: ${bg}; }
@keyframes lrhs-cont-in { from { opacity: 0; } to { opacity: 1; } }
body { animation: lrhs-cont-in 520ms cubic-bezier(.2,.7,.1,1) both; }

#lrhs-exit {
  position: fixed; inset: 0; z-index: 99999; pointer-events: none; opacity: 0;
  transition: opacity 420ms cubic-bezier(.4,0,.2,1);
}
#lrhs-exit.on { opacity: 1; pointer-events: auto; }

.lrhs-back {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 16px; border-radius: 999px;
  font-family: var(--mono, ui-monospace, monospace);
  font-size: 12px; letter-spacing: .13em; text-transform: uppercase;
  text-decoration: none; white-space: nowrap;
  transition: transform .5s cubic-bezier(.2,.7,.1,1), opacity .4s ease;
  ${glass}
}
.lrhs-back:hover { transform: translateY(-1px); }
.lrhs-back .a { transition: transform .5s cubic-bezier(.2,.7,.1,1); }
.lrhs-back:hover .a { transform: translateX(-3px); }
.lrhs-back--float {
  position: fixed; left: 20px; bottom: 20px; z-index: 60;
}
@supports (backdrop-filter: blur(18px)) {
  .lrhs-back { backdrop-filter: blur(18px) saturate(180%); }
}
@media (max-width: 700px) { .lrhs-back { font-size: 11px; padding: 8px 13px; } }
</style>
<script id="${MARKER}">
(function () {
  var BACK_HREF = ${JSON.stringify(back.href)};
  var BACK_LABEL = ${JSON.stringify(back.label)};
  var BACK_PLACE = ${JSON.stringify(back.place)};

  /* Where is this link taking us, and what colour does that page start on?
     Fading to the destination is the whole trick — fading to our own colour
     is what produced the cut. */
  function siteBg() {
    try { return localStorage.getItem('bmh-theme') === 'light' ? '#f1f1f1' : '#0e0e10'; }
    catch (e) { return '#0e0e10'; }
  }
  function destBg(href) {
    if (href.indexOf('website-concept') !== -1) return '#fbfbf9';
    if (href.indexOf('lrhs-brand-refresh') !== -1) return '#0e0e10';
    return siteBg();
  }

  var ov = null;
  function overlay() {
    if (!ov) { ov = document.createElement('div'); ov.id = 'lrhs-exit'; document.body.appendChild(ov); }
    return ov;
  }

  document.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.charAt(0) === '#') return;
    if (href.indexOf('://') !== -1) return;
    if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
    if (a.target === '_blank') return;
    e.preventDefault();
    var o = overlay();
    o.style.background = destBg(href);
    requestAnimationFrame(function () { o.classList.add('on'); });
    setTimeout(function () { window.location.href = href; }, 400);
  }, true);

  /* A way back into the site. Injected rather than written into the template
     markup — the payload is JSON-escaped and editing it by hand is how this
     page got broken once already. */
  function addBack() {
    if (document.querySelector('.lrhs-back')) return;
    var a = document.createElement('a');
    a.className = 'lrhs-back' + (BACK_PLACE === 'float' ? ' lrhs-back--float' : '');
    a.href = BACK_HREF;
    a.innerHTML = '<span class="a">\\u2190</span><span>' + BACK_LABEL + '</span>';
    if (BACK_PLACE === 'bar') {
      var bar = document.querySelector('.bar .in');
      if (bar) { a.style.marginRight = '18px'; bar.insertBefore(a, bar.firstChild); return; }
    }
    a.className = 'lrhs-back lrhs-back--float';
    document.body.appendChild(a);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addBack);
  else addBack();
  setTimeout(addBack, 600);
})();
</script>
`;
};

function inject(fileAbs, cfg) {
  let file = fs.readFileSync(fileAbs, "utf8");
  const re = /(<script[^>]*type="__bundler\/template"[^>]*>)([\s\S]*?)(<\/script>)/i;
  const m = file.match(re);
  if (!m) {
    console.log("  ! no template script found, skipping");
    return false;
  }
  const open = m[1], rawBody = m[2], close = m[3];
  let payload = JSON.parse(rawBody.trim());

  if (!/<\/head>/i.test(payload)) {
    console.log("  ! payload has no </head>, skipping");
    return false;
  }

  // Strip a previous run so re-running upgrades rather than duplicates.
  const before = payload.length;
  payload = payload
    .replace(/<style id="lrhs-cont[^"]*">[\s\S]*?<\/style>/gi, "")
    .replace(/<script id="lrhs-cont[^"]*">[\s\S]*?<\/script>/gi, "");
  if (payload.length !== before) console.log("  ~ removed prior continuity block");

  payload = payload.replace(/<\/head>/i, block(cfg) + "</head>");

  // Re-encode exactly as the animation layer does: stringify, then escape
  // every "</" so no literal </script> can close the template tag early.
  const newBody = JSON.stringify(payload).replace(/<\//g, "<\\/");
  file = file.replace(re, () => open + newBody + close);

  /* The OUTER document carries an older fade script. documentElement.replaceWith
     drops its <style>, but the listener it registered on `document` survives the
     swap — leaving two handlers racing to navigate. Remove it from the head that
     precedes the template. */
  const cut = file.indexOf(open);
  let head = file.slice(0, cut);
  const tail = file.slice(cut);
  const headBefore = head.length;
  head = head
    .replace(/<style>\s*@keyframes lrhs-page-fade-in[\s\S]*?<\/style>\s*/i, "")
    .replace(/<script>\s*document\.addEventListener\('click'[\s\S]*?<\/script>\s*/i, "");
  if (head.length !== headBefore) console.log("  ~ removed outer legacy fade layer");
  file = head + tail;

  fs.writeFileSync(fileAbs, file);

  // Integrity gate — the failure mode that broke this page before.
  const check = fs.readFileSync(fileAbs, "utf8").match(re);
  const parsed = JSON.parse(check[2].trim());
  if (/<\//.test(check[2])) throw new Error("raw </ survived in payload — would break the page");
  if (!parsed.includes(MARKER)) throw new Error("marker missing after write");
  return true;
}

let n = 0;
for (const cfg of PAGES) {
  const abs = path.join(root, cfg.rel);
  console.log(cfg.rel);
  if (!fs.existsSync(abs)) { console.log("  ! missing"); continue; }
  if (inject(abs, cfg)) { n++; console.log(`  + continuity layer (bg ${cfg.bg}, back -> ${cfg.back.href})`); }
}
console.log(`\ndone — patched ${n} file(s).`);
