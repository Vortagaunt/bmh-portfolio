/**
 * Inject a fluid scroll-reveal + micro-interaction layer into the two static
 * LRHS pages. These are single-file bundler exports whose loader does
 * `document.documentElement.replaceWith(templatePayload)` — so anything added
 * to the OUTER document is wiped on swap. The enhancement therefore has to live
 * INSIDE the template payload (the <script type="__bundler/template"> JSON
 * string), injected just before its </head>.
 *
 * Re-run safely any time: it is idempotent via the MARKER below. Bump the
 * marker version to replace an older injected block.
 *
 * Run: node scripts/inject-lrhs-animations.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const FILES = [
  "public/lrhs-brand-refresh.html",
  "public/lrhs-brand-system/website-concept.html",
];

const MARKER = "lrhs-anim-v1";

const ENH = `
<style id="${MARKER}">
/* ===== LRHS fluid animation layer (${MARKER}) ===== */
@media (prefers-reduced-motion: no-preference) {
  .r-anim {
    transition: opacity 1s cubic-bezier(.2,.7,.1,1),
                transform 1s cubic-bezier(.2,.7,.1,1),
                filter 1s cubic-bezier(.2,.7,.1,1);
    will-change: opacity, transform, filter;
  }
  .r-hide { opacity: 0; transform: translateY(26px); filter: blur(7px); }
  .r-in   { opacity: 1; transform: none;             filter: blur(0); }

  /* Hover micro-interactions — additive, layout-safe (transform/shadow only) */
  .lg .stage { overflow: hidden; }
  .lg .stage img { transition: transform .7s cubic-bezier(.2,.7,.1,1); }
  .lg:hover .stage img { transform: scale(1.06); }

  .cols .col .chip { transition: filter .5s ease, transform .6s cubic-bezier(.2,.7,.1,1); }
  .cols .col:hover .chip { filter: brightness(1.12) saturate(1.05); }

  .pillars .p { transition: background-color .5s ease, transform .5s cubic-bezier(.2,.7,.1,1); }
  .pillars .p:hover { background-color: rgba(255,255,255,.035); }

  #iconwrap .ic { transition: transform .5s cubic-bezier(.2,.7,.1,1), color .4s ease; }
  #iconwrap .ic:hover { transform: scale(1.18); }

  .hero .scroll { transition: transform .5s cubic-bezier(.2,.7,.1,1); }
  .hero .scroll:hover { transform: translateY(4px); }

  /* website-concept cards */
  .ncard, .tcard, .rec {
    transition: transform .55s cubic-bezier(.2,.7,.1,1), box-shadow .55s ease;
  }
  .ncard:hover, .tcard:hover, .rec:hover {
    transform: translateY(-5px);
    box-shadow: 0 18px 42px rgba(0,0,0,.28);
  }
  .btn, .icon-btn {
    transition: transform .4s cubic-bezier(.2,.7,.1,1), box-shadow .4s ease, background-color .4s ease, color .4s ease;
  }
  .btn:hover, .icon-btn:hover { transform: translateY(-2px); }

  /* sticky header gains depth on scroll */
  .bar, .hdr { transition: box-shadow .5s ease, background-color .5s ease; }
  .bar.scrolled, .hdr.scrolled { box-shadow: 0 12px 34px rgba(0,0,0,.30); }

  .hero .mk, .hero-wm { will-change: transform; }
}
/* Safety net: if reveal JS never runs, nothing stays hidden (no static hide). */
</style>
<script id="${MARKER}-js">
(function () {
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SEL = [
    /* brand-system */
    '.hero .tagrow', '.hero h1', '.hero .lede', '.hero .scroll',
    '.sechead', '.pillars .p', '.logos .lg', '.cols .col',
    '#type .typeblock', '#type .scaleline', '#iconwrap .ic',
    '.voicegrid .vc', '.cries .cry',
    '.door .mono', '.door h2', '.door p', '.door .launch',
    'footer .in',
    /* website-concept */
    '.hero-in > *', '.hero-strip', '.hero-cta',
    '.sec-head', '.grid-2 > *', '.grid-3 > *',
    '.ncard', '.tcard', '.rec', '.erow', '.stat', '.score',
    '.cta-band h2', '.cta-band p', '.cta-band .btn', '.cta-band a',
    '.ftr-top > *'
  ].join(',');

  function header() {
    var h = document.querySelector('.bar, .hdr');
    if (h) h.classList.toggle('scrolled', (window.scrollY || window.pageYOffset) > 8);
  }

  var wm = null, wmOrig = '';
  function initParallax() {
    if (RM) return;
    wm = document.querySelector('.hero .mk, .hero-wm');
    if (wm) {
      var t = getComputedStyle(wm).transform;
      wmOrig = (t && t !== 'none') ? t + ' ' : '';
    }
  }

  var ticking = false;
  function onScroll() {
    header();
    if (ticking || !wm) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset || 0;
      var off = Math.max(-40, Math.min(90, y * 0.08));
      wm.style.transform = wmOrig + 'translateY(' + off + 'px)';
      ticking = false;
    });
  }

  var io = (!RM && 'IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          el.classList.remove('r-hide');
          el.classList.add('r-in');
          io.unobserve(el);
          var done = function () {
            el.classList.remove('r-anim', 'r-in');
            el.style.transitionDelay = '';
            el.removeEventListener('transitionend', done);
          };
          el.addEventListener('transitionend', done);
          setTimeout(done, 1500);
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -7% 0px' })
    : null;

  function hasTargetAncestor(el, set) {
    var p = el.parentElement;
    while (p) { if (set.has(p)) return true; p = p.parentElement; }
    return false;
  }

  function stagger(list) {
    var groups = new Map();
    list.forEach(function (el) {
      var k = el.parentNode;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(el);
    });
    groups.forEach(function (arr) {
      arr.forEach(function (el, i) {
        if (!el.__st) { el.__st = 1; el.style.transitionDelay = (Math.min(i, 8) * 70) + 'ms'; }
      });
    });
  }

  function scan() {
    if (!io) return;
    if (!RM && !wm) initParallax(); // hero may render after boot (SPA)
    var all = Array.prototype.slice.call(document.querySelectorAll(SEL));
    var set = new Set(all);
    var fresh = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.__r) continue;
      if (hasTargetAncestor(el, set)) { el.__r = 1; continue; }
      // Skip elements with no box right now (hidden tabs/modals) — leave visible.
      if (el.offsetWidth === 0 && el.offsetHeight === 0) { el.__r = 1; continue; }
      fresh.push(el);
    }
    if (!fresh.length) return;
    stagger(fresh);
    fresh.forEach(function (el) {
      el.__r = 1;
      el.classList.add('r-anim', 'r-hide');
      io.observe(el);
    });
  }

  function boot() {
    initParallax();
    scan();
    header();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    var t;
    var mo = new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(scan, 120);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
</script>
`;

function injectIntoTemplate(fileAbs) {
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

  // Strip any previously-injected animation block so re-runs upgrade cleanly.
  const before = payload.length;
  payload = payload
    .replace(/<style id="lrhs-anim[^"]*">[\s\S]*?<\/style>/gi, "")
    .replace(/<script id="lrhs-anim[^"]*">[\s\S]*?<\/script>/gi, "");
  if (payload.length !== before) console.log("  ~ removed prior animation block");

  payload = payload.replace(/<\/head>/i, ENH + "</head>");

  // Re-encode: JSON.stringify, then escape every "</" as "<\/" so no literal
  // </script> can prematurely close the template <script> tag.
  const newBody = JSON.stringify(payload).replace(/<\//g, "<\\/");

  file = file.replace(re, function () { return open + newBody + close; });
  fs.writeFileSync(fileAbs, file);
  return true;
}

let n = 0;
for (const rel of FILES) {
  const abs = path.join(root, rel);
  console.log(rel);
  if (!fs.existsSync(abs)) { console.log("  ! missing"); continue; }
  if (injectIntoTemplate(abs)) { n++; console.log("  + injected animation layer"); }
}
console.log("\\ndone — patched " + n + " file(s).");
