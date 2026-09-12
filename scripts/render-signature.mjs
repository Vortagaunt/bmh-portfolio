/**
 * Email signature, in the same language as the 8:46 AM cards.
 *
 * Emits:
 *   assets/signature/bronx-signature-dark.png    2040x...  (680 wide at 3x)
 *   assets/signature/bronx-signature-light.png
 *   assets/signature/bronx-signature.html        live-text version
 *   public/images/badges/acp-*.png               hosted badges for the HTML
 *
 * On "high resolution, small file": the card is drawn at 3x and the PNG is then
 * palette-quantised. A flat design like this only really contains the ground,
 * a few greys from the text antialiasing, and the badge colours — so an indexed
 * palette reproduces it with no visible loss while cutting the file by roughly
 * an order of magnitude against truecolour. Set width="680" on the <img> and it
 * renders crisp on every retina display without shipping a megabyte.
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
const BADGE_SRC = path.join(OUT, "badges");
const BADGE_PUB = path.join(root, "public", "images", "badges");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(BADGE_PUB, { recursive: true });

const FONT_DIR = path.join(root, "deck", "fonts");
const font = (f) => fs.readFileSync(path.join(FONT_DIR, f)).toString("base64");
const BRICOLAGE = font("BricolageGrotesque.ttf");
const INTER = font("Inter.ttf");
const SERIF_IT = font("InstrumentSerifItalic.ttf");

/**
 * Adobe ships these badges on solid white with no alpha channel, which would
 * park three white squares on the dark card. Keying every white pixel would
 * also punch holes in the artwork — the "PROFESSIONAL" lettering and the
 * Creative Cloud mark are white too. So this floods inward from the border and
 * only clears white that is actually connected to the outside; anything white
 * enclosed by the shield is left alone. The threshold sits well above the
 * shield colours (navy, maroon, red), so the fill stops at the silhouette.
 */
async function keyOutsideWhite(file, tol = 205) {
  const { data, info } = await sharp(file).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: ch } = info;
  const out = Buffer.from(data);
  const seen = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);

  let cleared = 0;
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    const i = p * ch;
    if (data[i] < tol || data[i + 1] < tol || data[i + 2] < tol) continue;
    seen[p] = 1;
    out[i + 3] = 0;
    cleared++;
    const x = p % W, y = (p - x) / W;
    if (x > 0) stack.push(p - 1);
    if (x < W - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - W);
    if (y < H - 1) stack.push(p + W);
  }
  const pct = ((cleared / (W * H)) * 100).toFixed(1);
  return { buf: await sharp(out, { raw: { width: W, height: H, channels: ch } })
    .png().toBuffer(), pct };
}

const BADGES = [
  ["acp-visual-design", "Visual Design"],
  ["acp-photoshop", "Photoshop"],
  ["acp-illustrator", "Illustrator"],
];

const badgeUri = {};
for (const [slug] of BADGES) {
  const { buf, pct } = await keyOutsideWhite(path.join(BADGE_SRC, `${slug}.png`));
  badgeUri[slug] = "data:image/png;base64," + buf.toString("base64");
  /* 132px is 3x the 44px the HTML displays them at, so they stay sharp on
     retina mail clients without being a needless download */
  const pub = path.join(BADGE_PUB, `${slug}.png`);
  await sharp(buf).resize({ width: 132 })
    .png({ palette: true, colors: 192, effort: 10, compressionLevel: 9 })
    .toFile(pub);
  console.log(`  badge ${slug.padEnd(18)} keyed ${pct}% → ` +
    `${(fs.statSync(pub).size / 1024).toFixed(1)}KB hosted`);
}

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
  credTitle: "Adobe Certified Professional",
  credList: "Visual Design &middot; Photoshop &middot; Illustrator",
};

const THEMES = {
  /* chip: the Photoshop and Illustrator badges are dark navy and dark maroon.
     Keyed out and dropped straight onto a near-black card they turn to mud, so
     the dark variant seats each one on a white tile — which is how a badge
     usually appears anyway. On paper they need no such help. */
  dark: { ground: "#0A0A0B", ink: "#F4F3F1", muted: "#8B8B86", faint: "#5C5C58",
          rule: "rgba(244,243,241,.14)", red: "#DC030F", chip: true },
  /* the red is taken down a little on paper: #DC030F is tuned to glow on near
     black and vibrates against a light ground */
  light: { ground: "#F5F5F3", ink: "#0C0C0C", muted: "#585852", faint: "#8A8A82",
           rule: "rgba(12,12,12,.16)", red: "#C1121C", chip: false },
};

const W = 680, H = 228, SCALE = 3;

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
      gap:26px;padding:24px 28px;overflow:hidden;}
.bar{flex:0 0 auto;width:3px;align-self:stretch;background:${t.red};border-radius:2px;}
.body{flex:1;min-width:0;display:flex;flex-direction:column;}
.top{display:flex;gap:26px;align-items:center;}
.left{flex:0 0 186px;}
.name{font-family:'Bricolage',sans-serif;font-weight:700;letter-spacing:-.035em;
      font-size:28px;line-height:1.02;}
.name em{font-family:'Serif',serif;font-style:italic;font-weight:400;letter-spacing:-.01em;}
.role{font-size:12px;line-height:1.4;color:${t.muted};margin-top:7px;}
.site{font-size:12.5px;font-weight:600;letter-spacing:-.01em;color:${t.ink};margin-top:12px;}
.vrule{flex:0 0 auto;width:1px;align-self:stretch;background:${t.rule};}
.right{flex:1;min-width:0;display:flex;flex-direction:column;gap:7px;}
.row{display:flex;align-items:baseline;gap:12px;}
.lb{flex:0 0 62px;font-size:9px;letter-spacing:.18em;text-transform:uppercase;
    font-weight:700;color:${t.faint};}
.vl{font-size:12px;color:${t.ink};white-space:nowrap;}
.hr{height:1px;background:${t.rule};margin:17px 0 15px;}
.creds{display:flex;align-items:center;gap:16px;}
.badges{display:flex;gap:9px;flex:0 0 auto;}
.badges span{display:block;${t.chip
  ? "background:#FFFFFF;border-radius:8px;padding:4px;line-height:0;"
  : "line-height:0;"}}
.badges img{height:${t.chip ? 36 : 44}px;width:auto;display:block;}
.ct{font-size:11.5px;font-weight:600;letter-spacing:-.01em;color:${t.ink};}
.cs{font-size:10px;color:${t.faint};margin-top:3px;letter-spacing:.01em;}
</style></head><body>
<div class="card">
  <div class="bar"></div>
  <div class="body">
    <div class="top">
      <div class="left">
        <div class="name">${ME.name}<br><em>${ME.surname}</em></div>
        <div class="role">${ME.role}</div>
        <div class="site">${ME.site}</div>
      </div>
      <div class="vrule"></div>
      <div class="right">
        ${ME.rows.map(([lb, vl]) =>
          `<div class="row"><span class="lb">${lb}</span><span class="vl">${vl}</span></div>`
        ).join("\n        ")}
      </div>
    </div>
    <div class="hr"></div>
    <div class="creds">
      <div class="badges">
        ${BADGES.map(([slug, alt]) =>
          `<span><img src="${badgeUri[slug]}" alt="${alt}"></span>`).join("\n        ")}
      </div>
      <div>
        <div class="ct">${ME.credTitle}</div>
        <div class="cs">${ME.credList}</div>
      </div>
    </div>
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
  await p.waitForTimeout(400);

  /* guard against anything quietly running past the card edge or bottom — the
     values are nowrap, so an overflow would be clipped with no visible symptom */
  const over = await p.evaluate(() => {
    const c = document.querySelector(".card").getBoundingClientRect();
    const bad = [];
    for (const el of document.querySelectorAll(".vl, .site, .name, .ct, .cs, .creds")) {
      const r = el.getBoundingClientRect();
      if (r.right > c.right - 6) bad.push("→ " + el.textContent.trim().slice(0, 40));
      if (r.bottom > c.bottom - 4) bad.push("↓ " + el.textContent.trim().slice(0, 40));
    }
    return bad;
  });
  if (over.length) console.log(`  ! ${name}: ${over.join(" | ")}`);

  const shot = await p.screenshot({ clip: { x: 0, y: 0, width: W, height: H } });
  const out = path.join(OUT, `bronx-signature-${name}.png`);
  await sharp(shot)
    .png({ palette: true, colors: 256, effort: 10, compressionLevel: 9 })
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
   so it sits on a normal white email ground. Badges point at the copies served
   from the site, because data: URIs are unreliable in mail clients. */
const t = THEMES.light;
const BADGE_BASE = "https://bronxhanratty.me/images/badges";
const link = (href, text, style) =>
  href ? `<a href="${href}" style="${style};text-decoration:none;">${text}</a>`
       : `<span style="${style}">${text}</span>`;

const html = `<!-- Bronx Hanratty — email signature.
     Paste into Gmail (Settings > See all settings > Signature) or Outlook.
     Generated by scripts/render-signature.mjs — edit there, not here. -->
<table cellpadding="0" cellspacing="0" border="0" role="presentation"
       style="border-collapse:collapse;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <tr>
    <td rowspan="3" style="width:3px;background:${t.red};border-radius:2px;">&nbsp;</td>
    <td rowspan="3" style="width:24px;">&nbsp;</td>
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
  <tr><td colspan="5" style="height:16px;line-height:16px;font-size:0;">&nbsp;</td></tr>
  <tr>
    <td colspan="5" style="border-top:1px solid ${t.rule};padding-top:14px;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation"
             style="border-collapse:collapse;">
        <tr>
${BADGES.map(([slug, alt]) => `          <td style="padding-right:9px;vertical-align:middle;"><img src="${BADGE_BASE}/${slug}.png" alt="Adobe Certified Professional — ${alt}" width="44" height="44" style="display:block;border:0;width:44px;height:44px;"></td>`).join("\n")}
          <td style="padding-left:7px;vertical-align:middle;">
            <div style="font-size:11.5px;font-weight:600;color:${t.ink};">${ME.credTitle}</div>
            <div style="font-size:10px;color:${t.faint};padding-top:3px;">${ME.credList}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;

fs.writeFileSync(path.join(OUT, "bronx-signature.html"), html);
console.log(`  html  ${(Buffer.byteLength(html) / 1024).toFixed(1)}KB  bronx-signature.html`);
