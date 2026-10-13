/**
 * The case study's copies of Mustang Studio's own pictures, made from the
 * captures in assets/studio (scripts/capture-mustang-studio.mjs writes those):
 *
 *   public/images/lrhs-studio/templates/<id>.jpg   every template, 720px on the long side
 *   public/images/lrhs-studio/ui-<name>.jpg        the tour's screens, 1920 x 1200
 *   public/images/lrhs-studio/apparel-*.jpg        1.1: the jersey mockup sheet (1920 wide) and the roster (1440 wide)
 *   src/data/mustang-studio-templates.json         the template wall's list, in the app's order
 *
 * Existing pictures are left alone unless they are named on the command line
 * (or --all), so a re-capture that changed nothing changes nothing here.
 *
 * Run: node scripts/studio-site-images.mjs [--all] [ui-sizes ui-templates ...]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STUDIO = path.join(root, "assets", "studio");
const SITE = path.join(root, "public", "images", "lrhs-studio");
const args = process.argv.slice(2), all = args.includes("--all"), named = new Set(args.filter((a) => !a.startsWith("--")));
const TOUR = ["templates", "edit", "fill", "batch", "carousel", "seasons", "apparel", "sizes", "export", "check-before", "check-after"];
const APPAREL = [["apparel-mockup", 1920], ["apparel-roster", 1440]];

const list = JSON.parse(fs.readFileSync(path.join(STUDIO, "templates.json"), "utf8"));
const out = [];
fs.mkdirSync(path.join(SITE, "templates"), { recursive: true });
for (const t of list) {
  const dest = path.join(SITE, "templates", `${t.id}.jpg`);
  if (all || named.has(t.id) || !fs.existsSync(dest)) {
    await sharp(path.join(STUDIO, `tpl-${t.id}.jpg`)).resize(720, 720, { fit: "inside" })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(dest);
    console.log("template", t.id);
  }
  const m = await sharp(dest).metadata();
  out.push({ ...t, w: m.width, h: m.height });
}
fs.writeFileSync(path.join(root, "src", "data", "mustang-studio-templates.json"), JSON.stringify({
  _about: `Mustang Studio's ${out.length} templates, as shown on the LRHS case study. Thumbnails in public/images/lrhs-studio/templates, made from assets/studio/tpl-*.jpg (720px on the long side) by scripts/studio-site-images.mjs. Order and groups come from assets/studio/templates.json.`,
  templates: out,
}, null, 2) + "\n");

for (const name of TOUR) {
  const dest = path.join(SITE, `ui-${name}.jpg`);
  if (!(all || named.has(`ui-${name}`)) && fs.existsSync(dest)) continue;
  await sharp(path.join(STUDIO, `ui-${name}.jpg`)).resize(1920, 1200).jpeg({ quality: 86, mozjpeg: true }).toFile(dest);
  console.log("screen", name);
}
for (const [name, width] of APPAREL) {
  const dest = path.join(SITE, `${name}.jpg`);
  if (!(all || named.has(name)) && fs.existsSync(dest)) continue;
  await sharp(path.join(STUDIO, `${name}.jpg`)).resize({ width }).jpeg({ quality: 86, mozjpeg: true, progressive: true }).toFile(dest);
  console.log("apparel", name);
}
console.log(`${out.length} templates on the wall`);
