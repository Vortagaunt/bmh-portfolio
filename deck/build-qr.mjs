/* Generate the site QR for the deck, then read it back to prove it scans.
   A QR that doesn't decode is worse than no QR at all, so this never leaves the
   file in place without round-tripping it through a decoder first.
   Run: node build-qr.mjs */
import QRCode from "qrcode";
import jsQR from "jsqr";
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const URL = "https://bronxhanratty.me";
const OUT = path.join(here, "img", "qr-site.png");

await QRCode.toFile(OUT, URL, {
  errorCorrectionLevel: "H", // survives a fold, a glare, a bad camera
  margin: 2,
  width: 1200,
  color: { dark: "#04231AFF", light: "#FFFFFFFF" },
});

const { data, info } = await sharp(OUT).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const res = jsQR(new Uint8ClampedArray(data), info.width, info.height);

if (!res) { console.error("FAIL: generated QR did not decode"); process.exit(1); }
if (res.data !== URL) { console.error(`FAIL: decoded "${res.data}", expected "${URL}"`); process.exit(1); }

console.log(`  qr-site.png ${info.width}x${info.height}`);
console.log(`  decoded: "${res.data}"  (ECC level H)`);
