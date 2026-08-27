/* The seven brand-system boards, in the deck's own language.
 * Rendered at 2400x1350 because section() shows them ~1990px wide on a 4K slide.
 * Run: node render-boards.mjs
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 2400, H = 1350;
const OUT = path.join(here, "img");

const BK = "#04231A", PAPER = "#FCFCFC", ONGREEN = "#D6E2DA";
const MUTED = "#8FA79A", FAINT = "#5F7A6C", RED = "#A82424";
const HAIR = "rgba(255,255,255,.12)", HAIR2 = "rgba(255,255,255,.09)";
const PANEL = "rgba(255,255,255,.055)";

/* lucide geometry read straight out of the package — same glyphs the board claims */
const ICON_DIR = path.join(here, "..", "node_modules", "lucide-react", "dist", "esm", "icons");
function icon(name, size = 46) {
  const src = fs.readFileSync(path.join(ICON_DIR, `${name}.js`), "utf8");
  const m = src.match(/const __iconNode = (\[[\s\S]*?\n\];)/);
  if (!m) throw new Error(`no __iconNode in ${name}`);
  const nodes = new Function("return " + m[1].replace(/;$/, ""))();
  const body = nodes.map(([tag, attrs]) => {
    const a = Object.entries(attrs).filter(([k]) => k !== "key")
      .map(([k, v]) => `${k}="${v}"`).join(" ");
    return `<${tag} ${a}/>`;
  }).join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
    stroke-linejoin="round">${body}</svg>`;
}

const CSS = `
@font-face{font-family:'Bricolage';src:url('fonts/BricolageGrotesque.ttf');font-weight:200 800;}
@font-face{font-family:'InterV';src:url('fonts/Inter.ttf');font-weight:100 900;}
@font-face{font-family:'Industry';src:url('fonts/industry-black.otf');font-weight:900;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${W}px;height:${H}px;overflow:hidden;}
body{font-family:'InterV',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;}
.b{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${BK};
   color:${PAPER};padding:84px 92px 72px;display:flex;flex-direction:column;
   box-shadow:inset 0 0 0 2px rgba(255,255,255,.10);}
.b::before{content:"";position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(to right, rgba(255,255,255,.04) 1px, transparent 1px);
  background-size:calc((100% - 184px) / 4) 100%;background-position:92px 0;}
.hd{position:relative;display:flex;align-items:flex-start;justify-content:space-between;
    gap:90px;padding-bottom:40px;border-bottom:1px solid ${HAIR};}
.n{display:inline-flex;align-items:center;justify-content:center;width:54px;height:54px;
   border-radius:50%;background:${RED};color:#fff;font-size:21px;font-weight:700;flex:0 0 auto;}
.ttl{font-family:'Bricolage',sans-serif;font-weight:700;letter-spacing:-.03em;font-size:78px;line-height:.98;}
.cap{font-size:25px;line-height:1.5;color:${MUTED};max-width:600px;text-align:right;flex:0 0 auto;}
.lbl{font-size:19px;letter-spacing:.2em;text-transform:uppercase;color:${MUTED};font-weight:600;}
.bd{font-size:25px;line-height:1.6;color:${ONGREEN};}
.main{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;gap:32px;padding:44px 0 34px;}
.ft{position:relative;margin-top:auto;padding-top:30px;border-top:1px solid ${HAIR2};
    display:flex;justify-content:space-between;font-size:18px;letter-spacing:.18em;
    text-transform:uppercase;color:${FAINT};}
.card{background:${PANEL};border:1px solid ${HAIR2};border-radius:20px;}
`;

const board = (n, title, cap, main, ft) => `<!doctype html><html><head><meta charset="utf-8">
<style>${CSS}</style></head><body><div class="b">
  <div class="hd">
    <div style="display:flex;align-items:center;gap:30px;">
      <span class="n">${n}</span><span class="ttl">${title}</span>
    </div>
    <div class="cap">${cap}</div>
  </div>
  <div class="main">${main}</div>
  ${ft ? `<div class="ft">${ft}</div>` : ""}
</div></body></html>`;

/* 01 identity — short content, so the row centres rather than stretching */
const identity = board("01", "Identity",
  "Proud, athletic heritage &mdash; modernised. One green, one mustang, one voice.",
  `<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);gap:34px;
       align-content:center;">
    ${[["01","Proud","We celebrate our scholars, athletes, and artists loudly and often. Game-day energy, all year."],
       ["02","Grounded","Welcoming and clear for every family. Spirited, never corporate; confident, never loud for its own sake."],
       ["03","Together","One campus, one community. We ride together &mdash; and the brand pulls in the same direction."]]
      .map(([i,h,p]) => `
      <div class="card" style="padding:56px 48px;display:flex;flex-direction:column;justify-content:center;">
        <div class="lbl" style="color:${FAINT};">/ ${i}</div>
        <div style="font-family:'Bricolage',sans-serif;font-weight:700;letter-spacing:-.02em;
             font-size:58px;margin:26px 0 24px;">${h}</div>
        <div class="bd">${p}</div>
      </div>`).join("")}
  </div>`);

/* 02 marks */
const markTile = (file, name, use, onGreen) => `
  <div style="display:flex;flex-direction:column;">
    <div style="flex:1;min-height:0;border-radius:18px 18px 0 0;display:flex;align-items:center;
         justify-content:center;padding:44px;background:${onGreen ? "#003C24" : "#F0F2F0"};">
      <img src="img/marks/${file}.png" style="max-width:100%;max-height:100%;object-fit:contain;">
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;
         padding:22px 26px;border:1px solid ${HAIR2};border-top:none;border-radius:0 0 18px 18px;">
      <span style="font-size:23px;font-weight:600;letter-spacing:.04em;">${name}</span>
      <span class="lbl" style="font-size:17px;">${use}</span>
    </div>
  </div>`;

const marks = board("02", "The marks",
  "Always use supplied artwork. Never redraw, recolour, or stretch the mascot.",
  `<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(4,1fr);gap:26px;">
    ${markTile("LRHS-Full-Logo-1","Primary","Official",false)}
    ${markTile("LRHS-Emblem","Emblem","Athletics",false)}
    ${markTile("LRHS-Emblem-White","Reverse","On green",true)}
    ${markTile("LRHS-Horse","Mustang","Icon / WM",false)}
  </div>
  <div style="flex:0 0 auto;display:flex;align-items:center;gap:34px;">
    <div style="width:150px;height:104px;border-radius:14px;background:#F0F2F0;flex:0 0 auto;
         display:flex;align-items:center;justify-content:center;padding:18px;">
      <img src="img/marks/I-Love-LRHS.png" style="max-width:100%;max-height:100%;object-fit:contain;">
    </div>
    <div class="bd" style="font-size:24px;">
      Spirit mark &mdash; <strong style="color:${PAPER};font-weight:600;">I &#9829; Lakewood Ranch</strong>
      &mdash; community and spirit use only. Legacy &ldquo;Old LR&rdquo; marks are retired; do not use in new work.
    </div>
  </div>`,
  `<span>Eighteen marks &middot; each with its own permitted use</span><span>SVG only</span>`);

/* 03 colour */
const SW = [
  ["Mustang Green","#033922","Primary"],["Field Green","#144B2C","Depth"],
  ["Bright Pine","#1C6E40","Accents"],["Spirit Red","#AA2121","Rare accent"],
  ["Ink","#0B0B0B","Contrast"],["Paper","#FBFBF9","Background"],
];
const RAMP = ["50","100","200","300","400","500","600","700","800","900"];
const colour = board("03", "Colour",
  "Mustang Green leads, with black and white. Spirit Red stays rare.",
  `<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(6,1fr);gap:20px;">
    ${SW.map(([n,hex,role]) => `
      <div style="display:flex;flex-direction:column;">
        <div style="flex:1;min-height:0;border-radius:16px 16px 0 0;background:${hex};
             ${hex === "#FBFBF9" ? `border:1px solid ${HAIR2};border-bottom:none;` : ""}"></div>
        <div style="padding:22px 20px;border:1px solid ${HAIR2};border-top:none;border-radius:0 0 16px 16px;">
          <div style="font-size:22px;font-weight:600;letter-spacing:.02em;">${n}</div>
          <div style="font-size:19px;color:${MUTED};margin-top:8px;letter-spacing:.06em;">${hex.toUpperCase()}</div>
          <div class="lbl" style="font-size:16px;margin-top:12px;color:${FAINT};">${role}</div>
        </div>
      </div>`).join("")}
  </div>
  <div style="flex:0 0 auto;display:flex;border-radius:14px;overflow:hidden;border:1px solid ${HAIR2};">
    ${RAMP.map((s,i) => {
      const l = 97 - i * 9.4;
      return `<div style="flex:1;height:74px;background:hsl(150 8% ${l}%);display:flex;
           align-items:center;justify-content:center;font-size:17px;letter-spacing:.1em;
           color:${l > 55 ? "#3A4A42" : "#D6E2DA"};">${s}</div>`;
    }).join("")}
  </div>`,
  `<span>Warm stone &middot; neutral scale</span><span>Green-leaning greys</span>`);

/* 04 type */
const type = board("04", "Type",
  "Industry Black for headlines. Hanken Grotesk for body.",
  `<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;">
  <div style="font-family:'Industry',sans-serif;font-weight:900;font-size:196px;line-height:.92;
       letter-spacing:.01em;">GO <span style="color:#2EA866;">MUSTANGS</span></div>
  <div style="font-size:38px;letter-spacing:.13em;color:${ONGREEN};margin-top:34px;
       font-family:'Industry',sans-serif;font-weight:900;">
    ABCDEFGHIJKLMNOPQRSTUVWXYZ &middot; 0123456789</div>
  </div>
  <div style="flex:0 0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;
       padding-top:40px;border-top:1px solid ${HAIR2};">
    <div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-size:25px;font-weight:600;letter-spacing:.04em;">Body &mdash; Hanken Grotesk</span>
        <span class="lbl" style="font-size:16px;">--font-body</span>
      </div>
      <div class="bd" style="margin-top:24px;">From Friday-night lights to the science fair,
        there&rsquo;s a place for every Mustang to compete, create, and belong.</div>
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-size:25px;font-weight:600;letter-spacing:.04em;">Scale</span>
        <span class="lbl" style="font-size:16px;">Semantic ramp</span>
      </div>
      <div style="margin-top:22px;display:flex;flex-direction:column;gap:14px;">
        ${[["display",`<span style="font-family:'Industry';font-weight:900;font-size:40px;color:#2EA866;">RIDE TOGETHER</span>`],
           ["heading",`<span style="font-family:'Industry';font-weight:900;font-size:30px;">MUSTANG NEWS</span>`],
           ["eyebrow",`<span style="font-size:21px;letter-spacing:.2em;color:#2EA866;font-weight:600;">ONE RANCH</span>`],
           ["body",`<span style="font-size:23px;color:${ONGREEN};">Sentence-case body.</span>`]]
          .map(([k,v]) => `<div style="display:flex;align-items:baseline;gap:30px;">
             <span class="lbl" style="width:150px;font-size:17px;flex:0 0 auto;">${k}</span>${v}</div>`).join("")}
      </div>
    </div>
  </div>`);

/* 05 iconography */
const ICONS = ["graduation-cap","trophy","calendar","users","map-pin","megaphone","book-open","star",
               "ticket","bell","heart","shield","flag","music","flask-conical","award"];
const icons = board("05", "Iconography",
  "Lucide outline set &middot; ~2px stroke &middot; currentColor. No emoji in official use.",
  `<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(8,1fr);
       gap:18px;align-content:center;">
    ${ICONS.map((n) => `
      <div class="card" style="aspect-ratio:1;display:flex;align-items:center;
           justify-content:center;color:#2EA866;">${icon(n, 62)}</div>`).join("")}
  </div>`,
  `<span>Mustang mark doubles as app icon &amp; award glyph</span><span>lucide.dev</span>`);

/* 06 voice */
const voice = board("06", "Voice",
  `We speak as <strong style="color:${PAPER};font-weight:600;">we</strong>, to <strong style="color:${PAPER};font-weight:600;">you</strong>.`,
  `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:30px;
       align-content:center;">
    ${[["We do",["Speak as <strong>we</strong>; address <strong>you</strong>.",
                 "Headlines UPPERCASE; body sentence case.",
                 "Lead with pride and clarity.",
                 "Use rallying cries sparingly."]],
       ["We don&rsquo;t",["No corporate jargon.",
                          "No emoji in flagship materials.",
                          "No trailing periods on headlines.",
                          "Never snarky or talking down."]]]
      .map(([h, items]) => `
      <div class="card" style="padding:46px 44px;">
        <div style="font-family:'Bricolage',sans-serif;font-weight:700;font-size:40px;
             letter-spacing:-.02em;color:#2EA866;margin-bottom:28px;">${h}</div>
        ${items.map((t) => `<div style="display:flex;gap:18px;margin-bottom:18px;">
            <span style="color:${FAINT};flex:0 0 auto;">&bull;</span>
            <span class="bd" style="font-size:24px;">${t}</span></div>`).join("")}
      </div>`).join("")}
  </div>
  <div style="flex:0 0 auto;display:flex;flex-wrap:wrap;gap:16px;">
    ${["Go Mustangs","Home of the Mustangs","Ride together","Mustang pride","One Ranch","Join the herd"]
      .map((t) => `<span style="border:1px solid ${HAIR};border-radius:999px;padding:16px 32px;
           font-size:21px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;
           color:${ONGREEN};">${t}</span>`).join("")}
  </div>`,
  `<span>Written for staff, not for designers</span><span>Same document as the marks</span>`);

/* 07 in use */
const inUse = board("07", "In use",
  "The system, applied across social, signage and the website.",
  `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:30px;">
    <div style="display:flex;flex-direction:column;">
      <div style="position:relative;flex:1;min-height:0;border-radius:18px 18px 0 0;overflow:hidden;
           background:linear-gradient(150deg,#0A5733,#003C24 60%,#021C11);
           display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
        <img src="img/marks/LRHS-Horse.png" style="position:absolute;right:-60px;top:0;height:100%;
             opacity:.10;filter:brightness(0) invert(1);">
        <div style="position:relative;font-size:21px;letter-spacing:.24em;text-transform:uppercase;
             color:#84C9A2;font-weight:600;">Game day</div>
        <div style="position:relative;font-family:'Industry',sans-serif;font-weight:900;
             font-size:60px;line-height:1.06;margin:18px 0 16px;">MUSTANGS VS.<br>BRADEN RIVER</div>
        <div style="position:relative;font-size:22px;color:${ONGREEN};">Fri &middot; 7:00 PM &middot; Mustang Stadium</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:22px 26px;
           border:1px solid ${HAIR2};border-top:none;border-radius:0 0 18px 18px;">
        <span style="font-size:22px;font-weight:600;">Social / event graphic</span>
        <span class="lbl" style="font-size:16px;">Green + jersey type</span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;">
      <div style="flex:1;min-height:0;border-radius:18px 18px 0 0;overflow:hidden;background:#FBFBF9;
           display:flex;flex-direction:column;">
        <div style="background:#003C24;padding:20px 28px;display:flex;align-items:center;gap:18px;">
          <img src="img/marks/LRHS-Emblem-White.png" style="height:38px;">
          <span style="font-family:'Industry',sans-serif;font-weight:900;font-size:22px;
                letter-spacing:.03em;color:#fff;line-height:1.15;">LAKEWOOD RANCH<br>
            <span style="font-size:14px;letter-spacing:.2em;color:#84C9A2;">HIGH SCHOOL</span></span>
          <span style="margin-left:auto;border:1px solid rgba(255,255,255,.4);border-radius:999px;
                padding:10px 22px;font-size:16px;letter-spacing:.16em;color:#fff;">TICKETS</span>
        </div>
        <div style="flex:1;padding:38px 34px;">
          <div style="font-size:18px;letter-spacing:.2em;text-transform:uppercase;
               color:#1C6E40;font-weight:700;">Home of the Mustangs</div>
          <div style="font-family:'Industry',sans-serif;font-weight:900;font-size:52px;
               color:#0C2A1C;margin:16px 0 14px;">RIDE TOGETHER</div>
          <div style="font-size:22px;color:#4A5A52;">One Ranch, one herd &mdash; find your program.</div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:22px 26px;
           border:1px solid ${HAIR2};border-top:none;border-radius:0 0 18px 18px;">
        <span style="font-size:22px;font-weight:600;">Website header</span>
        <span class="lbl" style="font-size:16px;">Live UI kit</span>
      </div>
    </div>
  </div>`);

const BOARDS = [
  ["lrhs-identity", identity], ["lrhs-marks", marks], ["lrhs-color", colour],
  ["lrhs-type", type], ["lrhs-icons", icons], ["lrhs-voice", voice], ["lrhs-in-use", inUse],
];

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const missing = [];
page.on("requestfailed", (r) => missing.push(r.url().split("/").pop()));

for (const [name, html] of BOARDS) {
  const tmp = path.join(here, `_board_${name}.html`);
  fs.writeFileSync(tmp, html);
  await page.goto("file:///" + tmp.split(path.sep).join("/"), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(320);
  await page.screenshot({ path: path.join(OUT, `${name}.jpg`), type: "jpeg", quality: 94,
                          clip: { x: 0, y: 0, width: W, height: H } });
  fs.unlinkSync(tmp);
  console.log("  " + name);
}
console.log("missing assets:", missing.length ? [...new Set(missing)] : "none");
await browser.close();
