/**
 * The ten stadium video-board pieces for The Ranch.
 *
 * Each piece: markup built from the catalogue's own marks (kit.mjs helpers),
 * an optional init (runs once in the page, after fonts load) and a scene, a
 * pure function of time t that sets every moving part. Every looping piece
 * starts and ends on the bare wallpaper field, so its last frame runs straight
 * into its first.
 *
 *   keys   the three PREVIEW moments: building in, the hero hold, going out
 *   hero   the poster frame
 *   hold   [in, out]: the stretch where everything is fully readable
 *   still  ranges with no fast movement (rendered without motion-blur sub-frames)
 */
export const PIECES = [];
const add = (p) => PIECES.push(p);

/* ======================================================================== */
add({
  id: "01", slug: "welcome-to-the-ranch", title: "Welcome to The Ranch", seconds: 12,
  family: "Emblem (LRHS Emblem.svg)",
  use: "Opener. Gates open, pre-game, the first thing on the board. Loops, or plays once and holds (the -once file).",
  keys: [1.9, 6.0, 10.4], hero: 6.0, hold: [4.0, 9.7], still: [[4.0, 9.6]], once: 9.7,
  html: (A) => `
    <div class="sweep" id="sw"></div><div class="bloom" id="bl"></div>
    <div class="stage">
      ${A.mk("LRHS Emblem.svg", 520, { id: "em", cls: "safe" })}
      ${A.gap(46)}
      ${A.ln("Welcome to The Ranch", { id: "l1", size: 138 })}
      ${A.gap(30)}
      ${A.ln("Home of the Mustangs", { id: "l2", cls: "hk", size: 130, color: A.T.onGreen })}
    </div>`,
  scene: (t, T, R) => {
    const { tk, put } = R;
    R.bg("#sw", tk(t, [[0.2, { v: 150 }], [1.9, { v: -50 }, "quintInOut"]]).v);
    put("#bl", tk(t, [[0.3, { o: 0 }], [1.7, { o: 1 }, "quintInOut"], [3.4, { o: 0.4 }, "quintInOut"], [9.7, {}], [11.0, { o: 0 }, "quintInOut"]]));
    put("#em", tk(t, [[1.0, { o: 0, y: 120, s: 1.06 }], [2.4, { o: 1, y: 0, s: 1 }], [10.1, {}], [10.9, { o: 0, y: -40, s: 0.97 }, "quintIn"]]));
    R.sheen("#em", tk(t, [[2.6, { v: 0 }], [3.8, { v: 1 }, "quintInOut"]]).v);
    put("#l1 .i", tk(t, [[2.5, { yp: 112 }], [3.4, { yp: 0 }], [9.85, {}], [10.45, { yp: 112 }, "quintIn"]]));
    put("#l2 .i", tk(t, [[3.0, { yp: 112 }], [3.95, { yp: 0 }], [9.7, {}], [10.3, { yp: 112 }, "quintIn"]]));
  },
});

/* ======================================================================== */
add({
  id: "02", slug: "touchdown", title: "Touchdown", seconds: 8,
  family: "Emblem (LRHS Emblem Mono.svg, the reversed emblem)",
  use: "Straight after a Mustangs touchdown. One of the two full-frame Spirit Red pieces.",
  keys: [0.7, 3.0, 5.6], hero: 3.0, hold: [1.35, 6.45], still: [[2.1, 5.0], [5.8, 6.4]],
  css: `#td{transform-origin:50% 60%}`,
  html: (A) => `
    <div class="flood" id="fl"><i class="sweep" id="fsw" style="background:linear-gradient(105deg,rgba(241,242,240,0) 38%,rgba(241,242,240,.22) 50%,rgba(241,242,240,0) 62%);background-size:320% 100%"></i></div>
    <div class="stage">
      ${A.mk("LRHS Emblem Mono.svg", 380, { id: "em", cls: "safe" })}
      ${A.gap(40)}
      ${A.ln("Touchdown", { id: "td", size: 272 })}
    </div>`,
  scene: (t, T, R) => {
    const { tk, put } = R;
    const f = tk(t, [[0.05, { a: 0, b: 0 }], [0.6, { b: 1.3 }], [5.0, {}], [5.75, { a: 1.3 }, "quintInOut"]]);
    R.band("#fl", f.a, f.b);
    R.bg("#fsw", tk(t, [[1.1, { v: 150 }], [2.1, { v: -50 }, "quintInOut"]]).v);
    put("#td", tk(t, [[0.42, { o: 0, s: 1.45 }], [0.95, { o: 1, s: 1 }]]));
    put("#td .i", tk(t, [[6.45, { yp: 0 }], [7.05, { yp: 112 }, "quintIn"]]));
    put("#em", tk(t, [[0.72, { o: 0, s: 1.25 }], [1.35, { o: 1, s: 1 }], [6.35, {}], [6.95, { o: 0, y: -40, s: 0.97 }, "quintIn"]]));
    R.sheen("#em", tk(t, [[1.3, { v: 0 }], [2.1, { v: 1 }, "quintInOut"]]).v);
  },
});

/* ======================================================================== */
add({
  id: "03", slug: "its-good", title: "It's Good", seconds: 7,
  family: "Emblem (LRHS Emblem.svg)",
  use: "Field goal or extra point is good.",
  keys: [0.95, 3.2, 5.6], hero: 3.2, hold: [2.1, 4.8], still: [[2.7, 4.7]],
  css: `.post{position:absolute;top:0;bottom:0;width:26px;left:947px;background:#F1F2F0;transform-origin:50% 100%}
        #pn{position:absolute;inset:0;background:#05281A;clip-path:inset(0 50% 0 50%)}`,
  html: (A) => `
    <div id="pn"></div><div class="post" id="p1"></div><div class="post" id="p2"></div>
    <div class="stage">
      ${A.mk("LRHS Emblem.svg", 270, { id: "em", cls: "safe" })}
      ${A.gap(44)}
      ${A.chars("It’s Good", { id: "tx", size: 300 })}
    </div>`,
  scene: (t, T, R) => {
    const { tk, put } = R;
    const p = tk(t, [[0.1, { sy: 0, dx: 0 }], [0.6, { sy: 1 }], [1.25, { dx: 770 }], [5.15, {}], [5.85, { dx: 0 }, "quintInOut"], [6.35, { sy: 0 }, "quintIn"]]);
    put("#p1", { x: -p.dx, sy: p.sy }); put("#p2", { x: p.dx, sy: p.sy });
    const c = ((960 - p.dx) / 1920) * 100; R.clip("#pn", [0, c, 0, c]);
    const L = R.$$("#tx .c .i"), n = L.length;
    L.forEach((el, i) => put(el, tk(t, [[0.8 + i * 0.05, { yp: 112 }], [1.5 + i * 0.05, { yp: 0 }], [4.8 + (n - 1 - i) * 0.04, {}], [5.3 + (n - 1 - i) * 0.04, { yp: 112 }, "quintIn"]])));
    put("#em", tk(t, [[1.0, { o: 0, y: -70 }], [1.8, { o: 1, y: 0 }], [4.85, {}], [5.4, { o: 0, y: -50 }, "quintIn"]]));
    R.sheen("#em", tk(t, [[1.9, { v: 0 }], [2.7, { v: 1 }, "quintInOut"]]).v);
  },
});

/* ======================================================================== */
add({
  id: "04", slug: "first-down", title: "First Down", seconds: 6,
  family: "Mustang (LRHS Mustang.svg, keylined, as the small badge)",
  use: "Mustangs move the chains.",
  keys: [0.45, 2.5, 4.55], hero: 2.5, hold: [1.25, 4.0], still: [[1.4, 3.95]],
  css: `#bd{position:absolute;left:0;right:0;top:290px;height:340px;background:#05281A;clip-path:inset(0 100% 0 0)}
        #ch{position:absolute;left:96px;width:1473px;top:733px;height:14px;background:#F1F2F0;transform-origin:0 50%}
        #hb{position:absolute;left:96px;top:665px}
        #txw{position:absolute;left:0;right:0;top:290px;height:340px;display:flex;align-items:center;justify-content:center}`,
  html: (A) => `
    <div id="bd"></div><div id="ch"></div>
    <div id="hb">${A.mk("LRHS Mustang.svg", 150, { cls: "safe" })}</div>
    <div id="txw">${A.chars("First Down", { id: "tx", size: 280, masked: false })}</div>`,
  scene: (t, T, R) => {
    const { tk, put } = R;
    const b = tk(t, [[0.05, { l: 0, r: 100 }], [0.6, { r: 0 }], [4.2, {}], [4.95, { l: 100 }, "quintIn"]]);
    R.clip("#bd", [0, b.r, 0, b.l]);
    const L = tk(t, [[0.15, { v: 0 }], [0.85, { v: 1 }]]).v, X = tk(t, [[4.3, { v: 0 }], [5.0, { v: 1 }, "quintIn"]]).v;
    put("#ch", { sx: Math.max(L, 0.0001) }); R.clip("#ch", [0, 0, 0, X * 100]);
    put("#hb", { x: L * 1473 + X * 760, o: tk(t, [[0.15, { o: 0 }], [0.35, { o: 1 }]]).o });
    const C = R.$$("#tx .c"), n = C.length;
    C.forEach((el, i) => put(el, tk(t, [[0.3 + i * 0.04, { o: 0, x: -170 }], [1.0 + i * 0.04, { o: 1, x: 0 }], [4.0 + (n - 1 - i) * 0.035, {}], [4.5 + (n - 1 - i) * 0.035, { o: 0, x: 260 }, "quintIn"]])));
  },
});

/* ======================================================================== */
add({
  id: "05", slug: "make-some-noise", title: "Make Some Noise", seconds: 8,
  family: "Clawed (LRHS Clawed.svg)",
  use: "Defence on the field, crowd prompt. The meter fills while the type grows with it.",
  keys: [1.25, 5.6, 6.45], hero: 5.6, hold: [2.1, 6.0], still: [],
  css: `.meter{display:flex;gap:10px;flex:none}
        .sg{position:relative;width:112px;height:44px;background:rgba(241,242,240,.14);display:block}
        .sg b{position:absolute;inset:0;background:#F1F2F0;opacity:0}
        .sg.hot b{background:#A82424}
        #chip{position:relative;flex:none;padding:22px 52px 18px}
        #chip .bgc{position:absolute;inset:0;background:#A82424;clip-path:inset(0 100% 0 0)}
        #mk{transform-origin:50% 55%}`,
  html: (A) => `
    <div class="stage">
      ${A.mk("LRHS Clawed.svg", 320, { id: "cl", cls: "safe" })}
      ${A.gap(34)}
      ${A.ln("Make Some Noise", { id: "mk", size: 150 })}
      ${A.gap(40)}
      <div class="meter safe" id="mt">${Array.from({ length: 12 }, (_, i) => `<i class="sg${i >= 9 ? " hot" : ""}"><b></b></i>`).join("")}</div>
      ${A.gap(40)}
      <div id="chip" class="safe"><i class="bgc"></i>${A.ln("Defense", { id: "df", size: 150 })}</div>
    </div>`,
  scene: (t, T, R) => {
    const { tk, put, clamp01 } = R;
    const lv = tk(t, [[1.8, { v: 0 }], [5.4, { v: 1 }, "quintInOut"], [6.0, {}], [6.6, { v: 0 }, "quintIn"]]).v;
    const beat = t > 1.8 && t < 6.6 ? 0.5 - 0.5 * Math.cos(2 * Math.PI * (t - 1.8) * 2) : 0, pulse = beat * lv;
    const cl = tk(t, [[0.2, { o: 0, y: 80, s: 1.05 }], [1.2, { o: 1, y: 0, s: 1 }], [6.1, {}], [6.8, { o: 0, y: -40, s: 0.97 }, "quintIn"]]);
    put("#cl", { ...cl, s: cl.s * (1 + 0.025 * pulse) });
    put("#mk", { s: 0.94 + 0.08 * lv + 0.025 * pulse });
    put("#mk .i", tk(t, [[0.6, { yp: 112 }], [1.4, { yp: 0 }], [6.0, {}], [6.55, { yp: 112 }, "quintIn"]]));
    R.$$("#mt .sg").forEach((el, i) => {
      put(el, tk(t, [[1.0 + i * 0.03, { o: 0, y: 30 }], [1.6 + i * 0.03, { o: 1, y: 0 }], [6.2 + (11 - i) * 0.02, {}], [6.6 + (11 - i) * 0.02, { o: 0, y: 30 }, "quintIn"]]));
      el.firstChild.style.opacity = clamp01(lv * 12 - i);
    });
    const ch = tk(t, [[1.3, { r: 100, l: 0 }], [1.8, { r: 0 }], [6.3, {}], [6.8, { l: 100 }, "quintIn"]]);
    R.clip("#chip .bgc", [0, ch.r, 0, ch.l]);
    put("#df .i", tk(t, [[1.5, { yp: 112 }], [2.1, { yp: 0 }], [6.0, {}], [6.5, { yp: 112 }, "quintIn"]]));
  },
});

/* ======================================================================== */
add({
  id: "06", slug: "turnover", title: "Turnover", seconds: 7,
  family: "Emblem (LRHS Emblem.svg) and Mustang (LRHS Mustang.svg on the card's red face)",
  use: "Interception or fumble recovery. The card literally turns over.",
  keys: [1.3, 3.2, 5.25], hero: 3.2, hold: [1.7, 4.9], still: [[2.3, 4.85]],
  css: `#fw{width:1640px;height:420px;flex:none;clip-path:inset(0 50% 0 50%)}
        #fp{position:relative;width:1640px;height:420px}
        .face{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
        .face i.shade{position:absolute;inset:0;background:#0C0C0C;opacity:0;pointer-events:none}
        .front{background:#A82424}
        .back{background:#05281A;border-top:18px solid #A82424;border-bottom:18px solid #A82424}`,
  html: (A) => `
    <div class="stage">
      ${A.mk("LRHS Emblem.svg", 240, { id: "em", cls: "safe" })}
      ${A.gap(44)}
      <div id="fw" class="safe"><div id="fp">
        <div class="face front">${A.mk("LRHS Mustang.svg", 250)}<i class="shade"></i></div>
        <div class="face back">${A.ln("Turnover", { id: "to", size: 290 })}<i class="shade"></i></div>
      </div></div>
    </div>`,
  scene: (t, T, R) => {
    const { tk, put } = R;
    const c = tk(t, [[0.2, { v: 50 }], [0.75, { v: 0 }]]).v; R.clip("#fw", c > 0.01 ? [0, c, 0, c] : [-20, 0, -20, 0]);
    /* The flip is drawn flat: the card folds to its edge and opens again on the other
       face, darkening as it turns. (A real 3D rotateX drew sheared, half-swapped
       frames in headless Chrome, and the motion-blur sub-frames smeared them.) */
    const e = R.E.cubicInOut(R.clamp01((t - 0.95) / 0.8)), half = e < 0.5;
    const out = R.E.quintIn(R.clamp01((t - 4.95) / 0.55));
    R.$("#fp .front").style.visibility = half ? "visible" : "hidden";
    R.$("#fp .back").style.visibility = half ? "hidden" : "visible";
    const k = Math.abs(Math.cos(Math.PI * e)) * (half ? 1 : 1 - out);
    put("#fp", { sy: Math.max(k, 0.0001), o: t >= 5.5 ? 0 : 1 });
    R.each("#fp .shade", (el) => (el.style.opacity = 0.45 * (1 - k)));
    put("#em", tk(t, [[1.4, { o: 0, y: -60 }], [2.2, { o: 1, y: 0 }], [4.9, {}], [5.45, { o: 0, y: -50 }, "quintIn"]]));
    R.sheen("#em", tk(t, [[2.2, { v: 0 }], [3.0, { v: 1 }, "quintInOut"]]).v);
  },
});

/* ======================================================================== */
add({
  id: "07", slug: "sack", title: "Sack", seconds: 6,
  family: "Clawed (LRHS Clawed.svg)",
  use: "Quarterback sack. Hard impact frame, then the claws tear through the word. The second full-frame Spirit Red piece.",
  keys: [0.4, 2.5, 4.35], hero: 2.5, hold: [1.15, 4.6], still: [[1.4, 3.95]],
  css: `#fs{position:absolute;inset:0;background:#F1F2F0;opacity:0}
        #sk{flex:none;transform-origin:50% 55%}
        #sk svg{display:block;overflow:visible}`,
  html: (A) => {
    const slashes = ["M1080 -40 Q 860 170 560 450", "M1225 -40 Q 1005 170 705 450", "M1370 -40 Q 1150 170 850 450"];
    return `
    <div class="flood" id="fl"></div><div id="fs"></div>
    <div class="stage">
      ${A.mk("LRHS Clawed.svg", 250, { id: "cl", cls: "safe" })}
      ${A.gap(30)}
      <div id="sk" class="safe" data-size="520"><svg width="1400" height="400" viewBox="0 0 1400 400">
        <defs><mask id="cut" maskUnits="userSpaceOnUse" x="-100" y="-100" width="1600" height="600">
          <rect x="-100" y="-100" width="1600" height="600" fill="#fff"/>
          <g fill="none" stroke="#000" stroke-width="44" stroke-linecap="round">${slashes.map((d) => `<path class="cut" d="${d}"/>`).join("")}</g>
        </mask></defs>
        <text x="700" y="382" text-anchor="middle" mask="url(#cut)" style="font-family:IB;font-size:520px;fill:#F1F2F0">SACK</text>
        <g fill="none" stroke="#F1F2F0" stroke-width="16" stroke-linecap="round" id="trail">${slashes.map((d) => `<path class="tr" d="${d}"/>`).join("")}</g>
      </svg></div>
    </div>`;
  },
  scene: (t, T, R) => {
    const { tk, put } = R;
    const hit = 0.3;
    R.band("#fl", tk(t, [[0, { a: 0 }], [4.0, {}], [4.6, { a: 1.3 }, "quintInOut"]]).a, t >= hit ? 1.3 : 0);
    put("#fs", { o: t < hit ? 0 : 0.85 * (1 - R.E.quintOut(R.clamp01((t - hit) / 0.16))) });
    const sk = tk(t, [[hit, { s: 1.7 }], [hit + 0.25, { s: 1 }], [4.6, {}], [5.15, { s: 0.94 }, "quintIn"]]);
    const u = t - (hit + 0.06), shake = u > 0 && u < 0.45 ? Math.exp(-u * 9) : 0;
    put("#sk", { s: sk.s, x: 12 * shake * Math.sin(u * 95), y: 8 * shake * Math.cos(u * 81),
      o: t < hit ? 0 : tk(t, [[4.6, { o: 1 }], [5.15, { o: 0 }, "quintIn"]]).o });
    put("#cl", tk(t, [[0.65, { o: 0, y: 60 }], [1.25, { o: 1, y: 0 }], [4.5, {}], [5.1, { o: 0, y: -40 }, "quintIn"]]));
    const cuts = R.$$("#sk .cut"), trails = R.$$("#sk .tr");
    cuts.forEach((el, i) => {
      const len = el.__len || (el.__len = el.getTotalLength());
      const p = R.E.quintOut(R.clamp01((t - (0.85 + i * 0.05)) / 0.16));
      for (const e of [el, trails[i]]) { e.style.strokeDasharray = len + " " + len; e.style.strokeDashoffset = String(len * (1 - p)); }
      trails[i].style.opacity = 1 - R.E.quintOut(R.clamp01((t - (1.0 + i * 0.05)) / 0.35));
    });
  },
});

/* ======================================================================== */
add({
  id: "08", slug: "starting-lineup", title: "Starting Lineup", seconds: 8,
  family: "Mustang (LRHS Mustang 3.svg, the badge) and Mustang 4 knocked out white as the empty photo slot's ghost",
  use: "Player introductions. A template: assets/motion/stadium/lineup.json lists the players and each gets its own video.",
  keys: [0.9, 3.5, 5.95], hero: 3.5, hold: [1.9, 5.6], still: [[2.0, 5.55]], template: true,
  css: `#ph{position:relative;width:520px;height:700px;flex:none;border-radius:22px;overflow:hidden;background:#05281A;
          box-shadow:inset 0 0 0 5px rgba(241,242,240,.28)}
        #ph .gh{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:.16}
        #ph img.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
        #col{position:relative;width:1136px;flex:none;display:flex;flex-direction:column;align-items:flex-start}
        #ac{position:absolute;left:-40px;top:0;bottom:0;width:14px;background:#A82424;transform-origin:50% 0}
        #bdg{position:absolute;right:0;top:20px}`,
  html: (A, p) => `
    <div class="stage" style="flex-direction:row;gap:72px">
      <div id="ph" class="safe">${p.photo ? `<img class="photo" src="${p.photo}" alt="">` : A.mk("LRHS Mustang 4.svg", 300, { cls: "gh", knockout: true })}</div>
      <div id="col" class="safe">
        <i id="ac"></i>
        ${A.mk("LRHS Mustang 3.svg", 150, { id: "bdg" })}
        ${A.ln("#" + p.number, { id: "nb", size: 330 })}
        ${A.gap(26)}
        ${A.ln(p.name, { id: "nm", size: 160 })}
        ${A.gap(34)}
        <div id="pos" data-one="${A.esc(p.position + " · Class of " + p.classOf)}" data-a="${A.esc(p.position)}" data-b="${A.esc("Class of " + p.classOf)}"></div>
      </div>
    </div>`,
  /* fit: the name shrinks to the column (warns under the readability floor); the
     position line breaks into two at the dot when it can't sit on one line */
  init: (R) => {
    const col = 1136, warn = [];
    const nm = R.$("#nm");
    let fs = 160;
    while (nm.querySelector(".i").getBoundingClientRect().width > col && fs > 60) { fs -= 2; nm.style.fontSize = fs + "px"; }
    nm.dataset.size = fs; if (fs < 130) warn.push(`name set at ${fs}px (under 130px)`);
    const pos = R.$("#pos"), mk = (txt, id) => `<div class="m hk safe" id="${id}" data-size="130" style="font-size:130px;color:#D6E2DA"><span class="i">${txt}</span></div>`;
    pos.innerHTML = mk(pos.dataset.one, "p1");
    if (R.$("#p1 .i").getBoundingClientRect().width > col) pos.innerHTML = mk(pos.dataset.a, "p1") + `<div style="height:18px"></div>` + mk(pos.dataset.b, "p2");
    return { warn };
  },
  scene: (t, T, R) => {
    const { tk, put } = R;
    const ph = tk(t, [[0.2, { c: 100, d: 0 }], [0.9, { c: 0 }], [5.7, {}], [6.3, { d: 100 }, "quintIn"]]);
    R.clip("#ph", [ph.c, 0, ph.d, 0]);
    put("#ac", tk(t, [[0.4, { sy: 0 }], [1.0, { sy: 1 }], [5.8, {}], [6.3, { sy: 0 }, "quintIn"]]));
    put("#nb", tk(t, [[0.5, { o: 0, x: 120 }], [1.2, { o: 1, x: 0 }], [5.6, {}], [6.1, { o: 0, x: -60 }, "quintIn"]]));
    put("#nm .i", tk(t, [[0.75, { yp: 112 }], [1.45, { yp: 0 }], [5.65, {}], [6.15, { yp: 112 }, "quintIn"]]));
    R.$$("#pos .m .i").forEach((el, i) => put(el, tk(t, [[0.95 + i * 0.08, { yp: 112 }], [1.65 + i * 0.08, { yp: 0 }], [5.7, {}], [6.2, { yp: 112 }, "quintIn"]])));
    put("#bdg", tk(t, [[1.2, { o: 0, s: 0.8 }], [1.9, { o: 1, s: 1 }], [5.6, {}], [6.0, { o: 0, s: 0.9 }, "quintIn"]]));
  },
});

/* ======================================================================== */
add({
  id: "09", slug: "halftime-mustang-band", title: "Halftime · The Mustang Band", seconds: 10,
  family: "Band (LRHS Band Emblem.svg)",
  use: "Halftime, as the band takes the field. Slower and warmer than the game-day pieces.",
  keys: [1.8, 5.5, 8.4], hero: 5.5, hold: [3.4, 7.5], still: [[3.4, 7.5]],
  css: `#st{position:absolute;left:0;right:0;top:598px;height:182px;display:flex;flex-direction:column;justify-content:space-between;clip-path:inset(0 100% 0 0)}
        #st i{display:block;height:5px;background:rgba(241,242,240,.16)}
        #gl{position:absolute;inset:0;opacity:0;background:radial-gradient(34% 44% at 50% 33%, rgba(241,242,240,.10) 0%, rgba(241,242,240,0) 70%)}`,
  html: (A) => `
    <div id="gl"></div>
    <div id="st"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="stage">
      ${A.mk("LRHS Band Emblem.svg", 400, { id: "em", cls: "safe" })}
      ${A.gap(38)}
      ${A.ln("Halftime", { id: "h1", size: 250 })}
      ${A.gap(30)}
      ${A.ln("The Mustang Band", { id: "h2", cls: "hk", size: 130, color: A.T.onGreen })}
    </div>`,
  scene: (t, T, R) => {
    const { tk, put } = R;
    const st = tk(t, [[0.2, { r: 100, l: 0 }], [2.4, { r: 0 }, "quintInOut"], [8.0, {}], [9.4, { l: 100 }, "quintInOut"]]);
    R.clip("#st", [0, st.r, 0, st.l]);
    put("#gl", tk(t, [[0.6, { o: 0 }], [2.6, { o: 1 }, "quintInOut"], [7.8, {}], [9.4, { o: 0 }, "quintInOut"]]));
    put("#em", tk(t, [[0.6, { o: 0, y: 90, s: 1.04 }], [2.4, { o: 1, y: 0, s: 1 }, "quintOut"], [7.8, {}], [9.2, { o: 0, y: -40, s: 0.98 }, "quintInOut"]]));
    R.sheen("#em", tk(t, [[2.6, { v: 0 }], [4.2, { v: 1 }, "quintInOut"]]).v);
    put("#h1 .i", tk(t, [[1.4, { yp: 112 }], [2.8, { yp: 0 }, "quintOut"], [7.6, {}], [8.6, { yp: 112 }, "quintInOut"]]));
    put("#h2 .i", tk(t, [[2.0, { yp: 112 }], [3.4, { yp: 0 }, "quintOut"], [7.5, {}], [8.5, { yp: 112 }, "quintInOut"]]));
  },
});

/* ======================================================================== */
const win = (id, slug, title, words) => ({
  id, slug, title, seconds: 12,
  family: "Emblem (LRHS Emblem.svg) + Wordmark (LRHS Wordmark.svg, white knockout)",
  use: id === "10" ? "Closer, after a win. Loops, or plays once and holds (the -once file)."
                   : "Closer for any other moment: end of the night, pre-game, after a loss. Loops, or plays once and holds.",
  keys: [3.0, 7.5, 10.2], hero: 7.5, hold: [5.6, 9.6], still: [[5.7, 9.55]], once: 9.6,
  css: `#row{display:flex;align-items:center;gap:56px;flex:none}
        #dv{display:block;width:6px;height:250px;background:rgba(241,242,240,.5);flex:none}
        #wn{display:flex;gap:.3em;flex:none;font-size:220px}
        #ul{display:block;width:640px;height:12px;background:#A82424;flex:none}`,
  html: (A) => `
    <div class="sweep" id="sw"></div><div class="bloom" id="bl"></div>
    <div class="stage">
      <div id="row" class="safe">
        ${A.mk("LRHS Emblem.svg", 330, { id: "em" })}
        <i id="dv"></i>
        ${A.mk("LRHS Wordmark.svg", 230, { id: "wm", knockout: true })}
      </div>
      ${A.gap(70)}
      <div id="wn" class="safe" data-size="220">${words.map((w, i) => A.ln(w, { id: "w" + i, size: 220 })).join("")}</div>
      ${A.gap(34)}
      <i id="ul" class="safe"></i>
    </div>`,
  init: (R) => {
    const row = R.$("#row").getBoundingClientRect(), em = R.$("#em").getBoundingClientRect();
    return { ox: row.left + row.width / 2 - (em.left + em.width / 2) };
  },
  scene: (t, T, R, S) => {
    const { tk, put } = R;
    R.bg("#sw", tk(t, [[0.2, { v: 150 }], [1.9, { v: -50 }, "quintInOut"]]).v);
    put("#bl", tk(t, [[0.3, { o: 0 }], [1.7, { o: 1 }, "quintInOut"], [3.6, { o: 0.4 }, "quintInOut"], [9.7, {}], [11.0, { o: 0 }, "quintInOut"]]));
    const e = tk(t, [[0.8, { o: 0, y: 100, s: 1.06 }], [2.2, { o: 1, y: 0, s: 1 }], [9.9, {}], [10.7, { o: 0, y: -36, s: 0.97 }, "quintIn"]]);
    put("#em", { ...e, x: tk(t, [[2.4, { x: S.ox }], [3.4, { x: 0 }, "quintInOut"]]).x });
    R.sheen("#em", tk(t, [[4.2, { v: 0 }], [5.2, { v: 1 }, "quintInOut"]]).v);
    put("#dv", tk(t, [[3.0, { sy: 0, o: 1 }], [3.6, { sy: 1 }], [9.8, {}], [10.4, { o: 0 }, "quintIn"]]));
    const w = tk(t, [[3.1, { r: 100 }], [4.0, { r: 0 }]]); R.clip("#wm", [0, w.r, 0, 0]);
    put("#wm", tk(t, [[9.9, { o: 1, y: 0 }], [10.7, { o: 0, y: -36 }, "quintIn"]]));
    R.$$("#wn .m .i").forEach((el, i) => put(el, tk(t, [[4.0 + i * 0.12, { yp: 112 }], [4.9 + i * 0.12, { yp: 0 }], [9.7 + i * 0.08, {}], [10.25 + i * 0.08, { yp: 112 }, "quintIn"]])));
    put("#ul", tk(t, [[4.8, { sx: 0 }], [5.6, { sx: 1 }], [9.6, {}], [10.1, { sx: 0 }, "quintIn"]]));
  },
});
add(win("10", "mustangs-win", "Mustangs Win", ["Mustangs", "Win"]));
add(win("10-alt", "go-mustangs", "Go Mustangs (alt)", ["Go", "Mustangs"]));
