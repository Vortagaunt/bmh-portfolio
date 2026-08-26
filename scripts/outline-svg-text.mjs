/**
 * Convert <text> elements in selected SVGs to outlined <path> elements
 * using opentype.js. Eliminates the font dependency entirely so the
 * marks render identically in every browser/context.
 *
 * Run with: node scripts/outline-svg-text.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const marksDir = path.join(root, "public", "images", "lrhs-marks");
/* Industry Black is a licensed face and deliberately not committed. Look in
 * the repo first, then where Windows installs per-user fonts, so this can be
 * re-run on a machine that has the font without ever shipping it. */
const FONT_CANDIDATES = [
  path.join(root, "public", "fonts", "industry-black.otf"),
  path.join(
    process.env.LOCALAPPDATA || "",
    "Microsoft",
    "Windows",
    "Fonts",
    "industry-black.otf",
  ),
];
const fontPath = FONT_CANDIDATES.find((p) => p && fs.existsSync(p));
if (!fontPath) {
  console.error(
    "Industry Black not found. Install it, or drop industry-black.otf at " +
      FONT_CANDIDATES[0],
  );
  process.exit(1);
}

/* Every mark that ships with live <text>. Already-outlined files are skipped
 * automatically (no font-family left to find), so listing them is harmless. */
const TARGETS = [
  "LRHS Band 1.svg",
  "LRHS Band 2.svg",
  "LRHS Full Logo 2.svg",
  "LRHS Full Logo 3.svg",
  "LRHS Mustangs Ahead 1.svg",
  "LRHS Mustangs Ahead 2.svg",
];

const font = opentype.parse(fs.readFileSync(fontPath).buffer);

/** Parse a <defs><style>…</style></defs> block into a className→props map. */
function parseStyleBlock(svg) {
  const styleMatch = svg.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (!styleMatch) return {};
  const css = styleMatch[1];
  const classes = {};
  const ruleRe = /\.([\w-]+)\s*\{([^}]+)\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const name = m[1];
    const body = m[2];
    const props = {};
    body.split(";").forEach((decl) => {
      const idx = decl.indexOf(":");
      if (idx === -1) return;
      const k = decl.slice(0, idx).trim();
      const v = decl.slice(idx + 1).trim();
      if (k && v) props[k] = v;
    });
    classes[name] = props;
  }
  return classes;
}

/** Parse a transform="translate(x y)" — only translate is handled (sufficient here). */
function parseTranslate(attr) {
  if (!attr) return { x: 0, y: 0 };
  const m = attr.match(/translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)/);
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 0, y: 0 };
}

/** Read attributes off a tag string. */
function parseAttrs(tagAttrs) {
  const out = {};
  const re = /(\w[\w-]*)="([^"]*)"/g;
  let m;
  while ((m = re.exec(tagAttrs))) out[m[1]] = m[2];
  return out;
}

/** Resolve a tag's effective style by merging parent → own class → own inline. */
function resolveStyle(attrs, parentStyle, classes) {
  const own = { ...parentStyle };
  const cls = attrs.class || attrs.className;
  if (cls) {
    cls
      .split(/\s+/)
      .forEach((c) => Object.assign(own, classes[c] || {}));
  }
  // numeric inline attrs that matter
  if (attrs["font-size"]) own["font-size"] = attrs["font-size"];
  if (attrs["font-family"]) own["font-family"] = attrs["font-family"];
  if (attrs["letter-spacing"]) own["letter-spacing"] = attrs["letter-spacing"];
  if (attrs.fill) own.fill = attrs.fill;
  return own;
}

/** Convert px-ish font-size string ("159.8px", "159.8") → number. */
function px(v) {
  if (!v) return 0;
  return parseFloat(String(v));
}

/**
 * Recursively walk <text>/<tspan> children, returning a flat list of
 * { x, y, size, letterSpacing, fill, runText } chunks.
 *
 * Each tspan with x/y attrs RESETS the position; without them, it
 * continues from where the previous chunk left off. SVG semantics
 * here are subtle, but for the LRHS files every text-bearing tspan
 * has explicit x/y, which we honor exactly.
 */
function flattenTspans(innerHtml, parentX, parentY, parentStyle, classes) {
  const chunks = [];
  let cursorX = parentX;
  let cursorY = parentY;

  // Walk the inner content. <tspan> can nest; we recurse.
  const re = /<tspan\b([^>]*)>([\s\S]*?)<\/tspan>|([^<]+)/g;
  let m;
  while ((m = re.exec(innerHtml))) {
    if (m[1] !== undefined) {
      // tspan
      const attrs = parseAttrs(m[1]);
      const style = resolveStyle(attrs, parentStyle, classes);
      const x = attrs.x !== undefined ? parseFloat(attrs.x) : cursorX;
      const y = attrs.y !== undefined ? parseFloat(attrs.y) : cursorY;
      const sub = flattenTspans(m[2], x, y, style, classes);
      chunks.push(...sub);
      if (sub.length) {
        const last = sub[sub.length - 1];
        cursorX = last.advanceEndX;
        cursorY = last.y;
      }
    } else if (m[3] !== undefined) {
      // raw text node
      const text = m[3].replace(/\s+/g, " ");
      if (!text.trim() && !text.includes(" ")) continue;
      const size = px(parentStyle["font-size"]);
      const letterSpacing = parseFloat(parentStyle["letter-spacing"] || "0");
      // Letter-spacing in CSS units. The values in the LRHS SVGs use em ("-.08em"),
      // so parseFloat→ -0.08 means 8% of font-size.
      const lsPx =
        /em/i.test(parentStyle["letter-spacing"] || "")
          ? letterSpacing * size
          : letterSpacing;
      chunks.push({
        x: cursorX,
        y: cursorY,
        size,
        letterSpacing: lsPx,
        fill: parentStyle.fill,
        runText: text,
        // we'll fill advanceEndX after typesetting
        advanceEndX: cursorX,
      });
    }
  }
  // Pre-compute advanceEndX for each chunk so siblings continue correctly.
  let runningX = parentX;
  chunks.forEach((c) => {
    // If chunk has its own x already set above parentX, respect it
    runningX = c.x;
    const advance = measureAdvance(c.runText, c.size, c.letterSpacing);
    c.advanceEndX = runningX + advance;
  });
  return chunks;
}

function measureAdvance(text, size, letterSpacing) {
  const glyphs = font.stringToGlyphs(text);
  const fontSizeScale = (1 / font.unitsPerEm) * size;
  let advance = 0;
  glyphs.forEach((g, i) => {
    advance += g.advanceWidth * fontSizeScale;
    if (i < glyphs.length - 1) advance += letterSpacing;
  });
  return advance;
}

/** Build a single big <path d="..."> from a list of typeset chunks. */
function chunksToPathData(chunks) {
  let d = "";
  for (const c of chunks) {
    if (!c.runText) continue;
    // opentype's font.getPath places text on a baseline at y=ascender.
    // We let opentype handle each glyph individually so letterSpacing applies.
    const glyphs = font.stringToGlyphs(c.runText);
    const scale = (1 / font.unitsPerEm) * c.size;
    let x = c.x;
    for (let i = 0; i < glyphs.length; i++) {
      const g = glyphs[i];
      const glyphPath = g.getPath(x, c.y, c.size);
      d += " " + glyphPath.toPathData();
      x += g.advanceWidth * scale + c.letterSpacing;
    }
  }
  return d.trim();
}

function processSvg(filePath) {
  let svg = fs.readFileSync(filePath, "utf8");
  const classes = parseStyleBlock(svg);

  // Replace each <text> with an outlined <path>. Need to preserve transform.
  svg = svg.replace(
    /<text\b([^>]*)>([\s\S]*?)<\/text>/gi,
    (whole, openAttrs, inner) => {
      const attrs = parseAttrs(openAttrs);
      const baseStyle = resolveStyle(attrs, {}, classes);
      const tr = parseTranslate(attrs.transform);
      const chunks = flattenTspans(inner, 0, 0, baseStyle, classes);
      if (!chunks.length) return whole;
      const d = chunksToPathData(chunks);
      const fill = baseStyle.fill || "currentColor";
      const transform = attrs.transform
        ? ` transform="${attrs.transform}"`
        : tr.x || tr.y
          ? ` transform="translate(${tr.x} ${tr.y})"`
          : "";
      return `<path d="${d}" fill="${fill}"${transform}/>`;
    },
  );

  return svg;
}

let outlined = 0;
for (const name of TARGETS) {
  const filePath = path.join(marksDir, name);
  if (!fs.existsSync(filePath)) {
    console.log("skip (missing):", name);
    continue;
  }
  const before = fs.readFileSync(filePath, "utf8");
  if (!/font-family/i.test(before)) {
    console.log("skip (no font reference):", name);
    continue;
  }
  const updated = processSvg(filePath);
  fs.writeFileSync(filePath, updated);
  outlined++;
  console.log("outlined:", name, `(${before.length} → ${updated.length} bytes)`);
}
console.log(`\ndone — outlined ${outlined} file(s).`);
