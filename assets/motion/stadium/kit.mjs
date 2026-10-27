/**
 * Shared kit for the stadium video-board pieces (scripts/render-stadium-motion.mjs).
 *
 * Node side: brand tokens, frame and title-safe geometry, fonts, the catalogue
 * check and the HTML helpers the pieces build their markup with.
 * Page side (RUNTIME): easing, the keyframe tracker, the wallpaper field and
 * the little helpers every scene uses. Scenes are pure functions of time, so
 * any frame (or motion-blur sub-frame) can be drawn in any order.
 *
 * Layout is authored at 1920x1080 CSS px. 4K is device scale 2, 8K is device
 * scale 4 of the same layout, so every size is drawn natively, never upscaled.
 */
import fs from "node:fs";
import path from "node:path";

export const T = {
  green: "#003C24",     // Mustang Green
  deep: "#05281A",      // deep green
  doc: "#033922",       // documented green
  red: "#A82424",       // Spirit Red
  paper: "#F1F2F0",
  ink: "#0C0C0C",
  onGreen: "#D6E2DA",   // on-green text
  muted: "#7E958A",
};
export const W = 1920, H = 1080;
/* title-safe: the centre 90% x 90% */
export const SAFE = { x: W * 0.05, y: H * 0.05, w: W * 0.9, h: H * 0.9 };
/* readability floor: display type at least ~12% of frame height */
export const MIN_TYPE = Math.round(H * 0.12);   // 130px at 1080

/* ---------------- fonts (inlined into the throwaway render page only) ---------------- */
function fontSrc(label, candidates) {
  const found = candidates.find((p) => p && fs.existsSync(p));
  if (!found) throw new Error(`${label} not found (looked in ${candidates.filter(Boolean).join(", ")})`);
  const ext = path.extname(found).toLowerCase();
  const fmt = { ".otf": "opentype", ".woff2": "woff2", ".woff": "woff" }[ext] || "truetype";
  const mime = { ".otf": "font/otf", ".woff2": "font/woff2", ".woff": "font/woff" }[ext] || "font/ttf";
  return { file: found, css: `url(data:${mime};base64,${fs.readFileSync(found).toString("base64")}) format('${fmt}')` };
}
export function fonts(root) {
  const userFonts = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "Windows", "Fonts");
  const ib = fontSrc("Industry Black", [process.env.INDUSTRY_FONT, path.join(userFonts, "industry-black.otf"),
    path.join(root, "public", "fonts", "industry-black.otf"), path.join(root, "deck", "fonts", "industry-black.otf")]);
  const hk = fontSrc("Hanken Grotesk", [process.env.HANKEN_FONT, path.join(userFonts, "HankenGrotesk-VariableFont_wght.ttf"),
    path.join(root, "src", "app", "lrhs-brand-guidelines", "fonts", "HankenGrotesk-latin-wght.woff2")]);
  return {
    files: { industry: ib.file, hanken: hk.file },
    css: `@font-face{font-family:IB;src:${ib.css};font-display:block}
@font-face{font-family:HK;src:${hk.css};font-weight:100 900;font-display:block}`,
  };
}

/* ---------------- marks: catalogued, live, untouched ---------------- */
export function catalogue(root) {
  const cat = JSON.parse(fs.readFileSync(path.join(root, "src", "data", "lrhs-marks.json"), "utf8"));
  const live = new Map(cat.marks.map((m) => [m.file, m]));
  const retired = new Set(cat.retired.map((m) => m.file));
  return { cat, live, retired };
}
/* A mark as a data URI. The only allowed variant is a white knockout: every fill
   becomes white, nothing else about the drawing changes. */
export function markURI(root, file, { knockout = false } = {}) {
  const f = path.join(root, "public", "images", "lrhs-marks", file);
  if (file.endsWith(".png")) return `data:image/png;base64,${fs.readFileSync(f).toString("base64")}`;
  let s = fs.readFileSync(f, "utf8");
  if (knockout) s = s.replace(/fill\s*:\s*#[0-9a-fA-F]{3,8}/g, "fill:#fff").replace(/fill="#[0-9a-fA-F]{3,8}"/g, 'fill="#fff"');
  return `data:image/svg+xml;base64,${Buffer.from(s).toString("base64")}`;
}

/* ---------------- markup helpers handed to each piece ---------------- */
export function helpers(root, used) {
  const { live, retired } = catalogue(root);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const A = {
    T,
    /* a mark at a given height, with a light-sweep layer masked to its own shape */
    mk(file, h, { id = "", cls = "", knockout = false, style = "" } = {}) {
      if (retired.has(file)) throw new Error(`${file} is retired; stadium pieces use live marks only`);
      if (!live.has(file)) throw new Error(`${file} is not in src/data/lrhs-marks.json`);
      used.add(file + (knockout ? " (white knockout)" : ""));
      const uri = markURI(root, file, { knockout });
      return `<div class="mk ${cls}" ${id ? `id="${id}"` : ""} style="height:${h}px;${style}"><img src="${uri}" alt=""><i class="sh" style="-webkit-mask-image:url(${uri});mask-image:url(${uri})"></i></div>`;
    },
    /* one line of type inside a mask, so it can wipe in and out */
    ln(text, { id = "", cls = "ib", size, color = "", style = "" }) {
      return `<div class="m ${cls} safe" ${id ? `id="${id}"` : ""} data-size="${size}" style="font-size:${size}px;${color ? `color:${color};` : ""}${style}"><span class="i">${esc(text)}</span></div>`;
    },
    /* the same, one mask per letter (for staggered letter builds) */
    chars(text, { id = "", cls = "ib", size, color = "", masked = true }) {
      const cells = [...text].map((ch) => ch === " "
        ? `<span class="sp" style="width:.32em"></span>`
        : `<span class="${masked ? "m " : ""}c"><span class="i">${esc(ch)}</span></span>`).join("");
      return `<div class="row ${cls} safe" ${id ? `id="${id}"` : ""} data-size="${size}" style="font-size:${size}px;${color ? `color:${color};` : ""}">${cells}</div>`;
    },
    gap: (h) => `<div style="height:${h}px;flex:none"></div>`,
    esc,
  };
  return A;
}

/* ---------------- the page ---------------- */
export const BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${T.green}}
.fx{position:absolute;inset:0;overflow:hidden}
/* the wallpaper field — deck/build-wallpaper.mjs, at half its 4K layout */
.field{position:absolute;inset:0;background:
  radial-gradient(120% 90% at 22% 12%, #0A5733 0%, rgba(10,87,51,0) 62%),
  radial-gradient(110% 100% at 88% 96%, #021A10 0%, rgba(2,26,16,0) 58%),
  linear-gradient(146deg, #04482A 0%, #003C24 44%, #05281A 100%);}
.ghost{position:absolute;width:1600px;right:-440px;top:235px;opacity:.042;filter:brightness(0) invert(1);will-change:transform}
.grid{position:absolute;inset:0;opacity:.5;background-image:
  linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size:calc((100% - ${Math.round(W * 0.16)}px) / 5) 100%, 100% 100%;
  background-position:${Math.round(W * 0.08)}px 0, 0 0;}
.vig{position:absolute;inset:0;background:radial-gradient(130% 105% at 50% 45%, rgba(0,0,0,0) 38%, rgba(0,0,0,.34) 100%)}
.grain{position:absolute;inset:0;width:${W}px;height:${H}px;mix-blend-mode:overlay;opacity:.05;pointer-events:none;z-index:50}
.stage{position:absolute;left:${SAFE.x}px;top:${SAFE.y}px;width:${SAFE.w}px;height:${SAFE.h}px;
  display:flex;flex-direction:column;align-items:center;justify-content:center}
.ib{font-family:IB;line-height:1;color:${T.paper};white-space:nowrap;text-transform:uppercase}
.hk{font-family:HK;font-weight:800;line-height:1;letter-spacing:.03em;color:${T.paper};white-space:nowrap;text-transform:uppercase}
.m{display:block;overflow:hidden;padding:.1em .14em;margin:-.1em -.14em}
.m>.i,.c>.i{display:block;will-change:transform}
.row{display:flex;align-items:flex-end;flex:none}
.c{display:inline-block}
.row .m.c{margin:-.1em -.02em;padding:.1em .02em}
.mk{position:relative;flex:none;will-change:transform}
.mk img{display:block;height:100%;width:auto}
.mk .sh{position:absolute;inset:0;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
  background:linear-gradient(105deg,rgba(255,255,255,0) 38%,rgba(255,255,255,.9) 50%,rgba(255,255,255,0) 62%);
  background-size:320% 100%;background-position:150% 0;mix-blend-mode:overlay}
.sweep{position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(105deg,rgba(241,242,240,0) 36%,rgba(241,242,240,.07) 50%,rgba(241,242,240,0) 64%);
  background-size:320% 100%;background-position:150% 0}
.bloom{position:absolute;inset:0;opacity:0;pointer-events:none;
  background:radial-gradient(55% 60% at 50% 44%, rgba(241,242,240,.07) 0%, rgba(241,242,240,0) 70%)}
.flood{position:absolute;inset:0;background:
  radial-gradient(120% 90% at 20% 10%, rgba(241,242,240,.10) 0%, rgba(241,242,240,0) 60%),
  linear-gradient(146deg, rgba(12,12,12,0) 30%, rgba(12,12,12,.38) 100%), ${T.red};
  clip-path:polygon(0 0,0 0,0 0,0 0)}
`;

/* everything below runs inside the page */
export const RUNTIME = `
const E = {
  linear: (p) => p,
  expoOut: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  expoIn: (p) => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10)),
  quintOut: (p) => 1 - Math.pow(1 - p, 5),
  quintIn: (p) => p * p * p * p * p,
  quintInOut: (p) => (p < 0.5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2),
  cubicInOut: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - Math.pow(-2 * p + 2, 3) / 2),
  step: (p) => (p >= 1 ? 1 : 0),
};
const clamp01 = (p) => Math.min(1, Math.max(0, p));
const lerp = (a, b, k) => a + (b - a) * k;
/* keyframes: [[time, {props}, easeIntoThisKey], ...]; props carry forward */
function tk(t, kfs) {
  let st = { ...kfs[0][1] };
  if (t <= kfs[0][0]) return st;
  for (let i = 1; i < kfs.length; i++) {
    const [t1, p1, e] = kfs[i], t0 = kfs[i - 1][0];
    const next = { ...st, ...p1 };
    if (t >= t1) { st = next; continue; }
    const k = E[e || "expoOut"](clamp01((t - t0) / (t1 - t0 || 1e-9)));
    const out = {};
    for (const key in next) {
      const a = st[key], b = next[key];
      out[key] = Array.isArray(b) ? b.map((v, j) => lerp(a ? a[j] : v, v, k)) : a == null ? b : lerp(a, b, k);
    }
    return out;
  }
  return st;
}
const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
const $$ = (s) => [...document.querySelectorAll(s)];
const each = (s, fn) => { const l = typeof s === "string" ? $$(s) : s.length != null ? [...s] : [s]; l.forEach(fn); };
/* x,y px · xp,yp % of own box · s,sx,sy scale · r deg · rx deg (flat flip) · o opacity */
function put(sel, st) {
  each(sel, (el) => {
    if (!el) return;
    const tf = [];
    if (st.rx) tf.push("perspective(3200px) rotateX(" + st.rx + "deg)");
    if (st.x || st.y) tf.push("translate(" + (st.x || 0) + "px," + (st.y || 0) + "px)");
    if (st.xp || st.yp) tf.push("translate(" + (st.xp || 0) + "%," + (st.yp || 0) + "%)");
    if (st.r) tf.push("rotate(" + st.r + "deg)");
    const s = st.s == null ? 1 : st.s, sx = (st.sx == null ? 1 : st.sx) * s, sy = (st.sy == null ? 1 : st.sy) * s;
    if (sx !== 1 || sy !== 1) tf.push("scale(" + sx + "," + sy + ")");
    el.style.transform = tf.join(" ");
    if (st.o != null) el.style.opacity = st.o;
  });
}
const clip = (sel, [t, r, b, l]) => each(sel, (el) => (el.style.clipPath = "inset(" + t + "% " + r + "% " + b + "% " + l + "%)"));
const bg = (sel, v) => each(sel, (el) => (el.style.backgroundPosition = v + "% 0"));
/* a light sweep across a mark, p 0 -> 1 */
const sheen = (sel, p) => each($(sel).querySelectorAll(".sh"), (el) => (el.style.backgroundPosition = (150 - 200 * p) + "% 0"));
/* a slanted band between two edges (fractions of the width along the top edge) */
function band(sel, a, b, slant = 0.25) {
  const P = (v) => (v * 100).toFixed(3) + "%";
  each(sel, (el) => (el.style.clipPath = b <= a ? "polygon(0 0,0 0,0 0)" :
    "polygon(" + P(a) + " 0," + P(b) + " 0," + P(b - slant) + " 100%," + P(a - slant) + " 100%)"));
}
const R = { E, tk, put, clip, bg, sheen, band, $, $$, each, clamp01, lerp };

/* the field: the ghost horse drifts on a loop that closes exactly at the piece length */
function field(t) {
  const L = window.__T, a = (2 * Math.PI * t) / L;
  put(".ghost", { x: 16 * Math.sin(a), y: 7 * Math.sin(a + 1.1) });
}
/* static grain, seeded, at device resolution: dithers the gradients, loops by definition */
function grain() {
  const c = document.querySelector(".grain"), d = devicePixelRatio;
  c.width = ${W} * d; c.height = ${H} * d;
  const g = c.getContext("2d"), img = g.createImageData(c.width, c.height), px = img.data;
  let s = 0x2f6e2b1;
  for (let i = 0; i < px.length; i += 4) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const v = 128 + (((s >>> 0) % 256) - 128) * 0.9;
    px[i] = px[i + 1] = px[i + 2] = v; px[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
}
`;

export function pageHTML({ fontCSS, ghostURI, css = "", body }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCSS}${BASE_CSS}${css}</style></head><body>
<div class="fx" id="world">
  <div class="field"></div>
  <img class="ghost" src="${ghostURI}" alt="">
  <div class="grid"></div>
  <div class="vig"></div>
  ${body}
  <canvas class="grain"></canvas>
</div>
</body></html>`;
}
