/* Full-bleed 4K renders, one per slide. 3840x2160 into a 13.333x7.5in canvas is
   exactly 16:9 into exactly 16:9 — nothing is scaled non-uniformly.

   Slides that move (slides-png/motion.json, written by render-slides.mjs from
   S.motion in slides-lrhs.js) get their video laid over the still, full bleed,
   set to start on its own the moment the slide appears and to hold its last
   frame. The still stays underneath, so the PDF and anything that can't play
   video still show the finished slide. */
const pptx = require("pptxgenjs");
const JSZip = require("jszip");
const fs = require("fs"), path = require("path");
const sharp = require("sharp");

const here = __dirname;
const OUT = path.join(here, "Bronx-Hanratty-LRHS-Presentation.pptx");

/* What PowerPoint itself writes for a video set to Start: Automatically. */
const autoplay = (spid, ms) => `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>` +
  `<p:par><p:cTn id="2" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>` +
  `<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
  `<p:par><p:cTn id="4" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
  `<p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="5" dur="${ms}" fill="hold"/><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cBhvr></p:cmd>` +
  `</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>` +
  `<p:video><p:cMediaNode vol="80000"><p:cTn id="6" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>` +
  `<p:endCondLst><p:cond evt="onStopAudio" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst></p:cTn>` +
  `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cMediaNode></p:video>` +
  `</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`;

/* an MP4's length in ms, from its movie header — no ffprobe needed */
function mp4Ms(file) {
  const b = fs.readFileSync(file), i = b.indexOf("mvhd");
  const v = b[i + 4], scale = b.readUInt32BE(i + (v ? 24 : 16));
  const dur = v ? Number(b.readBigUInt64BE(i + 28)) : b.readUInt32BE(i + 20);
  return Math.round((dur / scale) * 1000);
}

(async () => {
  const srcDir = path.join(here, "slides-png");
  const jpgDir = path.join(here, "slides-jpg");
  fs.rmSync(jpgDir, { recursive: true, force: true });
  fs.mkdirSync(jpgDir, { recursive: true });

  const src = fs.readdirSync(srcDir).filter((f) => f.endsWith(".png")).sort();
  for (const f of src) {
    await sharp(path.join(srcDir, f))
      .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
      .toFile(path.join(jpgDir, f.replace(".png", ".jpg")));
  }

  const motionFile = path.join(srcDir, "motion.json");
  const motion = fs.existsSync(motionFile) ? JSON.parse(fs.readFileSync(motionFile, "utf8")) : {};
  // the videos open on black, so the poster is black: nothing flashes before they start
  const black = "data:image/png;base64," + (await sharp({ create: { width: 1920, height: 1080, channels: 3, background: "#000000" } }).png().toBuffer()).toString("base64");

  const p = new pptx();
  p.layout = "LAYOUT_WIDE";
  p.author = "Bronx Hanratty";
  p.title = "Lakewood Ranch High School — A Mustang Brand System, for the Principal";

  const moving = [];
  const jpgs = fs.readdirSync(jpgDir).filter((f) => f.endsWith(".jpg")).sort();
  jpgs.forEach((f, i) => {
    const s = p.addSlide();
    s.background = { color: i < 2 ? "F5F5F3" : "003C24" };
    s.addImage({ path: path.join(jpgDir, f), x: 0, y: 0, w: 13.333, h: 7.5, altText: `Slide ${i + 1}` });
    const video = motion[String(i + 1)];
    if (video) {
      const file = path.join(here, video);
      if (!fs.existsSync(file)) { console.log(`  ! slide ${i + 1}: ${video} is missing — run prepare-assets (it stays a still)`); return; }
      s.addMedia({ type: "video", path: file, x: 0, y: 0, w: 13.333, h: 7.5, cover: black, objectName: "Build" });
      moving.push({ n: i + 1, ms: mp4Ms(file), video });
    }
  });

  await p.writeFile({ fileName: OUT });

  /* set each video to play by itself (pptxgenjs leaves it on click) */
  if (moving.length) {
    const zip = await JSZip.loadAsync(fs.readFileSync(OUT));
    for (const m of moving) {
      const name = `ppt/slides/slide${m.n}.xml`;
      let xml = await zip.file(name).async("string");
      const spid = xml.match(/<p:cNvPr id="(\d+)"[^>]*><a:hlinkClick r:id="" action="ppaction:\/\/media"\/>/)[1];
      xml = xml.replace(/<p:timing>[\s\S]*?<\/p:timing>/, "");
      xml = xml.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + autoplay(spid, m.ms));
      zip.file(name, xml);
      console.log(`  slide ${m.n} plays ${path.basename(m.video)} by itself (${(m.ms / 1000).toFixed(1)}s, then holds)`);
    }
    fs.writeFileSync(OUT, await zip.generateAsync({ type: "nodebuffer", compression: "STORE" }));
  }

  const mb = (fs.statSync(OUT).size / 1048576).toFixed(2);
  console.log(`assembled ${jpgs.length} full-bleed slides  ${mb}MB  ${path.basename(OUT)}`);
})();
