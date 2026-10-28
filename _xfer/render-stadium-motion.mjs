/**
 * Stadium video-board motion graphics for The Ranch — ten silent pieces in the
 * Mustangs Ahead system (assets/motion/stadium/pieces.mjs), drawn by the same
 * Playwright -> frames -> ffmpeg approach as render-bento-motion.mjs.
 *
 * Every piece is authored once at 1920x1080 and drawn natively at each size:
 * 4K is device scale 2, 8K is device scale 4 (the same layout, never an
 * upscale). Frames are piped straight into ffmpeg. Fast moves get motion blur
 * from sub-frames averaged inside a 180° shutter; holds are drawn once.
 *
 * Per piece (assets/motion/stadium/out/, gitignored):
 *   <nn>-<slug>-4k.mov      ProRes 422 HQ, 3840x2160, 59.94 fps, 10-bit 4:2:2
 *   <nn>-<slug>-8k.mov      ProRes 422 HQ, 7680x4320, 59.94 fps
 *   <nn>-<slug>-4k.mp4      H.264 high, ~60 Mbps, yuv420p, +faststart
 *   <nn>-<slug>-8k.mp4      H.265, ~120 Mbps, hvc1
 *   <nn>-<slug>-poster.png  1920x1080, the hero frame
 * Pieces 01 and 10 also get "-once" files that stop on the hero hold.
 * No audio track at all; the stadium runs its own sound.
 *
 * Run: node scripts/render-stadium-motion.mjs [01..10|10-alt|lineup|all] ...
 *   PREVIEW=1           1920x1080 stills at each piece's three key moments, plus
 *                       a contact sheet (assets/motion/stadium/preview/). No video.
 *   PREVIEW=0.5,2,4     stills at those times instead
 *   RES=4k|8k|4k,8k     which masters to render (default 4k,8k)
 *   FPS=59.94  SUB=6    frame rate; motion-blur sub-frames (1 = off)
 *   GIF=1280            looping GIFs for the site instead (width; 25 fps, no grain), into OUT_DIR
 *   ONCE=0              skip the -once files for 01 and 10 (default: make them)
 *   FORCE=1             render even if the disk check says it won't fit
 *   LINEUP=path.json    the starting-lineup list (default assets/motion/stadium/lineup.json);
 *                       "lineup" renders one video per player, "08" only the sample
 *   optional env: LRHS_ROOT, OUT_DIR, CHROME, FFMPEG, INDUSTRY_FONT, HANKEN_FONT
 */
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { W, H, SAFE, MIN_TYPE, fonts, helpers, markURI, pageHTML, RUNTIME } from "../assets/motion/stadium/kit.mjs";
import { PIECES } from "../assets/motion/stadium/pieces.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.LRHS_ROOT || path.join(here, "..");
const DIR = path.join(root, "assets", "motion", "stadium");
const OUT = process.env.OUT_DIR || path.join(DIR, "out");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const FPS_LABEL = process.env.FPS || "59.94";
const FPS = FPS_LABEL === "59.94" ? 60000 / 1001 : FPS_LABEL === "29.97" ? 30000 / 1001 : +FPS_LABEL;
const FPS_ARG = FPS_LABEL === "59.94" ? "60000/1001" : FPS_LABEL === "29.97" ? "30000/1001" : FPS_LABEL;
const SUB = Math.max(1, +(process.env.SUB || 6));
const RES = (process.env.RES || "4k,8k").split(",").map((s) => s.trim().toLowerCase());
const ONCE = process.env.ONCE !== "0";
const LINEUP = process.env.LINEUP || path.join(DIR, "lineup.json");

const FONTS = fonts(root);
const GHOST = markURI(root, "LRHS Mustang 4.svg");
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---------------- build a piece's page ---------------- */
function buildPage(piece, player) {
  const used = new Set();
  const A = helpers(root, used);
  const body = piece.html(A, player);
  const html = pageHTML({ fontCSS: FONTS.css, ghostURI: GHOST, css: piece.css || "", body });
  const script = `${RUNTIME}
    const scene = (${piece.scene.toString()});
    const init = ${piece.init ? `(${piece.init.toString()})` : "null"};
    window.__boot = async (L) => {
      window.__T = L;
      await document.fonts.ready;
      for (const im of document.images) { try { await im.decode(); } catch (e) {} }
      grain();
      window.__S = init ? init(R) || {} : {};
      return { warn: window.__S.warn || [] };
    };
    window.__seek = async (t) => {
      field(t); scene(t, window.__T, R, window.__S);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    };
    /* everything that should sit inside title-safe, and the type sizes */
    window.__audit = () => [...document.querySelectorAll(".safe")].map((el) => {
      const r = (el.matches(".m") ? el.querySelector(".i") : el).getBoundingClientRect();   // the type, not its mask's padding
      return { id: el.id || el.className, l: r.left, t: r.top, r: r.right, b: r.bottom, size: +el.dataset.size || 0 };
    });`;
  return { html: html.replace("</body>", () => `<script>${script}</script></body>`), used: [...used] };
}

async function openPiece(browser, piece, { scale = 1, player, seconds } = {}) {
  const { html, used } = buildPage(piece, player);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `stadium-${piece.id}-`));
  const file = path.join(tmp, "piece.html");
  fs.writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(pathToFileURL(file).href);
  const frames = Math.round((seconds || piece.seconds) * FPS);
  const { warn } = await page.evaluate((L) => window.__boot(L), piece.once && seconds === piece.once ? piece.seconds : frames / FPS);
  if (errors.length) throw new Error(`${piece.id}: ${errors.join("; ")}`);
  return { page, tmp, used, warn, frames, close: async () => { await page.close(); fs.rmSync(tmp, { recursive: true, force: true }); } };
}

/* title-safe and type-size check at the hero frame */
async function audit(page, piece) {
  await page.evaluate((t) => window.__seek(t), piece.hero);
  const boxes = await page.evaluate(() => window.__audit());
  const x0 = SAFE.x - 0.5, y0 = SAFE.y - 0.5, x1 = SAFE.x + SAFE.w + 0.5, y1 = SAFE.y + SAFE.h + 0.5;
  const problems = [];
  for (const b of boxes) {
    if (b.l < x0 || b.t < y0 || b.r > x1 || b.b > y1) problems.push(`${b.id} outside title-safe (${b.l.toFixed(0)},${b.t.toFixed(0)})-(${b.r.toFixed(0)},${b.b.toFixed(0)})`);
    if (b.size && b.size < MIN_TYPE) problems.push(`${b.id} type ${b.size}px < ${MIN_TYPE}px`);
  }
  return problems;
}

/* ---------------- previews ---------------- */
async function preview(browser, list) {
  const dir = path.join(DIR, "preview");
  fs.mkdirSync(dir, { recursive: true });
  const custom = process.env.PREVIEW !== "1" ? process.env.PREVIEW.split(",").map(Number) : null;
  const sheet = [];
  for (const { piece, player, tag } of list) {
    const P = await openPiece(browser, piece, { player });
    const problems = [...(await audit(P.page, piece)), ...P.warn];
    const shots = [];
    for (const t of custom || piece.keys) {
      await P.page.evaluate((t) => window.__seek(t), t);
      const f = path.join(dir, `${tag}-${t.toFixed(2)}s.jpg`);
      await P.page.screenshot({ path: f, type: "jpeg", quality: 90 });
      shots.push({ t, f });
    }
    console.log(`${tag}  ${piece.title}  ·  ${P.used.join(", ")}${problems.length ? "\n   ! " + problems.join("\n   ! ") : "  ·  title-safe ok, type ≥ " + MIN_TYPE + "px"}`);
    sheet.push({ piece, tag, shots, problems });
    await P.close();
  }
  if (!custom) await contactSheet(browser, sheet, path.join(dir, "contact-sheet.jpg"));
  console.log(`wrote ${dir}`);
}

async function contactSheet(browser, rows, out) {
  const tile = (f) => `data:image/jpeg;base64,${fs.readFileSync(f).toString("base64")}`;
  const labels = ["building in", "hold (hero)", "going out"];
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS.css}
    body{margin:0;background:#0C0C0C;color:#F1F2F0;font-family:HK;padding:48px 48px 24px;width:2400px;box-sizing:border-box}
    h1{font:400 64px/1 IB;margin:0 0 6px;text-transform:uppercase} p.s{margin:0 0 40px;font-size:22px;color:#7E958A}
    .r{display:grid;grid-template-columns:300px repeat(3,1fr);gap:14px;margin-bottom:22px;align-items:center}
    .n{font:400 40px/1 IB} .t{font-weight:700;font-size:22px;margin:8px 0 6px} .f{font-size:16px;color:#7E958A;line-height:1.35}
    .x{position:relative} .x img{display:block;width:100%;border-radius:6px}
    .x span{position:absolute;left:10px;bottom:8px;font-size:15px;background:rgba(12,12,12,.7);padding:3px 8px;border-radius:4px}
    .x i{position:absolute;left:5%;top:5%;width:90%;height:90%;outline:1px dashed rgba(241,242,240,.35)}
    .bad{color:#ff8a8a;font-size:15px;margin-top:6px}</style></head><body>
    <h1>The Ranch · stadium motion</h1><p class="s">Preview stills, 1920×1080 · dashed box = title-safe (centre 90%) · concept work · not affiliated with the school district</p>
    ${rows.map((r) => `<div class="r"><div><div class="n">${r.piece.id}</div><div class="t">${r.piece.title} · ${r.piece.seconds}s</div><div class="f">${r.piece.family}</div>${r.problems.map((p) => `<div class="bad">${p}</div>`).join("")}</div>
      ${r.shots.map((s, i) => `<div class="x"><img src="${tile(s.f)}"><i></i><span>${s.t.toFixed(2)}s · ${labels[i] || ""}</span></div>`).join("")}</div>`).join("")}
    </body></html>`;
  const page = await browser.newPage({ viewport: { width: 2400, height: 1000 } });
  await page.setContent(html); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, type: "jpeg", quality: 88, fullPage: true });
  await page.close();
}

/* ---------------- full render ---------------- */
const BT709 = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"];
const toYUV = (pix) => `scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=${pix}`;

async function renderVideo(browser, piece, { player, tag, res, once }) {
  const scale = res === "8k" ? 4 : 2, w = W * scale, h = H * scale;
  const seconds = once ? piece.once : piece.seconds;
  const P = await openPiece(browser, piece, { scale, player, seconds });
  const N = P.frames, name = `${tag}${once ? "-once" : ""}-${res}`;
  fs.mkdirSync(OUT, { recursive: true });
  const marker = path.join(OUT, `.${name}.done`);
  const mp4 = res === "8k"
    ? ["-c:v", "libx265", "-preset", "medium", "-b:v", "120M", "-maxrate", "150M", "-bufsize", "240M", "-tag:v", "hvc1",
       "-x265-params", "log-level=error:colorprim=bt709:transfer=bt709:colormatrix=bt709", "-pix_fmt", "yuv420p"]
    : ["-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-level", "5.2", "-b:v", "60M", "-maxrate", "75M", "-bufsize", "120M", "-pix_fmt", "yuv420p"];
  const ff = spawn(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${w}x${h}`, "-framerate", FPS_ARG, "-i", "-",
    "-filter_complex", `[0:v]split=2[a][b];[a]${toYUV("yuv422p10le")}[pr];[b]${toYUV("yuv420p")}[mp]`,
    "-map", "[pr]", "-c:v", "prores_ks", "-profile:v", "3", "-vendor", "apl0", "-pix_fmt", "yuv422p10le", ...BT709, "-an",
    path.join(OUT, `${name}.mov`),
    "-map", "[mp]", ...mp4, ...BT709, "-movflags", "+faststart", "-an", path.join(OUT, `${name}.mp4`),
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res2, rej) => ff.on("close", (c) => (c === 0 ? res2() : rej(new Error(`ffmpeg exited ${c}`)))));

  /* Playwright's own screenshot, not raw CDP: CDP's captureScreenshot comes back at
     CSS size in headless Chrome, ignoring the device scale (1080p instead of 4K/8K) */
  const grab = async (t) => {
    await P.page.evaluate((t) => window.__seek(t), t);
    const { data, info } = await sharp(await P.page.screenshot({ type: "png" })).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    if (info.width !== w || info.height !== h) throw new Error(`frame came back ${info.width}x${info.height}, expected ${w}x${h}`);
    return data;
  };
  const isStill = (t) => (piece.still || []).some(([a, b]) => t >= a && t <= b);
  const acc = new Uint32Array(w * h * 3), frame = Buffer.alloc(w * h * 3);
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const t = i / FPS, n = SUB > 1 && !isStill(t) ? SUB : 1;
    let buf;
    if (n === 1) buf = await grab(t);
    else {
      acc.fill(0);
      for (let k = 0; k < n; k++) {           // 180° shutter, centred on the frame time
        const s = await grab(t + ((k + 0.5) / n - 0.5) * (0.5 / FPS));
        for (let j = 0; j < s.length; j++) acc[j] += s[j];
      }
      for (let j = 0; j < frame.length; j++) frame[j] = Math.round(acc[j] / n);
      buf = frame;
    }
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 60 === 59) process.stdout.write(` ${((i + 1) / FPS).toFixed(0)}s`);
  }
  ff.stdin.end(); await done;
  fs.writeFileSync(marker, new Date().toISOString());
  console.log(`\n  ${name}: ${N} frames in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
  await P.close();
}

/* A looping GIF for the site: drawn at 1920x1080 (with motion blur), scaled down,
   one palette per piece. 25 fps because GIF delays are whole hundredths of a
   second, so the loop keeps its exact length. The grain is left off: on 256
   colours it only turns into dither noise and doubles the file. */
async function renderGif(browser, piece, { player, tag }, width) {
  const GFPS = 25, h = Math.round((width * 9) / 16 / 2) * 2;
  const P = await openPiece(browser, piece, { scale: 1, player });
  await P.page.evaluate(() => { window.__T = window.__T; document.querySelector(".grain").style.display = "none"; });
  const N = Math.round(piece.seconds * GFPS), L = N / GFPS;
  await P.page.evaluate((L) => (window.__T = L), L);
  fs.mkdirSync(OUT, { recursive: true });
  const out = path.join(OUT, `${tag}-${width}.gif`);
  const ff = spawn(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${W}x${H}`, "-framerate", String(GFPS), "-i", "-",
    "-filter_complex", `[0:v]scale=${width}:${h}:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=full:reserve_transparent=0[p];[b][p]paletteuse=dither=sierra2_4a`,
    "-loop", "0", out], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error(`ffmpeg exited ${c}`)))));
  const grab = async (t) => {
    await P.page.evaluate((t) => window.__seek(t), t);
    return sharp(await P.page.screenshot({ type: "png" })).removeAlpha().raw().toBuffer();
  };
  const isStill = (t) => (piece.still || []).some(([a, b]) => t >= a && t <= b);
  const acc = new Uint32Array(W * H * 3), frame = Buffer.alloc(W * H * 3);
  for (let i = 0; i < N; i++) {
    const t = i / GFPS, n = SUB > 1 && !isStill(t) ? SUB : 1;
    let buf;
    if (n === 1) buf = await grab(t);
    else {
      acc.fill(0);
      for (let k = 0; k < n; k++) { const s = await grab(t + ((k + 0.5) / n - 0.5) * (0.5 / GFPS)); for (let j = 0; j < s.length; j++) acc[j] += s[j]; }
      for (let j = 0; j < frame.length; j++) frame[j] = Math.round(acc[j] / n);
      buf = frame;
    }
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end(); await done;
  console.log(`  ${path.basename(out)}  ${N} frames  ${(fs.statSync(out).size / 1048576).toFixed(1)} MB`);
  await P.close();
}

async function poster(browser, piece, { player, tag }) {
  const P = await openPiece(browser, piece, { player });
  await P.page.evaluate((t) => window.__seek(t), piece.hero);
  fs.mkdirSync(OUT, { recursive: true });
  await P.page.screenshot({ path: path.join(OUT, `${tag}-poster.png`), type: "png" });
  await P.close();
}

/* ---------------- targets ---------------- */
function targets(args) {
  /* a photo can be a plain file path (relative to the list, or absolute like C:\\...\\photo.jpg) */
  const lineup = JSON.parse(fs.readFileSync(LINEUP, "utf8")).players.map((pl) =>
    pl.photo && !/^(data|file|https?):/i.test(pl.photo) ? { ...pl, photo: pathToFileURL(path.resolve(path.dirname(LINEUP), pl.photo)).href } : pl);
  const L = PIECES.find((p) => p.template);
  const one = (p) => p.template
    ? [{ piece: p, player: lineup[0], tag: `${p.id}-${p.slug}` }]
    : [{ piece: p, tag: `${p.id}-${p.slug}` }];
  const out = [];
  for (const a of args.length ? args : ["all"]) {
    if (a === "all") PIECES.forEach((p) => out.push(...one(p)));
    else if (a === "lineup") lineup.forEach((pl) => out.push({ piece: L, player: pl, tag: `${L.id}-lineup-${slugify(pl.number)}-${slugify(pl.name)}` }));
    else {
      const p = PIECES.find((x) => x.id === a || x.slug === a);
      if (!p) { console.error(`unknown piece "${a}" (${PIECES.map((x) => x.id).join(", ")}, lineup or all)`); process.exit(1); }
      out.push(...one(p));
    }
  }
  return out;
}

const list = targets(process.argv.slice(2));
/* Software rendering, and sRGB whatever the monitor's profile. On Windows, Chrome's GPU
   path ran out of tile memory at 8K (device scale 4) and dropped layers for a frame or
   two while the Turnover card folded: the word and the emblem blinked out. */
const browser = await chromium.launch({ executablePath: CHROME, headless: true,
  args: ["--disable-gpu", "--disable-gpu-compositing", "--disable-gpu-rasterization", "--force-color-profile=srgb"] });
if (process.env.PREVIEW) await preview(browser, list);
else if (process.env.REF) {   // REF=1: every frame at 1080p, no blur, as 240x135 grey (for checking a render against)
  for (const job of list) for (const once of job.piece.once ? [false, true] : [false]) {
    const P = await openPiece(browser, job.piece, { scale: 1, player: job.player, seconds: once ? job.piece.once : undefined });
    fs.mkdirSync(path.join(OUT, "ref"), { recursive: true });
    const bufs = [];
    for (let i = 0; i < P.frames; i++) {
      await P.page.evaluate((t) => window.__seek(t), i / FPS);
      bufs.push(await sharp(await P.page.screenshot({ type: "png" })).resize(240, 135).greyscale().raw().toBuffer());
    }
    fs.writeFileSync(path.join(OUT, "ref", `${job.tag}${once ? "-once" : ""}.gray`), Buffer.concat(bufs));
    console.log(job.tag, once ? "once" : "", P.frames);
    await P.close();
  }
}
else if (process.env.PROBE) {   // PROBE=1.5,1.6 [PROBE_SCALE=4]: real-size frames at those times, saved small, for checking renders
  for (const job of list) {
    const P = await openPiece(browser, job.piece, { scale: +(process.env.PROBE_SCALE || 4), player: job.player });
    fs.mkdirSync(path.join(OUT, "probe"), { recursive: true });
    for (const t of process.env.PROBE.split(",").map(Number)) {
      await P.page.evaluate((t) => window.__seek(t), t);
      await sharp(await P.page.screenshot({ type: "png" })).resize(960).jpeg({ quality: 85 }).toFile(path.join(OUT, "probe", `${job.tag}-${t.toFixed(3)}s.jpg`));
    }
    await P.close();
  }
}
else if (process.env.GIF) { for (const job of list) await renderGif(browser, job.piece, job, +process.env.GIF); }
else {
  /* every file still to make (finished ones are skipped, so a stopped run picks up where it left off) */
  const jobs = [];
  for (const job of list) for (const res of RES) for (const once of job.piece.once && ONCE ? [false, true] : [false]) {
    const name = `${job.tag}${once ? "-once" : ""}-${res}`;
    if (!fs.existsSync(path.join(OUT, `.${name}.done`))) jobs.push({ ...job, res, once, name });
  }
  /* disk check: ProRes 422 HQ of these frames measured ~0.46 bytes a pixel (the grain keeps it busy) */
  const px = { "4k": 3840 * 2160, "8k": 7680 * 4320 }, mbps = { "4k": 60, "8k": 120 };
  const need = jobs.reduce((n, j) => {
    const f = Math.round((j.once ? j.piece.once : j.piece.seconds) * FPS);
    return n + f * px[j.res] * 0.46 + (f / FPS) * mbps[j.res] * 125000;
  }, 0);
  fs.mkdirSync(OUT, { recursive: true });
  const st = fs.statfsSync(OUT), free = st.bavail * st.bsize, GB = (b) => (b / 1e9).toFixed(1) + " GB";
  console.log(`${jobs.length} files to render into ${OUT}\n  needs about ${GB(need)}, ${GB(free)} free`);
  if (need * 1.05 > free && process.env.FORCE !== "1") {
    console.error(`\nNot enough space. Free up ${GB(need * 1.05 - free)}, render to another drive (OUT_DIR, or drag a folder onto render-8k.cmd)` +
      (ONCE ? ", or set ONCE=0 to skip the -once files" : "") + ". FORCE=1 renders anyway.");
    process.exit(1);
  }
  for (const job of list) if (jobs.some((j) => j.tag === job.tag)) await poster(browser, job.piece, job);
  for (const j of jobs) await renderVideo(browser, j.piece, j);
  console.log(`wrote ${OUT}`);
}
await browser.close();
