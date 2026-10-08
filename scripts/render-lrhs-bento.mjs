/**
 * The LRHS brand system on one page — a keynote-style bento of every major part
 * of the guidelines, for after the principal approved the logos.
 *
 * Emits:
 *   assets/flyer/lrhs-bento.jpg      3840x2160, for sharing and the deck
 *   assets/flyer/lrhs-bento-8k.jpg   7680x4320, for print
 *
 * Set in the brand's own type: Industry Black for headlines, Hanken Grotesk for
 * everything else. Both are read from where Windows installs per-user fonts
 * (Industry Black is licensed and never committed) and inlined into the
 * throwaway render HTML, so neither ships as a file.
 *
 * Every mark is the catalogue's own SVG, inlined — nothing is redrawn.
 *
 * Run: node scripts/render-lrhs-bento.mjs
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "assets", "flyer");
const userFonts = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "Windows", "Fonts");

function font(name, also = []) {
  const found = [...also, path.join(userFonts, name)].find((p) => p && fs.existsSync(p));
  if (!found) { console.error(`${name} not found in ${userFonts}`); process.exit(1); }
  return fs.readFileSync(found).toString("base64");
}
const INDUSTRY = font("industry-black.otf", [path.join(root, "deck", "fonts", "industry-black.otf")]);
const HANKEN = font("HankenGrotesk-VariableFont_wght.ttf");

const uri = (file, type) => `data:${type};base64,${fs.readFileSync(file).toString("base64")}`;
const mark = (name) => uri(path.join(root, "public", "images", "lrhs-marks", name), "image/svg+xml");
const img = (...p) => {
  const f = path.join(root, ...p);
  return uri(f, f.endsWith(".svg") ? "image/svg+xml" : f.endsWith(".png") ? "image/png" : "image/jpeg");
};

/* lucide glyphs straight from the package, as on the iconography board */
const ICON_DIR = path.join(root, "node_modules", "lucide-react", "dist", "esm", "icons");
function icon(name, size) {
  const src = fs.readFileSync(path.join(ICON_DIR, `${name}.js`), "utf8");
  const nodes = new Function("return " + src.match(/const __iconNode = (\[[\s\S]*?\n\]);/)[1])();
  const body = nodes.map(([tag, attrs]) =>
    `<${tag} ${Object.entries(attrs).filter(([k]) => k !== "key").map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

const GREEN = "#033922", BRIGHT = "#2EA866", RED = "#AA2121";
const INK = "#0B0B0B", PAPER = "#FBFBF9";
const FIELD = `radial-gradient(120% 95% at 18% 10%, #0A5733 0%, rgba(10,87,51,0) 62%),
  radial-gradient(110% 100% at 88% 96%, #021A10 0%, rgba(2,26,16,0) 58%),
  linear-gradient(146deg, #04482A 0%, #003C24 44%, #05281A 100%)`;

const FAMILIES = [
  ["Emblem", 5, "Athletics & the whole school"],
  ["Wordmark", 3, "Front office & signage"],
  ["Mustang", 4, "Icons, avatars, watermarks"],
  ["Band", 2, "The Mustang Band"],
  ["Crest", 3, "Graduation & awards"],
  ["Mustangs Ahead", 6, "Newsletter & podcast"],
  ["Retro", 2, "Spirit wear & reunions"],
];
const SWATCHES = [
  ["Mustang Green", "#033922", "Primary", 24, "#fff"],
  ["Field Green", "#144B2C", "Depth", 15, "#fff"],
  ["Bright Pine", "#1C6E40", "Accents", 15, "#fff"],
  ["Spirit Red", "#AA2121", "Rare accent", 14, "#fff"],
  ["Ink", "#0B0B0B", "Contrast", 15, "#fff"],
  ["Paper", "#FBFBF9", "Background", 17, "#3A4A42"],
];

const W = 3840, H = 2160;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Industry';src:url(data:font/otf;base64,${INDUSTRY}) format('opentype');font-weight:900;}
@font-face{font-family:'Hanken';src:url(data:font/ttf;base64,${HANKEN}) format('truetype');font-weight:100 900;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#06130D;}
body{font-family:'Hanken',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;color:#fff;}
.grid{position:absolute;inset:96px;display:grid;gap:28px;
  grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(4,1fr);}
.t{position:relative;border-radius:44px;overflow:hidden;padding:44px;display:flex;flex-direction:column;}
.dark{background:linear-gradient(180deg,#132E22 0%,#0D2219 100%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);}
.paper{background:${PAPER};color:${INK};}
.field{background:${FIELD};}
.red{background:linear-gradient(150deg,#C02A2A 0%,${RED} 45%,#7E1717 100%);}
.eb{font-size:23px;font-weight:650;letter-spacing:.2em;text-transform:uppercase;color:#8FA79A;}
.paper .eb{color:#5A6A61;} .red .eb{color:rgba(255,255,255,.78);} .field .eb{color:#A9C9B6;}
.h{font-family:'Industry',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.01em;line-height:.92;}
.p{font-size:27px;line-height:1.42;color:#B6C8BE;font-weight:450;}
.paper .p{color:#4A5A52;} .red .p{color:rgba(255,255,255,.88);} .field .p{color:#D6E2DA;}
.sp{flex:1;}
.fit{width:100%;height:100%;object-fit:contain;display:block;}
.ghost{position:absolute;opacity:.05;filter:brightness(0) invert(1);pointer-events:none;}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(130% 110% at 50% 40%,rgba(0,0,0,0) 45%,rgba(0,0,0,.32) 100%);}
.pill{display:inline-flex;align-items:center;gap:14px;padding:14px 24px 14px 18px;border-radius:999px;
  background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);
  font-size:23px;font-weight:650;letter-spacing:.16em;text-transform:uppercase;color:#fff;align-self:flex-start;}
</style></head><body><div class="grid">

<!-- hero -->
<div class="t field" style="grid-area:1/1/3/3;">
  <div style="position:absolute;inset:0;overflow:hidden;"><img class="ghost" src="${mark("LRHS Mustang 4.svg")}" style="width:1500px;right:-520px;top:180px;"></div>
  <div class="vig"></div>
  <div style="position:relative;flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:10px 0 34px;">
    <img src="${mark("LRHS Emblem Mono.svg")}" style="height:100%;max-height:520px;">
  </div>
  <div style="position:relative;">
    <div class="pill" style="color:#fff;">${icon("badge-check", 34)}<span>Approved by the principal · October 2026</span></div>
    <div class="h" style="font-size:132px;margin:30px 0 20px;">Mustangs Ahead</div>
    <div class="p" style="font-size:31px;max-width:1000px;">The Lakewood Ranch High School brand system. One green, one mustang, one voice.</div>
  </div>
</div>

<!-- the library -->
<div class="t dark" style="grid-area:1/3/3/4;">
  <div class="eb">The mark library</div>
  <div class="h" style="font-size:200px;color:${BRIGHT};margin-top:22px;line-height:.82;">25</div>
  <div class="h" style="font-size:42px;margin:16px 0 24px;">Marks · 7 families</div>
  <div style="display:flex;flex-direction:column;gap:10px;">
    ${FAMILIES.map(([n, c, u]) => `
      <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:12px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <span style="font-size:25px;font-weight:650;">${n}</span>
          <span class="h" style="font-size:27px;color:${BRIGHT};">${c}</span></div>
        <div style="font-size:19px;color:#8FA79A;margin-top:4px;">${u}</div>
      </div>`).join("")}
  </div>
</div>

<!-- one horse -->
<div class="t paper" style="grid-area:1/4/2/6;flex-direction:row;gap:30px;">
  <div style="flex:0 0 560px;display:flex;flex-direction:column;">
    <div class="eb">The mustang</div><div class="sp"></div>
    <div class="h" style="font-size:72px;color:${GREEN};">One horse,<br>drawn once</div>
    <div class="p" style="margin-top:22px;">One silhouette in one colour — the same file on a scoreboard, a jersey and a favicon.</div>
  </div>
  <div style="flex:1;min-width:0;"><img class="fit" src="${mark("LRHS Mustang 4.svg")}"></div>
</div>

<!-- crest -->
<div class="t paper" style="grid-area:1/6/3/7;">
  <div class="eb">The crest</div>
  <div style="flex:1;min-height:0;padding:30px 0;"><img class="fit" src="${mark("LRHS Grad Mark.svg")}"></div>
  <div class="h" style="font-size:58px;color:${GREEN};">Founded 1998</div>
  <div class="p" style="margin-top:16px;">Diplomas, programmes and awards — kept for the moments that should feel permanent.</div>
</div>

<!-- colour -->
<div class="t" style="grid-area:2/4/3/6;padding:0;flex-direction:row;">
  ${SWATCHES.map(([n, hex, role, w, fg], i) => `
    <div style="flex:0 0 ${w}%;background:${hex};color:${fg};padding:34px 22px 34px ${i ? 22 : 44}px;display:flex;flex-direction:column;
         ${hex === PAPER ? "box-shadow:inset 1px 0 0 rgba(0,0,0,.06);" : ""}">
      ${i === 0 ? `<div class="eb" style="color:rgba(255,255,255,.8);">Colour</div>` : ""}
      <div class="sp"></div>
      <div style="font-size:23px;font-weight:700;line-height:1.15;white-space:nowrap;">${n}</div>
      <div style="font-size:19px;opacity:.8;margin-top:6px;letter-spacing:.04em;">${hex}</div>
      <div style="font-size:15px;opacity:.7;margin-top:4px;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;">${role}</div>
    </div>`).join("")}
</div>

<!-- type + icons -->
<div class="t dark" style="grid-area:3/1/4/3;">
  <div class="eb">Type &amp; icons</div>
  <div class="h" style="font-size:150px;margin-top:22px;">Go <span style="color:${BRIGHT};">Mustangs</span></div>
  <div class="sp"></div>
  <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:30px;">
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="font-size:27px;"><span class="h" style="font-size:30px;">Industry Black</span>
        <span style="color:#8FA79A;"> — headlines, uppercase</span></div>
      <div style="font-size:27px;"><span style="font-weight:700;">Hanken Grotesk</span>
        <span style="color:#8FA79A;"> — body &amp; UI</span></div>
    </div>
    <div style="display:flex;gap:18px;color:${BRIGHT};">
      ${["trophy", "graduation-cap", "music", "calendar", "megaphone", "map-pin"].map((n) => icon(n, 46)).join("")}
    </div>
  </div>
</div>

<!-- the emblem, softened -->
<div class="t paper" style="grid-area:3/3/4/4;padding:0;">
  <div style="position:relative;height:260px;overflow:hidden;background:#F0F1EF;">
    <img src="${mark("LRHS Emblem.svg")}" style="position:absolute;width:${1944.33 * 0.95}px;left:${30 * 0.95 + 26}px;top:${30 * 0.95 + 20}px;">
  </div>
  <div style="padding:30px 40px 36px;display:flex;flex-direction:column;flex:1;">
    <div class="eb">The emblem</div><div class="sp"></div>
    <div class="h" style="font-size:40px;color:${GREEN};">Softened corners</div>
    <div class="p" style="font-size:23px;margin-top:10px;">Identical in all seven emblem files.</div>
  </div>
</div>

<!-- band -->
<div class="t paper" style="grid-area:3/4/4/5;">
  <div style="flex:1;min-height:0;"><img class="fit" src="${mark("LRHS Band Emblem.svg")}"></div>
  <div class="eb" style="margin-top:22px;">The Mustang Band</div>
</div>

<!-- mustangs ahead -->
<div class="t dark" style="grid-area:3/5/4/6;align-items:center;">
  <div style="flex:1;min-height:0;width:100%;"><img class="fit" src="${img("assets", "podcast", "lrhs-podcasts-mustangs-ahead.svg")}"></div>
  <div class="eb" style="margin-top:22px;text-align:center;">Newsletter + podcast</div>
</div>

<!-- game day -->
<div class="t red" style="grid-area:3/6/4/7;">
  <div class="eb">Game day</div><div class="sp"></div>
  <div class="h" style="font-size:66px;">Spirit Red</div>
  <div class="p" style="margin-top:14px;font-size:24px;">The one true accent. Full volume on game day, rare everywhere else.</div>
</div>

<!-- signage -->
<div class="t" style="grid-area:4/1/5/2;padding:0;background:#000;">
  <img src="${img("public", "images", "lrhs-signage", "sign-after.jpg")}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
  <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(4,20,13,.96) 0%,rgba(4,20,13,.82) 34%,rgba(4,20,13,0) 72%);"></div>
  <div style="position:relative;margin-top:auto;padding:36px 40px;">
    <div class="eb" style="color:#A9C9B6;">Signage</div>
    <div class="h" style="font-size:40px;margin-top:12px;">The same wall, redrawn</div>
  </div>
</div>

<!-- posters -->
<div class="t dark" style="grid-area:4/2/5/3;">
  <div style="flex:1;min-height:0;position:relative;">
    <img src="${img("public", "images", "lrhs-signage", "poster-name.jpg")}" style="position:absolute;left:0;top:0;width:76%;border-radius:14px;box-shadow:0 20px 50px -20px rgba(0,0,0,.7);">
    <img src="${img("public", "images", "lrhs-signage", "poster-go-mustangs.jpg")}" style="position:absolute;right:0;bottom:0;width:76%;border-radius:14px;box-shadow:0 24px 60px -16px rgba(0,0,0,.85);">
  </div>
  <div class="eb" style="margin-top:20px;">Posters · one system</div>
</div>

<!-- apparel -->
<div class="t paper" style="grid-area:4/3/5/4;">
  <div style="flex:1;min-height:0;display:flex;gap:10px;">
    <div style="flex:1;min-width:0;"><img class="fit" src="${img("public", "images", "lrhs-apparel", "jersey.png")}"></div>
    <div style="flex:1;min-width:0;"><img class="fit" src="${img("public", "images", "lrhs-apparel", "hoodie.png")}"></div>
  </div>
  <div class="eb" style="margin-top:18px;">Apparel · one file</div>
</div>

<!-- academic powerhouse -->
<div class="t paper" style="grid-area:4/4/5/5;">
  <div style="flex:1;min-height:0;display:flex;gap:14px;">
    <div style="flex:1;min-width:0;"><img class="fit" src="${img("public", "images", "lrhs-powerhouse", "powerhouse-lr.svg")}"></div>
    <div style="flex:1;min-width:0;"><img class="fit" src="${img("public", "images", "lrhs-powerhouse", "powerhouse-mustang.svg")}"></div>
  </div>
  <div class="eb" style="margin-top:18px;">Academic Powerhouse</div>
  <div class="p" style="font-size:22px;margin-top:6px;">From an AI image to a real mark.</div>
</div>

<!-- voice -->
<div class="t dark" style="grid-area:4/5/5/6;">
  <div class="eb">Voice</div><div class="sp"></div>
  <div class="h" style="font-size:62px;line-height:1;">Proud<br><span style="color:${BRIGHT};">Grounded</span><br>Together</div>
  <div class="p" style="font-size:23px;margin-top:16px;">Written for staff, not for designers.</div>
</div>

<!-- see it all -->
<div class="t field" style="grid-area:4/6/5/7;">
  <div class="vig"></div>
  <div style="position:relative;display:flex;gap:26px;align-items:center;">
    <div style="background:#fff;border-radius:22px;padding:14px;flex:0 0 auto;">
      <img src="${img("deck", "img", "qr-site.png")}" style="width:150px;height:150px;display:block;"></div>
    <div><div class="eb">See it all</div>
      <div class="p" style="font-size:22px;margin-top:10px;">Every mark and the full guidelines, online.</div></div>
  </div>
  <div class="sp"></div>
  <div class="h" style="position:relative;font-size:42px;">bronxhanratty.me</div>
  <div class="p" style="position:relative;font-size:19px;margin-top:12px;">Designed by Bronx Hanratty · LRHS Class of 2030</div>
</div>

</div></body></html>`;

fs.mkdirSync(OUT, { recursive: true });
const tmp = path.join(os.tmpdir(), "lrhs-bento.html");
fs.writeFileSync(tmp, html);
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true,
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.goto("file:///" + tmp.replace(/\\/g, "/"));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
const problems = await page.evaluate(() => {
  const out = [];
  for (const i of document.images) if (!i.complete || i.naturalWidth === 0) out.push("broken image");
  for (const t of document.querySelectorAll(".t")) if (t.scrollHeight > t.clientHeight + 2 || t.scrollWidth > t.clientWidth + 2) out.push("overflow in tile: " + t.textContent.trim().slice(0, 30));
  if (!document.fonts.check("900 40px Industry") || !document.fonts.check("400 20px Hanken")) out.push("font missing");
  return out;
});
const shot = await page.screenshot({ type: "png" });
await browser.close();
fs.unlinkSync(tmp);

await sharp(shot).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(OUT, "lrhs-bento-8k.jpg"));
await sharp(shot).resize(W, H, { kernel: "lanczos3" }).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(OUT, "lrhs-bento.jpg"));
console.log(problems.length ? "PROBLEMS:\n  " + problems.join("\n  ") : "no overflow, no broken images, fonts loaded");
console.log("wrote assets/flyer/lrhs-bento.jpg (3840x2160) and lrhs-bento-8k.jpg (7680x4320)");
