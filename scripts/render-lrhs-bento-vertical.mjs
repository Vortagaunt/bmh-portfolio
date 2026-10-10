/**
 * The LRHS brand system on one page, standing up — the vertical (9:16) cut of the
 * keynote-style bento (scripts/render-lrhs-bento.mjs), for stories, phones and
 * a portrait print. Same tiles, same type, same rules; laid out on a 4 x 8 grid.
 * The Mustang Studio tile shows the 1.6 app (assets/studio/ui-gameday.jpg).
 *
 * Emits 8K only:
 *   assets/flyer/lrhs-bento-vertical-8k.jpg   4320x7680
 *
 * Fonts: Industry Black (licensed, never committed) and Hanken Grotesk are read
 * from where Windows installs per-user fonts and inlined into the throwaway
 * render HTML, so neither ships. Every mark is the catalogue's own SVG.
 *
 * Run: node scripts/render-lrhs-bento-vertical.mjs
 *   optional env: LRHS_ROOT, OUT_DIR, CHROME, HANKEN_FONT, INDUSTRY_FONT
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = process.env.LRHS_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT_DIR || path.join(root, "assets", "flyer");
const userFonts = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "Windows", "Fonts");

function font(label, candidates) {
  const found = candidates.find((p) => p && fs.existsSync(p));
  if (!found) { console.error(`${label} not found (looked in ${candidates.filter(Boolean).join(", ")})`); process.exit(1); }
  const ext = path.extname(found).toLowerCase();
  const fmt = ext === ".otf" ? "opentype" : ext === ".woff2" ? "woff2" : ext === ".woff" ? "woff" : "truetype";
  const mime = ext === ".otf" ? "font/otf" : ext === ".woff2" ? "font/woff2" : ext === ".woff" ? "font/woff" : "font/ttf";
  return `url(data:${mime};base64,${fs.readFileSync(found).toString("base64")}) format('${fmt}')`;
}
const INDUSTRY = font("Industry Black", [process.env.INDUSTRY_FONT, path.join(userFonts, "industry-black.otf"),
  path.join(root, "deck", "fonts", "industry-black.otf")]);
const HANKEN = font("Hanken Grotesk", [process.env.HANKEN_FONT, path.join(userFonts, "HankenGrotesk-VariableFont_wght.ttf")]);

const uri = (file, type) => `data:${type};base64,${fs.readFileSync(file).toString("base64")}`;
const mark = (name) => uri(path.join(root, "public", "images", "lrhs-marks", name), "image/svg+xml");
const img = (...p) => {
  const f = path.join(root, ...p);
  return uri(f, f.endsWith(".svg") ? "image/svg+xml" : f.endsWith(".png") ? "image/png" : "image/jpeg");
};

/* lucide glyphs straight from the package, as on the iconography board */
const ICON_DIR = path.join(root, "node_modules", "lucide-react", "dist", "esm", "icons");
function icon(name, size, sw = 1.8) {
  const src = fs.readFileSync(path.join(ICON_DIR, `${name}.js`), "utf8");
  const nodes = new Function("return " + src.match(/const __iconNode = (\[[\s\S]*?\n\]);/)[1])();
  const body = nodes.map(([tag, attrs]) =>
    `<${tag} ${Object.entries(attrs).filter(([k]) => k !== "key").map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

const RED = "#AA2121";
const FIELD = `radial-gradient(120% 95% at 18% 10%, #0A5733 0%, rgba(10,87,51,0) 62%),
  radial-gradient(110% 100% at 88% 96%, #021A10 0%, rgba(2,26,16,0) 58%),
  linear-gradient(146deg, #04482A 0%, #003C24 44%, #05281A 100%)`;

const FAMILIES = [
  ["Emblem", 5], ["Wordmark", 3], ["Mustang", 4], ["Band", 2],
  ["Crest", 3], ["Mustangs Ahead", 6], ["Retro", 2],
];
const SWATCHES = [  // name, hex, role, (unused), text colour — the v1 strips, now equal widths
  ["Mustang Green", "#033922", "Primary", 22, "#fff"],
  ["Field Green", "#144B2C", "Depth", 15.5, "#fff"],
  ["Bright Pine", "#1C6E40", "Accents", 15.5, "#fff"],
  ["Spirit Red", "#AA2121", "Rare accent", 16, "#fff"],
  ["Ink", "#0B0B0B", "Contrast", 14, "#fff"],
  ["Paper", "#FBFBF9", "Background", 17, "#3A4A42"],
];

const W = 2160, H = 3840;   // CSS px; rendered at 2x = 4320 x 7680
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Industry';src:${INDUSTRY};font-weight:900;}
@font-face{font-family:'Hanken';src:${HANKEN};font-weight:100 900;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000;}
body{font-family:'Hanken',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;
  --fg:#F5F5F7;--mute:#8B938E;color:var(--fg);}
.grid{position:absolute;inset:88px;display:grid;gap:26px;
  grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(8,1fr);}

/* tiles: flat, no strokes, big radius — the keynote look */
.t{position:relative;border-radius:50px;overflow:hidden;padding:50px;display:flex;flex-direction:column;min-width:0;min-height:0;}
.dark{background:#161917;}
.paper{background:#F5F5F3;--fg:#0B0B0B;--mute:#6C736E;color:var(--fg);}
.field{background:${FIELD};--mute:#BCD3C5;}
.red{background:linear-gradient(160deg,#C42B2B 0%,${RED} 48%,#7A1616 100%);--mute:rgba(255,255,255,.72);}
.c{align-items:center;text-align:center;}

/* type */
.lab{font-size:29px;font-weight:600;letter-spacing:-.005em;color:var(--mute);line-height:1.2;}
.h{font-size:58px;font-weight:700;letter-spacing:-.032em;line-height:1.04;text-wrap:balance;}
.hs{font-size:43px;font-weight:700;letter-spacing:-.028em;line-height:1.06;text-wrap:balance;}
.sub{font-size:29px;font-weight:500;line-height:1.32;color:var(--mute);letter-spacing:-.008em;text-wrap:balance;}
.m{color:var(--mute);}
.ind{font-family:'Industry',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.005em;line-height:.9;}
.g{background:linear-gradient(172deg,#A6F5C8 0%,#46C27E 42%,#1E8C4E 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}
.paper .g{background-image:linear-gradient(172deg,#24965A 0%,#0B5A35 50%,#033922 100%);}
.sp{flex:1;min-height:0;}
.rel{position:relative;}
.fit{width:100%;height:100%;object-fit:contain;display:block;}
.art{flex:1;min-height:0;width:100%;position:relative;}
.ghost{position:absolute;opacity:.05;filter:brightness(0) invert(1);pointer-events:none;}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(130% 110% at 50% 40%,rgba(0,0,0,0) 45%,rgba(0,0,0,.32) 100%);}
.new{display:inline-block;background:${RED};color:#fff;font-size:22px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  padding:7px 14px 6px;border-radius:999px;vertical-align:3px;margin-right:12px;}
</style></head><body><div class="grid">

<!-- hero -->
<div class="t field c" style="grid-area:1/1/3/4;padding:60px;">
  <div style="position:absolute;inset:0;overflow:hidden;"><img class="ghost" src="${mark("LRHS Mustang 4.svg")}" style="width:1500px;right:-560px;top:240px;"></div>
  <div class="vig"></div>
  <div style="position:relative;display:inline-flex;align-items:center;gap:12px;padding:12px 26px 12px 18px;border-radius:999px;
       background:rgba(255,255,255,.12);font-size:26px;font-weight:600;color:#fff;">${icon("badge-check", 32, 2)}<span>Approved by the principal · October 2026</span></div>
  <div class="art" style="margin:44px 0 40px;"><img class="fit" src="${mark("LRHS Emblem Mono.svg")}"></div>
  <div class="ind" style="position:relative;font-size:124px;white-space:nowrap;">Mustangs Ahead</div>
  <div class="sub" style="position:relative;font-size:36px;margin-top:22px;color:#D6E2DA;">The Lakewood Ranch High School brand system.</div>
</div>

<!-- student ID — new -->
<div class="t dark c" style="grid-area:3/1/5/3;padding-bottom:0;">
  <div class="lab"><span class="new">New</span>Student ID</div>
  <div class="h" style="margin-top:18px;">A card every student <span class="m">carries.</span></div>
  <div class="sub" style="margin-top:14px;">Front and back, with 24/7 support lines.</div>
  <div class="art" style="margin-top:10px;">
    <img src="${img("public", "images", "lrhs-ids", "student-back.png")}" style="position:absolute;height:560px;left:50%;top:50%;
      transform:translate(-50%,-50%) translate(-150px,-4px) rotate(-7deg);filter:drop-shadow(0 30px 50px rgba(0,0,0,.6));">
    <img src="${img("public", "images", "lrhs-ids", "student-front.png")}" style="position:absolute;height:560px;left:50%;top:50%;
      transform:translate(-50%,-50%) translate(140px,14px) rotate(4deg);filter:drop-shadow(0 40px 60px rgba(0,0,0,.7));">
  </div>
</div>

<!-- one horse -->
<div class="t paper" style="grid-area:3/3/4/5;flex-direction:row;gap:20px;padding-right:36px;">
  <div style="flex:0 0 430px;display:flex;flex-direction:column;">
    <div class="lab">The mustang</div><div class="sp"></div>
    <div class="h">One horse, <span class="m">drawn once.</span></div>
    <div class="sub" style="margin-top:16px;font-size:26px;">The same file on a scoreboard, a jersey and a favicon.</div>
  </div>
  <div style="flex:1;min-width:0;"><img class="fit" src="${mark("LRHS Mustang 4.svg")}"></div>
</div>

<!-- crest -->
<div class="t paper c" style="grid-area:1/4/3/5;">
  <div class="lab">The crest</div>
  <div class="art" style="margin:26px 0 30px;"><img class="fit" src="${mark("LRHS Grad Mark.svg")}"></div>
  <div class="h" style="font-size:50px;">Founded <span class="g">1998.</span></div>
  <div class="sub" style="margin-top:12px;font-size:26px;">Diplomas, programmes and awards.</div>
</div>

<!-- the library -->
<div class="t dark" style="grid-area:4/3/5/5;flex-direction:row;gap:40px;align-items:stretch;">
  <div style="display:flex;flex-direction:column;flex:0 0 auto;">
    <div class="lab">The mark library</div><div class="sp"></div>
    <div class="ind" style="font-size:300px;line-height:.78;margin-bottom:-6px;"><span class="g">25</span></div>
  </div>
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;">
    <div class="sp"></div>
    <div class="h" style="font-size:54px;">Marks.<br><span class="m">Seven families.</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:24px;">
      ${FAMILIES.map(([n, c]) => `<span style="display:inline-flex;gap:10px;align-items:baseline;padding:9px 16px;border-radius:999px;
        background:rgba(255,255,255,.08);font-size:22px;font-weight:600;white-space:nowrap;">${n}<span class="g" style="font-weight:800;">${c}</span></span>`).join("")}
    </div>
  </div>
</div>

<!-- type + icons -->
<div class="t dark" style="grid-area:5/1/6/3;">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <div class="lab">Type &amp; icons</div>
    <div style="display:flex;gap:18px;color:#46C27E;">
      ${["trophy", "graduation-cap", "music", "calendar", "megaphone", "map-pin"].map((n) => icon(n, 38)).join("")}
    </div>
  </div>
  <div class="sp"></div>
  <div class="ind" style="font-size:112px;white-space:nowrap;">Go <span class="g">Mustangs</span></div>
  <div class="sp"></div>
  <div class="hs" style="font-size:34px;line-height:1.28;">Industry Black <span class="m">for headlines.</span><br>Hanken Grotesk <span class="m">for everything else.</span></div>
</div>

<!-- the emblem, softened -->
<div class="t paper" style="grid-area:5/3/6/4;padding:0;">
  <div style="position:relative;flex:1;min-height:0;overflow:hidden;background:#ECEDEA;">
    <img src="${mark("LRHS Emblem.svg")}" style="position:absolute;width:${1944.33 * 0.5}px;left:${-30 * 0.5 + 44}px;top:${-30 * 0.5 + 40}px;">
  </div>
  <div style="padding:30px 44px 40px;">
    <div class="hs">Softer corners.</div>
    <div class="sub" style="font-size:25px;margin-top:8px;">The same in all seven emblem files.</div>
  </div>
</div>

<!-- colour — v1's full-bleed strips -->
<div class="t" style="grid-area:6/1/7/3;padding:0;flex-direction:row;">
  ${SWATCHES.map(([n, hex, role, , fg], i) => `
    <div class="sw" style="flex:1 1 0;min-width:0;background:${hex};color:${fg};padding:44px 22px;display:flex;flex-direction:column;">
      ${i === 0 ? `<div class="lab" style="color:rgba(255,255,255,.8);">Colour</div>` : ""}
      <div class="sp"></div>
      <div style="font-size:22px;font-weight:700;line-height:1.12;min-height:2.24em;display:flex;align-items:flex-end;letter-spacing:-.01em;">${n.replace(" ", "<br>")}</div>
      <div style="font-size:17px;opacity:.8;margin-top:8px;letter-spacing:.04em;white-space:nowrap;">${hex}</div>
      <div style="font-size:12px;opacity:.72;margin-top:5px;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;">${role}</div>
    </div>`).join("")}
</div>

<!-- band -->
<div class="t paper c" style="grid-area:6/3/7/4;">
  <div class="art"><img class="fit" src="${mark("LRHS Band Emblem.svg")}"></div>
  <div class="hs" style="font-size:36px;margin-top:22px;">The Mustang Band</div>
</div>

<!-- mustangs ahead -->
<div class="t dark c" style="grid-area:6/4/7/5;">
  <div class="art"><img class="fit" src="${img("assets", "podcast", "lrhs-podcasts-mustangs-ahead.svg")}"></div>
  <div class="hs" style="font-size:36px;margin-top:22px;">Newsletter <span class="m">+ podcast</span></div>
</div>

<!-- game day -->
<div class="t red" style="grid-area:5/4/6/5;">
  <div class="lab">Game day</div><div class="sp"></div>
  <div class="ind" style="font-size:74px;">Spirit Red</div>
  <div class="sub" style="margin-top:14px;font-size:25px;color:rgba(255,255,255,.86);">Full volume on game day. Rare everywhere else.</div>
</div>

<!-- Mustang Studio — new: the brand-locked design app, screenshot from the app itself -->
<div class="t paper" style="grid-area:7/1/8/3;">
  <div style="position:relative;z-index:1;width:300px;display:flex;flex-direction:column;flex:1;">
    <div class="lab"><span class="new">New</span>Mustang Studio</div>
    <div class="sp"></div>
    <div class="h" style="font-size:52px;">On brand, <span class="m">every time.</span></div>
    <div class="sub" style="font-size:24px;margin-top:14px;">A design app with 41 templates, every mark and every rule built in.</div>
  </div>
  <div style="position:absolute;inset:0;overflow:hidden;">   <!-- clip the bleed without growing the tile -->
    <div style="position:absolute;left:390px;top:58px;width:700px;border-radius:16px;overflow:hidden;
         box-shadow:0 0 0 1px rgba(0,0,0,.2),0 30px 70px -20px rgba(12,12,12,.55);">
      <img src="${img("assets", "studio", "ui-gameday.jpg")}" style="display:block;width:100%;">
    </div>
  </div>
</div>

<!-- posters -->
<div class="t dark c" style="grid-area:7/3/8/5;">
  <div class="art">
    <img src="${img("public", "images", "lrhs-signage", "poster-name.jpg")}" style="position:absolute;left:0;top:14px;width:52%;border-radius:16px;
      transform:rotate(-2.5deg);box-shadow:0 20px 50px -20px rgba(0,0,0,.7);">
    <img src="${img("public", "images", "lrhs-signage", "poster-go-mustangs.jpg")}" style="position:absolute;right:0;bottom:14px;width:52%;border-radius:16px;
      transform:rotate(2deg);box-shadow:0 24px 60px -16px rgba(0,0,0,.85);">
  </div>
  <div class="hs" style="font-size:40px;margin-top:26px;">Two posters, <span class="m">one system.</span></div>
</div>

<!-- apparel -->
<div class="t paper c" style="grid-area:8/1/9/2;">
  <div class="art" style="display:flex;gap:10px;">
    <div style="flex:1;min-width:0;"><img class="fit" src="${img("public", "images", "lrhs-apparel", "jersey.png")}"></div>
    <div style="flex:1;min-width:0;"><img class="fit" src="${img("public", "images", "lrhs-apparel", "hoodie.png")}"></div>
  </div>
  <div class="hs" style="font-size:36px;margin-top:22px;">Apparel</div>
</div>

<!-- voice -->
<div class="t dark" style="grid-area:8/2/9/3;">
  <div class="lab">Voice</div><div class="sp"></div>
  <div class="h" style="font-size:58px;line-height:1.02;">Proud.<br><span class="g">Grounded.</span><br>Together.</div>
  <div class="sub" style="font-size:25px;margin-top:16px;">Written for staff, not designers.</div>
</div>

<!-- academic powerhouse -->
<div class="t paper c" style="grid-area:8/3/9/4;">
  <div class="art" style="display:flex;gap:14px;">
    <div style="flex:1;min-width:0;"><img class="fit" src="${img("public", "images", "lrhs-powerhouse", "powerhouse-lr.svg")}"></div>
    <div style="flex:1;min-width:0;"><img class="fit" src="${img("public", "images", "lrhs-powerhouse", "powerhouse-mustang.svg")}"></div>
  </div>
  <div class="hs" style="font-size:34px;margin-top:22px;">Academic Powerhouse</div>
  <div class="sub" style="font-size:22px;margin-top:6px;">From an AI image to a real mark.</div>
</div>

<!-- see it all -->
<div class="t field c" style="grid-area:8/4/9/5;padding:40px 30px 38px;">
  <div class="vig"></div>
  <div class="lab rel">See it all</div>
  <div class="sp"></div>
  <div style="position:relative;background:#fff;border-radius:24px;padding:13px;">
    <img src="${img("deck", "img", "qr-site.png")}" style="width:184px;height:184px;display:block;"></div>
  <div class="sp"></div>
  <div class="ind rel" style="font-size:31px;white-space:nowrap;">bronxhanratty.me</div>
  <div class="rel" style="font-size:15.5px;color:#A9C9B6;margin-top:12px;line-height:1.45;">Designed by Bronx Hanratty · Class of 2030<br>Concept work · not affiliated<br>with the school district</div>
</div>

</div></body></html>`;

/* scripts/render-bento-motion.mjs builds the motion cut from this same page:
   with BENTO_HTML set, hand over the HTML and stop before the still render. */
if (process.env.BENTO_HTML) { fs.writeFileSync(process.env.BENTO_HTML, html); process.exit(0); }

fs.mkdirSync(OUT, { recursive: true });
const tmp = path.join(os.tmpdir(), "lrhs-bento-vertical.html");
fs.writeFileSync(tmp, html);
const browser = await chromium.launch({
  executablePath: process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true,
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.goto("file:///" + tmp.replace(/\\/g, "/").replace(/^\//, ""));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
const problems = await page.evaluate(() => {
  const out = [];
  for (const i of document.images) if (!i.complete || i.naturalWidth === 0) out.push("broken image");
  for (const t of document.querySelectorAll(".t")) if (t.scrollHeight > t.clientHeight + 2 || t.scrollWidth > t.clientWidth + 2) out.push("overflow in tile: " + t.textContent.trim().slice(0, 30));
  for (const e of document.querySelectorAll(".ind,.h,.hs")) if (e.scrollWidth > e.clientWidth + 2) out.push("text too wide: " + e.textContent.trim().slice(0, 30));
  for (const sw of document.querySelectorAll(".sw")) { const r = sw.getBoundingClientRect();
    for (const c of sw.children) { const cr = c.getBoundingClientRect(); if (c.scrollWidth > c.clientWidth + 1 || cr.right > r.right - 21) out.push("swatch text too wide: " + c.textContent.trim()); } }
  if (!document.fonts.check("900 40px Industry") || !document.fonts.check("400 20px Hanken")) out.push("font missing");
  return out;
});
const shot = await page.screenshot({ type: "png" });
await browser.close();
fs.unlinkSync(tmp);

await sharp(shot).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(OUT, "lrhs-bento-vertical-8k.jpg"));
console.log(problems.length ? "PROBLEMS:\n  " + problems.join("\n  ") : "no overflow, no broken images, fonts loaded");
console.log(`wrote ${OUT}/lrhs-bento-vertical-8k.jpg (4320x7680)`);
