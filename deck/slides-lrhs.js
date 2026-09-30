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
const TOTAL = CAT.marks.length;                      // 25
const FAMILIES = CAT.families.length;                // 7

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
  "The emblem, the wordmarks, the mustang, the band, a graduation crest, the Mustangs Ahead publications and the retro marks. Supplied as SVG only.",
  "lrhs-marks.jpg", { note: `${cap(words(TOTAL))} marks in ${words(FAMILIES)} families, each with its own permitted use.` });

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* NEW for the principal: which mark serves which part of the school. The
   library grew from one family into seven, and this is the view of it a
   principal actually needs — not the files, but who uses them for what. */
const departments = (n) => page("lrpaper", `
  ${kicker(n, "Where each mark lives", false)}
  <div class="display" style="font-size:160px;color:#0C0C0C;margin:56px 0 30px;">
    One family, every department
  </div>
  <div style="font-size:46px;line-height:1.5;color:${GREY};max-width:3000px;margin-bottom:60px;">
    Each part of the school gets a mark built for it &mdash; and every one of
    them still reads as the same school.
  </div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(4,1fr);
       grid-template-rows:1fr 1fr;gap:36px;">
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
         flex-direction:column;justify-content:center;">
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
  <div style="font-size:40px;line-height:1.45;color:${GREY};max-width:3300px;margin-bottom:44px;">
    ${cap(words(TOTAL))} marks in ${words(FAMILIES)} families &mdash;
    the emblem and its reductions, three wordmarks, the mustang, the band, the
    graduation crest, Mustangs Ahead and the retro marks.
  </div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(5,1fr);
       grid-auto-rows:1fr;gap:26px 30px;">
    ${CAT.marks.map((m) => `
      <div style="display:flex;flex-direction:column;min-height:0;">
        <div style="flex:1;min-height:0;background:${m.ground === "dark" ? GREEN : "#E3E8E4"};display:flex;padding:22px 30px;">
          ${fit(markImg(m.file))}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;
             gap:14px;margin-top:12px;">
          <span style="font-size:23px;font-weight:600;color:#0C0C0C;white-space:nowrap;
                overflow:hidden;text-overflow:ellipsis;">${m.name}</span>
          <span style="font-size:18px;letter-spacing:.16em;text-transform:uppercase;
                color:${GREY};white-space:nowrap;">${family(m.family).name}</span>
        </div>
      </div>`).join("")}
  </div>`);

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
      Every mark in the campus audit carried its own outline, its own shading and
      its own green. This is one silhouette in one colour &mdash; the same file on
      a scoreboard, a jersey and a favicon.
    </div>
  </div>`, false);

const colour = section("Colour", "Green leads, red accents",
  "Mustang Green is the school's own dark green and carries the system. Spirit Red is the single true accent, reserved for game day. Ink and Paper do everything else.",
  "lrhs-color.jpg", { dark: true, note: "One dominant, one accent, two neutrals. Nothing else." });
const type = section("Typography", "A scholastic serif, a plain sans",
  "A sturdy serif carries headlines and anything ceremonial — diplomas, banners, the yearbook. A plain sans handles everything functional.",
  "lrhs-type.jpg", { note: "Two families, four weights, no exceptions." });
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
      Social templates and match-day graphics &mdash; the one place the accent runs
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

/* the QR. Code generated and decode-verified by build-qr.mjs */
const qr = (n) => page("greend", `
  ${kicker(n, "See it live", true)}
  <div style="flex:1;min-height:0;display:flex;align-items:center;gap:150px;">
    <div style="flex:1;min-width:0;">
      <div class="display" style="font-size:170px;margin-bottom:52px;">
        The whole system, online
      </div>
      <div style="font-size:50px;line-height:1.55;color:${ONGREEN};margin-bottom:64px;">
        Every mark, the full guidelines, and the case study behind them &mdash;
        including the campus photographs from earlier.
      </div>
      <div class="display" style="font-size:76px;color:#FCFCFC;">bronxhanratty.me</div>
      <div style="font-size:34px;letter-spacing:.2em;text-transform:uppercase;
           color:${LR_MUTED};margin-top:26px;">Point a camera at the code</div>
    </div>
    <div style="flex:0 0 auto;background:#FFFFFF;border-radius:44px;padding:52px;
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
   The two portfolio slides from slides.js come first. Title and outro carry no
   badge; everything between them is numbered in the order it appears. */
const ORDER = [
  title,
  brief, evidence,
  identity, library, departments, fullSet, crest, beforeAfter, result,
  colour, type, icons, voice, inUse,
  signage, posters,
  apparel, gameDay,
  ask, qr,
  outro,
];

let n = 0;
for (const make of ORDER) {
  const numbered = make !== title && make !== outro;
  S.push(make(numbered ? ++n : undefined));
}

S.extras = { "lrhs-crest": crest(), "lrhs-signage": signage(), "lrhs-posters": posters() };

module.exports = S;
