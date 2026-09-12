/**
 * "8:46 AM" — 25th anniversary flyers for Instagram.
 *
 * A carousel's worth of cuts, all 1080x1350 unless noted, plus one story:
 *   846am-25th-feed.jpg      the clock still  — the opener
 *   846am-25th-story.jpg     the clock still, 1080x1920 for stories
 *   846am-25th-poster.jpg    the film's one-sheet
 *   846am-25th-banner.jpg    the plate that fronts the film on the site
 *   846am-25th-carol.jpg     Carol Lin
 *   846am-25th-wtc.jpg       the CNN World Trade Center broadcast
 *   846am-25th-watch.jpg     "Watch it here" + a QR to the case study
 *
 * Every cut shares one shell — eyebrow, display pair, image, text block — so
 * the layout does not jump as you swipe through them.
 *
 * Tone is deliberately restrained. These post on a day of mourning, so the
 * occasion leads, the film follows, and the festival win sits at the bottom in
 * the smallest type on the page rather than being the headline.
 *
 * The dedication is transcribed from the film's own poster and left exactly as
 * written — it names 2/26/1993 as well as 9/11/2001, which is the filmmaker's
 * choice and not mine to tidy. It repeats on every cut on purpose: it is the
 * memorial line, and a carousel is swiped, not read front to back.
 *
 * Run: node scripts/render-846-flyer.mjs
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import QRCode from "qrcode";
import jsQR from "jsqr";

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
const uri = (buf) => "data:image/jpeg;base64," + buf.toString("base64");

/* Two of the stills were captured with a recording indicator live on screen —
   a saturated purple dot in the top-right corner. Measured, not guessed: on the
   clock it sits at x=1602, on the broadcast still it spans x=1591..1612. Both
   crops cut inside those and still keep the frame on either side. */
const HERO = uri(await sharp(img("846-clock.png"))
  .extract({ left: 0, top: 0, width: 1580, height: 907 })
  .jpeg({ quality: 96 }).toBuffer());

const WTC = uri(await sharp(img("846-breaking-news.png"))
  .extract({ left: 0, top: 0, width: 1585, height: 902 })
  .jpeg({ quality: 96 }).toBuffer());

/* clean as shot — no crop needed */
const CAROL = uri(await sharp(img("846-carol-lin.png"))
  .jpeg({ quality: 96 }).toBuffer());

/* The one-sheet, cut off above its billing block so the flyer's own credits do
   that job instead. Measured off the artwork rather than guessed: the "FOREVER"
   line runs to y=888, then there is dead space, and the billing block starts at
   y=904. Cutting at 898 lands in that gap — the tagline survives whole and no
   sliver of the credits is left behind. */
const POSTER = uri(await sharp(img("846am-poster.png"))
  .extract({ left: 0, top: 0, width: 691, height: 898 })
  .jpeg({ quality: 96 }).toBuffer());

/* The banner that fronts the film on the site's works grid. Already 16:9, so
   it drops into the same band as the clock still with only the outer bezel
   cropped. Resampled to 2160 wide because that is exactly what the 2x render
   consumes; the full 2560 would only bloat the inlined data URI. */
const BANNER = uri(await sharp(img("846am.jpg"))
  .resize({ width: 2160 }).jpeg({ quality: 96 }).toBuffer());

/* ---- the QR, round-tripped before it is allowed near the artwork ----
   A printed QR that does not scan is worse than no QR at all, so this decodes
   its own output and refuses to carry on if it does not come back identical.
   Level H so it survives a phone camera pointed at a phone screen. */
const QR_TARGET = "https://bronxhanratty.me/case-study/846-am";
const qrBuf = await QRCode.toBuffer(QR_TARGET, {
  errorCorrectionLevel: "H",
  margin: 2,
  width: 1200,
  color: { dark: "#0A0A0BFF", light: "#FFFFFFFF" },
});
{
  const { data, info } = await sharp(qrBuf).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const back = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  if (!back) { console.error("FAIL: generated QR did not decode"); process.exit(1); }
  if (back.data !== QR_TARGET) {
    console.error(`FAIL: QR decoded to "${back.data}", expected "${QR_TARGET}"`);
    process.exit(1);
  }
  console.log(`  qr      decoded -> ${back.data}  (ECC H)`);
}
const QR = "data:image/png;base64," + qrBuf.toString("base64");

const INK = "#F4F3F1", MUTED = "#8B8B86", FAINT = "#5C5C58";
const GROUND = "#0A0A0B";
const RED = "#DC030F"; // sampled from the clock digits themselves

const FONT_CSS = `
@font-face{font-family:'Bricolage';src:url(data:font/ttf;base64,${BRICOLAGE});font-weight:200 800;}
@font-face{font-family:'InterV';src:url(data:font/ttf;base64,${INTER});font-weight:100 900;}
@font-face{font-family:'Serif';src:url(data:font/ttf;base64,${SERIF_IT});font-style:italic;}`;

/* everything every layout shares: the shell, the eyebrow, the display pair, and
   the text block under the image */
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
.disp{font-family:'Bricolage',sans-serif;font-weight:700;letter-spacing:-.035em;
  line-height:.95;font-size:${92 * s}px;}
.disp em{font-family:'Serif',serif;font-style:italic;font-weight:400;letter-spacing:-.01em;}
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

const DEDICATION =
  "In memoriam of those lives lost on 2/26/1993 and 9/11/2001";
const CREDITS =
  `Researched, filmed and edited by <b>Bronx Hanratty</b> &mdash; with
   <b>Carol Lin</b>, the CNN anchor who first broke the story, and
   <b>Jordan Swonger</b>, a first responder at the Pentagon.`;
const AWARD = "Winner &middot; Jim Harbin Student Festival";
const RUNTIME = "Short &middot; 7 min";

const BOT_HTML = (o) => `
  <div class="bot">
    <div class="lede">${o.lede ?? "A short documentary"}</div>
    <div class="body">${o.body ?? CREDITS}</div>
    <div class="rule"></div>
    <div class="ded"><s></s><span>${DEDICATION}</span></div>
    <div class="foot">
      <span class="w">bronxhanratty.me</span>
      <span class="a">${o.footRight}</span>
    </div>
  </div>`;

const TOP_HTML = (o) => `
  <div class="top">
    <div class="kick"><span>${o.kick ?? "September 11, 2001"}</span><i></i></div>
    <div class="disp">${o.disp ?? "Twenty-five<br><em>years on</em>"}</div>
  </div>`;

/* ---------- layout A: a still in a full-bleed band ---------- */
const page = (o) => `
<!doctype html><html><head><meta charset="utf-8"><style>${FONT_CSS}
${SHARED_CSS(o)}
.top{padding:${o.padT}px ${72 * o.s}px ${44 * o.s}px;}

/* full-bleed: the frame edges of the original window read as the edge of the
   flyer, which is why the image is not inset like the text */
.hero{position:relative;width:${o.w}px;height:${o.heroH}px;flex:0 0 auto;overflow:hidden;}
.hero img{width:100%;height:100%;object-fit:cover;object-position:${o.heroPos};display:block;}
.hero .fade{position:absolute;left:0;right:0;bottom:0;height:${o.fadeH * o.s}%;
  background:linear-gradient(to top,${GROUND} 0%,rgba(10,10,11,.55) 46%,rgba(10,10,11,0) 100%);}
.hero .fadetop{position:absolute;left:0;right:0;top:0;height:${(o.fadeTopH ?? 16) * o.s}%;
  background:linear-gradient(to bottom,${GROUND} 0%,rgba(10,10,11,0) 100%);}
</style></head><body><div class="f">
${TOP_HTML(o)}

  <div class="hero">
    <img src="${o.heroImg}">
    <div class="fadetop"></div>
    <div class="fade"></div>
  </div>
${BOT_HTML(o)}

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
${BOT_HTML(o)}

</div></body></html>`;

/* ---------- layout C: the QR ----------
   The code takes the space the image band holds on the other cuts, so the
   carousel keeps its rhythm. The URL is spelled out underneath because a QR is
   useless to anyone reading a screenshot, or scrolling past on the same phone
   they would have to scan it with. */
const qrPage = (o) => `
<!doctype html><html><head><meta charset="utf-8"><style>${FONT_CSS}
${SHARED_CSS(o)}
.top{padding:${o.padT}px ${72 * o.s}px 0;}
.sub{font-size:${25 * o.s}px;line-height:1.58;color:${MUTED};
  margin-top:${28 * o.s}px;max-width:${820 * o.s}px;}
.qrstage{flex:1;min-height:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:${26 * o.s}px;
  padding:${30 * o.s}px ${72 * o.s}px;}
.qrcard{background:#FFFFFF;border-radius:${24 * o.s}px;padding:${26 * o.s}px;
  box-shadow:0 40px 90px -34px rgba(0,0,0,.95);}
.qrcard img{width:${o.qrSize}px;height:${o.qrSize}px;display:block;}
.qrurl{font-size:${23 * o.s}px;font-weight:600;letter-spacing:-.01em;color:${INK};}
.bot{flex:0 0 auto;padding-top:0;}
</style></head><body><div class="f">

  <div class="top">
    <div class="kick"><span>${o.kick}</span><i></i></div>
    <div class="disp">Watch it<br><em>here</em></div>
    <div class="sub">Seven minutes &mdash; the full film, with the research,
      the archive and the interviews behind it.</div>
  </div>

  <div class="qrstage">
    <div class="qrcard"><img src="${QR}"></div>
    <div class="qrurl">bronxhanratty.me/case-study/846-am</div>
  </div>

  <div class="bot">
    <div class="rule"></div>
    <div class="ded"><s></s><span>${DEDICATION}</span></div>
    <div class="foot">
      <span class="w">bronxhanratty.me</span>
      <span class="a">${o.footRight}</span>
    </div>
  </div>

</div></body></html>`;

const VARIANTS = [
  { name: "feed",  w: 1080, h: 1350, s: 1,    heroH: 570, padT: 76,  padB: 64,
    heroImg: HERO, heroPos: "50% 46%", fadeH: 34, footRight: AWARD,
    out: "846am-25th-feed.jpg" },

  { name: "story", w: 1080, h: 1920, s: 1.06, heroH: 720, padT: 168, padB: 288,
    heroImg: HERO, heroPos: "50% 46%", fadeH: 34, footRight: AWARD,
    out: "846am-25th-story.jpg" },

  { name: "poster", layout: "poster", w: 1080, h: 1350, s: 1,
    posterW: 625, padT: 60, padB: 56, footRight: AWARD,
    out: "846am-25th-poster.jpg" },

  /* The banner carries "WINNER OF MANATEE FILM RUSH, JIM HARBIN STUDENT
     FESTIVAL" inside the artwork, so repeating the award in the footer a couple
     of hundred pixels below it would just say the same thing twice. The runtime
     goes there instead — it is the one fact none of the other type states. */
  { name: "banner", w: 1080, h: 1350, s: 1, heroH: 570, padT: 76, padB: 64,
    heroImg: BANNER, heroPos: "50% 50%", fadeH: 20, footRight: RUNTIME,
    out: "846am-25th-banner.jpg" },

  /* Carol Lin sits high in her frame, so the band is top-aligned and the crop
     comes off the desk rather than her head, and the top fade is pulled right
     back — at the default depth it washes over her hair. */
  { name: "carol", w: 1080, h: 1350, s: 1, heroH: 570, padT: 76, padB: 64,
    heroImg: CAROL, heroPos: "50% 0%", fadeH: 30, fadeTopH: 7,
    kick: "The interviews", disp: "Carol<br><em>Lin</em>",
    lede: "The first to report it",
    body: `Carol Lin was the CNN anchor who first took the attacks to air. She
           sat down for this film to talk about that morning &mdash; what she
           knew, when she knew it, and what it was like to be the one telling
           the country.`,
    footRight: RUNTIME, out: "846am-25th-carol.jpg" },

  { name: "wtc", w: 1080, h: 1350, s: 1, heroH: 570, padT: 76, padB: 64,
    heroImg: WTC, heroPos: "50% 50%", fadeH: 26,
    kick: "The archive", disp: "Breaking<br><em>news</em>",
    lede: "The morning as it aired",
    body: `The film is cut from the broadcast itself &mdash; the chyrons, the
           market ticker still running underneath it, and the anchors working
           out in real time what they were looking at.`,
    footRight: RUNTIME, out: "846am-25th-wtc.jpg" },

  { name: "watch", layout: "qr", w: 1080, h: 1350, s: 1, padT: 76, padB: 64,
    qrSize: 400, kick: "The film", footRight: AWARD,
    out: "846am-25th-watch.jpg" },
];

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const missing = [];
const TPL = { poster: posterPage, qr: qrPage };

for (const v of VARIANTS) {
  /* render at 2x and resample down: supersampling is what keeps the hairlines
     and the tracked caps clean once Instagram re-encodes the upload */
  const p = await browser.newPage({
    viewport: { width: v.w, height: v.h },
    deviceScaleFactor: 2,
  });
  p.on("requestfailed", (r) => missing.push(r.url().slice(0, 40)));
  await p.setContent((TPL[v.layout] ?? page)(v), { waitUntil: "load" });
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
