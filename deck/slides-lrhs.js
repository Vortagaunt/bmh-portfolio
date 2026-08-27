/* LRHS half — same page engine, Mustang palette.
   Order in PITCH mode:
     3 title · 4 brief · 5 audit · 6 identity · 7 mark library · 8 full set
     9 before/after · 10 result · 11 colour · 12 type · 13 icons · 14 voice
     15 in use · 16 apparel · 17 game day · 18 the ask · 19 QR · 20 outro     */
const { S, page } = require("./slides");
const PITCH = !!process.env.PITCH;

const RED = "#A82424", ONGREEN = "#D6E2DA", LR_MUTED = "#7E958A", GREY = "#5A6A61";

const badge = (n, onDark) => `
  <span style="display:inline-flex;align-items:center;justify-content:center;
    width:104px;height:104px;border-radius:50%;background:${onDark ? RED : "#003C24"};
    color:#fff;font-size:38px;font-weight:700;letter-spacing:.02em;flex:0 0 auto;">
    ${String(n).padStart(2, "0")}</span>`;

/* section slide: badge + kicker + title + body left, board image right */
const section = (n, kick, title, body, img, opts = {}) => {
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

/* 3. title */
S.push(page("greend", `
  <img src="img/emblem-white.png" style="position:absolute;right:250px;top:50%;
       transform:translateY(-50%);width:1000px;height:1000px;object-fit:contain;opacity:.95;">
  <div class="eyebrow"><span class="dot"></span>A speculative redesign · Bronx Hanratty</div>
  <div class="spacer"></div>
  <div class="display" style="font-size:260px;max-width:2700px;margin-bottom:90px;">
    Lakewood Ranch<br>High School
  </div>
  <div class="body" style="font-size:52px;max-width:2500px;">
    A Mustang brand system &mdash; marks, colour, type and voice, drawn and
    documented end to end.
  </div>
  <div class="spacer"></div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;">
    <div class="cap" style="color:${RED};letter-spacing:.24em;">Mustangs Ahead</div>
    <div class="cap">Concept work · not affiliated with the school district</div>
  </div>`));

/* 4. the brief */
S.push(page("lrpaper", `
  <div style="display:flex;align-items:center;gap:44px;">
    ${badge(2, false)}
    <span style="font-size:30px;font-weight:600;letter-spacing:.28em;
          text-transform:uppercase;color:${GREY};">The brief</span>
  </div>
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
             width:70px;height:70px;border-radius:50%;background:#003C24;color:#fff;
             font-size:30px;font-weight:700;">${i + 1}</div>
        <div style="font-size:52px;font-weight:600;letter-spacing:-.02em;margin:38px 0 26px;">${t}</div>
        <div style="font-size:38px;line-height:1.5;color:${GREY};">${d}</div>
      </div>`).join("")}
  </div>`));

/* ---- the system sections ---- */
S.push(section(3, "Identity", "The core lockup",
  "Horse, wordmark and shield resolved into a single lockup that survives a jersey, a letterhead and a favicon without being redrawn.",
  "lrhs-identity.jpg", { dark: true, note: "Clear space equal to the shield's height on every side." }));
S.push(section(4, "The mark library", "Every Mustang, captioned",
  "Current lockups, athletic emblems, the band mark, and the retired legacy artwork kept on file for reference rather than use. Supplied as SVG only.",
  "lrhs-marks.jpg", { note: "Eighteen marks, each with its own permitted use." }));
S.push(section(5, "Colour", "Green leads, red accents",
  "Mustang Green is the school's own dark green and carries the system. Spirit Red is the single true accent, reserved for game day. Ink and Paper do everything else.",
  "lrhs-color.jpg", { dark: true, note: "One dominant, one accent, two neutrals. Nothing else." }));
S.push(section(6, "Typography", "A scholastic serif, a plain sans",
  "A sturdy serif carries headlines and anything ceremonial — diplomas, banners, the yearbook. A plain sans handles everything functional.",
  "lrhs-type.jpg", { note: "Two families, four weights, no exceptions." }));
S.push(section(7, "Iconography", "One line weight, drawn on a grid",
  "A small icon set for wayfinding, athletics and the site — every glyph on the same grid at the same stroke weight, so a new one can be added later without the set falling apart.",
  "lrhs-icons.jpg", { dark: true }));
S.push(section(8, "Voice", "How the school sounds",
  "Direct, warm and unfussy. Proud without the hard sell. The voice guidance sits in the same document as the marks, because a brand that only governs logos governs nothing.",
  "lrhs-voice.jpg", { note: "Written for staff, not for designers." }));
S.push(section(9, "In use", "The system on real surfaces",
  "Signage, print, apparel and social applied from the same rules — the test of a system is whether it still looks like one school once other people start using it.",
  "lrhs-in-use.jpg", { dark: true }));

/* ---- 4a. the full set ---- */
const MARKS_NEW = [
  ["LRHS-Full-Logo-1", "Primary lockup"], ["LRHS-Full-Logo-2", "Horizontal lockup"],
  ["LRHS-Full-Logo-3", "Horizontal — wide"], ["LRHS-Emblem", "Emblem"],
  ["LRHS-Emblem-Black", "Emblem — one colour"], ["LRHS-Emblem-No-Horse", "Emblem — no horse"],
  ["LRHS-Horse", "Horse"], ["LRHS-Band-1", "Mustang Band"],
  ["LRHS-Band-2", "Band — short"], ["LRHS-Mustangs-Ahead-1", "Mustangs Ahead I"],
  ["LRHS-Mustangs-Ahead-2", "Mustangs Ahead II"], ["LRHS-Retro", "Retro"],
  ["I-Love-LRHS", "I ♥ LRHS"],
];
S.splice(PITCH ? 6 : 9, 0, page("lrpaper", `
  <div style="display:flex;align-items:center;gap:44px;">
    ${badge("4a", false)}
    <span style="font-size:34px;font-weight:600;letter-spacing:.28em;
          text-transform:uppercase;color:${GREY};">The full set</span>
  </div>
  <div class="display" style="font-size:150px;color:#0C0C0C;margin:56px 0 20px;">
    Every mark, drawn from scratch
  </div>
  <div style="font-size:44px;line-height:1.5;color:${GREY};max-width:2900px;margin-bottom:56px;">
    Thirteen marks in one family &mdash; three primary lockups, the emblem and its
    reductions, the horse, spirit marks, and the band lockups.
  </div>
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(5,1fr);gap:40px;">
    ${MARKS_NEW.map(([f, label]) => `
      <div style="background:#EFF2F0;display:flex;flex-direction:column;
           align-items:center;justify-content:center;gap:26px;padding:44px 30px;">
        <img src="img/marks/${f}.png" style="width:100%;height:250px;object-fit:contain;">
        <div style="font-size:28px;letter-spacing:.12em;text-transform:uppercase;
             color:${GREY};text-align:center;">${label}</div>
      </div>`).join("")}
  </div>`));

/* ---- 4b. before / after ---- */
S.splice(PITCH ? 7 : 10, 0, page("greend", `
  <div style="display:flex;align-items:center;gap:44px;">
    ${badge("4b", true)}
    <span style="font-size:34px;font-weight:600;letter-spacing:.28em;
          text-transform:uppercase;color:${LR_MUTED};">Before / after</span>
  </div>
  <div class="display" style="font-size:150px;margin:56px 0 70px;">
    The emblem, redrawn
  </div>
  <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:110px;">
    ${[["Old-LRHS-Emblem", "Before", "The retired emblem — kept on file for reference, not for use."],
       ["LRHS-Emblem", "After", "Redrawn on a single grid: cleaner silhouette, one green, legible at a favicon."]]
      .map(([f, tag, note], i) => `
      <div style="display:flex;flex-direction:column;">
        <!-- both panels share one ground: a before/after on two different
             backgrounds is not a comparison -->
        <div style="background:#F0F2F0;flex:1;display:flex;align-items:center;
             justify-content:center;padding:70px;
             ${i ? "box-shadow:0 40px 120px rgba(0,0,0,.35);" : ""}">
          <img src="img/marks/${f}.png" style="max-width:100%;max-height:820px;object-fit:contain;">
        </div>
        <div style="font-size:34px;letter-spacing:.24em;text-transform:uppercase;
             color:${i ? RED : LR_MUTED};margin-top:44px;font-weight:600;">${tag}</div>
        <div style="font-size:40px;line-height:1.5;color:${ONGREEN};margin-top:20px;">${note}</div>
      </div>`).join("")}
  </div>`));

/* ---- 2b. the audit. Index 4, straight after the brief: the section slides are
   already in by the time this runs, and 6 would land it after Identity —
   putting the problem slide in the middle of the solution. ---- */
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
S.splice(PITCH ? 4 : 7, 0, page("greend", `
  <div style="display:flex;align-items:center;gap:44px;">
    ${badge("2b", true)}
    <span style="font-size:30px;font-weight:600;letter-spacing:.28em;
          text-transform:uppercase;color:${LR_MUTED};">The evidence</span>
  </div>
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
  </div>`));

/* ---- 4c. the result: full-bleed wallpaper with a soft scrim ---- */
S.splice(PITCH ? 9 : 12, 0, page("greend", `
  <img src="wallpaper/LRHS-wallpaper-slide.png"
       style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
  <div style="position:absolute;left:0;right:0;bottom:0;height:44%;pointer-events:none;
       background:linear-gradient(to top,
         rgba(1,17,10,.95) 0%, rgba(1,17,10,.88) 30%, rgba(1,17,10,.52) 60%,
         rgba(1,17,10,.14) 84%, rgba(1,17,10,0) 100%);"></div>
  <div style="position:relative;display:flex;align-items:center;gap:44px;">
    ${badge("4c", true)}
    <span style="font-size:30px;font-weight:600;letter-spacing:.28em;
          text-transform:uppercase;color:${LR_MUTED};">The result</span>
  </div>
  <div class="spacer"></div>
  <div style="position:relative;max-width:2900px;">
    <div class="display" style="font-size:190px;margin-bottom:52px;">One horse, drawn once</div>
    <div style="font-size:52px;line-height:1.55;color:${ONGREEN};">
      Every mark in the campus audit carried its own outline, its own shading and
      its own green. This is one silhouette in one colour &mdash; the same file on
      a scoreboard, a jersey and a favicon.
    </div>
  </div>`, false));

/* ---- 9b. apparel ---- */
const APPAREL = [
  ["cap", "Cap", "Embroidered"],
  ["hoodie", "Hoodie", "One-colour print"],
  ["jersey", "Game jersey", "Sublimated"],
  ["crewneck", "Crewneck", "Reversed on green"],
  ["polo", "Polo", "Embroidered patch"],
];
S.splice(PITCH ? 15 : 18, 0, page("lrpaper", `
  <div style="display:flex;align-items:center;gap:44px;">
    ${badge("9b", false)}
    <span style="font-size:30px;font-weight:600;letter-spacing:.28em;
          text-transform:uppercase;color:${GREY};">Apparel</span>
  </div>
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
  </div>`));

/* 10. game day — image band on top, caption field below */
S.push(`<!doctype html><html><head><meta charset="utf-8"><style>${require("./slides").CSS}</style></head>
<body><div class="slide greend" style="padding:0;">
  <img src="img/lrhs-go-mustangs.jpg" style="width:3840px;height:1330px;object-fit:cover;">
  <div style="flex:1;padding:110px 245px;">
    <div style="display:flex;align-items:center;gap:44px;margin-bottom:56px;">
      ${badge(10, true)}
      <span style="font-size:30px;font-weight:600;letter-spacing:.28em;
            text-transform:uppercase;color:${LR_MUTED};">Game day</span>
    </div>
    <div class="display" style="font-size:158px;color:#FCFCFC;margin-bottom:48px;">
      Where Spirit Red earns its keep
    </div>
    <div style="font-size:50px;line-height:1.55;color:${ONGREEN};max-width:3100px;">
      Social templates and match-day graphics &mdash; the one place the accent runs
      at full volume.
    </div>
  </div>
</div></body></html>`);

/* 12. the ask */
if (PITCH) S.push(page("lrpaper", `
  <div style="display:flex;align-items:center;gap:44px;">
    ${badge(12, false)}
    <span style="font-size:30px;font-weight:600;letter-spacing:.28em;
          text-transform:uppercase;color:${GREY};">The ask</span>
  </div>
  <div class="display" style="font-size:170px;color:#0C0C0C;margin:56px 0 70px;">
    One family, free to adopt
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:70px 120px;max-width:3300px;">
    ${[
      ["Adopt one mark family", "Athletics, band, yearbook and social all drawing from the same source, as the school's official Mustang identity."],
      ["Free", "No cost, no licence, no invoice."],
      ["Handed over ready to use", "SVG artwork plus a short usage guide. Nothing that needs a designer to operate."],
      ["Start with one piece", "Not all of it at once — the band mark, the game-day templates, or the yearbook."],
    ].map(([t, d]) => `
      <div>
        <div style="font-size:56px;font-weight:600;letter-spacing:-.02em;margin-bottom:24px;">${t}</div>
        <div style="font-size:40px;line-height:1.5;color:${GREY};">${d}</div>
      </div>`).join("")}
  </div>
  <div class="ital" style="font-size:46px;color:${GREY};margin-top:80px;">
    Fifteen minutes, and permission to hand files to whoever runs athletics, band, or yearbook.
  </div>
  <div class="spacer"></div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;">
    <div class="cap">bronxhanratty.me</div>
    <div class="cap">Concept work · not affiliated with the school district</div>
  </div>`));

/* outro */
S.push(page("green", `
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
  </div>`));

/* 13. the QR — second to last, so it lands after the ask and immediately before
   the outro. Positioned with S.length so it does not depend on how many slides
   the PITCH flag added. Code generated and decode-verified by build-qr.mjs. */
S.splice(S.length - 1, 0, page("greend", `
  <div style="display:flex;align-items:center;gap:44px;">
    ${badge(13, true)}
    <span style="font-size:30px;font-weight:600;letter-spacing:.28em;
          text-transform:uppercase;color:${LR_MUTED};">See it live</span>
  </div>
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
  </div>`));

module.exports = S;
