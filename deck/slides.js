/* Slide engine: page shell, CSS, and the two portfolio slides that open the
   pitch. Every slide is a standalone HTML document rendered at 3840x2160.

   Lives in the repo. The previous copy of this engine existed only in a scratch
   directory and was lost when that directory was cleaned; the deck is the
   user's work and belongs under version control with the site. */

const PAPER = "#F5F5F3", INK = "#0C0C0C";
const GREEN = "#003C24", GREEN_DEEP = "#05281A", LR_PAPER = "#F1F2F0";
const RED = "#A82424", LR_MUTED = "#7E958A", ONGREEN = "#D6E2DA";

const CSS = `
@font-face{font-family:'Bricolage';src:url('fonts/BricolageGrotesque.ttf');font-weight:200 800;}
@font-face{font-family:'Instrument';src:url('fonts/InstrumentSerif.ttf');font-style:normal;}
@font-face{font-family:'Instrument';src:url('fonts/InstrumentSerifItalic.ttf');font-style:italic;}
@font-face{font-family:'InterV';src:url('fonts/Inter.ttf');font-weight:100 900;}
@font-face{font-family:'Industry';src:url('fonts/industry-black.otf');font-weight:900;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:3840px;height:2160px;overflow:hidden;}
body{font-family:'InterV',sans-serif;-webkit-font-smoothing:antialiased;
     text-rendering:geometricPrecision;}
.slide{position:relative;width:3840px;height:2160px;overflow:hidden;
       padding:150px 200px;display:flex;flex-direction:column;}
.paper{background:${PAPER};color:${INK};}
.dark{background:${INK};color:${PAPER};}
.green{background:${GREEN};color:${LR_PAPER};}
.greend{background:${GREEN_DEEP};color:${LR_PAPER};}
.lrpaper{background:${LR_PAPER};color:#0C0C0C;}
.grid{position:absolute;inset:0;pointer-events:none;}
.grid i{position:absolute;top:0;bottom:0;width:2px;background:rgba(0,0,0,.05);}
.dark .grid i,.green .grid i,.greend .grid i{background:rgba(255,255,255,.055);}
.eyebrow{font-size:34px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;
         color:#5A6A61;display:flex;align-items:center;gap:22px;}
.dark .eyebrow,.green .eyebrow,.greend .eyebrow{color:${LR_MUTED};}
.dot{width:20px;height:20px;border-radius:50%;background:${INK};flex:0 0 auto;}
.dark .dot{background:${PAPER};} .green .dot,.greend .dot{background:${RED};}
.display{font-family:'Bricolage',sans-serif;font-weight:700;letter-spacing:-.035em;
         line-height:.98;}
.ital{font-family:'Instrument',serif;font-style:italic;font-weight:400;letter-spacing:-.01em;}
.body{font-size:50px;line-height:1.55;color:#5A6A61;}
.dark .body{color:#c9c9c9;} .green .body,.greend .body{color:${ONGREEN};}
.cap{font-size:30px;letter-spacing:.2em;text-transform:uppercase;color:#5A6A61;font-weight:600;}
.green .cap,.greend .cap,.dark .cap{color:${LR_MUTED};}
.spacer{flex:1;}
.shadow{box-shadow:0 40px 120px rgba(0,0,0,.28);}
img{display:block;}
`;

/** five hairline columns, matching the site's grid backdrop */
const gridCols = () =>
  `<div class="grid">${[0, 1, 2, 3, 4]
    .map((i) => `<i style="left:${200 + ((3840 - 400) / 5) * i}px"></i>`)
    .join("")}</div>`;

const page = (cls, inner, withGrid = true) =>
  `<!doctype html><html><head><meta charset="utf-8">
<style>${CSS}</style></head><body><div class="slide ${cls}">${
    withGrid ? gridCols() : ""
  }${inner}</div></body></html>`;

/* ---------------- portfolio half ---------------- */
const S = [];
const PITCH = !!process.env.PITCH;

/* 1. title */
S.push(page("paper", `
  <div class="eyebrow"><span class="dot"></span>Portfolio · Bronx Hanratty</div>
  <div class="spacer"></div>
  <div class="display" style="font-size:340px;margin-bottom:70px;">
    Bronx<br><span class="ital">Hanratty</span>
  </div>
  <div class="body" style="max-width:2600px;">
    Experimental digital &amp; brand designer &mdash; brand systems, editorial
    layout, and film.
  </div>
  <div class="cap" style="margin-top:34px;text-transform:none;letter-spacing:0;font-size:38px;font-weight:400;">
    Sarasota, Florida. Moving pixels since 2020.
  </div>
  <div class="spacer"></div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;">
    <div class="cap">bronxhanratty.me</div>
    <div class="cap">Lakewood Ranch High School · Class of 2030</div>
  </div>`));

/* 2. about */
S.push(page("paper", `
  <div class="eyebrow">(About)</div>
  <div class="spacer"></div>
  <div style="display:flex;gap:150px;align-items:center;">
    <div style="flex:1;min-width:0;">
      <div class="display" style="font-size:170px;margin-bottom:60px;">
        A designer who <span class="ital">builds</span>
      </div>
      <div class="body" style="font-size:46px;margin-bottom:70px;">
        Everything here was designed and built end to end &mdash; including the
        portfolio site itself, a hand-written codebase rather than a template.
      </div>
      <div style="display:flex;flex-direction:column;gap:38px;">
        ${[
          ["DMJ Yearbook", "Designer — cover, spread system, 200+ page printed book."],
          ["Manatee Film Rush", "Winner, Jim Harbin Student Festival — the short film 8:46 AM."],
          ["Dalí Museum", "Student Surrealist Art Exhibit — for “Cascade Creation.”"],
        ].map(([t, d]) => `
          <div style="display:flex;gap:34px;align-items:baseline;">
            <span class="dot" style="margin-top:18px;"></span>
            <span style="font-size:40px;font-weight:600;flex:0 0 620px;">${t}</span>
            <span style="font-size:38px;color:#5A6A61;line-height:1.45;">${d}</span>
          </div>`).join("")}
      </div>
    </div>
    <img src="img/portrait.png" class="shadow"
         style="flex:0 0 1100px;width:1100px;height:1240px;object-fit:cover;object-position:top center;">
  </div>
  <div class="spacer"></div>`));

module.exports = { S, page, CSS, PITCH, PAPER, INK, GREEN, GREEN_DEEP, LR_PAPER, RED, LR_MUTED, ONGREEN };
