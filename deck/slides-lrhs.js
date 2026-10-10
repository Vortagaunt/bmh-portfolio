/* LRHS half — the presentation for the principal. Same page engine and Mustang
   palette as the portfolio slides it follows.

   The order lives in one explicit list (ORDER, at the bottom) instead of being
   assembled with S.splice at hard-coded indices. The splice version put the
   audit slide in the wrong place once already, and every new slide shifted the
   indices of the ones after it. Badge numbers are derived from the same list,
   so they always count up in the order the slides are shown.

   Every mark on every slide comes from src/data/lrhs-marks.json — the same
   catalogue the PDF and the site read — so the three cannot disagree. */
const { S, page, CSS } = require("./slides");
const CAT = require("../src/data/lrhs-marks.json");

const RED = "#A82424", ONGREEN = "#D6E2DA", LR_MUTED = "#7E958A", GREY = "#5A6A61";
const GREEN = "#003C24";

const slug = (file) => file.replace(/\.svg$/, "").replace(/ /g, "-");
const markImg = (file) => `img/marks/${slug(file)}.png`;
const tileBg = (m) => (m.ground === "dark" ? GREEN : "#EFF2F0");
const family = (id) => CAT.families.find((f) => f.id === id);
const inFamily = (id) => CAT.marks.filter((m) => m.family === id);
/* numbers written out in running copy, so the counts can never go stale when
   the library grows */
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
  "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const words = (k) => (k < 20 ? ONES[k] : TENS[Math.floor(k / 10)] + (k % 10 ? "-" + ONES[k % 10] : ""));
const TOTAL = CAT.marks.length;                      // 27 (Oct 10: the Academics pair joined)
const FAMILIES = CAT.families.length;                // 8

const badge = (n, onDark) => `
  <span style="display:inline-flex;align-items:center;justify-content:center;
    width:104px;height:104px;border-radius:50%;background:${onDark ? RED : GREEN};
    color:#fff;font-size:38px;font-weight:700;letter-spacing:.02em;flex:0 0 auto;">
    ${String(n).padStart(2, "0")}</span>`;

const kicker = (n, text, onDark) => `
  <div style="display:flex;align-items:center;gap:44px;">
    ${n === undefined ? "" : badge(n, onDark)}
    <span style="font-size:30px;font-weight:600;letter-spacing:.28em;
          text-transform:uppercase;color:${onDark ? LR_MUTED : GREY};">${text}</span>
  </div>`;

/* section slide: badge + kicker + title + body left, board image right */
const section = (kick, title, body, img, opts = {}) => (n) => {
  const dark = !!opts.dark;
  const cls = dark ? "green" : "lrpaper";
  const titleColor = dark ? "#FCFCFC" : "#0C0C0C";
  const bodyColor = dark ? ONGREEN : GREY;
  return page(cls, `
    <div style="display:flex;gap:120px;height:100%;align-items:center;">
      <div style="flex:0 0 1330px;">
        <div style="display:flex;align-items:center;gap:44px;margin-bottom:90px;">
          ${badge(n, dark)}
          <span style="font-size:30px;font-weight:600;letter-spacing:.28em;
                text-transform:uppercase;color:${dark ? LR_MUTED : GREY};">${kick}</span>
        </div>
        <div class="display" style="font-size:160px;color:${titleColor};margin-bottom:75px;">
          ${title}
        </div>
        <div style="font-size:50px;line-height:1.6;color:${bodyColor};">${body}</div>
        ${opts.note ? `<div class="ital" style="font-size:42px;line-height:1.5;
             color:${dark ? LR_MUTED : GREY};margin-top:64px;">${opts.note}</div>` : ""}
      </div>
      <!-- min-width:0 is load-bearing: a flex item defaults to min-width:auto,
           which for an image is its intrinsic width, so the board refuses to
           shrink and runs off the slide. -->
      <img src="img/${img}" class="shadow"
           style="flex:1;min-width:0;width:100%;aspect-ratio:16/9;object-fit:cover;">
    </div>`);
};

/* an image that always fits its box, whatever the mark's proportions — the
   library runs from a 4.5:1 wordmark to a 0.7:1 crest */
const fit = (src, pad = 0) => `
  <div style="position:relative;flex:1;min-height:0;margin:${pad}px;">
    <img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">
  </div>`;

/* ---------------- slides ---------------- */

const title = () => page("greend", `
  <img src="img/emblem-white.png" style="position:absolute;right:250px;top:50%;
       transform:translateY(-50%);width:1000px;height:1000px;object-fit:contain;opacity:.95;">
  <div class="eyebrow"><span class="dot"></span>Prepared for the Principal · Bronx Hanratty</div>
  <div class="spacer"></div>
  <div class="display" style="font-size:260px;max-width:2700px;margin-bottom:90px;">
    Lakewood Ranch<br>High School
  </div>
  <div class="body" style="font-size:52px;max-width:2400px;">
    A Mustang brand system &mdash; ${words(TOTAL)} marks, and the colour,
    type and voice that hold them together.
  </div>
  <div class="spacer"></div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;">
    <div class="cap" style="color:${RED};letter-spacing:.24em;">Mustangs Ahead</div>
    <div class="cap">Concept work · not affiliated with the school district</div>
  </div>`);

const brief = (n) => page("lrpaper", `
  ${kicker(n, "The brief", false)}
  <div class="display" style="font-size:185px;color:#0C0C0C;margin:80px 0 60px;">
    One school, four different Mustangs
  </div>
  <div style="font-size:52px;line-height:1.6;color:${GREY};max-width:2700px;">
    Athletics, the band, the yearbook and social were each running a different
    horse, in different greens, at different weights. None of them were wrong.
    They just weren&rsquo;t the same school.
  </div>
  <div class="spacer"></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:60px;">
    ${[
      ["Consolidate", "One mark family, drawn once, supplied as SVG — never redrawn or restretched."],
      ["Anchor the colour", "Mustang Green leads. Spirit Red is an accent, not a second primary."],
      ["Make it usable", "A system a yearbook editor or a coach can follow without a designer."],
    ].map(([t, d], i) => `
      <div style="background:#EFF2F0;padding:76px 68px;">
        <div style="display:inline-flex;align-items:center;justify-content:center;
             width:70px;height:70px;border-radius:50%;background:${GREEN};color:#fff;
             font-size:30px;font-weight:700;">${i + 1}</div>
        <div style="font-size:52px;font-weight:600;letter-spacing:-.02em;margin:38px 0 26px;">${t}</div>
        <div style="font-size:38px;line-height:1.5;color:${GREY};">${d}</div>
      </div>`).join("")}
  </div>`);

const AUDIT = [
  ["img-4591", "Scoreboard", "50% 26%"],
  ["img-4605", "Academic banner", "50% 42%"],
  ["img-4608", "Pole banner", "50% 45%"],
  ["img-4609", "Building sign", "50% 42%"],
  ["img-4594", "Field bench", "50% 28%"],
  ["img-4611", "Entrance banner", "52% 48%"],
  ["img-4813", "Parking sign", "50% 45%"],
  ["img-4617", "Band trailer", "34% 34%"],
  ["img-4616", "Band trailer", "58% 42%"],
  ["img-4606", "Pole banner", "50% 42%"],
  ["img-4612", "Cafeteria", "44% 38%"],
  ["7e57aa60-1d8d-4695-84ee-2cf9b2c02b30", "Midfield", "50% 50%"],
];
const evidence = (n) => page("greend", `
  ${kicker(n, "The evidence", true)}
  <div class="display" style="font-size:170px;margin:70px 0 40px;">Count the horses</div>
  <div style="font-size:48px;line-height:1.5;color:${ONGREEN};max-width:2700px;">
    Every one of these is on campus right now &mdash; photographed in a single afternoon.
  </div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(6,1fr);
       grid-template-rows:1fr 1fr;gap:34px 26px;margin:60px 0 44px;">
    ${AUDIT.map(([f, cap, pos]) => `
      <figure style="margin:0;display:flex;flex-direction:column;min-height:0;">
        <div style="flex:1;min-height:0;overflow:hidden;background:rgba(255,255,255,.05);">
          <img src="img/audit/${f}.jpg"
               style="width:100%;height:100%;object-fit:cover;object-position:${pos};">
        </div>
        <figcaption style="font-size:26px;letter-spacing:.14em;text-transform:uppercase;
             color:${LR_MUTED};margin-top:16px;">${cap}</figcaption>
      </figure>`).join("")}
  </div>
  <div style="font-size:44px;line-height:1.5;color:#FCFCFC;max-width:3000px;">
    At least five different horse drawings, greens that run from near-black to teal
    to cyan, and no two lockups built the same way.
  </div>`);

const identity = section("Identity", "The core lockup",
  "The LR, the mustang and the school name, resolved into lockups that survive a jersey, a letterhead and a favicon without being redrawn.",
  "lrhs-identity.jpg", { dark: true, note: "Clear space equal to the height of the L on every side." });

const library = section("The mark library", "Every Mustang, captioned",
  "The emblem, the wordmarks, the mustang, the band, a graduation crest, the Academic Powerhouse badge, the Mustangs Ahead publications and the retro marks. Supplied as SVG only.",
  "lrhs-marks.jpg", { note: `${cap(words(TOTAL))} marks in ${words(FAMILIES)} families, each with its own permitted use.` });

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* NEW for the principal: which mark serves which part of the school. The
   library grew from one family into eight, and this is the view of it a
   principal actually needs — not the files, but who uses them for what.
   Five to a row; the count tile takes whatever is left of the last row, so a
   new family only ever shrinks it. */
const DEPT_COLS = 5;
const departments = (n) => page("lrpaper", `
  ${kicker(n, "Where each mark lives", false)}
  <div class="display" style="font-size:160px;color:#0C0C0C;margin:56px 0 30px;">
    One family, every department
  </div>
  <div style="font-size:46px;line-height:1.5;color:${GREY};max-width:3000px;margin-bottom:60px;">
    Each part of the school gets a mark built for it &mdash; and every one of
    them still reads as the same school.
  </div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(${DEPT_COLS},1fr);
       grid-auto-rows:1fr;gap:36px;">
    ${CAT.families.map((f) => {
      const hero = CAT.marks.find((m) => m.file === f.hero);
      const count = inFamily(f.id).length;
      return `
      <div style="background:${tileBg(hero)};display:flex;flex-direction:column;
           padding:40px 44px 42px;min-height:0;">
        ${fit(markImg(f.hero), 10)}
        <div style="margin-top:26px;">
          <div style="font-size:25px;letter-spacing:.2em;text-transform:uppercase;
               color:${GREY};font-weight:600;">${f.name} &middot; ${count}</div>
          <div style="font-size:42px;font-weight:600;letter-spacing:-.02em;
               margin-top:12px;line-height:1.15;color:#0C0C0C;">${f.dept}</div>
        </div>
      </div>`;
    }).join("")}
    <div style="background:${GREEN};color:#FCFCFC;padding:56px 60px;display:flex;
         flex-direction:column;justify-content:center;
         grid-column:span ${DEPT_COLS - (CAT.families.length % DEPT_COLS) || DEPT_COLS};">
      <div class="display" style="font-size:190px;line-height:.9;">${TOTAL}</div>
      <div style="font-size:30px;letter-spacing:.24em;text-transform:uppercase;
           color:#84C9A2;font-weight:600;margin-top:18px;">marks</div>
      <div class="ital" style="font-size:52px;color:${ONGREEN};margin-top:40px;line-height:1.25;">
        ${cap(words(FAMILIES))} families.<br>One school.
      </div>
    </div>
  </div>`);

const fullSet = (n) => page("lrpaper", `
  ${kicker(n, "The full set", false)}
  <div class="display" style="font-size:130px;color:#0C0C0C;margin:44px 0 16px;">
    Every mark, in one family
  </div>
  <div style="font-size:40px;line-height:1.45;color:${GREY};max-width:3300px;margin-bottom:44px;text-wrap:balance;">
    ${cap(words(TOTAL))} marks in ${words(FAMILIES)} families &mdash;
    the emblem and its reductions, three wordmarks, the mustang, the band, the
    graduation crest, Academic Powerhouse, Mustangs Ahead and the retro marks.
  </div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(${SET_COLS},1fr);
       grid-auto-rows:1fr;gap:24px 30px;">
    ${CAT.marks.map((m) => `
      <div style="display:flex;flex-direction:column;min-height:0;">
        <div style="flex:1;min-height:0;background:${m.ground === "dark" ? GREEN : "#E3E8E4"};display:flex;padding:20px 26px;">
          ${fit(markImg(m.file))}
        </div>
        <div style="margin-top:12px;line-height:1.2;">
          <div style="font-size:23px;font-weight:600;color:#0C0C0C;white-space:nowrap;
               overflow:hidden;text-overflow:ellipsis;">${m.name}</div>
          <div style="font-size:16px;letter-spacing:.16em;text-transform:uppercase;
               color:${GREY};white-space:nowrap;margin-top:5px;">${family(m.family).name}</div>
        </div>
      </div>`).join("")}
    ${TOTAL % SET_COLS ? `
      <div style="grid-column:span ${SET_COLS - (TOTAL % SET_COLS)};background:${GREEN};color:#FCFCFC;
           display:flex;flex-direction:column;justify-content:center;padding:30px 40px;">
        <div class="display" style="font-size:120px;line-height:.9;">${TOTAL}</div>
        <div style="font-size:22px;letter-spacing:.24em;text-transform:uppercase;color:#84C9A2;
             font-weight:600;margin-top:14px;">marks &middot; ${words(FAMILIES)} families</div>
      </div>` : ""}
  </div>`);
const SET_COLS = 7;

/* The crest, big. On the full-set slide the three crests are the smallest
   marks in the grid — tall artwork in wide tiles — and they carry the most
   detail in the system, so they get a page of their own: the use at the top,
   then the crests as large as the slide allows. */
const CREST_USE = {
  "LRHS Grad Mark.svg": ["Full colour", "Diplomas, programmes and awards"],
  "LRHS Grad Mark Alt.svg": ["Light", "Where the full crest reads too heavy"],
  "LRHS Grad Mark Mono.svg": ["One colour", "Embossing, foil and single-ink print"],
};
const crest = (n) => page("lrpaper", `
  ${kicker(n, "The crest", false)}
  <div class="display" style="font-size:130px;color:#0C0C0C;margin:48px 0 26px;">
    For the moments that should feel permanent
  </div>
  <div style="font-size:44px;line-height:1.5;color:${GREY};max-width:3200px;margin-bottom:56px;">
    The most formal mark in the system &mdash; diplomas, graduation programmes,
    awards and ceremonies. Keep it for those, so it keeps its weight.
  </div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);gap:90px;">
    ${inFamily("crest").map((m) => {
      const [label, use] = CREST_USE[m.file] || [m.name, m.use];
      return `
      <div style="display:flex;flex-direction:column;min-height:0;">
        ${fit(markImg(m.file))}
        <div style="text-align:center;margin-top:34px;">
          <div style="font-size:40px;font-weight:600;letter-spacing:-.01em;color:#0C0C0C;">${label}</div>
          <div style="font-size:28px;letter-spacing:.14em;text-transform:uppercase;
               color:${GREY};margin-top:12px;">${use}</div>
        </div>
      </div>`;
    }).join("")}
  </div>`);

/* Academic Powerhouse: the badge on campus today is an AI-generated picture.
   Bronx's two vector versions sit beside it, the same size, so the slide is a
   straight comparison. All three go in white cards because the original is a
   flat image with its own white ground (254, so the cards match it). */
/* Since Oct 10 the two redrawn badges are catalogued marks — the Academics
   family — so they come from the same PNGs as every other mark. */
const POWERHOUSE = [
  ["img/powerhouse/powerhouse-ai-original.png", "Today", "The original", "AI-generated · in use now"],
  [markImg("LRHS Academic Powerhouse.svg"), "Redrawn", "With the LR", "The system's mustang inside the LR"],
  [markImg("LRHS Academic Powerhouse 2.svg"), "Redrawn", "The mustang", "The horse alone, drawn larger"],
];
const powerhouse = (n) => page("lrpaper", `
  ${kicker(n, "Academic Powerhouse", false)}
  <div class="display" style="font-size:130px;color:#0C0C0C;margin:48px 0 26px;">
    From a generated image to a real mark
  </div>
  <div style="font-size:44px;line-height:1.5;color:${GREY};max-width:3300px;margin-bottom:56px;">
    The badge in use today began as an AI-generated picture &mdash; a flat image that
    blurs when it is enlarged and can't be recoloured. Both new versions are vector
    artwork built on the system's mustang, so they print sharp at any size.
  </div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);gap:90px;">
    ${POWERHOUSE.map(([f, tag, label, use], i) => `
      <div style="display:flex;flex-direction:column;min-height:0;">
        <div style="flex:1;min-height:0;display:flex;position:relative;background:#FEFEFE;border-radius:36px;
             box-shadow:0 40px 100px -40px rgba(12,12,12,.35);">
          ${fit(f, 60)}
        </div>
        <div style="text-align:center;margin-top:34px;">
          <div style="font-size:26px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;
               color:${i ? RED : GREY};">${tag}</div>
          <div style="font-size:40px;font-weight:600;letter-spacing:-.01em;color:#0C0C0C;margin-top:12px;">${label}</div>
          <div style="font-size:28px;letter-spacing:.14em;text-transform:uppercase;
               color:${GREY};margin-top:12px;">${use}</div>
        </div>
      </div>`).join("")}
  </div>`);

const beforeAfter = (n) => page("greend", `
  ${kicker(n, "Before / after", true)}
  <div class="display" style="font-size:150px;margin:56px 0 70px;">
    The emblem, redrawn
  </div>
  <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:110px;">
    ${[["Old LRHS Emblem.svg", "Before", "The retired emblem — kept on file for reference, not for use."],
       ["LRHS Emblem.svg", "After", "Redrawn on a single grid: cleaner silhouette, one green, legible at a favicon."]]
      .map(([f, tag, note], i) => `
      <div style="display:flex;flex-direction:column;">
        <!-- both panels share one ground: a before/after on two different
             backgrounds is not a comparison -->
        <div style="background:#F0F2F0;flex:1;display:flex;align-items:center;
             justify-content:center;padding:70px;
             ${i ? "box-shadow:0 40px 120px rgba(0,0,0,.35);" : ""}">
          <img src="${markImg(f)}" style="max-width:100%;max-height:820px;object-fit:contain;">
        </div>
        <div style="font-size:34px;letter-spacing:.24em;text-transform:uppercase;
             color:${i ? RED : LR_MUTED};margin-top:44px;font-weight:600;">${tag}</div>
        <div style="font-size:40px;line-height:1.5;color:${ONGREEN};margin-top:20px;">${note}</div>
      </div>`).join("")}
  </div>`);

/* Softer corners: the square-cornered emblem beside the rounded one, at the
   same size on the same ground, plus a close-up of the L's top corners at the
   same zoom so the change can actually be seen. The square original lives in
   public/images/lrhs-corners; prepare-assets copies both into img/corners. */
const cornerCard = (f) => `<div style="position:relative;background:#FEFEFE;border-radius:36px;height:100%;
  display:flex;align-items:center;justify-content:center;padding:80px;
  box-shadow:0 40px 100px -40px rgba(12,12,12,.35);">
  <img src="img/corners/${f}" style="max-width:100%;max-height:100%;object-fit:contain;"></div>`;
/* the L's top edge, units 0-600 of the 1944-wide artboard, at 2.1x */
const cornerZoom = (f) => `<div style="position:relative;overflow:hidden;background:#FEFEFE;border-radius:36px;
  height:100%;box-shadow:0 40px 100px -40px rgba(12,12,12,.35);">
  <img src="img/corners/${f}" style="position:absolute;left:63px;top:63px;width:4083px;max-width:none;"></div>`;
const cornerCap = (tag, name, use, red) => `
  <div style="margin-top:40px;">
    <div style="font-size:26px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:${red ? RED : GREY};">${tag}</div>
    <div style="font-size:40px;font-weight:600;letter-spacing:-.01em;color:#0C0C0C;margin-top:12px;">${name}</div>
    <div style="font-size:28px;letter-spacing:.14em;text-transform:uppercase;color:${GREY};margin-top:10px;">${use}</div>
  </div>`;
const corners = (n) => page("lrpaper", `
  ${kicker(n, "Corners", false)}
  <div class="display" style="font-size:150px;color:#0C0C0C;margin:56px 0 30px;">
    Softer corners, same LR
  </div>
  <div style="font-size:46px;line-height:1.5;color:${GREY};max-width:3100px;text-wrap:balance;">
    Every corner on the LR is now very slightly rounded &mdash; about the softness of an
    app icon &mdash; and the same change runs through all seven emblem files.
    Where one letter tucks under the other, the corner stays sharp.
  </div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr 1.26fr;gap:90px;margin-top:70px;">
    <div style="display:flex;flex-direction:column;min-height:0;">
      <div style="flex:1;min-height:0;">${cornerCard("emblem-square.svg")}</div>
      ${cornerCap("Before", "Square corners", "The emblem as first drawn", false)}
    </div>
    <div style="display:flex;flex-direction:column;min-height:0;">
      <div style="flex:1;min-height:0;">${cornerCard("emblem-rounded.svg")}</div>
      ${cornerCap("After", "Subtly rounded", "All seven emblem files", true)}
    </div>
    <div style="display:flex;flex-direction:column;min-height:0;">
      <div style="flex:1;min-height:0;display:grid;grid-template-rows:1fr 1fr;gap:40px;">
        ${cornerZoom("emblem-square.svg")}${cornerZoom("emblem-rounded.svg")}
      </div>
      ${cornerCap("Close-up", "The top of the L", "Before above, after below", false)}
    </div>
  </div>`);

/* the result: full-bleed wallpaper with a soft scrim */
const result = (n) => page("greend", `
  <img src="wallpaper/LRHS-wallpaper-slide.png"
       style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
  <div style="position:absolute;left:0;right:0;bottom:0;height:44%;pointer-events:none;
       background:linear-gradient(to top,
         rgba(1,17,10,.95) 0%, rgba(1,17,10,.88) 30%, rgba(1,17,10,.52) 60%,
         rgba(1,17,10,.14) 84%, rgba(1,17,10,0) 100%);"></div>
  <div style="position:relative;">${kicker(n, "The result", true)}</div>
  <div class="spacer"></div>
  <div style="position:relative;max-width:2900px;">
    <div class="display" style="font-size:190px;margin-bottom:52px;">One horse, drawn once</div>
    <div style="font-size:52px;line-height:1.55;color:${ONGREEN};">
      The horses on campus today each carry their own outline, their own shading
      and their own green. This is one silhouette in one colour &mdash; the same
      file on a scoreboard, a jersey and a favicon.
    </div>
  </div>`, false);

const colour = section("Colour", "Green leads, red accents",
  "Mustang Green is the school's own dark green and carries the system. Spirit Red is the single true accent, reserved for game day. Ink and Paper do everything else.",
  "lrhs-color.jpg", { dark: true, note: "One dominant, one accent, two neutrals. Nothing else." });
const type = section("Typography", "An athletic display face, a plain sans",
  "Industry Black — uppercase, tracked and unapologetically athletic — carries headlines, numbers and anything that should shout. Hanken Grotesk handles everything functional.",
  "lrhs-type.jpg", { note: "Two families. Nothing else." });
const icons = section("Iconography", "One line weight, drawn on a grid",
  "A small icon set for wayfinding, athletics and the site — every glyph on the same grid at the same stroke weight, so a new one can be added later without the set falling apart.",
  "lrhs-icons.jpg", { dark: true });
const voice = section("Voice", "How the school sounds",
  "Direct, warm and unfussy. Proud without the hard sell. The voice guidance sits in the same document as the marks, because a brand that only governs logos governs nothing.",
  "lrhs-voice.jpg", { note: "Written for staff, not for designers." });
const inUse = section("In use", "The system on real surfaces",
  "Signage, print, apparel and social applied from the same rules — the test of a system is whether it still looks like one school once other people start using it.",
  "lrhs-in-use.jpg", { dark: true });

/* Signage: the real sign on campus beside the concept on the same wall. Laid
   out like the emblem's before/after — one ground for both, so it is a
   comparison rather than two pictures. */
const signage = (n) => page("greend", `
  ${kicker(n, "Signage", true)}
  <div class="display" style="font-size:150px;margin:56px 0 64px;">
    The same wall, redrawn
  </div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:110px;">
    ${[["sign-before.jpg", "Before", "The sign as it hangs today — the old mustang laid over grey block letters, the two fighting for the same space."],
       ["sign-after.jpg", "After", "The same words and the same wall, set in the brand's type on Mustang Green, with the horse moved back into the field so the name can be read."]]
      .map(([f, tag, note], i) => `
      <div style="display:flex;flex-direction:column;min-height:0;">
        <div style="flex:1;min-height:0;overflow:hidden;
             ${i ? "box-shadow:0 40px 120px rgba(0,0,0,.45);" : ""}">
          <img src="img/signage/${f}" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <div style="font-size:34px;letter-spacing:.24em;text-transform:uppercase;
             color:${i ? RED : LR_MUTED};margin-top:44px;font-weight:600;">${tag}</div>
        <div style="font-size:40px;line-height:1.5;color:${ONGREEN};margin-top:20px;">${note}</div>
      </div>`).join("")}
  </div>`);

/* Poster concepts, straight from the two print files */
const posters = (n) => page("lrpaper", `
  ${kicker(n, "Poster concepts", false)}
  <div class="display" style="font-size:150px;color:#0C0C0C;margin:56px 0 30px;">
    Two posters, one system
  </div>
  <div style="font-size:46px;line-height:1.5;color:${GREY};max-width:3200px;margin-bottom:70px;">
    Both built on the same Mustang Green field and horse as the wallpaper, so a
    poster, a banner and the sign all read as one school.
  </div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:90px;align-items:start;align-content:center;">
    ${[["poster-name.jpg", "The name", "Walls, entrances and the stadium"],
       ["poster-go-mustangs.jpg", "Go Mustangs!", "Game week and the student section"]]
      .map(([f, name, use]) => `
      <figure style="margin:0;">
        <img src="img/signage/${f}" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;
             box-shadow:0 40px 100px -30px rgba(12,12,12,.55);">
        <figcaption style="margin-top:40px;">
          <div style="font-size:44px;font-weight:600;letter-spacing:-.01em;color:#0C0C0C;">${name}</div>
          <div style="font-size:28px;letter-spacing:.14em;text-transform:uppercase;
               color:${GREY};margin-top:12px;">${use}</div>
        </figcaption>
      </figure>`).join("")}
  </div>`);

/* ID cards — student (vertical) and staff (horizontal), both double sided.
   Card art: public/images/lrhs-ids, rendered from the ID concept build. The
   student card carries a sample ID number and barcode, never a real one: the
   repo is public. */
const idCaption = (tag, name, use) => `
  <figcaption style="margin-top:48px;">
    <div style="font-size:26px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:${GREY};">${tag}</div>
    <div style="font-size:40px;font-weight:600;letter-spacing:-.01em;color:#0C0C0C;margin-top:12px;">${name}</div>
    <div style="font-size:28px;letter-spacing:.14em;text-transform:uppercase;color:${GREY};margin-top:10px;">${use}</div>
  </figcaption>`;
const idCard = (f, w) => `<img src="img/ids/${f}.png" data-layer="${f}" style="width:${w}px;height:auto;display:block;
  filter:drop-shadow(0 40px 60px rgba(12,12,12,.24)) drop-shadow(0 8px 16px rgba(12,12,12,.10));">`;
const studentIds = (n) => page("lrpaper", `
  ${kicker(n, "Student ID", false)}
  <div class="display" style="font-size:150px;color:#0C0C0C;margin:56px 0 30px;">
    A card every student carries
  </div>
  <div style="font-size:46px;line-height:1.5;color:${GREY};max-width:3100px;text-wrap:balance;">
    Credit-card size and vertical, for the lanyard. The photo and name lead, the
    barcode sits clear so it scans first time, and the 24/7 support lines stay on the back.
  </div>
  <div style="flex:1;min-height:0;display:flex;justify-content:center;align-items:flex-end;gap:240px;">
    <figure style="margin:0;">${idCard("student-front", 680)}${idCaption("Front", "Photo, name, grade and barcode", "Shown at the door and the library")}</figure>
    <figure style="margin:0;">${idCard("student-back", 680)}${idCaption("Back", "Support lines and return address", "The same helplines as today's card")}</figure>
  </div>`);
const staffIds = (n) => page("lrpaper", `
  ${kicker(n, "Staff ID", false)}
  <div class="display" style="font-size:150px;color:#0C0C0C;margin:56px 0 30px;">
    Staff, at a glance
  </div>
  <div style="font-size:46px;line-height:1.5;color:${GREY};max-width:3100px;text-wrap:balance;">
    Horizontal and full Mustang Green, so staff read differently from students
    across a corridor. The back carries the return address, the same support
    lines and an employee ID.
  </div>
  <div style="flex:1;min-height:0;display:flex;justify-content:center;align-items:flex-end;gap:160px;">
    <figure style="margin:0;">${idCard("staff-front", 1560)}${idCaption("Front", "Photo, name, title and department", "Worn on campus all day")}</figure>
    <figure style="margin:0;">${idCard("staff-back", 1560)}${idCaption("Back", "Return address, support lines, employee ID", "Printed for each member of staff")}</figure>
  </div>`);

const APPAREL = [
  ["cap", "Cap", "Embroidered"],
  ["hoodie", "Hoodie", "One-colour print"],
  ["jersey", "Game jersey", "Sublimated"],
  ["crewneck", "Crewneck", "Reversed on green"],
  ["polo", "Polo", "Embroidered patch"],
];
const apparel = (n) => page("lrpaper", `
  ${kicker(n, "Apparel", false)}
  <div class="display" style="font-size:170px;color:#0C0C0C;margin:60px 0 36px;">
    The part students actually wear
  </div>
  <div style="font-size:48px;line-height:1.5;color:${GREY};max-width:3100px;">
    The largest run the school prints each year &mdash; and every one of these
    comes off the same file.
  </div>
  <div class="spacer"></div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:30px;
       align-items:end;margin:0 -70px;">
    ${APPAREL.map(([f, name, how]) => `
      <figure style="margin:0;display:flex;flex-direction:column;justify-content:flex-end;">
        <img src="img/apparel/${f}.png"
             style="width:100%;height:auto;display:block;
                    filter:drop-shadow(0 34px 46px rgba(12,12,12,.20));">
        <figcaption style="margin-top:44px;">
          <div style="font-size:34px;font-weight:600;color:#0C0C0C;">${name}</div>
          <div style="font-size:26px;letter-spacing:.14em;text-transform:uppercase;
               color:${GREY};margin-top:12px;">${how}</div>
        </figcaption>
      </figure>`).join("")}
  </div>`);

/* game day — image band on top, caption field below */
const gameDay = (n) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
<body><div class="slide greend" style="padding:0;">
  <img src="img/lrhs-go-mustangs.jpg" style="width:3840px;height:1330px;object-fit:cover;">
  <div style="flex:1;padding:110px 245px;">
    <div style="margin-bottom:56px;">${kicker(n, "Game day", true)}</div>
    <div class="display" style="font-size:158px;color:#FCFCFC;margin-bottom:48px;">
      Where Spirit Red earns its keep
    </div>
    <div style="font-size:50px;line-height:1.55;color:${ONGREEN};max-width:3100px;">
      Social posts and match-day graphics &mdash; the one place the accent runs
      at full volume.
    </div>
  </div>
</div></body></html>`;

const ask = (n) => page("lrpaper", `
  ${kicker(n, "The ask", false)}
  <div class="display" style="font-size:170px;color:#0C0C0C;margin:56px 0 70px;">
    One family, free to adopt
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:70px 120px;max-width:3300px;">
    ${[
      ["Adopt one mark family", "Athletics, the band, graduation, the newsletter and the front office all drawing from the same source, as the school's official Mustang identity."],
      ["Free", "No cost, no licence, no invoice."],
      ["Handed over ready to use", "SVG artwork plus a short usage guide. Nothing that needs a designer to operate."],
      ["Start with one piece", "Not all of it at once — the band mark, the graduation crest, or the newsletter."],
    ].map(([t, d]) => `
      <div>
        <div style="font-size:56px;font-weight:600;letter-spacing:-.02em;margin-bottom:24px;">${t}</div>
        <div style="font-size:40px;line-height:1.5;color:${GREY};">${d}</div>
      </div>`).join("")}
  </div>
  <div class="ital" style="font-size:46px;color:${GREY};margin-top:80px;">
    Fifteen minutes, and permission to hand files to whoever runs athletics,
    the band, graduation and the newsletter.
  </div>
  <div class="spacer"></div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;">
    <div class="cap">bronxhanratty.me</div>
    <div class="cap">Concept work · not affiliated with the school district</div>
  </div>`);

/* ---------------- Mustang Studio ----------------
   The brand-locked design app Bronx built, shown with its own screens and its
   own template exports (assets/studio — captured from the app by
   scripts/capture-mustang-studio.mjs). prepare-assets copies them to img/studio.
   Facts on these slides are read from the app (1.6): 41 templates in 6 groups
   (the sixth is Seasons), 17 sizes, 25 marks, 6 type styles, 134 icons,
   28 brand-check rules, 4 seasonal themes. */
const STUDIO = "img/studio";
const STUDIO_TPL = require("../assets/studio/templates.json");
const STUDIO_FMT = {
  "ig-post": [1080, 1080, "Instagram", "1080 × 1080"], "ig-portrait": [1080, 1350, "Portrait", "1080 × 1350"],
  story: [1080, 1920, "Story", "1080 × 1920"], "x-post": [1600, 900, "X / Facebook", "1600 × 900"],
  "fb-event": [1920, 1005, "Facebook event", "1920 × 1005"], "yt-thumb": [1280, 720, "YouTube", "1280 × 720"],
  "x-header": [1500, 500, "X header", "1500 × 500"], slide: [1920, 1080, "Slide", "16 : 9"],
  letter: [8.5, 11, "Flyer", "8.5 × 11 in"], half: [5.5, 8.5, "Half-letter", "5.5 × 8.5 in"],
  tabloid: [11, 17, "Poster", "11 × 17 in"], poster18: [18, 24, "Poster", "18 × 24 in"],
  poster24: [24, 36, "Poster", "24 × 36 in"], banner: [72, 24, "Banner", "6 × 2 ft"],
  postcard: [6, 4, "Postcard", "6 × 4 in"], "id-v": [2.125, 3.375, "ID card", "Vertical"],
  "id-h": [3.375, 2.125, "ID card", "Horizontal"],
};
const studioIcon = (paths, size, color) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
  stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const ICO = {
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};
/* part of a 1440 x 900 app screenshot, [x, y, w, h] in screenshot points, shown `width` px wide */
const studioCrop = (src, [x, y, w, h], width, extra = "") => {
  const k = width / w;
  return `<div style="position:relative;width:${width}px;height:${Math.round(h * k)}px;overflow:hidden;border-radius:26px;
    box-shadow:0 40px 100px -40px rgba(12,12,12,.55);${extra}">
    <img src="${STUDIO}/${src}" style="position:absolute;left:${-x * k}px;top:${-y * k}px;width:${1440 * k}px;max-width:none;"></div>`;
};
const studioCap = (title, use, onDark) => `
  <div style="margin-top:38px;">
    <div style="font-size:44px;font-weight:600;letter-spacing:-.01em;color:${onDark ? "#FCFCFC" : "#0C0C0C"};">${title}</div>
    <div style="font-size:30px;line-height:1.45;color:${onDark ? ONGREEN : GREY};margin-top:12px;">${use}</div>
  </div>`;

/* 1 — the reveal: the app, big */
const studioIntro = (n) => page("greend", `
  <div style="position:relative;z-index:1;">${kicker(n, "Mustang Studio", true)}</div>
  <div style="position:relative;z-index:1;flex:1;display:flex;flex-direction:column;justify-content:center;max-width:1380px;">
    <img src="${STUDIO}/app-icon.png" style="width:200px;height:200px;margin-bottom:60px;filter:drop-shadow(0 30px 50px rgba(0,0,0,.45));">
    <div class="display" style="font-size:240px;line-height:.9;margin-bottom:64px;">Mustang<br>Studio</div>
    <div style="font-size:54px;line-height:1.45;color:${ONGREEN};text-wrap:balance;">
      A design app that only speaks Mustang. Anyone at school can make a flyer, a post or a poster
      &mdash; and it comes out on brand every time.</div>
    <div style="display:flex;flex-wrap:wrap;gap:22px;margin-top:72px;">
      ${["41 templates", "17 sizes", "25 marks", "28 brand checks"].map((t) => `<span style="padding:20px 38px;border-radius:999px;
        background:rgba(255,255,255,.1);font-size:36px;font-weight:600;color:#FCFCFC;">${t}</span>`).join("")}
    </div>
  </div>
  <div style="position:absolute;right:-300px;top:310px;width:2420px;border-radius:30px;overflow:hidden;
       box-shadow:0 0 0 2px rgba(255,255,255,.08),0 80px 160px -50px rgba(0,0,0,.8);">
    <img src="${STUDIO}/ui-gameday.jpg" style="display:block;width:100%;"></div>`);

/* 2 — how it works, in three real screens */
const STUDIO_STEPS = [
  ["ui-templates.jpg", [0, 40, 1080, 810], "Pick a template", "Forty-one of them, sorted by department and season."],
  ["ui-fill.jpg", [280, 30, 1160, 870], "Fill in the blanks", "Type the details into a form. The type, colours and spacing stay locked to the brand."],
  ["ui-export.jpg", [300, 120, 840, 630], "Export", "PNG or JPG for screens, a print-ready PDF, or a video and a GIF when it moves."],
];
const studioSteps = (n) => page("lrpaper", `
  ${kicker(n, "How it works", false)}
  <div class="display" style="font-size:150px;color:#0C0C0C;margin:56px 0 30px;">Three steps, no designer</div>
  <div style="font-size:46px;line-height:1.5;color:${GREY};max-width:3100px;text-wrap:balance;">
    A coach, a club sponsor or the front office picks a template, changes the words and exports.
    The brand is already built in, so there is nothing to get wrong.</div>
  <div style="flex:1;min-height:0;display:flex;align-items:center;">
  <div style="width:100%;display:grid;grid-template-columns:repeat(3,1fr);gap:110px;align-items:start;">
    ${STUDIO_STEPS.map(([src, box, title, use], i) => `
      <div>
        ${studioCrop(src, box, 1006)}
        <div style="display:flex;gap:30px;align-items:flex-start;">
          <span style="flex:0 0 auto;margin-top:40px;display:inline-flex;align-items:center;justify-content:center;width:76px;height:76px;
            border-radius:50%;background:${GREEN};color:#fff;font-size:34px;font-weight:700;">${i + 1}</span>
          ${studioCap(title, use, false)}
        </div>
      </div>`).join("")}
  </div></div>`);

/* 3 — every template, by department, as the app exports them */
const STUDIO_GROUPS = ["Athletics", "Events & clubs", "News & podcast", "School & awards", "ID cards", "Seasons"];
const studioTemplates = (n) => page("lrpaper", `
  ${kicker(n, "Templates", false)}
  <div class="display" style="font-size:130px;color:#0C0C0C;margin:48px 0 20px;">Forty-one templates, ready on day one</div>
  <div style="font-size:42px;line-height:1.5;color:${GREY};">Built from the brand system, one set for every part of the school &mdash; and one for every season. Everything stays editable.</div>
  <div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:26px;">
    ${STUDIO_GROUPS.map((g) => {
      const items = STUDIO_TPL.filter((t) => t.group === g);
      return `<div style="display:flex;align-items:center;gap:60px;">
        <div style="flex:0 0 420px;">
          <div style="font-size:44px;font-weight:600;letter-spacing:-.01em;color:#0C0C0C;">${g}</div>
          <div style="font-size:26px;letter-spacing:.16em;text-transform:uppercase;color:${GREY};margin-top:10px;">${items.length} templates</div>
        </div>
        <div style="display:flex;gap:22px;align-items:center;height:214px;">
          ${items.map((t) => `<img src="${STUDIO}/tpl-${t.id}.jpg" alt="${t.name}" style="height:214px;width:auto;display:block;border-radius:8px;
            box-shadow:0 0 0 1px rgba(12,12,12,.08),0 18px 40px -20px rgba(12,12,12,.5);">`).join("")}
        </div>
      </div>`;
    }).join("")}
  </div>`);

/* 4 — the brand check, before and after one click each */
const STUDIO_CHECKS = ["Text that’s hard to read", "A mark on the wrong ground", "Tilted or faded marks", "Off-brand colours",
  "Too much Spirit Red", "Text too small to print", "Too close to the trim", "QR codes and barcodes"];
const studioCheck = (n) => page("greend", `
  ${kicker(n, "Brand check", true)}
  <div class="display" style="font-size:150px;margin:56px 0 70px;">It checks the work for you</div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr .8fr;gap:90px;">
    ${[["ui-check-before.jpg", "Before", "Two mistakes: the emblem is tilted, and the headline is green on green. Both are flagged, each with a fix."],
       ["ui-check-after.jpg", "After", "One click each, and it reads “On brand. Nothing to fix.”"]].map(([src, tag, note], i) => `
      <div style="display:flex;flex-direction:column;min-height:0;">
        ${studioCrop(src, [429, 52, 1011, 820], 1136, i ? "box-shadow:0 40px 120px rgba(0,0,0,.45);" : "")}
        <div style="font-size:34px;letter-spacing:.24em;text-transform:uppercase;color:${i ? RED : LR_MUTED};margin-top:44px;font-weight:600;">${tag}</div>
        <div style="font-size:38px;line-height:1.5;color:${ONGREEN};margin-top:18px;">${note}</div>
      </div>`).join("")}
    <div style="display:flex;flex-direction:column;justify-content:flex-start;">
      <div style="font-size:30px;letter-spacing:.24em;text-transform:uppercase;color:${LR_MUTED};font-weight:600;">28 rules, including</div>
      <div style="display:flex;flex-direction:column;gap:30px;margin-top:44px;">
        ${STUDIO_CHECKS.map((c) => `<div style="display:flex;gap:24px;align-items:center;font-size:40px;color:#FCFCFC;">
          ${studioIcon(ICO.check, 44, "#2EA866")}<span>${c}</span></div>`).join("")}
      </div>
    </div>
  </div>`);

/* 5 — every size the app makes, drawn to shape */
const STUDIO_ROWS = [
  [["Social", ["ig-post", "ig-portrait", "story", "x-post", "fb-event", "yt-thumb", "x-header"]], ["Screen", ["slide"]]],
  [["Print", ["letter", "half", "tabloid", "poster18", "poster24", "banner", "postcard", "id-v", "id-h"]]],
];
const studioShape = (id) => {
  const [w, h, name, dims] = STUDIO_FMT[id], H = 230, W = Math.round(H * w / h), card = id.startsWith("id-");
  return `<div style="display:flex;flex-direction:column;align-items:center;min-width:190px;">
    <div style="width:${W}px;height:${H}px;background:${GREEN};border-radius:${card ? 22 : 10}px;display:flex;align-items:center;justify-content:center;
         box-shadow:0 22px 50px -24px rgba(12,12,12,.55);">
      <img src="img/emblem-white.png" style="width:${Math.round(Math.min(W, H) * .5)}px;opacity:.95;"></div>
    <div style="font-size:28px;font-weight:600;color:#0C0C0C;margin-top:26px;white-space:nowrap;">${name}</div>
    <div style="font-size:22px;letter-spacing:.12em;text-transform:uppercase;color:${GREY};margin-top:8px;white-space:nowrap;">${dims}</div>
  </div>`;
};
const studioSizes = (n) => page("lrpaper", `
  ${kicker(n, "Every size", false)}
  <div class="display" style="font-size:150px;color:#0C0C0C;margin:56px 0 30px;">Seventeen sizes, one system</div>
  <div style="font-size:46px;line-height:1.5;color:${GREY};max-width:3200px;text-wrap:balance;">
    Posts and stories, a screen slide, flyers, posters up to 24 × 36, a six-foot fence banner &mdash; and
    the ID cards. Print sizes export as print-ready PDFs at 300 dpi.</div>
  <div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:90px;">
    ${STUDIO_ROWS.map((row) => `<div style="display:flex;gap:120px;align-items:flex-end;">
      ${row.map(([label, ids]) => `<div>
        <div style="font-size:30px;letter-spacing:.24em;text-transform:uppercase;color:${GREY};font-weight:600;margin-bottom:34px;">${label}</div>
        <div style="display:flex;gap:40px;align-items:flex-end;">${ids.map(studioShape).join("")}</div>
      </div>`).join("")}
    </div>`).join("")}
  </div>`);

/* 6 — what's already inside, straight from the app's drawers */
const STUDIO_INSIDE = [
  ["ui-marks.jpg", [0, 40, 368, 520], "Every mark", "All twenty-five, sorted by family, each labelled with where it belongs."],
  ["ui-text.jpg", [0, 40, 368, 520], "Six type styles", "Industry Black, Hanken Grotesk, Space Mono and Yellowtail, set up once."],
  ["ui-icons.jpg", [0, 40, 368, 520], "134 icons", "One line weight, ready to drop in."],
  ["ui-gameday.jpg", [1140, 40, 300, 424], "Brand colours only", "The palette is built in. Anything off-brand gets flagged."],
];
const studioInside = (n) => page("lrpaper", `
  ${kicker(n, "Built in", false)}
  <div class="display" style="font-size:150px;color:#0C0C0C;margin:56px 0 0;">Everything is already inside</div>
  <div style="flex:1;min-height:0;display:flex;align-items:center;">
  <div style="width:100%;display:grid;grid-template-columns:repeat(4,1fr);gap:90px;align-items:start;">
    ${STUDIO_INSIDE.map(([src, box, title, use]) => `<div>${studioCrop(src, box, 792)}${studioCap(title, use, false)}</div>`).join("")}
  </div></div>`);

/* 7 — new in 1.6: made for the people who'll use it, not for designers */
const STUDIO_NEW = [
  ["Motion", "Everything can rise, pop or slide in. Export an MP4 for Reels or a GIF that loops."],
  ["Seasons", "Homecoming gold, Pink Out, Halloween and winter colours, planned and checked."],
  ["Your own templates", "Save any design as a template. Next week, just fill it in."],
  ["“Who are you?”", "Coach, club, band, newsletter or front office: your templates come first."],
];
const studioNew = (n) => page("lrpaper", `
  ${kicker(n, "New in Mustang Studio 1.6", false)}
  <div class="display" style="font-size:150px;color:#0C0C0C;margin:56px 0 0;">Made for people who aren’t designers</div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.18fr .72fr 1.18fr;gap:90px;align-items:center;">
    <div>${studioCrop("ui-fill.jpg", [190, 30, 1250, 850], 1100)}${studioCap("Fill in the blanks", "A form instead of a canvas. Type the details; long lines shrink to fit and nothing slides off brand.", false)}</div>
    <div>
      <div style="width:100%;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px rgba(12,12,12,.08),0 40px 100px -40px rgba(12,12,12,.55);">
        <img src="${STUDIO}/sheet-staff-ids.jpg" style="display:block;width:100%;"></div>
      ${studioCap("A batch from a spreadsheet", "Paste a staff list: every ID comes out ganged on Letter sheets with cut marks.", false)}
    </div>
    <div>${studioCrop("ui-carousel.jpg", [110, 70, 1150, 790], 1100)}${studioCap("Carousels and multi-page files", "Pages along the bottom. An Instagram carousel exports as a ZIP; a newsletter as one PDF.", false)}</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:70px;padding-top:20px;border-top:2px solid rgba(12,12,12,.08);">
    ${STUDIO_NEW.map(([t, d]) => `<div style="padding-top:44px;">
      <div style="display:flex;gap:18px;align-items:center;font-size:40px;font-weight:600;color:#0C0C0C;">${studioIcon(ICO.check, 44, GREEN)}${t}</div>
      <div style="font-size:30px;line-height:1.45;color:${GREY};margin-top:14px;">${d}</div></div>`).join("")}
  </div>`);

/* 8 — where it runs, and what it hands back */
const studioAnywhere = (n) => page("greend", `
  ${kicker(n, "Where it runs", true)}
  <div class="display" style="font-size:150px;margin:56px 0 30px;">Free, and it runs anywhere</div>
  <div style="font-size:50px;line-height:1.55;color:${ONGREEN};max-width:3000px;">
    No licence, no account, no subscription. Install it, or open it at <span data-link="https://bronxhanratty.me/studio/">bronxhanratty.me/studio</span>.</div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);gap:70px;align-items:center;">
    ${[["monitor", "Windows app", "Installs in a minute, like any other program."],
       ["laptop", "Mac app", "For Apple silicon and Intel Macs."],
       ["globe", "Chromebooks", `Install it from <span data-link="https://bronxhanratty.me/studio/">bronxhanratty.me/studio</span>.`]].map(([ic, t, d]) => `
      <div style="background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 2px rgba(255,255,255,.07);border-radius:52px;padding:110px 96px 104px;">
        ${studioIcon(ICO[ic], 168, "#FCFCFC")}
        <div style="font-size:84px;font-weight:600;letter-spacing:-.025em;color:#FCFCFC;margin-top:70px;">${t}</div>
        <div style="font-size:44px;line-height:1.45;color:${ONGREEN};margin-top:22px;">${d}</div>
      </div>`).join("")}
  </div>
  <div style="display:flex;gap:80px;flex-wrap:wrap;">
    ${["PNG, JPG, PDF, MP4 and GIF", "Bleed and crop marks for the print shop", "Saves projects and templates", "Works offline"].map((t) => `
      <div style="display:flex;gap:22px;align-items:center;font-size:42px;color:#FCFCFC;">${studioIcon(ICO.check, 50, "#2EA866")}${t}</div>`).join("")}
  </div>`);

/* The whole system on one page — the keynote-style bento rendered by
   scripts/render-lrhs-bento.mjs (assets/flyer/lrhs-bento-v2.jpg), full bleed.
   It is already a finished 3840x2160 composition with its own type, so it gets
   no kicker or badge, and the slides around it keep their numbers.
   prepare-assets copies it in as img/lrhs-bento.jpg. */
const bento = () => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
<body><div class="slide" style="padding:0;background:#000;">
  <img src="img/lrhs-bento.jpg" style="width:3840px;height:2160px;object-fit:cover;">
</div></body></html>`;

/* Mustang Studio on one page — the wide cut of scripts/render-studio-bento.mjs
   (BENTO_LAYOUT=wide → assets/flyer/mustang-studio-bento-wide.jpg), full bleed,
   closing the Studio reveal before the system bento. Like the system bento it is a finished
   composition, so no kicker or badge; it builds itself in (see S.motion). */
const studioBento = () => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
<body><div class="slide" style="padding:0;background:#000;">
  <img src="img/mustang-studio-bento.jpg" style="width:3840px;height:2160px;object-fit:cover;">
</div></body></html>`;

/* Apple-style "One more thing…" — black, centred, nothing else. It is the
   reveal: Mustang Studio is kept secret until here, and its first slide follows
   as a straight cut from the black. */
const oneMore = () => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
<body><div class="slide" style="padding:0;background:#000;align-items:center;justify-content:center;">
  <div style="font-weight:600;font-size:210px;letter-spacing:-.04em;color:#F5F5F7;
       font-variation-settings:'opsz' 32;">One more thing&hellip;</div>
</div></body></html>`;

/* the QR. Code generated and decode-verified by build-qr.mjs */
const qr = (n) => page("greend", `
  ${kicker(n, "See it live", true)}
  <div style="flex:1;min-height:0;display:flex;align-items:center;gap:150px;">
    <div style="flex:1;min-width:0;">
      <div class="display" style="font-size:170px;margin-bottom:52px;">
        The whole system, online
      </div>
      <div style="font-size:50px;line-height:1.55;color:${ONGREEN};margin-bottom:64px;text-wrap:balance;">
        Every mark, the full guidelines, and the case study behind them &mdash;
        including photographs of the horses on campus today.
      </div>
      <div class="display" style="font-size:76px;color:#FCFCFC;"><span data-link="https://bronxhanratty.me">bronxhanratty.me</span></div>
      <div style="font-size:34px;letter-spacing:.2em;text-transform:uppercase;
           color:${LR_MUTED};margin-top:26px;">Point a camera at the code</div>
    </div>
    <div data-link="https://bronxhanratty.me" style="flex:0 0 auto;background:#FFFFFF;border-radius:44px;padding:52px;
         box-shadow:0 50px 120px -40px rgba(0,0,0,.8);">
      <img src="img/qr-site.png" style="width:620px;height:620px;display:block;">
    </div>
  </div>`);

const outro = () => page("green", `
  <div class="spacer"></div>
  <div class="display" style="font-size:280px;line-height:.92;">
    MUSTANGS<br><span style="color:${RED};">AHEAD</span>
  </div>
  <div style="font-size:50px;color:${ONGREEN};margin-top:60px;">
    A speculative Mustang brand system, by Bronx Hanratty.
  </div>
  <div class="spacer"></div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;">
    <div class="cap" style="color:#FCFCFC;">bronxhanratty.me</div>
    <div class="cap">Concept work · not affiliated with the school district</div>
  </div>`);

/* ---------------- the order ----------------
   Bronx's cut for the principal (Sep 30): it opens on the title and ends on the
   QR. The two portfolio slides from slides.js, the brief, the evidence, the ask
   and the outro are left out; put them back here to restore them. The title
   carries no badge; everything after it is numbered in the order it appears.

   Mustang Studio is a surprise (Oct 10): nothing before "One more thing…"
   mentions the app, and the black slide reveals it. The system bento — which
   has a Studio tile — comes after the Studio slides, as the recap before the
   QR. The section is called "One more thing" rather than "Mustang Studio" so
   the name doesn't show in PowerPoint's slide list before the reveal. */
S.splice(0);   // drop the portfolio slides slides.js pushed

/* Each entry: the slide, its title (alt text, speaker-note heading and PDF
   bookmark) and the section it sits in (PowerPoint sections, PDF outline). */
const ORDER = [
  [title, "Lakewood Ranch High School — a Mustang brand system", "Opening"],
  [identity, "Identity — the core lockup", "The system"],
  [library, "The mark library — every Mustang, captioned", "The system"],
  [departments, "Departments — one family, every department", "The system"],
  [fullSet, "The full set — every mark, in one family", "The system"],
  [crest, "The crest — for the moments that should feel permanent", "The system"],
  [powerhouse, "Academic Powerhouse — from a generated image to a real mark", "The system"],
  [beforeAfter, "Before / after — the emblem, redrawn", "The system"],
  [corners, "Corners — softer corners, same LR", "The system"],
  [result, "The result — one horse, drawn once", "The system"],
  [colour, "Colour — green leads, red accents", "Guidelines"],
  [type, "Typography — an athletic display face, a plain sans", "Guidelines"],
  [icons, "Iconography — one line weight, drawn on a grid", "Guidelines"],
  [voice, "Voice — how the school sounds", "Guidelines"],
  [inUse, "In use — the system on real surfaces", "Guidelines"],
  [signage, "Signage — the same wall, redrawn", "Applied"],
  [posters, "Poster concepts — two posters, one system", "Applied"],
  [studentIds, "Student ID — a card every student carries", "Applied"],
  [staffIds, "Staff ID — staff, at a glance", "Applied"],
  [apparel, "Apparel — the part students actually wear", "Applied"],
  [gameDay, "Game day — where Spirit Red earns its keep", "Applied"],
  [oneMore, "One more thing…", "One more thing"],
  [studioIntro, "Mustang Studio — a design app that only speaks Mustang", "One more thing"],
  [studioSteps, "How it works — three steps, no designer", "One more thing"],
  [studioTemplates, "Templates — forty-one, ready on day one", "One more thing"],
  [studioCheck, "Brand check — it checks the work for you", "One more thing"],
  [studioSizes, "Every size — seventeen sizes, one system", "One more thing"],
  [studioInside, "Built in — everything is already inside", "One more thing"],
  [studioNew, "New in 1.6 — made for people who aren't designers", "One more thing"],
  [studioAnywhere, "Where it runs — free, and it runs anywhere", "One more thing"],
  [studioBento, "Mustang Studio, on one page", "One more thing"],
  [bento, "Mustangs Ahead — the whole system on one page", "Finale"],
  [qr, "See it live — bronxhanratty.me", "Finale"],
];
const UNNUMBERED = new Set([title, outro, oneMore, bento, studioBento]);

let n = 0;
S.meta = [];
for (const [make, name, sectionName] of ORDER) {
  S.push(make(UNNUMBERED.has(make) ? undefined : ++n));
  S.meta.push({ title: name, section: sectionName });
}
const at = (make) => ORDER.findIndex(([m]) => m === make) + 1;   // 1-based slide number

/* Slides that move. The two bentos build themselves in: each video is
   scripts/render-bento-motion.mjs's 1080p cut, which prepare-assets copies in.
   render-slides.mjs writes this map beside the PNGs and assemble.js lays the
   video over that slide's still, playing by itself. The still stays
   underneath, so the PDF and the site's slide copies are unchanged. */
S.motion = {
  [at(studioBento)]: "img/mustang-studio-bento-motion.mp4",
  [at(bento)]: "img/lrhs-bento-motion.mp4",
};

/* Slides whose pieces animate natively in PowerPoint. render-slides.mjs cuts
   every element marked data-layer out of the slide (shadow included, on a
   transparent ground) and renders the slide once more without them; assemble.js
   puts the cut-outs back in exactly the same place and gives them an entrance.
   "fan": the cards rise in as one stack, then spread to where they sit. */
S.layers = {
  [at(studentIds)]: { effect: "fan" },
  [at(staffIds)]: { effect: "fan" },
};

S.extras = { "lrhs-crest": crest(), "lrhs-powerhouse": powerhouse(), "lrhs-signage": signage(), "lrhs-posters": posters(),
  "lrhs-ids-student": studentIds(), "lrhs-ids-staff": staffIds(),
  "lrhs-corners": corners(),
  "lrhs-studio": studioIntro(), "lrhs-studio-templates": studioTemplates(), "lrhs-studio-new": studioNew() };

module.exports = S;
