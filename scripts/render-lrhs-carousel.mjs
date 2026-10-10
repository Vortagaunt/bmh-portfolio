/**
 * The LRHS brand system as an Instagram carousel — every tile of the keynote
 * bento (scripts/render-lrhs-bento.mjs) blown up to its own 4:5 feed post.
 *
 * One shell on every slide, so the carousel doesn't jump as you swipe: true-
 * black canvas, a top bar (mini LR + "Mustangs Ahead" + page count), one big
 * rounded tile, and a bottom bar. Tile styles, type and gradients match the
 * bento: flat graphite / paper / field / Spirit Red tiles, sentence-case two-
 * tone headlines in Hanken Grotesk, Industry Black for numerals and specimens.
 *
 * Emits assets/social/lrhs-carousel/lrhs-carousel-NN-<name>.jpg at 1080x1350
 * (rendered at 2x, downscaled with lanczos), plus a contact sheet.
 *
 * Run: node scripts/render-lrhs-carousel.mjs
 *   optional env: LRHS_ROOT, OUT_DIR, CHROME, HANKEN_FONT, INDUSTRY_FONT
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = process.env.LRHS_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT_DIR || path.join(root, "assets", "social", "lrhs-carousel");
const userFonts = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "Windows", "Fonts");

function font(label, candidates) {
  const found = candidates.find((p) => p && fs.existsSync(p));
  if (!found) { console.error(`${label} not found`); process.exit(1); }
  const ext = path.extname(found).toLowerCase();
  const fmt = ext === ".otf" ? "opentype" : ext === ".woff2" ? "woff2" : "truetype";
  const mime = ext === ".otf" ? "font/otf" : ext === ".woff2" ? "font/woff2" : "font/ttf";
  return `url(data:${mime};base64,${fs.readFileSync(found).toString("base64")}) format('${fmt}')`;
}
const INDUSTRY = font("Industry Black", [process.env.INDUSTRY_FONT, path.join(userFonts, "industry-black.otf"),
  path.join(root, "deck", "fonts", "industry-black.otf")]);
const HANKEN = font("Hanken Grotesk", [process.env.HANKEN_FONT, path.join(userFonts, "HankenGrotesk-VariableFont_wght.ttf")]);

const uri = (file) => {
  const t = file.endsWith(".svg") ? "image/svg+xml" : file.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${t};base64,${fs.readFileSync(file).toString("base64")}`;
};
const mark = (name) => uri(path.join(root, "public", "images", "lrhs-marks", name));
const img = (...p) => uri(path.join(root, ...p));
const png = (slug) => img("deck", "img", "marks", `${slug}.png`);   // prepare-assets' rasters

const ICON_DIR = path.join(root, "node_modules", "lucide-react", "dist", "esm", "icons");
function icon(name, size, sw = 1.8) {
  const src = fs.readFileSync(path.join(ICON_DIR, `${name}.js`), "utf8");
  const nodes = new Function("return " + src.match(/const __iconNode = (\[[\s\S]*?\n\]);/)[1])();
  const body = nodes.map(([tag, attrs]) =>
    `<${tag} ${Object.entries(attrs).filter(([k]) => k !== "key").map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
const ARROW = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
  stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

const RED = "#AA2121";
const FIELD = `radial-gradient(120% 95% at 18% 10%, #0A5733 0%, rgba(10,87,51,0) 62%),
  radial-gradient(110% 100% at 88% 96%, #021A10 0%, rgba(2,26,16,0) 58%),
  linear-gradient(146deg, #04482A 0%, #003C24 44%, #05281A 100%)`;
const DISCLAIMER = "Concept work · not affiliated with the school district";

/* the library, in catalogue order; true = reversed mark, sits on green */
const LIBRARY = [
  ["LRHS-Emblem"], ["LRHS-Emblem-2"], ["LRHS-Emblem-3"], ["LRHS-Emblem-Mono-2"], ["LRHS-Emblem-Mono", true],
  ["LRHS-Wordmark-2"], ["LRHS-Wordmark"], ["LRHS-Wordmark-3"],
  ["LRHS-Mustang-2"], ["LRHS-Mustang-4"], ["LRHS-Mustang-3"], ["LRHS-Mustang", true],
  ["LRHS-Band-Emblem"], ["LRHS-Band"],
  ["LRHS-Grad-Mark"], ["LRHS-Grad-Mark-Alt"], ["LRHS-Grad-Mark-Mono"],
  ["LRHS-Mustangs-Ahead"], ["LRHS-Mustangs-Ahead-3", true], ["LRHS-Mustangs-Ahead-2"], ["LRHS-Mustangs-Ahead-4", true],
  ["LRHS-Mustangs-Ahead-Alt"], ["LRHS-Mustangs-Ahead-5"],
  ["LRHS-Retro-Logo"], ["LRHS-Retro-Logo-2"],
];
const SWATCHES = [
  ["Mustang Green", "#033922", "Primary", "#fff"],
  ["Field Green", "#144B2C", "Depth", "#fff"],
  ["Bright Pine", "#1C6E40", "Accents", "#fff"],
  ["Spirit Red", "#AA2121", "Rare accent", "#fff"],
  ["Ink", "#0B0B0B", "Contrast", "#fff"],
  ["Paper", "#FBFBF9", "Background", "#3A4A42"],
];
const APPAREL = [["cap", "Cap"], ["hoodie", "Hoodie"], ["jersey", "Jersey"], ["crewneck", "Crewneck"], ["polo", "Polo"]];

const ghost = (w, right, top) => `<div style="position:absolute;inset:0;overflow:hidden;">
  <img class="ghost" src="${mark("LRHS Mustang 4.svg")}" style="width:${w}px;right:${right}px;top:${top}px;"></div><div class="vig"></div>`;

/* ---------------- the slides: [file name, tile html, bottom-left text] ---------------- */
const SLIDES = [
["cover", `
<div class="t field c" style="padding:64px 60px 60px;">
  ${ghost(1300, -560, 420)}
  <div class="art" style="margin:6px 0 46px;"><img class="fit" src="${mark("LRHS Emblem Mono.svg")}"></div>
  <div class="ind rel" style="font-size:96px;white-space:nowrap;">Mustangs Ahead</div>
  <div class="sub rel" style="font-size:34px;margin-top:22px;color:#D6E2DA;">The Lakewood Ranch High School brand system.</div>
  <div class="rel" style="margin-top:46px;display:inline-flex;align-items:center;gap:12px;padding:15px 26px 15px 30px;border-radius:999px;
       background:rgba(255,255,255,.13);font-size:25px;font-weight:600;">Swipe through the system ${ARROW}</div>
</div>`, DISCLAIMER],

["student-id", `
<div class="t dark c" style="padding-bottom:0;">
  <div class="lab"><span class="new">New</span>Student ID</div>
  <div class="h" style="margin-top:22px;">A card every student <span class="m">carries.</span></div>
  <div class="sub" style="margin-top:18px;">Front and back, with 24/7 support lines.</div>
  <div class="art" style="margin-top:14px;">
    <img src="${img("public", "images", "lrhs-ids", "student-back.png")}" style="position:absolute;height:650px;left:50%;top:50%;
      transform:translate(-50%,-50%) translate(-160px,-10px) rotate(-7deg);filter:drop-shadow(0 30px 50px rgba(0,0,0,.6));">
    <img src="${img("public", "images", "lrhs-ids", "student-front.png")}" style="position:absolute;height:650px;left:50%;top:50%;
      transform:translate(-50%,-50%) translate(150px,14px) rotate(4deg);filter:drop-shadow(0 40px 60px rgba(0,0,0,.7));">
  </div>
</div>`],

["one-horse", `
<div class="t paper">
  <div class="lab">The mustang</div>
  <div class="art" style="margin:20px -20px 34px;"><img class="fit" src="${mark("LRHS Mustang 4.svg")}"></div>
  <div class="h">One horse, <span class="m">drawn once.</span></div>
  <div class="sub" style="margin-top:18px;">The same file on a scoreboard, a jersey and a favicon.</div>
</div>`],

["mark-library", `
<div class="t dark">
  <div class="lab">The mark library</div>
  <div style="display:flex;align-items:flex-end;gap:40px;margin-top:26px;">
    <div class="ind" style="font-size:250px;line-height:.78;"><span class="g">25</span></div>
    <div class="h" style="font-size:66px;padding-bottom:2px;">Marks.<br><span class="m">Seven families.</span></div>
  </div>
  <div class="art" style="margin-top:44px;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(5,1fr);gap:12px;">
    ${LIBRARY.map(([s, dark]) => `<div style="position:relative;border-radius:20px;background:${dark ? "#033922" : "#EEF0EE"};">
      <img src="${png(s)}" style="position:absolute;inset:14px;width:calc(100% - 28px);height:calc(100% - 28px);object-fit:contain;"></div>`).join("")}
  </div>
</div>`],

["crest", `
<div class="t paper c">
  <div class="lab">The crest</div>
  <div class="art" style="margin:28px 0 36px;"><img class="fit" src="${mark("LRHS Grad Mark.svg")}"></div>
  <div class="h">Founded <span class="g">1998.</span></div>
  <div class="sub" style="margin-top:16px;">Diplomas, programmes and awards.</div>
</div>`],

["colour", `
<div class="t" style="padding:0;flex-direction:row;">
  ${SWATCHES.map(([n, hex, role, fg], i) => `
    <div class="sw" style="flex:1 1 0;min-width:0;background:${hex};color:${fg};padding:58px 20px 56px;display:flex;flex-direction:column;">
      ${i === 0 ? `<div class="lab" style="color:rgba(255,255,255,.8);">Colour</div>` : ""}
      <div class="sp"></div>
      <div style="font-size:28px;font-weight:700;line-height:1.1;min-height:2.2em;display:flex;align-items:flex-end;letter-spacing:-.01em;">${n.replace(" ", "<br>")}</div>
      <div style="font-size:20px;opacity:.8;margin-top:10px;letter-spacing:.03em;white-space:nowrap;">${hex}</div>
      <div style="font-size:13.5px;opacity:.72;margin-top:6px;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;">${role}</div>
    </div>`).join("")}
</div>`],

["type", `
<div class="t dark">
  <div class="lab">Type &amp; icons</div>
  <div class="sp"></div>
  <div class="ind" style="font-size:148px;line-height:.92;">Go<br><span class="g">Mustangs</span></div>
  <div class="sp"></div>
  <div class="hs" style="font-size:40px;line-height:1.28;">Industry Black <span class="m">for headlines.</span><br>Hanken Grotesk <span class="m">for everything else.</span></div>
  <div style="display:flex;justify-content:space-between;color:#46C27E;margin-top:50px;">
    ${["trophy", "graduation-cap", "music", "calendar", "megaphone", "map-pin"].map((n) => icon(n, 64, 1.7)).join("")}
  </div>
</div>`],

["softer-corners", `
<div class="t paper" style="padding:0;">
  <div style="position:relative;flex:1;min-height:0;overflow:hidden;background:#ECEDEA;">
    <img src="${mark("LRHS Emblem.svg")}" style="position:absolute;width:${1944.33 * 0.7}px;left:${-30 * 0.7 + 74}px;top:${-30 * 0.7 + 70}px;">
  </div>
  <div style="padding:46px 60px 58px;">
    <div class="lab">The emblem</div>
    <div class="h" style="margin-top:14px;">Softer corners.</div>
    <div class="sub" style="margin-top:14px;">The same in all seven emblem files.</div>
  </div>
</div>`],

["band", `
<div class="t paper c">
  <div class="lab">The band</div>
  <div class="art" style="margin:30px 0 40px;"><img class="fit" src="${mark("LRHS Band Emblem.svg")}"></div>
  <div class="h">The Mustang Band.</div>
  <div class="sub" style="margin-top:16px;">Its own mark, from the same family.</div>
</div>`],

["newsletter-podcast", `
<div class="t dark c">
  <div class="lab">Mustangs Ahead</div>
  <div class="art" style="margin:30px 0 40px;"><img class="fit" src="${img("assets", "podcast", "lrhs-podcasts-mustangs-ahead.svg")}"></div>
  <div class="h">Newsletter <span class="m">+ podcast.</span></div>
  <div class="sub" style="margin-top:16px;">One name for both, and a mark for each.</div>
</div>`],

["game-day", `
<div class="t red">
  <img src="${img("deck", "img", "emblem-white.png")}" style="position:absolute;right:56px;top:52px;width:190px;opacity:.95;">
  <div class="lab">Game day</div><div class="sp"></div>
  <div class="ind" style="font-size:210px;line-height:.88;">Spirit<br>Red</div>
  <div class="sub" style="margin-top:34px;font-size:36px;color:rgba(255,255,255,.88);">Full volume on game day. Rare everywhere else.</div>
</div>`],

["posters", `
<div class="t dark c">
  <div class="art">
    <img src="${img("public", "images", "lrhs-signage", "poster-name.jpg")}" style="position:absolute;left:0;top:24px;width:86%;border-radius:22px;
      transform:rotate(-3deg);box-shadow:0 30px 60px -24px rgba(0,0,0,.8);">
    <img src="${img("public", "images", "lrhs-signage", "poster-go-mustangs.jpg")}" style="position:absolute;right:0;bottom:24px;width:86%;border-radius:22px;
      transform:rotate(2.5deg);box-shadow:0 34px 70px -20px rgba(0,0,0,.9);">
  </div>
  <div class="h" style="margin-top:44px;">Two posters, <span class="m">one system.</span></div>
</div>`],

["apparel", `
<div class="t paper c">
  <div class="lab">Apparel</div>
  <div class="art" style="margin:26px 0 34px;display:flex;flex-direction:column;gap:18px;">
    <div style="flex:1;min-height:0;display:flex;gap:18px;">
      ${APPAREL.slice(0, 3).map(([f]) => `<div style="flex:1;min-width:0;position:relative;"><img class="fit abs" src="${img("deck", "img", "apparel", `${f}.png`)}"></div>`).join("")}
    </div>
    <div style="flex:1;min-height:0;display:flex;gap:18px;padding:0 15%;">
      ${APPAREL.slice(3).map(([f]) => `<div style="flex:1;min-width:0;position:relative;"><img class="fit abs" src="${img("deck", "img", "apparel", `${f}.png`)}"></div>`).join("")}
    </div>
  </div>
  <div class="h">The part students <span class="m">actually wear.</span></div>
</div>`],

["academic-powerhouse", `
<div class="t paper c">
  <div class="lab">Academic Powerhouse</div>
  <div class="art" style="margin:28px 0 36px;display:grid;grid-template-rows:.82fr 1.18fr;gap:26px;">
    <div style="position:relative;display:flex;justify-content:center;">
      <div style="position:relative;height:100%;aspect-ratio:1;background:#FEFEFE;border-radius:30px;box-shadow:0 24px 50px -24px rgba(12,12,12,.35);">
        <img class="fit abs" src="${img("deck", "img", "powerhouse", "powerhouse-ai-original.png")}" style="inset:16px;width:calc(100% - 32px);height:calc(100% - 32px);">
        <span class="chip" style="background:#5A6A61;">Today · AI image</span>
      </div>
    </div>
    <div style="position:relative;display:flex;gap:30px;">
      <span class="chip" style="background:${RED};left:50%;transform:translateX(-50%);top:-6px;">Redrawn · vector</span>
      <div style="flex:1;min-width:0;position:relative;"><img class="fit abs" src="${img("deck", "img", "powerhouse", "powerhouse-lr.svg")}" style="top:40px;height:calc(100% - 40px);"></div>
      <div style="flex:1;min-width:0;position:relative;"><img class="fit abs" src="${img("deck", "img", "powerhouse", "powerhouse-mustang.svg")}" style="top:40px;height:calc(100% - 40px);"></div>
    </div>
  </div>
  <div class="h" style="font-size:76px;">From an AI image <span class="m">to a real mark.</span></div>
</div>`],

["voice", `
<div class="t dark">
  <div class="lab">Voice</div><div class="sp"></div>
  <div class="h" style="font-size:150px;line-height:1;">Proud.<br><span class="g">Grounded.</span><br>Together.</div>
  <div class="sub" style="margin-top:34px;font-size:36px;">Written for staff, not designers.</div>
</div>`],

["mustang-studio", `
<div class="t paper">
  <div class="lab"><span class="new">New</span>Mustang Studio</div>
  <div class="h" style="margin-top:22px;">On brand,<br><span class="m">every time.</span></div>
  <div class="sub" style="margin-top:20px;">A design app with every mark, template and rule built in.</div>
  <div style="position:absolute;inset:0;overflow:hidden;">
    <div style="position:absolute;left:60px;top:456px;width:1120px;border-radius:22px;overflow:hidden;
         box-shadow:0 0 0 1px rgba(0,0,0,.2),0 40px 80px -24px rgba(12,12,12,.55);">
      <img src="${img("assets", "studio", "mustang-studio-ui.png")}" style="display:block;width:100%;">
    </div>
  </div>
</div>`],

["see-it-all", `
<div class="t field c">
  <div class="vig"></div>
  <div class="lab rel">See it all</div>
  <div class="h rel" style="margin-top:18px;">Every mark.<br><span class="m">The full guidelines.</span></div>
  <div class="art" style="display:flex;align-items:center;justify-content:center;margin:34px 0;">
    <div style="background:#fff;border-radius:44px;padding:30px;box-shadow:0 40px 80px -30px rgba(0,0,0,.6);">
      <img src="${img("deck", "img", "qr-site.png")}" style="width:400px;height:400px;display:block;"></div>
  </div>
  <div class="ind rel" style="font-size:68px;">bronxhanratty.me</div>
  <div class="rel" style="font-size:23px;color:#BCD3C5;margin-top:18px;">Designed by Bronx Hanratty · LRHS Class of 2030</div>
</div>`, DISCLAIMER],
];

const W = 1080, H = 1350, N = SLIDES.length;
const CSS = `
@font-face{font-family:'Industry';src:${INDUSTRY};font-weight:900;}
@font-face{font-family:'Hanken';src:${HANKEN};font-weight:100 900;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000;}
body{font-family:'Hanken',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;
  --fg:#F5F5F7;--mute:#8B938E;color:var(--fg);position:relative;}
.bar{position:absolute;left:52px;right:52px;height:44px;display:flex;align-items:center;justify-content:space-between;}
.top{top:36px;} .bot{bottom:36px;}
.brand{display:flex;align-items:center;gap:14px;font-size:23px;font-weight:650;letter-spacing:-.01em;color:#F5F5F7;}
.brand img{height:34px;width:auto;display:block;}
.count{font-size:22px;font-weight:600;color:#8B938E;font-variant-numeric:tabular-nums;letter-spacing:.02em;}
.foot{font-size:20px;font-weight:550;color:#7C847F;}
.t{position:absolute;left:40px;right:40px;top:108px;bottom:108px;border-radius:58px;overflow:hidden;padding:60px;
  display:flex;flex-direction:column;}
.dark{background:#161917;}
.paper{background:#F5F5F3;--fg:#0B0B0B;--mute:#6C736E;color:var(--fg);}
.field{background:${FIELD};--mute:#BCD3C5;}
.red{background:linear-gradient(160deg,#C42B2B 0%,${RED} 48%,#7A1616 100%);--mute:rgba(255,255,255,.74);}
.c{align-items:center;text-align:center;}
.rel{position:relative;}
.lab{position:relative;font-size:30px;font-weight:600;letter-spacing:-.005em;color:var(--mute);line-height:1.2;}
.h{position:relative;font-size:84px;font-weight:700;letter-spacing:-.036em;line-height:1.0;text-wrap:balance;}
.hs{position:relative;font-weight:700;letter-spacing:-.028em;}
.sub{position:relative;font-size:32px;font-weight:500;line-height:1.3;color:var(--mute);letter-spacing:-.01em;text-wrap:balance;}
.m{color:var(--mute);}
.ind{font-family:'Industry',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.005em;line-height:.9;}
.g{background:linear-gradient(172deg,#A6F5C8 0%,#46C27E 42%,#1E8C4E 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}
.paper .g{background-image:linear-gradient(172deg,#24965A 0%,#0B5A35 50%,#033922 100%);}
.sp{flex:1;min-height:0;}
.art{flex:1;min-height:0;width:100%;position:relative;}
.fit{width:100%;height:100%;object-fit:contain;display:block;}
.abs{position:absolute;inset:0;}
.ghost{position:absolute;opacity:.05;filter:brightness(0) invert(1);}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(130% 110% at 50% 40%,rgba(0,0,0,0) 45%,rgba(0,0,0,.32) 100%);}
.new{display:inline-block;background:${RED};color:#fff;font-size:22px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  padding:7px 14px 6px;border-radius:999px;vertical-align:4px;margin-right:12px;}
.chip{position:absolute;left:18px;top:18px;z-index:2;color:#fff;font-size:18px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  padding:8px 14px 7px;border-radius:999px;white-space:nowrap;}
`;
const LR = img("deck", "img", "emblem-white.png");
const page = ([, tile, foot], i) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="bar top"><div class="brand"><img src="${LR}">Mustangs Ahead</div><div class="count">${String(i + 1).padStart(2, "0")} / ${N}</div></div>
${tile}
<div class="bar bot"><div class="foot">${foot || "Lakewood Ranch High School · Brand system"}</div><div class="foot">bronxhanratty.me</div></div>
</body></html>`;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true,
});
const pg = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
const problems = [], files = [];
for (let i = 0; i < N; i++) {
  const tmp = path.join(os.tmpdir(), `lrhs-carousel-${i}.html`);
  fs.writeFileSync(tmp, page(SLIDES[i], i));
  await pg.goto("file:///" + tmp.replace(/\\/g, "/").replace(/^\//, ""));
  await pg.evaluate(async () => { await document.fonts.load("900 40px Industry"); await document.fonts.load("400 20px Hanken"); await document.fonts.ready; });
  await pg.waitForTimeout(250);
  const p = await pg.evaluate(() => {
    const out = [];
    for (const im of document.images) if (!im.complete || im.naturalWidth === 0) out.push("broken image");
    const t = document.querySelector(".t");
    if (t.scrollHeight > t.clientHeight + 2 || t.scrollWidth > t.clientWidth + 2) out.push("tile overflow");
    for (const e of document.querySelectorAll(".ind,.h,.hs,.sub,.lab")) if (e.scrollWidth > e.clientWidth + 2) out.push("text too wide: " + e.textContent.trim().slice(0, 24));
    for (const sw of document.querySelectorAll(".sw")) { const r = sw.getBoundingClientRect();
      for (const c of sw.children) { const cr = c.getBoundingClientRect(); if (cr.right > r.right - 19) out.push("swatch text: " + c.textContent.trim()); } }
    if (!document.fonts.check("900 40px Industry") || !document.fonts.check("400 20px Hanken")) out.push("font missing");
    return out;
  });
  if (p.length) problems.push(`${i + 1} ${SLIDES[i][0]}: ${p.join("; ")}`);
  const shot = await pg.screenshot({ type: "png" });
  fs.unlinkSync(tmp);
  const name = `lrhs-carousel-${String(i + 1).padStart(2, "0")}-${SLIDES[i][0]}.jpg`;
  await sharp(shot).resize(W, H, { kernel: "lanczos3" }).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(OUT, name));
  files.push(name);
}
await browser.close();

/* contact sheet: every slide in order, for checking the run at a glance */
const TW = 270, TH = 338, COLS = 6, GAP = 16;
const rows = Math.ceil(N / COLS);
const tiles = await Promise.all(files.map(async (f, i) => ({
  input: await sharp(path.join(OUT, f)).resize(TW, TH).toBuffer(),
  left: GAP + (i % COLS) * (TW + GAP), top: GAP + Math.floor(i / COLS) * (TH + GAP),
})));
await sharp({ create: { width: GAP + COLS * (TW + GAP), height: GAP + rows * (TH + GAP), channels: 3, background: "#222" } })
  .composite(tiles).jpeg({ quality: 88 }).toFile(path.join(OUT, "_contact-sheet.jpg"));

console.log(problems.length ? "PROBLEMS:\n  " + problems.join("\n  ") : "no overflow, no broken images, fonts loaded");
console.log(`wrote ${N} slides to ${OUT}`);
