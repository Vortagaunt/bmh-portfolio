/**
 * Email signature, in the same language as the 8:46 AM cards.
 *
 * Emits:
 *   assets/signature/bronx-signature-dark.png    1920x444  (640x148 at 3x)
 *   assets/signature/bronx-signature-light.png   1920x444
 *   assets/signature/bronx-signature.html        live-text version
 *
 * On "high resolution, small file": the card is drawn at 3x and the PNG is then
 * palette-quantised. A flat design like this only really contains the ground,
 * a few greys from the text antialiasing, and one red — so 128 indexed colours
 * reproduces it with no visible loss while cutting the file by roughly an order
 * of magnitude against truecolour. Set width="640" on the <img> and it renders
 * crisp on every retina display without shipping a megabyte.
 *
 * The HTML version is the one to actually paste into Gmail or Outlook: the
 * addresses are clickable, the text is selectable and searchable, screen
 * readers can read it, and it still shows when a client blocks images — which
 * many do by default, and an image-only signature simply vanishes there.
 *
 * Run: node scripts/render-signature.mjs
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "assets", "signature");
fs.mkdirSync(OUT, { recursive: true });

const FONT_DIR = path.join(root, "deck", "fonts");
const font = (f) => fs.readFileSync(path.join(FONT_DIR, f)).toString("base64");
const BRICOLAGE = font("BricolageGrotesque.ttf");
const INTER = font("Inter.ttf");
const SERIF_IT = font("InstrumentSerifItalic.ttf");

/* one source of truth for the details, used by both the PNG and the HTML */
const ME = {
  name: "Bronx",
  surname: "Hanratty",
  role: "Digital &amp; brand designer",
  site: "bronxhanratty.me",
  siteHref: "https://bronxhanratty.me",
  rows: [
    ["Email", "bronxhanratty@gmail.com", "mailto:bronxhanratty@gmail.com"],
    ["Student", "hanrattyb@students.manateeschools.net",
      "mailto:hanrattyb@students.manateeschools.net"],
    ["Phone", "(941) 264-8812", "tel:+19412648812"],
    ["School", "Lakewood Ranch High School &middot; Class of 2030", null],
  ],
};

const THEMES = {
  dark: { ground: "#0A0A0B", ink: "#F4F3F1", muted: "#8B8B86", faint: "#5C5C58",
          rule: "rgba(244,243,241,.14)", red: "#DC030F" },
  /* the red is taken down a little on paper: #DC030F is tuned to glow on near
     black and vibrates against a light ground */
  light: { ground: "#F5F5F3", ink: "#0C0C0C", muted: "#585852", faint: "#8A8A82",
           rule: "rgba(12,12,12,.16)", red: "#C1121C" },
};

const W = 680, H = 148, SCALE = 3;

const card = (t) => `
<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Bricolage';src:url(data:font/ttf;base64,${BRICOLAGE});font-weight:200 800;}
@font-face{font-family:'InterV';src:url(data:font/ttf;base64,${INTER});font-weight:100 900;}
@font-face{font-family:'Serif';src:url(data:font/ttf;base64,${SERIF_IT});font-style:italic;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${W}px;height:${H}px;overflow:hidden;}
body{font-family:'InterV',sans-serif;background:${t.ground};color:${t.ink};
     -webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;}
.card{width:${W}px;height:${H}px;background:${t.ground};display:flex;
      align-items:center;gap:28px;padding:26px 28px;overflow:hidden;}
.bar{flex:0 0 auto;width:3px;align-self:stretch;background:${t.red};border-radius:2px;}
.left{flex:0 0 186px;}
.name{font-family:'Bricolage',sans-serif;font-weight:700;letter-spacing:-.035em;
      font-size:29px;line-height:1.02;}
.name em{font-family:'Serif',serif;font-style:italic;font-weight:400;letter-spacing:-.01em;}
.role{font-size:12px;line-height:1.4;color:${t.muted};margin-top:7px;}
.site{font-size:12.5px;font-weight:600;letter-spacing:-.01em;color:${t.ink};margin-top:13px;}
.rule{flex:0 0 auto;width:1px;align-self:stretch;background:${t.rule};}
.right{flex:1;min-width:0;display:flex;flex-direction:column;gap:7px;}
.row{display:flex;align-items:baseline;gap:12px;}
.lb{flex:0 0 62px;font-size:9px;letter-spacing:.18em;text-transform:uppercase;
    font-weight:700;color:${t.faint};}
.vl{font-size:12px;color:${t.ink};white-space:nowrap;}
</style></head><body>
<div class="card">
  <div class="bar"></div>
  <div class="left">
    <div class="name">${ME.name}<br><em>${ME.surname}</em></div>
    <div class="role">${ME.role}</div>
    <div class="site">${ME.site}</div>
  </div>
  <div class="rule"></div>
  <div class="right">
    ${ME.rows.map(([lb, vl]) =>
      `<div class="row"><span class="lb">${lb}</span><span class="vl">${vl}</span></div>`
    ).join("\n    ")}
  </div>
</div></body></html>`;

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});

for (const [name, t] of Object.entries(THEMES)) {
  const p = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: SCALE,
  });
  await p.setContent(card(t), { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(350);

  /* guard against a value quietly running past the card edge — .vl is nowrap,
     so an overflow would be silently clipped rather than wrapping visibly */
  const over = await p.evaluate(() => {
    const c = document.querySelector(".card").getBoundingClientRect();
    return [...document.querySelectorAll(".vl, .site, .name")]
      .filter((el) => el.getBoundingClientRect().right > c.right - 6)
      .map((el) => el.textContent.trim());
  });
  if (over.length) console.log(`  ! ${name}: overflowing -> ${over.join(" | ")}`);

  const shot = await p.screenshot({ clip: { x: 0, y: 0, width: W, height: H } });
  const out = path.join(OUT, `bronx-signature-${name}.png`);
  await sharp(shot)
    .png({ palette: true, colors: 128, effort: 10, compressionLevel: 9 })
    .toFile(out);
  const m = await sharp(out).metadata();
  console.log(`  ${name.padEnd(5)} ${m.width}x${m.height}  ` +
    `${(fs.statSync(out).size / 1024).toFixed(1)}KB  ${path.basename(out)}`);
  await p.close();
}
await browser.close();

/* ---- the live-text version ----
   Table layout and inline styles on purpose: Outlook's word-based renderer
   drops flexbox, grid and <style> blocks entirely. Colours are the light theme
   so it sits on a normal white email ground. */
const t = THEMES.light;
const link = (href, text, style) =>
  href ? `<a href="${href}" style="${style};text-decoration:none;">${text}</a>`
       : `<span style="${style}">${text}</span>`;

const html = `<!-- Bronx Hanratty — email signature.
     Paste into Gmail (Settings > See all settings > Signature) or Outlook.
     Generated by scripts/render-signature.mjs — edit there, not here. -->
<table cellpadding="0" cellspacing="0" border="0" role="presentation"
       style="border-collapse:collapse;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <tr>
    <td style="width:3px;background:${t.red};border-radius:2px;">&nbsp;</td>
    <td style="width:24px;">&nbsp;</td>
    <td style="vertical-align:middle;padding:2px 0;">
      <div style="font-size:23px;font-weight:700;letter-spacing:-.8px;color:${t.ink};line-height:1.12;">
        ${ME.name}
      </div>
      <div style="font-size:23px;font-weight:400;font-style:italic;letter-spacing:-.2px;color:${t.ink};line-height:1.12;">
        ${ME.surname}
      </div>
      <div style="font-size:12px;color:${t.muted};padding-top:6px;">${ME.role}</div>
      <div style="font-size:12.5px;font-weight:600;padding-top:10px;">
        ${link(ME.siteHref, ME.site, `color:${t.ink}`)}
      </div>
    </td>
    <td style="width:28px;">&nbsp;</td>
    <td style="width:1px;background:${t.rule};">&nbsp;</td>
    <td style="width:28px;">&nbsp;</td>
    <td style="vertical-align:middle;padding:2px 0;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation"
             style="border-collapse:collapse;">
${ME.rows.map(([lb, vl, href]) => `        <tr>
          <td style="font-size:9px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;color:${t.faint};padding:0 12px 7px 0;white-space:nowrap;vertical-align:baseline;">${lb}</td>
          <td style="font-size:12px;color:${t.ink};padding:0 0 7px 0;white-space:nowrap;vertical-align:baseline;">${link(href, vl, `color:${t.ink}`)}</td>
        </tr>`).join("\n")}
      </table>
    </td>
  </tr>
</table>
`;

fs.writeFileSync(path.join(OUT, "bronx-signature.html"), html);
console.log(`  html  ${(Buffer.byteLength(html) / 1024).toFixed(1)}KB  bronx-signature.html`);
