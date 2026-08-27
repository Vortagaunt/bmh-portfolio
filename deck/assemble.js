/* Full-bleed 4K renders, one per slide. 3840x2160 into a 13.333x7.5in canvas is
   exactly 16:9 into exactly 16:9 — nothing is scaled non-uniformly. */
const pptx = require("pptxgenjs");
const fs = require("fs"), path = require("path");
const sharp = require("sharp");

const here = __dirname;
const OUT = path.join(here, "Bronx-Hanratty-LRHS-Pitch.pptx");

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

  const p = new pptx();
  p.layout = "LAYOUT_WIDE";
  p.author = "Bronx Hanratty";
  p.title = "Lakewood Ranch High School — A Mustang Brand System";

  const jpgs = fs.readdirSync(jpgDir).filter((f) => f.endsWith(".jpg")).sort();
  jpgs.forEach((f, i) => {
    const s = p.addSlide();
    s.background = { color: i < 2 ? "F5F5F3" : "003C24" };
    s.addImage({ path: path.join(jpgDir, f), x: 0, y: 0, w: 13.333, h: 7.5 });
  });

  await p.writeFile({ fileName: OUT });
  const mb = (fs.statSync(OUT).size / 1048576).toFixed(2);
  console.log(`assembled ${jpgs.length} full-bleed slides  ${mb}MB  ${path.basename(OUT)}`);
})();
