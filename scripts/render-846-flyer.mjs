/**
 * "8:46 AM" — 25th anniversary flyers for Instagram.
 *
 * Three cuts from one set of parts:
 *   assets/social/846am-25th-feed.jpg     1080x1350  clock still, 4:5 feed
 *   assets/social/846am-25th-story.jpg    1080x1920  clock still, 9:16 story
 *   assets/social/846am-25th-poster.jpg   1080x1350  the film poster, 4:5 feed
 *
 * The still cuts use the film's recurring motif — the seven-segment clock
 * reading 8:46AM — so the image carries the title and the type never repeats
 * it. The poster cut uses the film's own one-sheet instead.
 *
 * Tone is deliberately restrained. These post on a day of mourning, so the
 * occasion leads, the film follows, and the festival win sits at the bottom in
 * the smallest type on the page rather than being the headline.
 *
 * The dedication is transcribed from the film's own poster and left exactly as
 * written — it names 2/26/1993 as well as 9/11/2001, which is the filmmaker's
 * choice and not mine to tidy.
 *
 * Run: node scripts/render-846-flyer.mjs
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "assets", "social");
fs.mkdirSync(OUT, { recursive: true });

/* OFL faces, committed with the deck. Same family the site and deck use, so the
   flyer reads as part of the same body of work. */
const FONT_DIR = path.join(root, "deck", "fonts");
const font = (f) => fs.readFileSync(path.join(FONT_DIR, f)).toString("base64");
const BRICOLAGE = font("BricolageGrotesque.ttf");
const INTER = font("Inter.ttf");
const SERIF_IT = font("InstrumentSerifItalic.ttf");

const img = (...p) => path.join(root, "public", "images", ...p);

/* The source frame carries a stray purple UI dot at x=1602 (a recording
   indicator caught in the capture). Cropping to 1580 drops it and still keeps
   the window frame on both sides. */
const hero = await sharp(img("846-clock.png"))
  .extract({ left: 0, top: 0, width: 1580, height: 907 })
  .jpeg({ quality: 96 })
  .toBuffer();
const HERO = "data:image/jpeg;base64," + hero.toString("base64");

/* The one-sheet, cut off above its billing block so the flyer's own credits do
   that job instead. Measured off the artwork rather than guessed: the "FOREVER"
   line runs to y=888, then there is dead space, and the billing block starts at
   y=904. Cutting at 898 lands in that gap — the tagline survives whole and no
   sliver of the credits is left behind. */
const poster = await sharp(img("846am-poster.png"))
  .extract({ left: 0, top: 0, width: 691, height: 898 })
  .jpeg({ quality: 96 })
  .toBuffer();
const POSTER = "data:image/jpeg;base64," + poster.toString("base64");

const INK = "#F4F3F1", MUTED = "#8B8B86", FAINT = "#5C5C58";
const GROUND = "#0A0A0B";
const RED = "#DC030F"; // sampled from the clock digits themselves

const FONT_CSS = `
@font-face{font-family:'Bricolage';src:url(data:font/ttf;base64,${BRICOLAGE});font-weight:200 800;}
@font-face{font-family:'InterV';src:url(data:font/ttf;base64,${INTER});font-weight:100 900;}
@font-face{font-family:'Serif';src:url(data:font/ttf;base64,${SERIF_IT});font-style:italic;}`;

/* everything both layouts share: the shell, the eyebrow, and the whole text
   block under the image */
const SHARED_CSS = ({ w, h, s, padB }) => `
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${w}px;height:${h}px;overflow:hidden;}
body{font-family:'InterV',sans-serif;background:${GROUND};color:${INK};
     -webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;}
.f{position:relative;width:${w}px;height:${h}px;overflow:hidden;
   display:flex;flex-direction:column;background:${GROUND};}
.kick{display:flex;align-items:center;gap:${26 * s}px;margin-bottom:${40 * s}px;}
.kick span{font-size:${21 * s}px;letter-spacing:.28em;text-transform:uppercase;
  font-weight:600;color:${MUTED};white-space:nowrap;}
.kick i{flex:1;height:1px;background:rgba(244,243,241,.18);}
.bot{flex:1;min-height:0;padding:${40 * s}px ${72 * s}px ${padB}px;
     display:flex;flex-direction:column;}
.lede{font-family:'Bricolage',sans-serif;font-weight:700;letter-spacing:-.028em;
  font-size:${46 * s}px;line-height:1.05;margin-bottom:${22 * s}px;}
.body{font-size:${25 * s}px;line-height:1.58;color:${MUTED};max-width:${880 * s}px;}
.body b{color:${INK};font-weight:600;}
.rule{height:1px;background:rgba(244,243,241,.14);margin:${30 * s}px 0;}
.ded{font-family:'Serif',serif;font-style:italic;font-size:${27 * s}px;
  line-height:1.45;color:${INK};display:flex;gap:${20 * s}px;align-items:flex-start;}
.ded s{flex:0 0 auto;width:${3 * s}px;align-self:stretch;background:${RED};
  text-decoration:none;border-radius:${2 * s}px;}
.foot{margin-top:auto;padding-top:${34 * s}px;display:flex;justify-content:space-between;
  align-items:baseline;gap:${24 * s}px;}
.foot .w{font-size:${25 * s}px;font-weight:600;letter-spacing:-.01em;color:${INK};}
.foot .a{font-size:${18 * s}px;letter-spacing:.16em;text-transform:uppercase;
  color:${FAINT};text-align:right;}`;

const BOT_HTML = `
  <div class="bot">
    <div class="lede">A short documentary</div>
    <div class="body">
      Researched, filmed and edited by <b>Bronx Hanratty</b> &mdash; with
      <b>Carol Lin</b>, the CNN anchor who first broke the story, and
      <b>Jordan Swonger</b>, a first responder at the Pentagon.
    </div>
    <div class="rule"></div>
    <div class="ded"><s></s><span>In memoriam of those lives lost on
      2/26/1993 and 9/11/2001</span></div>
    <div class="foot">
      <span class="w">bronxhanratty.me</span>
      <span class="a">Winner &middot; Jim Harbin Student Festival</span>
    </div>
  </div>`;

/* ---------- layout A: the clock still ---------- */
const page = (o) => `
<!doctype html><html><head><meta charset="utf-8"><style>${FONT_CSS}
${SHARED_CSS(o)}
.top{padding:${o.padT}px ${72 * o.s}px ${44 * o.s}px;}
.disp{font-family:'Bricolage',sans-serif;font-weight:700;letter-spacing:-.035em;
  line-height:.95;font-size:${92 * o.s}px;}
.disp em{font-family:'Serif',serif;font-style:italic;font-weight:400;letter-spacing:-.01em;}

/* full-bleed: the frame edges of the original window read as the edge of the
   flyer, which is why the image is not inset like the text */
.hero{position:relative;width:${o.w}px;height:${o.heroH}px;flex:0 0 auto;overflow:hidden;}
.hero img{width:100%;height:100%;object-fit:cover;object-position:50% 46%;display:block;}
.hero .fade{position:absolute;left:0;right:0;bottom:0;height:${34 * o.s}%;
  background:linear-gradient(to top,${GROUND} 0%,rgba(10,10,11,.55) 46%,rgba(10,10,11,0) 100%);}
.hero .fadetop{position:absolute;left:0;right:0;top:0;height:${16 * o.s}%;
  background:linear-gradient(to bottom,${GROUND} 0%,rgba(10,10,11,0) 100%);}
</style></head><body><div class="f">

  <div class="top">
    <div class="kick"><span>September 11, 2001</span><i></i></div>
    <div class="disp">Twenty-five<br><em>years on</em></div>
  </div>

  <div class="hero">
    <img src="${HERO}">
    <div class="fadetop"></div>
    <div class="fade"></div>
  </div>
${BOT_HTML}

</div></body></html>`;

/* ---------- layout B: the film poster ----------
   The one-sheet is only 691px wide, so it is shown inset rather than blown up
   to the full 1080: at this size it is a slight downscale and stays sharp,
   where full-bleed would be a 1.56x upscale and go soft. Inset is also the only
   way the poster fits at all — cut off above its billing block it is a 0.77
   aspect, which at full width would need 1406px of height on a 1350px canvas.
   The anniversary line collapses to a single eyebrow here, because the poster
   carries its own title and a second piece of display type would fight it. */
const posterPage = (o) => `
<!doctype html><html><head><meta charset="utf-8"><style>${FONT_CSS}
${SHARED_CSS(o)}
.top{padding:${o.padT}px ${72 * o.s}px ${34 * o.s}px;}
.top .kick{margin-bottom:0;}
.pwrap{width:${o.posterW}px;margin:0 auto;position:relative;flex:0 0 auto;
  box-shadow:0 44px 96px -34px rgba(0,0,0,.95);}
.pwrap img{width:100%;height:auto;display:block;}
.pwrap i{position:absolute;inset:0;pointer-events:none;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);}
</style></head><body><div class="f">

  <div class="top">
    <div class="kick">
      <span>September 11, 2001 &middot; Twenty-five years on</span><i></i>
    </div>
  </div>

  <div class="pwrap"><img src="${POSTER}"><i></i></div>
${BOT_HTML}

</div></body></html>`;

const VARIANTS = [
  { name: "feed",  w: 1080, h: 1350, s: 1,    heroH: 570, padT: 76,  padB: 64,
    out: "846am-25th-feed.jpg" },
  { name: "story", w: 1080, h: 1920, s: 1.06, heroH: 720, padT: 168, padB: 288,
    out: "846am-25th-story.jpg" },
  { name: "poster", layout: "poster", w: 1080, h: 1350, s: 1,
    posterW: 625, padT: 60, padB: 56, out: "846am-25th-poster.jpg" },
];

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const missing = [];

for (const v of VARIANTS) {
  /* render at 2x and resample down: supersampling is what keeps the hairlines
     and the tracked caps clean once Instagram re-encodes the upload */
  const p = await browser.newPage({
    viewport: { width: v.w, height: v.h },
    deviceScaleFactor: 2,
  });
  p.on("requestfailed", (r) => missing.push(r.url().slice(0, 40)));
  const tpl = v.layout === "poster" ? posterPage : page;
  await p.setContent(tpl(v), { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  const shot = await p.screenshot({ clip: { x: 0, y: 0, width: v.w, height: v.h } });
  await sharp(shot)
    .resize(v.w, v.h, { fit: "fill", kernel: "lanczos3" })
    .jpeg({ quality: 95, chromaSubsampling: "4:4:4" })
    .toFile(path.join(OUT, v.out));
  const kb = (fs.statSync(path.join(OUT, v.out)).size / 1024).toFixed(0);
  console.log(`  ${v.name.padEnd(7)} ${v.w}x${v.h}  ${kb}KB  ${v.out}`);
  await p.close();
}
console.log("missing:", missing.length ? [...new Set(missing)] : "none");
await browser.close();
