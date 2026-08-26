/**
 * Outline the <text> in the two horizontal LRHS lockups.
 *
 * Written to replace outline-svg-text.mjs for these files: that script emits
 * each glyph mirrored about its cap-height midline (y -> -capHeight - y) and
 * drops the fill when a CSS rule lists several classes at once
 * (".cls-1, .cls-2 { fill: … }" — its parser only keeps the last selector).
 * Both bugs are visible in the render: black, upside-down letterforms.
 *
 * opentype's own getPath output is correct in SVG coordinates (baseline at y,
 * caps extending to negative y), so this walks the tspans and uses it directly.
 *
 * Run: node scripts/outline-lrhs-lockups.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const marksDir = path.join(root, "public", "images", "lrhs-marks");
const TARGETS = ["LRHS Full Logo 2.svg", "LRHS Full Logo 3.svg"];

const FONTS = [
  path.join(root, "public", "fonts", "industry-black.otf"),
  path.join(process.env.LOCALAPPDATA || "", "Microsoft", "Windows", "Fonts", "industry-black.otf"),
];
const fontPath = FONTS.find((p) => p && fs.existsSync(p));
if (!fontPath) { console.error("Industry Black not found at:\n  " + FONTS.join("\n  ")); process.exit(1); }
const font = opentype.parse(fs.readFileSync(fontPath).buffer);

/** class -> props. Handles ".a, .b { … }" by applying the block to every selector. */
function parseStyles(svg) {
  const block = svg.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (!block) return {};
  const out = {};
  for (const m of block[1].matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const props = {};
    for (const decl of m[2].split(";")) {
      const i = decl.indexOf(":");
      if (i > -1) props[decl.slice(0, i).trim()] = decl.slice(i + 1).trim();
    }
    for (const sel of m[1].split(",")) {
      const name = sel.trim().replace(/^\./, "");
      if (!name) continue;
      out[name] = { ...(out[name] || {}), ...props };
    }
  }
  return out;
}

const attrsOf = (s) => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const num = (v) => parseFloat(String(v).replace("px", "")) || 0;

function styleFor(cls, styles) {
  let s = {};
  for (const c of (cls || "").split(/\s+/).filter(Boolean)) s = { ...s, ...(styles[c] || {}) };
  return s;
}

/** Lay one run out on its baseline and return path data. */
function runToPath(text, x, y, size, letterSpacing) {
  const scale = size / font.unitsPerEm;
  let d = "", cx = x;
  for (const g of font.stringToGlyphs(text)) {
    const sub = g.getPath(cx, y, size).toPathData(2);
    if (sub) d += (d ? " " : "") + sub;
    cx += g.advanceWidth * scale + letterSpacing;
  }
  return d;
}

function outline(file) {
  const p = path.join(marksDir, file);
  let svg = fs.readFileSync(p, "utf8");
  const styles = parseStyles(svg);
  let count = 0;

  svg = svg.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g, (_m, tAttrs, inner) => {
    const ta = attrsOf(tAttrs);
    const ts = styleFor(ta.class, styles);
    const size = num(ts["font-size"]);
    const fill = ts.fill || ta.fill || "#000";

    let d = "";
    for (const m of inner.matchAll(/<tspan\b([^>]*)>([\s\S]*?)<\/tspan>/g)) {
      const sa = attrsOf(m[1]);
      const ss = { ...ts, ...styleFor(sa.class, styles) };
      const lsRaw = ss["letter-spacing"] || "0";
      const ls = /em/i.test(lsRaw) ? parseFloat(lsRaw) * size : parseFloat(lsRaw) || 0;
      const txt = m[2].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      const sub = runToPath(txt, num(sa.x), num(sa.y), num(ss["font-size"]) || size, ls);
      if (sub) d += (d ? " " : "") + sub;
      count++;
    }
    const tr = ta.transform ? ` transform="${ta.transform}"` : "";
    return `<path d="${d}" fill="${fill}"${tr}/>`;
  });

  // the font is no longer referenced; drop the now-dead declarations
  svg = svg.replace(/\s*font-family:[^;]*;/g, "").replace(/\s*font-weight:[^;]*;/g, "");
  fs.writeFileSync(p, svg);
  return count;
}

for (const f of TARGETS) {
  if (!fs.existsSync(path.join(marksDir, f))) { console.log("skip (missing):", f); continue; }
  const before = fs.readFileSync(path.join(marksDir, f), "utf8");
  if (!/<text\b/.test(before)) { console.log("skip (already outlined):", f); continue; }
  const n = outline(f);
  console.log(`outlined: ${f} — ${n} runs`);
}
