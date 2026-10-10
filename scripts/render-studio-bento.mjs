/**
 * Mustang Studio on one page — a vertical (9:16) keynote-style bento of just the
 * app, in the same language as the LRHS bento: true-black canvas, flat graphite,
 * paper and field tiles, two-tone sentence-case headlines, Industry numerals.
 *
 * Every picture is the app's own output: screens captured by
 * scripts/capture-mustang-studio.mjs, templates exported by its renderer, motion
 * frames and carousel pages drawn by its motion and page code, and the staff-ID
 * sheet laid out the way its batch PDF lays them out (assets/studio/).
 *
 * Emits 8K only:
 *   assets/flyer/mustang-studio-bento-8k.jpg   4320x7680
 *
 * BENTO_LAYOUT=wide lays the same tiles out 16:9 (8 x 4 instead of 4 x 8), for
 * the deck's Mustang Studio section and the case study:
 *   assets/flyer/mustang-studio-bento-wide-8k.jpg   7680x4320
 *   assets/flyer/mustang-studio-bento-wide.jpg      3840x2160  (the deck slide)
 *
 * Fonts: Industry Black (licensed, never committed) and Hanken Grotesk, read from
 * the per-user font folder and inlined into the throwaway render HTML. Icons are
 * the app's own Lucide set (assets/studio/icons.json).
 *
 * Run: node scripts/render-studio-bento.mjs
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
const STUDIO = path.join(root, "assets", "studio");
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

const uri = (file) => `data:${file.endsWith(".png") ? "image/png" : "image/jpeg"};base64,${fs.readFileSync(file).toString("base64")}`;
const st = (name) => uri(path.join(STUDIO, name));
const ICONS = JSON.parse(fs.readFileSync(path.join(STUDIO, "icons.json"), "utf8"));
const icon = (name, size, sw = 1.8) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${(ICONS[name] || []).map(([tag, a]) =>
  `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("")}</svg>`;
/* part of a 1440 x 900 app screen ([x, y, w, h] in screen points), shown `width` px wide */
const crop = (file, [x, y, w, h], width, extra = "") => {
  const k = width / w;
  return `<div style="position:relative;width:${width}px;height:${Math.round(h * k)}px;overflow:hidden;border-radius:18px;
    box-shadow:0 0 0 1px rgba(255,255,255,.08),0 40px 80px -30px rgba(0,0,0,.7);${extra}">
    <img src="${st(file)}" style="position:absolute;left:${-x * k}px;top:${-y * k}px;width:${1440 * k}px;max-width:none;"></div>`;
};

const RED = "#AA2121";
const FIELD = `radial-gradient(120% 95% at 18% 10%, #0A5733 0%, rgba(10,87,51,0) 62%),
  radial-gradient(110% 100% at 88% 96%, #021A10 0%, rgba(2,26,16,0) 58%),
  linear-gradient(146deg, #04482A 0%, #003C24 44%, #05281A 100%)`;
const TPL = JSON.parse(fs.readFileSync(path.join(STUDIO, "templates.json"), "utf8"));
const STRIP = ["gameday", "news", "story-podcast", "podstory", "spotlight", "certificate", "id-student-front", "band", "final", "ridetogether", "honor", "schedule", "issue", "gamestory"]
  .filter((id) => TPL.some((t) => t.id === id));
const SEASONS = [["homecoming-week", "Homecoming", ["#C9A227", "#EAD9A0"]], ["pinkout-game", "Pink Out", ["#EC5C8D", "#F8D3DF"]],
  ["halloween-trunk", "Halloween", ["#E8731C", "#F6C453"]], ["winter-break", "Winter", ["#B9C2C6", "#E7EEF1"]]];
const ROLES = [["trophy", "Coach or athlete"], ["users", "Club or activity"], ["music", "Mustang Band"],
  ["podcast", "Newsletter or podcast"], ["school", "Front office or teacher"], ["star", "Student"]];
const STAFF = [["Name", "Title"], ["Ms. Rivera", "Math · Mathematics"], ["Mr. Okafor", "Director · Mustang Band"], ["Dr. Patel", "Principal · Administration"],
  ["Ms. Kim", "Counselor · Student Services"], ["Mr. Diaz", "Coach · Athletics"], ["Ms. Lee", "Librarian · Media Center"]];

const WIDE = process.env.BENTO_LAYOUT === "wide";
const W = WIDE ? 3840 : 2160, H = WIDE ? 2160 : 3840;   // CSS px; rendered at 2x = 8K
/* where each tile sits: grid-area row / column / row-end / column-end */
const AREA = WIDE ? {
  hero: "1/1/3/5", fill: "1/5/3/7", batch: "1/7/3/9",
  templates: "3/1/4/5", pages: "3/5/4/7", motion: "3/7/4/9",
  seasons: "4/1/5/3", check: "4/3/5/4", who: "4/4/5/5", runs: "4/5/5/7", export: "4/7/5/8", signoff: "4/8/5/9",
} : {
  hero: "1/1/3/5", fill: "3/1/5/3", batch: "3/3/5/5", templates: "5/1/6/5", pages: "6/1/7/3", motion: "6/3/7/5",
  seasons: "7/1/8/3", check: "7/3/8/4", who: "7/4/8/5", runs: "8/1/9/3", export: "8/3/9/4", signoff: "8/4/9/5",
};
const w = (wide, tall) => (WIDE ? wide : tall);   // a value that differs between the two layouts
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Industry';src:${INDUSTRY};font-weight:900;}
@font-face{font-family:'Hanken';src:${HANKEN};font-weight:100 900;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000;}
body{font-family:'Hanken',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;
  --fg:#F5F5F7;--mute:#8B938E;color:var(--fg);}
.grid{position:absolute;inset:88px;display:grid;gap:26px;grid-template-columns:repeat(${w(8, 4)},1fr);grid-template-rows:repeat(${w(4, 8)},1fr);}
.t{position:relative;border-radius:50px;overflow:hidden;padding:50px;display:flex;flex-direction:column;min-width:0;min-height:0;}
.dark{background:#161917;}
.app{background:#0b100d;}
.paper{background:#F5F5F3;--fg:#0B0B0B;--mute:#6C736E;color:var(--fg);}
.field{background:${FIELD};--mute:#BCD3C5;}
.c{align-items:center;text-align:center;}
.lab{font-size:29px;font-weight:600;letter-spacing:-.005em;color:var(--mute);line-height:1.2;white-space:nowrap;}
.lab svg{vertical-align:-6px;}
.h{font-size:58px;font-weight:700;letter-spacing:-.032em;line-height:1.04;text-wrap:balance;}
.hs{font-size:43px;font-weight:700;letter-spacing:-.028em;line-height:1.06;text-wrap:balance;}
.sub{font-size:29px;font-weight:500;line-height:1.32;color:var(--mute);letter-spacing:-.008em;text-wrap:balance;}
.m{color:var(--mute);}
.ind{font-family:'Industry',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:.005em;line-height:.9;}
.g{background:linear-gradient(172deg,#A6F5C8 0%,#46C27E 42%,#1E8C4E 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}
.paper .g{background-image:linear-gradient(172deg,#24965A 0%,#0B5A35 50%,#033922 100%);}
.sp{flex:1;min-height:0;}
.rel{position:relative;}
.art{flex:1;min-height:0;width:100%;position:relative;}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(130% 110% at 50% 40%,rgba(0,0,0,0) 45%,rgba(0,0,0,.32) 100%);}
.new{display:inline-block;background:${RED};color:#fff;font-size:22px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  padding:7px 14px 6px;border-radius:999px;vertical-align:3px;margin-right:12px;}
.chip{display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:999px;background:rgba(255,255,255,.09);
  font-size:26px;font-weight:600;white-space:nowrap;}
.paper .chip{background:rgba(11,11,11,.06);}
.card{border-radius:10px;box-shadow:0 0 0 1px rgba(255,255,255,.06),0 26px 50px -18px rgba(0,0,0,.8);display:block;}
.time{font-size:20px;font-weight:700;letter-spacing:.08em;color:var(--mute);margin-top:14px;text-align:center;}
</style></head><body><div class="grid">

<!-- hero: the app, big -->
<div class="t app" style="grid-area:${AREA.hero};padding:64px;">
  <div style="position:absolute;inset:0;background:radial-gradient(80% 90% at 0% 0%,rgba(46,168,102,.22) 0%,rgba(46,168,102,0) 60%);"></div>
  <div style="position:relative;z-index:1;width:760px;display:flex;flex-direction:column;flex:1;">
    <img src="${uri(path.join(STUDIO, "app-icon-1024.png"))}" style="width:124px;height:124px;filter:drop-shadow(0 24px 40px rgba(0,0,0,.6));">
    <div class="lab" style="margin-top:38px;"><span class="new">New</span>Version 1.6</div>
    <div class="ind" style="font-size:142px;margin-top:22px;">Mustang<br><span class="g">Studio</span></div>
    <div class="sub" style="font-size:31px;margin-top:28px;color:#C9D6CE;">A design app that only speaks Mustang. Anyone at school makes a flyer, a post or a poster &mdash; and it comes out on brand every time.</div>
    <div class="sp"></div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      ${["41 templates", "17 sizes", "25 marks", "28 brand checks"].map((t) => `<span class="chip" style="font-size:22px;padding:10px 18px;">${t}</span>`).join("")}
    </div>
  </div>
  <div style="position:absolute;left:${w(840, 880)}px;top:${w(150, 118)}px;width:${w(1240, 1400)}px;border-radius:24px;overflow:hidden;
       box-shadow:0 0 0 2px rgba(255,255,255,.08),0 60px 120px -40px rgba(0,0,0,.9);">
    <img src="${st("ui-gameday.jpg")}" style="display:block;width:100%;"></div>
</div>

<!-- fill in the blanks -->
<div class="t dark" style="grid-area:${AREA.fill};">
  <div class="lab">${icon("pen-line", 30)} &nbsp;Fill in the blanks</div>
  <div class="h" style="margin-top:18px;">A form, <span class="m">not a canvas.</span></div>
  <div class="sub" style="margin-top:14px;">Type the details. Long lines shrink to fit, and nothing can slide off brand.</div>
  <div class="art" style="margin-top:38px;">
    <div style="position:absolute;left:0;bottom:-50px;">${crop("ui-fill.jpg", [250, 40, 1190, 735], w(1010, 979), "border-radius:18px 18px 0 0;")}</div>
  </div>
</div>

<!-- batch from a spreadsheet -->
<div class="t paper" style="grid-area:${AREA.batch};">
  <div class="lab">${icon("list-checks", 30)} &nbsp;Batch from a spreadsheet</div>
  <div class="h" style="margin-top:18px;">The whole staff, <span class="m">in one go.</span></div>
  <div class="sub" style="margin-top:14px;">Paste a list from Sheets or Excel. Every ID comes back on Letter sheets, with cut marks.</div>
  <div class="art" style="margin-top:34px;">
    <div style="position:absolute;left:0;top:${w(118, 70)}px;width:${w(340, 396)}px;background:#fff;border-radius:14px;overflow:hidden;
         box-shadow:0 0 0 1px rgba(0,0,0,.08),0 24px 50px -20px rgba(0,0,0,.35);font-size:${w(17, 19)}px;z-index:2;">
      ${STAFF.map((r, i) => `<div style="display:grid;grid-template-columns:44px 1fr 1.25fr;border-top:${i ? "1px solid #E3E6E3" : "0"};
        ${i ? "" : "background:#EEF1EE;font-weight:700;color:#3B423D;"}">
        <div style="padding:12px 0;text-align:center;color:#8B938E;border-right:1px solid #E3E6E3;font-size:16px;">${i + 1}</div>
        <div style="padding:12px 12px;border-right:1px solid #E3E6E3;white-space:nowrap;overflow:hidden;">${r[0]}</div>
        <div style="padding:12px 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${i ? "#3B423D" : "inherit"};">${r[1]}</div></div>`).join("")}
    </div>
    <div style="position:absolute;left:${w(346, 404)}px;top:${w(278, 240)}px;width:44px;color:#1C6E40;z-index:3;">${icon("arrow-right", 44, 2.4)}</div>
    <img src="${uri(path.join(STUDIO, "sheet-staff-ids-300.jpg"))}" style="position:absolute;right:${w(0, 6)}px;top:${w(66, 10)}px;height:${w(528, 556)}px;border-radius:6px;
      transform:rotate(2deg);box-shadow:0 0 0 1px rgba(0,0,0,.08),0 30px 60px -20px rgba(0,0,0,.45);">
  </div>
</div>

<!-- forty-one templates -->
<div class="t dark" style="grid-area:${AREA.templates};flex-direction:row;gap:56px;align-items:stretch;padding-right:0;">
  <div style="flex:0 0 auto;display:flex;flex-direction:column;">
    <div class="lab">${icon("layout-template", 30)} &nbsp;Templates</div>
    <div class="sp"></div>
    <div class="ind" style="font-size:250px;line-height:.78;margin-bottom:-4px;"><span class="g">41</span></div>
  </div>
  <div style="flex:0 0 330px;display:flex;flex-direction:column;">
    <div class="sp"></div>
    <div class="h" style="font-size:50px;">Ready on <span class="m">day one.</span></div>
    <div class="sub" style="font-size:25px;margin-top:12px;">Sorted by department and season. Everything stays editable.</div>
  </div>
  <div style="flex:1;min-width:0;position:relative;overflow:hidden;
       -webkit-mask-image:linear-gradient(90deg,#000 80%,transparent);mask-image:linear-gradient(90deg,#000 80%,transparent);">
    <div style="position:absolute;left:0;top:50%;transform:translateY(-50%);display:flex;gap:18px;align-items:center;">
      ${STRIP.map((id) => `<img class="card" src="${st(`tpl-${id}.jpg`)}" style="height:290px;width:auto;">`).join("")}
    </div>
  </div>
</div>

<!-- carousels -->
<div class="t paper" style="grid-area:${AREA.pages};flex-direction:row;gap:30px;">
  <div style="flex:0 0 330px;display:flex;flex-direction:column;">
    <div class="lab">${icon("layers", 30)} &nbsp;Pages</div>
    <div class="sp"></div>
    <div class="h" style="font-size:50px;">Carousels <span class="m">and multi-page files.</span></div>
    <div class="sub" style="font-size:24px;margin-top:12px;">A ZIP for Instagram, one PDF for a newsletter.</div>
  </div>
  <div class="art" style="flex:1;width:auto;">
    ${[1, 2, 3, 4].map((n, i) => `<img class="card" src="${uri(path.join(STUDIO, `recap-${n}.png`))}" style="position:absolute;height:280px;top:50%;
      left:${i * w(72, 88)}px;transform:translateY(-50%) rotate(${(i - 1.5) * 2.5}deg);z-index:${4 - i};border-radius:12px;">`).join("")}
  </div>
</div>

<!-- motion -->
<div class="t dark" style="grid-area:${AREA.motion};">
  <div style="display:flex;justify-content:space-between;align-items:baseline;">
    <div class="lab">${icon("play", 30)} &nbsp;Motion</div>
    <div class="hs" style="font-size:40px;">It moves. <span class="m">MP4 and GIF.</span></div>
  </div>
  <div class="sp"></div>
  <div style="display:flex;gap:18px;justify-content:space-between;">
    ${[[1, "0.6 s"], [2, "0.9 s"], [3, "1.3 s"], [4, "3.0 s"]].map(([n, t]) => `<div style="flex:1;min-width:0;">
      <img class="card" src="${uri(path.join(STUDIO, `motion-${n}.png`))}" style="width:100%;height:auto;">
      <div class="time">${t}</div></div>`).join("")}
  </div>
</div>

<!-- seasons -->
<div class="t paper" style="grid-area:${AREA.seasons};">
  <div style="display:flex;justify-content:space-between;align-items:baseline;">
    <div class="lab">${icon("calendar", 30)} &nbsp;Seasons</div>
    <div class="hs" style="font-size:40px;">Four seasons, <span class="m">planned.</span></div>
  </div>
  <div class="sp"></div>
  <div style="display:flex;gap:18px;align-items:flex-end;">
    ${SEASONS.map(([id, name, cols]) => `<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;">
      <div style="height:226px;display:flex;align-items:flex-end;justify-content:center;width:100%;">
        <img class="card" src="${st(`tpl-${id}.jpg`)}" style="max-height:226px;max-width:100%;box-shadow:0 0 0 1px rgba(0,0,0,.08),0 20px 40px -18px rgba(0,0,0,.45);"></div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:16px;font-size:22px;font-weight:700;white-space:nowrap;">
        ${cols.map((c) => `<i style="width:18px;height:18px;border-radius:50%;background:${c};box-shadow:0 0 0 1px rgba(0,0,0,.12);display:inline-block;"></i>`).join("")}${name}</div>
    </div>`).join("")}
  </div>
</div>

<!-- brand check -->
<div class="t field" style="grid-area:${AREA.check};">
  <div class="vig"></div>
  <div class="lab rel">${icon("badge-check", 30)} &nbsp;Brand check</div>
  <div class="sp"></div>
  <div class="ind rel" style="font-size:150px;line-height:.8;"><span class="g">28</span></div>
  <div class="hs rel" style="font-size:36px;margin-top:16px;">rules, <span class="m">checked as you work.</span></div>
  <div class="rel" style="display:inline-flex;gap:10px;align-items:center;margin-top:20px;padding:10px 16px;border-radius:14px;
       background:rgba(46,168,102,.18);color:#7FE0A8;font-size:${w(18, 20)}px;font-weight:700;align-self:flex-start;white-space:nowrap;">${icon("badge-check", 24, 2)}On brand. Nothing to fix.</div>
</div>

<!-- who are you -->
<div class="t dark" style="grid-area:${AREA.who};">
  <div class="lab">Start screen</div>
  <div class="hs" style="font-size:40px;margin-top:14px;">“Who are <span class="m">you?”</span></div>
  <div class="sp"></div>
  <div style="display:flex;flex-direction:column;gap:9px;">
    ${ROLES.map(([ic, r]) => `<div style="display:flex;gap:12px;align-items:center;font-size:21px;font-weight:600;color:#D6E2DA;">
      <span style="color:#46C27E;display:inline-flex;">${icon(ic, 26)}</span>${r}</div>`).join("")}
  </div>
</div>

<!-- runs anywhere -->
<div class="t paper" style="grid-area:${AREA.runs};">
  <div style="display:flex;justify-content:space-between;align-items:baseline;">
    <div class="lab">Where it runs</div>
    <div class="hs" style="font-size:40px;">Free. <span class="m">Runs anywhere.</span></div>
  </div>
  <div class="sp"></div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;">
    ${[["monitor", "Windows", "app"], ["laptop", "Mac", "app"], ["laptop", "Chromebook", "installs from the site"], ["globe", "Any browser", "one file"]].map(([ic, t, d]) => `
      <div style="background:#fff;border-radius:26px;padding:${w("24px 16px", "26px 22px")};box-shadow:0 0 0 1px rgba(0,0,0,.05);">
        <span style="color:#1C6E40;display:block;">${icon(ic, w(46, 52), 1.6)}</span>
        <div style="font-size:${w(24, 28)}px;font-weight:700;margin-top:18px;letter-spacing:-.02em;white-space:nowrap;">${t}</div>
        <div style="font-size:${w(16, 19)}px;color:#6C736E;margin-top:4px;${w("line-height:1.3;", "white-space:nowrap;")}">${d}</div></div>`).join("")}
  </div>
</div>

<!-- export -->
<div class="t dark" style="grid-area:${AREA.export};">
  <div class="lab">${icon("download", 30)} &nbsp;Export</div>
  <div class="sp"></div>
  <div style="display:flex;flex-wrap:wrap;gap:10px;">
    ${["PNG", "JPG", "PDF", "MP4", "GIF"].map((f) => `<span class="chip" style="font-size:24px;padding:10px 18px;">${f}</span>`).join("")}
  </div>
  <div class="hs" style="font-size:34px;margin-top:22px;">Print-ready, <span class="m">with bleed and crop marks.</span></div>
</div>

<!-- sign-off -->
<div class="t field c" style="grid-area:${AREA.signoff};padding:44px 30px 40px;">
  <div class="vig"></div>
  <div class="lab rel">Try it</div>
  <div class="sp"></div>
  <img class="rel" src="${uri(path.join(STUDIO, "app-icon-1024.png"))}" style="width:120px;height:120px;filter:drop-shadow(0 16px 30px rgba(0,0,0,.5));">
  <div class="sp"></div>
  <div class="ind rel" style="font-size:${w(28, 31)}px;white-space:nowrap;">bronxhanratty.me/studio</div>
  <div class="rel" style="font-size:15.5px;color:#A9C9B6;margin-top:12px;line-height:1.45;">Designed and built by Bronx Hanratty<br>Class of 2030 · Concept work · not<br>affiliated with the school district</div>
</div>

</div></body></html>`;

/* scripts/render-bento-motion.mjs builds the motion cut from this same page:
   with BENTO_HTML set, hand over the HTML and stop before the still render. */
if (process.env.BENTO_HTML) { fs.writeFileSync(process.env.BENTO_HTML, html); process.exit(0); }

fs.mkdirSync(OUT, { recursive: true });
const tmp = path.join(os.tmpdir(), WIDE ? "mustang-studio-bento-wide.html" : "mustang-studio-bento.html");
fs.writeFileSync(tmp, html);
const browser = await chromium.launch({
  executablePath: process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true,
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.goto("file:///" + tmp.replace(/\\/g, "/").replace(/^\//, ""));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
const problems = await page.evaluate(() => {
  const out = [];
  for (const i of document.images) if (!i.complete || i.naturalWidth === 0) out.push("broken image");
  for (const t of document.querySelectorAll(".t")) if (t.scrollHeight > t.clientHeight + 2 || t.scrollWidth > t.clientWidth + 2) out.push("overflow in tile: " + t.textContent.trim().slice(0, 40));
  for (const e of document.querySelectorAll(".ind,.h,.hs,.lab")) if (e.scrollWidth > e.clientWidth + 2) out.push("text too wide: " + e.textContent.trim().slice(0, 40));
  if (!document.fonts.check("900 40px Industry") || !document.fonts.check("400 20px Hanken")) out.push("font missing");
  return out;
});
const shot = await page.screenshot({ type: "png" });
await browser.close();
fs.unlinkSync(tmp);
const base = WIDE ? "mustang-studio-bento-wide" : "mustang-studio-bento";
await sharp(shot).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(OUT, `${base}-8k.jpg`));
if (WIDE) await sharp(shot).resize(W, H, { kernel: "lanczos3" }).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(OUT, `${base}.jpg`));
console.log(problems.length ? "PROBLEMS:\n  " + problems.join("\n  ") : "no overflow, no broken images, fonts loaded");
console.log(`wrote ${OUT}/${base}-8k.jpg (${W * 2}x${H * 2})${WIDE ? ` and ${base}.jpg (${W}x${H})` : ""}`);
