/* Full-bleed 4K renders, one per slide. 3840x2160 into a 13.333x7.5in canvas is
   exactly 16:9 into exactly 16:9 — nothing is scaled non-uniformly.

   On top of the stills, everything PowerPoint does natively:

   - Speaker notes on every slide, read out of the presenter script
     (assets/script/presenter-script.html, via notes.js), so Presenter View
     shows the lines to say. Bold = say it, italic = do it.
   - Sections (Opening, The system, Guidelines, Applied, Mustang Studio,
     Finale) and real slide titles as alt text, from S.meta in slides-lrhs.js.
   - A fade between slides; "One more thing…" fades through black, and the
     finale cuts straight from it to the bento.
   - Slides that move (slides-png/motion.json): the video is laid over the
     still, full bleed, starts on its own and holds its last frame. The still
     stays underneath, so the PDF and anything that can't play video still
     show the finished slide.
   - Slides with layers (slides-png/layers.json): the ground goes in as the
     slide, the cut-out cards go back exactly where they sit, and they fan in
     on their own when the slide opens. At rest the slide is the still.

   The timing XML is PowerPoint's own shape for "After Previous" effects in the
   main sequence (tmRoot → mainSeq → click group → effects). Run
   validate.py from the pptx skill on the output after changing any of it. */
const pptx = require("pptxgenjs");
const JSZip = require("jszip");
const fs = require("fs"), path = require("path");
const sharp = require("sharp");
const { speakerNotes } = require("./notes.js");

const here = __dirname;
const OUT = path.join(here, "Bronx-Hanratty-LRHS-Presentation.pptx");
const SW = 13.333, SH = 7.5, PX = 3840, PY = 2160;   // slide in inches, renders in px
const inch = (px, of, size) => +(px / of * size).toFixed(4);
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* an MP4's length in ms, from its movie header — no ffprobe needed */
function mp4Ms(file) {
  const b = fs.readFileSync(file), i = b.indexOf("mvhd");
  const v = b[i + 4], scale = b.readUInt32BE(i + (v ? 24 : 16));
  const dur = v ? Number(b.readBigUInt64BE(i + 28)) : b.readUInt32BE(i + 20);
  return Math.round((dur / scale) * 1000);
}

/* ---------------- timing ---------------- */
const tgt = (spid) => `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>`;
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
/* keyframes for a value that holds, then eases from `a` to `b` between t0 and t1 (0–1) */
function frames(a, b, t0, t1, ease, steps = 8) {
  const out = [[0, a]];
  if (t0 > 0) out.push([t0, a]);
  for (let k = 1; k <= steps; k++) { const p = k / steps; out.push([t0 + (t1 - t0) * p, a + (b - a) * ease(p)]); }
  if (t1 < 1) out.push([1, b]);
  return out;
}
const tav = (list, fmt) => `<p:tavLst>${list.map(([t, v]) =>
  `<p:tav tm="${Math.round(t * 100000)}"><p:val>${fmt(v)}</p:val></p:tav>`).join("")}</p:tavLst>`;
const sign = (v) => (v >= 0 ? `+${v.toFixed(4)}` : v.toFixed(4));

/* a video that starts by itself and holds its last frame */
const playVideo = (spid, ms) => (nid) => {
  const a = nid(), b = nid();
  return `<p:par><p:cTn id="${a}" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect">` +
    `<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
    `<p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="${b}" dur="${ms}" fill="hold"/>${tgt(spid)}</p:cBhvr></p:cmd>` +
    `</p:childTnLst></p:cTn></p:par>`;
};

/* a card that rises in as part of a stack, then slides out to where it sits.
   dx/dy: where the stack is, relative to the card's own place (fractions of
   the slide); rot: its angle in the stack (degrees). */
const fanIn = (spid, { dx, dy, rot, delay, dur, first }) => (nid) => {
  const c = nid(), set = nid(), fade = nid(), ax = nid(), ay = nid(), ar = nid();
  const RISE = 0.42;   // the stack rises over the first 42%, then the cards spread
  return `<p:par><p:cTn id="${c}" presetID="2" presetClass="entr" presetSubtype="4" fill="hold" nodeType="${first ? "afterEffect" : "withEffect"}">` +
    `<p:stCondLst><p:cond delay="${delay}"/></p:stCondLst><p:childTnLst>` +
    `<p:set><p:cBhvr><p:cTn id="${set}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>${tgt(spid)}` +
    `<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>` +
    `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${fade}" dur="${Math.round(dur * 0.32)}"/>${tgt(spid)}</p:cBhvr></p:animEffect>` +
    `<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="${ax}" dur="${dur}" fill="hold"/>${tgt(spid)}` +
    `<p:attrNameLst><p:attrName>ppt_x</p:attrName></p:attrNameLst></p:cBhvr>` +
    tav(frames(dx, 0, RISE, 1, easeInOut), (v) => `<p:strVal val="#ppt_x${sign(v)}"/>`) + `</p:anim>` +
    `<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="${ay}" dur="${dur}" fill="hold"/>${tgt(spid)}` +
    `<p:attrNameLst><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr>` +
    tav(frames(dy, 0, 0, RISE, easeOut), (v) => `<p:strVal val="#ppt_y${sign(v)}"/>`) + `</p:anim>` +
    `<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="${ar}" dur="${dur}" fill="hold"/>${tgt(spid)}` +
    `<p:attrNameLst><p:attrName>style.rotation</p:attrName></p:attrNameLst></p:cBhvr>` +
    tav(frames(rot, 0, RISE, 1, easeInOut), (v) => `<p:fltVal val="${v.toFixed(2)}"/>`) + `</p:anim>` +
    `</p:childTnLst></p:cTn></p:par>`;
};

/* the main sequence, started by the slide itself (no click), plus the media
   nodes PowerPoint keeps for each video */
function timing(effects, videos) {
  let id = 0; const nid = () => ++id;
  const root = nid(), seq = nid(), click = nid(), group = nid();
  const body = effects.map((fx) => fx(nid)).join("");
  const media = videos.map((spid) =>
    `<p:video><p:cMediaNode vol="80000"><p:cTn id="${nid()}" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>` +
    `<p:endCondLst><p:cond evt="onStopAudio" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst></p:cTn>${tgt(spid)}</p:cMediaNode></p:video>`).join("");
  return `<p:timing><p:tnLst><p:par><p:cTn id="${root}" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>` +
    `<p:seq concurrent="1" nextAc="seek"><p:cTn id="${seq}" dur="indefinite" nodeType="mainSeq"><p:childTnLst>` +
    `<p:par><p:cTn id="${click}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="${seq}"/></p:cond></p:stCondLst><p:childTnLst>` +
    `<p:par><p:cTn id="${group}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` + body +
    `</p:childTnLst></p:cTn></p:par>` +
    `</p:childTnLst></p:cTn></p:par>` +
    `</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>` +
    `<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>` +
    media + `</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`;
}

/* ---------------- transitions ---------------- */
function transition(i, meta) {
  if (i === 0) return "";
  const t = meta[i]?.title || "";
  if (/^One more thing/.test(t)) return `<p:transition spd="slow"><p:fade thruBlk="1"/></p:transition>`;
  if (/^One more thing/.test(meta[i - 1]?.title || "")) return "";   // the finale is a straight cut from black
  return `<p:transition spd="med"><p:fade/></p:transition>`;
}

/* ---------------- speaker notes ---------------- */
function notesBody(paras) {
  const run = (t, rpr) => `<a:r><a:rPr lang="en-US" dirty="0"${rpr}/><a:t>${xml(t)}</a:t></a:r>`;
  const p = (inner, space = 0) => `<a:p>${space ? `<a:pPr><a:spcBef><a:spcPts val="${space}"/></a:spcBef></a:pPr>` : ""}${inner}</a:p>`;
  const out = paras.map((q, k) => {
    if (q.kind === "head") return p(run(q.text.toUpperCase(), ` sz="1050" b="1" spc="60"`), k ? 1200 : 0);
    if (q.kind === "say") return p(run(q.text, ` sz="1500" b="1"`), 600);
    if (q.kind === "sub") return p(run(q.text, ` sz="1300" b="1"`), 600);
    return p(run("▸ " + q.text, ` sz="1250" i="1"`), 600);
  }).join("");
  return `<p:txBody><a:bodyPr/><a:lstStyle/>${out || p("")}</p:txBody>`;
}
const plain = (paras) => paras.map((q) => (q.kind === "head" ? q.text.toUpperCase() : q.kind === "do" ? "▸ " + q.text : q.text)).join("\n");

(async () => {
  const srcDir = path.join(here, "slides-png");
  const jpgDir = path.join(here, "slides-jpg");
  const baseDir = path.join(jpgDir, "base");
  fs.rmSync(jpgDir, { recursive: true, force: true });
  fs.mkdirSync(baseDir, { recursive: true });

  /* only slide-NN.png are slides; -base and -layer-* belong to layered slides */
  const src = fs.readdirSync(srcDir).filter((f) => /^slide-\d+\.png$/.test(f)).sort();
  for (const f of src) {
    await sharp(path.join(srcDir, f)).jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
      .toFile(path.join(jpgDir, f.replace(".png", ".jpg")));
  }
  const readJson = (f, d) => (fs.existsSync(path.join(srcDir, f)) ? JSON.parse(fs.readFileSync(path.join(srcDir, f), "utf8")) : d);
  const motion = readJson("motion.json", {}), layers = readJson("layers.json", {}), meta = readJson("meta.json", []);
  for (const L of Object.values(layers)) {
    await sharp(path.join(srcDir, L.base)).jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
      .toFile(path.join(baseDir, L.base.replace(".png", ".jpg")));
  }
  // the videos open on black, so the poster is black: nothing flashes before they start
  const black = "data:image/png;base64," + (await sharp({ create: { width: 1920, height: 1080, channels: 3, background: "#000000" } }).png().toBuffer()).toString("base64");

  const p = new pptx();
  p.layout = "LAYOUT_WIDE";
  p.author = "Bronx Hanratty";
  p.company = "Concept work · not affiliated with the school district";
  p.title = "Lakewood Ranch High School — A Mustang Brand System, for the Principal";
  p.subject = "Mustangs Ahead: the LRHS brand system and Mustang Studio";

  const sections = [];
  for (const m of meta) if (m.section && !sections.includes(m.section)) sections.push(m.section);
  for (const title of sections) p.addSection({ title });

  const titles = src.map((_, i) => meta[i]?.title || `Slide ${i + 1}`);
  const notes = speakerNotes(src.length, titles);
  const plan = [];   // per slide: what the timing needs
  src.forEach((f, i) => {
    const n = i + 1, s = p.addSlide(meta[i]?.section ? { sectionTitle: meta[i].section } : undefined);
    s.background = { color: "003C24" };
    const L = layers[String(n)];
    const still = L ? path.join(baseDir, L.base.replace(".png", ".jpg")) : path.join(jpgDir, f.replace(".png", ".jpg"));
    s.addImage({ path: still, x: 0, y: 0, w: SW, h: SH, altText: titles[i], objectName: "Slide" });
    const item = { n, cards: [], video: null };

    if (L) {
      /* back to front: the first card in the layout ends up on top of the stack */
      const parts = [...L.parts].reverse();
      const cx = (c) => c.x + c.w / 2, cy = (c) => c.y + c.h / 2;
      const gx = (Math.min(...L.parts.map((q) => q.card.x)) + Math.max(...L.parts.map((q) => q.card.x + q.card.w))) / 2;
      const gy = L.parts.reduce((a, q) => a + cy(q.card), 0) / L.parts.length;
      parts.forEach((q, k) => {
        const depth = parts.length - 1 - k;            // 0 = top of the stack
        const name = `Card ${q.file.replace(/^slide-\d+-layer-/, "").replace(/\.png$/, "")}`;
        s.addImage({ path: path.join(srcDir, q.file), x: inch(q.x, PX, SW), y: inch(q.y, PY, SH), w: inch(q.w, PX, SW), h: inch(q.h, PY, SH),
          altText: `${titles[i].split(" — ")[0]} — ${name.replace(/^Card /, "").replace(/-/g, " ")}`, objectName: name });
        item.cards.push({ name, dx: (gx - cx(q.card)) / PX + depth * 0.012, dy: (gy - cy(q.card)) / PY + 0.07, rot: depth ? 5 : -3 });
      });
    }
    const video = motion[String(n)];
    if (video) {
      const file = path.join(here, video);
      if (!fs.existsSync(file)) console.log(`  ! slide ${n}: ${video} is missing — run prepare-assets (it stays a still)`);
      else {
        s.addMedia({ type: "video", path: file, x: 0, y: 0, w: SW, h: SH, cover: black, objectName: "Build" });
        item.video = { ms: mp4Ms(file), name: path.basename(video) };
      }
    }
    if (notes[i].length) s.addNotes(plain(notes[i]));
    plan.push(item);
  });

  await p.writeFile({ fileName: OUT });

  /* ---- post-process: transitions, timing, rich notes ---- */
  const zip = await JSZip.loadAsync(fs.readFileSync(OUT));
  for (const item of plan) {
    const name = `ppt/slides/slide${item.n}.xml`;
    let x = await zip.file(name).async("string");
    x = x.replace(/<p:timing>[\s\S]*?<\/p:timing>/, "");
    const effects = [], videos = [];
    item.cards.forEach((c, k) => {
      const spid = x.match(new RegExp(`<p:cNvPr id="(\\d+)" name="${c.name}"`))[1];
      effects.push(fanIn(spid, { dx: c.dx, dy: c.dy, rot: c.rot, delay: 250, dur: 1500, first: k === 0 }));
    });
    if (item.video) {
      const spid = x.match(/<p:cNvPr id="(\d+)"[^>]*><a:hlinkClick r:id="" action="ppaction:\/\/media"\/>/)[1];
      effects.push(playVideo(spid, item.video.ms)); videos.push(spid);
    }
    const tail = transition(item.n - 1, meta) + (effects.length ? timing(effects, videos) : "");
    x = x.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + tail);
    zip.file(name, x);
    if (item.cards.length) console.log(`  slide ${item.n}: ${item.cards.length} cards fan in`);
    if (item.video) console.log(`  slide ${item.n} plays ${item.video.name} by itself (${(item.video.ms / 1000).toFixed(1)}s, then holds)`);
  }
  for (let i = 0; i < plan.length; i++) {
    const name = `ppt/notesSlides/notesSlide${i + 1}.xml`;
    const f = zip.file(name);
    if (!f || !notes[i].length) continue;
    let x = await f.async("string");
    x = x.replace(/(<p:cNvPr id="\d+" name="Notes Placeholder 2"\/>[\s\S]*?<p:spPr\/>)<p:txBody>[\s\S]*?<\/p:txBody>/, (m, head) => head + notesBody(notes[i]));
    zip.file(name, x);
  }
  fs.writeFileSync(OUT, await zip.generateAsync({ type: "nodebuffer", compression: "STORE" }));   // as before: media stays stored

  const mb = (fs.statSync(OUT).size / 1048576).toFixed(2);
  console.log(`assembled ${src.length} full-bleed slides in ${sections.length} sections, with speaker notes  ${mb}MB  ${path.basename(OUT)}`);
})();
