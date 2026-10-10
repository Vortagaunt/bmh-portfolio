/**
 * The bentos, moving — an Apple-keynote-style build of each one-page bento.
 *
 * It opens on black. The tiles rise in one after another, sweeping across the
 * page, and the details play as they land: the big numbers count up, the colour
 * strips rise one at a time, the student ID fans open (the back card slides out
 * from behind the front), the chips pop in. On the Mustang Studio bento the
 * Motion tile plays the game-day post's real "rise", frame by frame from the
 * app itself, each cell freezing on the moment the still shows. Then it holds
 * on the finished bento, which is pixel-for-pixel the page the still is made
 * from (same script, same HTML), so the last frame always matches the still.
 *
 * Nothing is redrawn here: each bento script hands over its own page
 * (BENTO_HTML), and this one only adds the motion on top.
 *
 * Emits (assets/motion/ unless OUT_DIR is set):
 *   lrhs        lrhs-bento-motion-4k.mp4              3840x2160  master
 *               lrhs-bento-motion-1080.mp4            1920x1080  the deck (slide after "One more thing")
 *               public/videos/lrhs-bento-motion.mp4   1920x1280  the case study (3:2, like its still)
 *   vertical    lrhs-bento-vertical-motion-4k.mp4     2160x3840  master
 *               lrhs-bento-vertical-reel.mp4          1080x1920  Instagram Reel / Story
 *   studio      mustang-studio-bento-motion-4k.mp4    2160x3840  master
 *               mustang-studio-bento-reel.mp4         1080x1920  Instagram Reel / Story
 * 10 s at 30 fps. Reels carry a silent audio track (some uploaders insist);
 * add a sound from Instagram's own library when posting.
 *
 * Run: node scripts/render-bento-motion.mjs [lrhs|vertical|studio|all]
 *   optional env: LRHS_ROOT, OUT_DIR, CHROME, FFMPEG, HANKEN_FONT, INDUSTRY_FONT,
 *   MUSTANG_STUDIO (the app's HTML with Industry Black built in, for the
 *   game-day frames; without it the Motion tile steps through its four stills),
 *   SECONDS (10), FPS (30)
 */
import { chromium } from "playwright-core";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.LRHS_ROOT || path.join(here, "..");
const OUT = process.env.OUT_DIR || path.join(root, "assets", "motion");
const SITE = process.env.SITE_DIR || path.join(root, "public", "videos");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const SECONDS = +(process.env.SECONDS || 10), FPS = +(process.env.FPS || 30);
const FRAMES = Math.round(SECONDS * FPS);
const STUDIO_APP = process.env.MUSTANG_STUDIO ||
  path.join(os.homedir(), "Downloads", "Mustang Studio installer", "Web", "Mustang Studio (Industry Black).html");

/* bt709 throughout, so Mustang Green is the same green in every player */
const BT709 = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"];
const yuv = (w, h, extra = "") => `scale=${w}:${h}:flags=lanczos+accurate_rnd+full_chroma_int:out_color_matrix=bt709:out_range=tv${extra},format=yuv420p`;
const x264 = (crf, level, more = []) => ["-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-profile:v", "high",
  "-level", level, "-pix_fmt", "yuv420p", ...BT709, "-movflags", "+faststart", ...more];

const BENTOS = {
  lrhs: {
    script: "render-lrhs-bento.mjs", W: 3840, H: 2160, sweep: 0.72,
    outputs: (o) => ({
      filter: `[0:v]split=3[a][b][c];[a]${yuv(3840, 2160)}[m];[b]${yuv(1920, 1080)}[d];[c]${yuv(1920, 1080, ",pad=1920:1280:0:100:black")}[s]`,
      args: [
        "-map", "[m]", ...x264(16, "5.1"), "-an", path.join(o, "lrhs-bento-motion-4k.mp4"),
        "-map", "[d]", ...x264(17, "4.1", ["-maxrate", "16M", "-bufsize", "32M"]), "-an", path.join(o, "lrhs-bento-motion-1080.mp4"),
        "-map", "[s]", ...x264(23, "4.1", ["-maxrate", "6M", "-bufsize", "12M"]), "-an", path.join(SITE, "lrhs-bento-motion.mp4"),
      ],
    }),
  },
  vertical: {
    script: "render-lrhs-bento-vertical.mjs", W: 2160, H: 3840, sweep: 0.22,
    outputs: (o) => reelOutputs(o, "lrhs-bento-vertical"),
  },
  studio: {
    script: "render-studio-bento.mjs", W: 2160, H: 3840, sweep: 0.22,
    outputs: (o) => reelOutputs(o, "mustang-studio-bento"),
  },
};
function reelOutputs(o, base) {
  return {
    filter: `[0:v]split=2[a][b];[a]${yuv(2160, 3840)}[m];[b]${yuv(1080, 1920)}[r]`,
    args: [
      "-map", "[m]", ...x264(16, "5.1"), "-an", path.join(o, `${base}-motion-4k.mp4`),
      "-map", "[r]", "-map", "1:a", ...x264(17, "4.1", ["-maxrate", "12M", "-bufsize", "24M"]),
      "-c:a", "aac", "-b:a", "128k", "-shortest", path.join(o, `${base}-reel.mp4`),
    ],
  };
}

/* ---------------- the motion, run inside the page ---------------- */
function motion({ sweep, gameday, T0, SPREAD }) {
  const W = innerWidth, H = innerHeight;
  const OUT = "cubic-bezier(.2,.8,.2,1)", SOFT = "cubic-bezier(.33,0,.15,1)", POP = "cubic-bezier(.34,1.5,.64,1)";
  const anims = [], fx = [], claimed = new Set();
  const add = (el, kf, start, dur, easing = OUT) => {
    if (!el) return;
    const a = el.animate(kf, { delay: start * 1000, duration: dur * 1000, easing, fill: "both" });
    a.pause(); anims.push(a); claimed.add(el);
  };
  const isClaimed = (el, tile) => { for (let e = el; e && e !== tile; e = e.parentElement) if (claimed.has(e)) return true; return false; };
  const txt = (el) => el.textContent.replace(/\s+/g, " ").trim();
  const rise = (el, s, d = 0.9, y = 26) => add(el, [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: "none" }], s, d);
  const pop = (el, s, d = 0.6) => add(el, [{ opacity: 0, transform: "scale(.55)" }, { opacity: 1, transform: "none" }], s, d, POP);
  const ease3 = (p) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);

  /* 1. the cascade: tiles rise in a sweep from the top-left */
  const tiles = [...document.querySelectorAll(".t")];
  const key = (t) => { const r = t.getBoundingClientRect(); return (r.left / W) * sweep + (r.top / H) * (1 - sweep); };
  const kmax = Math.max(...tiles.map(key)) || 1;
  const at = new Map(tiles.map((t) => [t, T0 + (key(t) / kmax) * SPREAD]));
  for (const t of tiles) add(t, [{ opacity: 0, transform: "translateY(80px) scale(.94)" }, { opacity: 1, transform: "none" }], at.get(t), 1.2);
  claimed.clear();

  for (const t of tiles) {
    const s = at.get(t), name = txt(t);

    /* 2. the set pieces */
    if (/Student ID/.test(name)) {                       // the card fans open: back slides out from behind the front
      const [back, front] = t.querySelectorAll(".art img");
      const stack = "translate(-50%, -50%) translate(0px, 6px) rotate(0deg)", low = "translate(-50%, -50%) translate(0px, 130px) rotate(0deg)";
      const FAN = "cubic-bezier(.5,0,.15,1)";
      add(front, [{ opacity: 0, transform: low, easing: OUT }, { opacity: 1, transform: stack, offset: 0.42, easing: FAN },
                  { opacity: 1, transform: front.style.transform }], s + 0.3, 1.9, "linear");
      // the back card waits, unseen, exactly behind the front, then slides out from under it
      add(back, [{ opacity: 0, transform: stack }, { opacity: 0, transform: stack, offset: 0.42 },
                 { opacity: 1, transform: stack, offset: 0.425, easing: FAN }, { opacity: 1, transform: back.style.transform }], s + 0.3, 1.9, "linear");
    }
    if (/^Pages/.test(name)) {                            // carousel pages fan out from one stack
      t.querySelectorAll(".art img").forEach((el) => {
        const left = parseFloat(el.style.left) || 0, rot = el.style.transform.match(/rotate\(([^)]+)\)/)[1];
        add(el, [{ opacity: 0, transform: `translateX(${-left}px) translateY(-50%) rotate(0deg) translateY(60px)`, easing: OUT },
                 { opacity: 1, transform: `translateX(${-left}px) translateY(-50%) rotate(0deg) translateY(0px)`, offset: 0.35, easing: "cubic-bezier(.5,0,.15,1)" },
                 { opacity: 1, transform: `translateX(0px) translateY(-50%) rotate(${rot}) translateY(0px)` }], s + 0.3, 1.7, "linear");
      });
    }
    if (/Ready on/.test(name)) {                          // the template strip glides in from the right
      const strip = [...t.querySelectorAll("div")].find((d) => d.style.transform === "translateY(-50%)");
      add(strip, [{ transform: "translateX(900px) translateY(-50%)" }, { transform: "translateX(0px) translateY(-50%)" }], s + 0.15, 2.2, SOFT);
      strip.querySelectorAll("img").forEach((im, i) => add(im, [{ opacity: 0 }, { opacity: 1 }], s + 0.2 + i * 0.07, 0.6));
    }
    if (/MP4 and GIF/.test(name) && gameday) {           // the game-day post's real rise, each cell freezing on its moment
      const cells = [...t.querySelectorAll("img.card")];
      const stops = [0.6, 0.9, 1.3, 3.0], begin = s + 0.55;
      const finals = cells.map((c) => c.src);
      const show = (img, src) => { if (img.getAttribute("src") === src) return null; img.src = src; return img.decode().catch(() => {}); };
      fx.push((T) => Promise.all(cells.map((img, i) => {
        const u = T - begin;
        if (u >= stops[i]) return show(img, finals[i]);
        const f = Math.max(0, Math.min(Math.round(u * gameday.fps), gameday.frames.length - 1));
        return show(img, gameday.frames[f]);
      })));
      cells.forEach((c) => claimed.add(c));
    }
    if (/^Batch from a spreadsheet/.test(name)) {         // rows paste in, then the sheet of IDs slides in
      const table = [...t.querySelectorAll(".art > div")][0];
      [...table.children].forEach((row, i) => rise(row, s + 0.45 + i * 0.07, 0.6, 14));
      claimed.add(table);
      const arrow = [...t.querySelectorAll(".art > div")][1]; pop(arrow, s + 1.0);
      const sheet = t.querySelector(".art > img");
      add(sheet, [{ opacity: 0, transform: `translateX(160px) ${sheet.style.transform}` }, { opacity: 1, transform: sheet.style.transform }], s + 1.05, 1.2);
    }
    if (/^Seasons/.test(name)) {
      t.querySelectorAll("img.card").forEach((im, i) => rise(im, s + 0.3 + i * 0.1, 0.9, 40));
      t.querySelectorAll("i").forEach((dot, i) => pop(dot, s + 0.7 + i * 0.06, 0.5));
    }
    if (/^Start screen/.test(name)) [...t.lastElementChild.children].forEach((r, i) => rise(r, s + 0.4 + i * 0.08, 0.7, 18));
    if (/^Where it runs/.test(name)) [...t.querySelector('[style*="grid-template-columns"]').children].forEach((c, i) => rise(c, s + 0.35 + i * 0.1, 0.9, 40));
    if (/^Brand check/.test(name)) { const pill = [...t.querySelectorAll("div")].find((d) => /Nothing to fix/.test(d.textContent) && d.children.length <= 2); pop(pill, s + 1.55, 0.6); }
    t.querySelectorAll(".sw").forEach((sw, i) =>        // colour strips rise one at a time
      add(sw, [{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)" }], s + 0.15 + i * 0.09, 0.95, OUT));
    t.querySelectorAll(".ghost").forEach((g) => add(g, [{ transform: "translateX(220px)" }, { transform: "translateX(0px)" }], s, 3.4, SOFT));

    /* 3. app windows slide in (from the right when they sit right of centre) */
    const tr = t.getBoundingClientRect();
    [...t.querySelectorAll("div")].filter((d) => /box-shadow/.test(d.getAttribute("style") || "") && d.style.overflow === "hidden" && d.querySelector("img") && !isClaimed(d, t))
      .forEach((d) => {
        const r = d.getBoundingClientRect(), right = r.left + r.width / 2 > tr.left + tr.width * 0.55;
        add(d, [{ opacity: 0, transform: right ? "translateX(180px)" : "translateY(140px)" }, { opacity: 1, transform: "none" }], s + 0.3, 1.4);
      });

    /* 4. anything else that sits at an angle drops in */
    t.querySelectorAll('img[style*="rotate("]').forEach((im, i) => {
      if (isClaimed(im, t)) return;
      const fin = im.style.transform;
      add(im, [{ opacity: 0, transform: `translateY(90px) ${fin}` }, { opacity: 1, transform: fin }], s + 0.25 + i * 0.12, 1.2);
    });

    /* 5. numbers count up (the box keeps its width, so nothing shifts) */
    t.querySelectorAll(".ind .g").forEach((g) => {
      const final = g.textContent; if (!/^\d+$/.test(final)) return;
      const box = g.closest(".ind"); box.style.width = getComputedStyle(box).width;   // layout width: the tile is mid-scale here
      const n = +final, b = s + 0.35;
      fx.push((T) => { const v = T >= b + 1.3 ? final : String(Math.round(n * ease3((T - b) / 1.3))); if (g.textContent !== v) g.textContent = v; });
    });

    /* 6. chips and pills pop, icon rows pop */
    [...t.querySelectorAll(".chip, [style*='border-radius:999px']")].filter((c) => !c.classList.contains("new") && !isClaimed(c, t))
      .forEach((c, i) => pop(c, s + 0.45 + i * 0.06));
    [...t.querySelectorAll("div")].filter((d) => [...d.children].filter((c) => c.tagName === "svg").length >= 4)
      .forEach((row) => [...row.children].forEach((ic, i) => pop(ic, s + 0.5 + i * 0.07, 0.55)));

    /* 7. the words rise in, in reading order */
    [...t.querySelectorAll(".lab, .h, .hs, .sub, .ind")].filter((e) => !isClaimed(e, t) && !e.parentElement.closest(".lab, .h, .hs, .sub, .ind"))
      .forEach((e, i) => rise(e, s + 0.22 + i * 0.07, 0.95, 28));

    /* 8. and the art settles */
    [...t.querySelectorAll("img")].filter((im) => !isClaimed(im, t) && !im.classList.contains("ghost") && !/rotate\(/.test(im.style.transform))
      .forEach((im, i) => add(im, [{ opacity: 0, transform: "scale(1.07)" }, { opacity: 1, transform: "none" }], s + 0.12 + i * 0.08, 1.5, OUT));
  }

  const end = Math.max(...anims.map((a) => (a.effect.getTiming().delay + a.effect.getTiming().duration) / 1000));
  /* Each animation lets go of its element the moment it lands (its last keyframe
     is the element's own style), so Chrome drops the compositing layer and the
     settled page is drawn exactly as the still is: same image filtering, same
     text antialiasing. Seek forward only. */
  const endOf = (a) => { const k = a.effect.getTiming(); return k.delay + k.duration; };
  window.__seek = async (T) => {
    for (const a of anims) {
      if (T * 1000 >= endOf(a)) { if (a.playState !== "idle") a.cancel(); }
      else a.currentTime = T * 1000;
    }
    await Promise.all(fx.map((f) => f(T)));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  };
  return { animations: anims.length, effects: fx.length, settledBy: +end.toFixed(2) };
}

/* the game-day post's own frames, drawn by Mustang Studio's renderer */
async function gamedayFrames(browser, dir) {
  if (!fs.existsSync(STUDIO_APP)) { console.warn(`  (no ${STUDIO_APP}; the Motion tile will step through its stills)`); return null; }
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => { localStorage.setItem("ms-who-seen", "1"); localStorage.setItem("ms-role", "coach"); });
  await p.goto(pathToFileURL(STUDIO_APP).href); await p.waitForTimeout(2500);
  const shots = await p.evaluate(async ({ fps, end }) => {
    const t = TEMPLATES.find((x) => x.id === "gameday"); const d = t.build(); d.motion = { preset: "rise", length: 4 };
    const P = MS16._.plan(d); await new Promise((r) => setTimeout(r, 800));
    const out = []; for (let i = 0; i <= Math.round(end * fps); i++) out.push(MS16._.renderSync(d, 1, { t: i / fps, plan: P }).toDataURL("image/png"));
    return out;
  }, { fps: FPS, end: 3.0 });
  await p.close();
  fs.mkdirSync(dir, { recursive: true });
  const frames = [];
  for (let i = 0; i < shots.length; i++) {
    const f = path.join(dir, `gd-${String(i).padStart(3, "0")}.jpg`);
    await sharp(Buffer.from(shots[i].split(",")[1], "base64")).resize(540).jpeg({ quality: 92 }).toFile(f);
    frames.push(pathToFileURL(f).href);
  }
  return { fps: FPS, frames };
}

async function render(name, browser) {
  const B = BENTOS[name];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `bento-motion-${name}-`));
  const htmlFile = path.join(tmp, "bento.html");
  const r = spawnSync(process.execPath, [path.join(here, B.script)], { env: { ...process.env, BENTO_HTML: htmlFile }, stdio: "inherit" });
  if (r.status !== 0 || !fs.existsSync(htmlFile)) throw new Error(`${B.script} did not hand over its page`);

  const gameday = name === "studio" ? await gamedayFrames(browser, path.join(tmp, "gameday")) : null;
  const page = await browser.newPage({ viewport: { width: B.W, height: B.H }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlFile).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const info = await page.evaluate(`(${motion.toString()})(${JSON.stringify({ sweep: B.sweep, gameday, T0: 0.35, SPREAD: 2.5 })})`);
  console.log(`${name}: ${info.animations} animations, ${info.effects} scripted effects, settled by ${info.settledBy}s`);

  fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(SITE, { recursive: true });
  if (process.env.PREVIEW) {                 // PREVIEW=0.5,1,2,4 — stills at those moments, no video
    const dir = path.join(OUT, "preview"); fs.mkdirSync(dir, { recursive: true });
    for (const T of process.env.PREVIEW.split(",").map(Number)) {
      await page.evaluate((T) => window.__seek(T), T);
      await page.screenshot({ path: path.join(dir, `${name}-${T.toFixed(2)}s.jpg`), type: "jpeg", quality: 85 });
    }
    await page.close(); fs.rmSync(tmp, { recursive: true, force: true });
    return;
  }
  const o = B.outputs(OUT);
  const ff = spawn(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
    "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
    "-filter_complex", o.filter, ...o.args], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));

  const cdp = await page.context().newCDPSession(page);
  const t0 = Date.now();
  let last = null;
  for (let i = 0; i < FRAMES; i++) {
    await page.evaluate((T) => window.__seek(T), i / FPS);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true });
    last = Buffer.from(data, "base64");
    if (!ff.stdin.write(last)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 30 === 29) process.stdout.write(` ${(i + 1) / FPS}s`);
  }
  ff.stdin.end(); await done;
  console.log(`\n  ${FRAMES} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

  /* proof the build lands on the still: the last frame vs a fresh, motionless render of the same page */
  await page.goto(pathToFileURL(htmlFile).href); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(600);
  const still = await page.screenshot({ type: "png" });
  await page.close();
  const [a, b] = await Promise.all([last, still].map((x) => sharp(x).removeAlpha().raw().toBuffer()));
  let off = 0; for (let i = 0; i < a.length; i += 3) if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 24) off++;
  console.log(`  last frame vs the still: ${off} of ${a.length / 3} pixels differ (${((off / (a.length / 3)) * 100).toFixed(3)}%)`);
  if (process.env.KEEP_LAST) {               // KEEP_LAST=some/prefix keeps the page and the last frame, for checking
    fs.copyFileSync(htmlFile, `${process.env.KEEP_LAST}-${name}.html`);
    fs.writeFileSync(`${process.env.KEEP_LAST}-${name}-last.png`, last);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

const which = process.argv[2] || "all";
const names = which === "all" ? Object.keys(BENTOS) : [which];
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
for (const n of names) {
  if (!BENTOS[n]) { console.error(`unknown bento "${n}" (lrhs, vertical, studio or all)`); process.exit(1); }
  await render(n, browser);
}
await browser.close();
console.log(`wrote ${OUT}`);
