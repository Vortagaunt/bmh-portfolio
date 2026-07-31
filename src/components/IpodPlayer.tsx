"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import cascadeManifest from "@/data/cascade.json";
import { BrickGame, type BrickApi } from "./BrickGame";

/* iPod artwork geometry (% of the device image box), measured from the
 * blacked-out screen of public/images/ipod.webp. */
const SCREEN = { left: 7.91, top: 4.78, width: 84.18, height: 38.13 };
const WHEEL = { cx: 50, cy: 68.5, r: 27, center: 10.5 };

const DALI = "/images/dali-bear.jpg";

export type Track = { title: string; artist: string; album?: string; art: string; src: string };

/* Cascade Creations — built from the user's playlist via the iTunes preview
 * pipeline (scripts/build-cascade-itunes.mjs). */
const CASCADE_TRACKS: Track[] = (cascadeManifest as Track[]).map((t) => ({
  title: t.title,
  artist: t.artist,
  album: t.album,
  art: t.art || DALI,
  src: t.src,
}));

/* Cover Flow — the curated covers in /public/images/cover-flow, identified,
 * with `match` patterns that pull each album's real tracks (playable Apple
 * previews) out of the Cascade manifest. Albums without matches show a
 * "Not on this iPod" flip side. */
const COVERS = [
  { n: 1, title: "Hurry Up Tomorrow", artist: "The Weeknd", match: ["Hurry Up Tomorrow", "Timeless"] },
  { n: 2, title: "GNX", artist: "Kendrick Lamar", match: [] },
  { n: 3, title: "MM..FOOD", artist: "MF DOOM", match: [] },
  { n: 4, title: "IGOR", artist: "Tyler, The Creator", match: [] },
  { n: 5, title: "CHROMAKOPIA", artist: "Tyler, The Creator", match: ["CHROMAKOPIA"] },
  { n: 6, title: "808s & Heartbreak", artist: "Kanye West", match: ["808s"] },
  { n: 7, title: "Man on the Moon", artist: "Kid Cudi", match: ["Man On The Moon"] },
  { n: 8, title: "Thriller", artist: "Michael Jackson", match: ["Thriller"] },
  { n: 9, title: "SABLE, fABLE", artist: "Bon Iver", match: [] },
  { n: 10, title: "Blonde", artist: "Frank Ocean", match: ["Blonde"] },
  { n: 11, title: "Ten", artist: "Pearl Jam", match: [] },
  { n: 12, title: "Shake Your Money Maker", artist: "The Black Crowes", match: [] },
  { n: 13, title: "Because the Internet", artist: "Childish Gambino", match: [] },
].map((c) => ({
  ...c,
  cover: `/images/cover-flow/album${c.n}.webp`,
  tracks: c.match.length
    ? CASCADE_TRACKS.filter((t) => c.match.some((m) => (t.album || "").toLowerCase().includes(m.toLowerCase())))
    : [],
}));

const MENU = ["Cover Flow", "Cascade Creations", "Now Playing", "Brick"];

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, "0")}`;
}
/* The screen shows art at ~150px CSS; Apple's 600px source is 4x more pixels
 * than needed and its decode janks song changes. Request the 300px rendition. */
function smallArt(u: string) {
  return u.replace("600x600bb", "300x300bb");
}
function angleDiff(a: number, b: number) {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

type View = "menu" | "cascade" | "coverflow" | "now" | "brick";

export function IpodPlayer() {
  const [stack, setStack] = useState<View[]>(["menu"]);
  const top = stack[stack.length - 1];
  const [menuSel, setMenuSel] = useState(0);
  const [listSel, setListSel] = useState(0);
  const [cf, setCf] = useState(0);
  const [cfFlipped, setCfFlipped] = useState(false);
  const [cfSel, setCfSel] = useState(0);
  const [queue, setQueue] = useState<Track[]>(CASCADE_TRACKS);
  const [qi, setQi] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cfRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastTimeRef = useRef(0); // gate timeupdate re-renders to ~1Hz
  const brickApi = useRef<BrickApi | null>(null);

  const s = useRef({ top, menuSel, listSel, cf, cfFlipped, cfSel, queue, qi, playing });
  // Mirror render state into the ref AFTER render (never during — the wheel's
  // event handlers are the only readers, and they fire between renders).
  useEffect(() => {
    s.current = { top, menuSel, listSel, cf, cfFlipped, cfSel, queue, qi, playing };
  });

  const push = (v: View) => setStack((p) => [...p, v]);
  const pop = () => setStack((p) => (p.length > 1 ? p.slice(0, -1) : p));

  const playAt = useCallback((list: Track[], i: number) => {
    setQueue(list);
    setQi(i);
    setStack((p) => (p[p.length - 1] === "now" ? p : [...p, "now"]));
    const a = audioRef.current;
    if (a) {
      a.src = list[i].src;
      a.currentTime = 0;
      lastTimeRef.current = 0;
      setTime(0);
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, []);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else { a.pause(); setPlaying(false); }
  }, []);

  const skip = useCallback((dir: 1 | -1) => {
    const { queue: q, qi: i } = s.current;
    const n = (i + dir + q.length) % q.length;
    setQi(n);
    const a = audioRef.current;
    if (a) {
      a.src = q[n].src;
      a.currentTime = 0;
      lastTimeRef.current = 0;
      setTime(0);
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, []);

  useEffect(() => { rowRefs.current[listSel]?.scrollIntoView({ block: "nearest" }); }, [listSel, top]);
  useEffect(() => { cfRowRefs.current[cfSel]?.scrollIntoView({ block: "nearest" }); }, [cfSel, cfFlipped]);

  /* Warm the next/prev track art so skipping never decode-janks. */
  useEffect(() => {
    for (const d of [1, -1]) {
      const t = queue[(qi + d + queue.length) % queue.length];
      if (t) new window.Image().src = smallArt(t.art);
    }
  }, [qi, queue]);

  /* ----- click wheel ----- */
  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    let dragging = false, lastAngle = 0, accum = 0, moved = 0, downX = 0, downY = 0;
    const center = () => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, radius: r.width / 2 };
    };
    const step = (dir: 1 | -1) => {
      const c = s.current;
      if (c.top === "menu") setMenuSel((p) => Math.min(MENU.length - 1, Math.max(0, p + dir)));
      else if (c.top === "cascade") setListSel((p) => Math.min(CASCADE_TRACKS.length - 1, Math.max(0, p + dir)));
      else if (c.top === "coverflow") {
        if (c.cfFlipped) {
          const n = COVERS[c.cf].tracks.length;
          if (n) setCfSel((p) => Math.min(n - 1, Math.max(0, p + dir)));
        } else {
          setCf((p) => Math.min(COVERS.length - 1, Math.max(0, p + dir)));
        }
      } else if (c.top === "now") {
        const a = audioRef.current;
        if (a && a.duration) {
          a.currentTime = Math.min(a.duration, Math.max(0, a.currentTime + dir * Math.max(2, a.duration * 0.03)));
          setTime(a.currentTime);
        }
      }
    };
    const onDown = (e: PointerEvent) => {
      const c = center();
      downX = e.clientX; downY = e.clientY;
      lastAngle = (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI;
      dragging = true; accum = 0; moved = 0;
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const c = center();
      const ang = (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI;
      const d = angleDiff(ang, lastAngle);
      lastAngle = ang; accum += d; moved += Math.abs(d);
      // Brick: the paddle tracks the wheel smoothly (no stepping).
      if (s.current.top === "brick") { brickApi.current?.spin(d); return; }
      const STEP = 24;
      while (accum >= STEP) { step(1); accum -= STEP; }
      while (accum <= -STEP) { step(-1); accum += STEP; }
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const c = center();
      const dx = e.clientX - c.x, dy = e.clientY - c.y;
      const dist = Math.hypot(dx, dy);
      const travelled = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved > 13 || travelled > 10) return; // it was a spin
      const cur = s.current;
      const centerR = c.radius * (WHEEL.center / WHEEL.r);
      if (dist < centerR) {
        // CENTER select
        if (cur.top === "menu") {
          if (cur.menuSel === 0) push("coverflow");
          else if (cur.menuSel === 1) push("cascade");
          else if (cur.menuSel === 2) push("now");
          else if (cur.menuSel === 3) push("brick");
        } else if (cur.top === "cascade") playAt(CASCADE_TRACKS, cur.listSel);
        else if (cur.top === "coverflow") {
          const album = COVERS[cur.cf];
          if (!cur.cfFlipped) { setCfSel(0); setCfFlipped(true); }
          else if (album.tracks.length) playAt(album.tracks, cur.cfSel);
          else setCfFlipped(false);
        } else if (cur.top === "brick") brickApi.current?.press();
        else togglePlay();
        return;
      }
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (ang >= -135 && ang < -45) {
        // top — MENU
        if (cur.top === "coverflow" && cur.cfFlipped) setCfFlipped(false);
        else {
          if (cur.top === "coverflow") setCfFlipped(false);
          pop();
        }
      } else if (ang >= -45 && ang < 45) {                 // right — next
        if (cur.top === "now") skip(1);
        else if (cur.top === "brick") brickApi.current?.spin(28);
        else step(1);
      } else if (ang >= 45 && ang < 135) {                 // bottom — play/pause
        if (cur.top === "brick") brickApi.current?.press();
        else togglePlay();
      } else {                                             // left — prev
        if (cur.top === "now") skip(-1);
        else if (cur.top === "brick") brickApi.current?.spin(-28);
        else step(-1);
      }
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [playAt, togglePlay, skip]);

  const cur = queue[qi];
  const pct = dur ? (time / dur) * 100 : 0;
  const titleBar =
    top === "menu" ? "iPod"
    : top === "cascade" ? "Cascade Creations"
    : top === "coverflow" ? "Cover Flow"
    : top === "brick" ? "Brick"
    : "Now Playing";

  return (
    <div className="relative w-full select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/ipod.webp" alt="iPod music player" className="pointer-events-none block w-full" draggable={false} />

      <div
        className="absolute overflow-hidden rounded-[6px] bg-white"
        style={{
          left: `${SCREEN.left}%`, top: `${SCREEN.top}%`, width: `${SCREEN.width}%`, height: `${SCREEN.height}%`,
          containerType: "size", fontFamily: "var(--font-inter), system-ui, sans-serif",
        }}
      >
        {/* title bar */}
        <div
          className="flex items-center justify-between px-[3.5cqw] text-[5.4cqw] font-semibold text-black/80"
          style={{ height: "15.5cqw", background: "linear-gradient(#f3f4f6,#cdd3dd)", borderBottom: "0.4cqw solid rgba(0,0,0,.18)" }}
        >
          <span style={{ fontSize: "4.6cqw", width: "10cqw" }}>{playing ? "▶" : ""}</span>
          <span className="truncate tracking-tight">{titleBar}</span>
          <span className="inline-flex justify-end" style={{ width: "10cqw" }} aria-hidden>
            <span style={{ width: "8cqw", height: "4.4cqw", border: "0.5cqw solid rgba(0,0,0,.55)", borderRadius: "0.8cqw", padding: "0.5cqw", display: "inline-block" }}>
              <span style={{ display: "block", width: "70%", height: "100%", background: "#3bd15f", borderRadius: "0.3cqw" }} />
            </span>
          </span>
        </div>

        <div className="h-[calc(100%_-_15.5cqw)] min-h-0">
          {top === "menu" && (
            <div className="flex h-full">
              <div className="flex-1">
                {MENU.map((m, i) => {
                  const on = i === menuSel;
                  return (
                    <div key={m} className="flex items-center justify-between px-[3.5cqw] text-[5.2cqw] tracking-tight"
                      style={{ height: "12.5cqw", color: on ? "#fff" : "#111", background: on ? "linear-gradient(#4aa3ff,#1f6fea)" : "transparent" }}>
                      <span className="truncate">{m}</span>
                      <span style={{ fontSize: "5cqw", opacity: on ? 0.9 : 0.3 }}>›</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex shrink-0 items-center justify-center" style={{ width: "40%", background: "linear-gradient(135deg,#7b54d6,#5a34b0)", padding: "5cqw" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={menuSel === 0 ? COVERS[cf].cover : menuSel === 2 ? smallArt(cur.art) : DALI} alt="" className="block w-full"
                  style={{ aspectRatio: "1/1", objectFit: "cover", borderRadius: "1cqw", boxShadow: "0 1cqw 3cqw rgba(0,0,0,.4)" }} draggable={false} />
              </div>
            </div>
          )}

          {top === "cascade" && (
            <div className="flex h-full">
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {CASCADE_TRACKS.map((tr, i) => {
                  const on = i === listSel;
                  return (
                    <div key={`${tr.src}-${i}`} ref={(n) => { rowRefs.current[i] = n; }}
                      className="flex items-center justify-between px-[3.5cqw] text-[5cqw] tracking-tight"
                      style={{ height: "11cqw", color: on ? "#fff" : "#111", background: on ? "linear-gradient(#4aa3ff,#1f6fea)" : "transparent", borderBottom: "0.3cqw solid rgba(0,0,0,.06)" }}>
                      <span className="truncate">{tr.title}</span>
                      {on && <span style={{ fontSize: "4.6cqw", opacity: 0.9 }}>›</span>}
                    </div>
                  );
                })}
              </div>
              <div className="flex shrink-0 items-center justify-center" style={{ width: "40%", background: "linear-gradient(135deg,#7b54d6,#5a34b0)", padding: "5cqw" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={smallArt(CASCADE_TRACKS[listSel]?.art || DALI)} alt="" className="block w-full" style={{ aspectRatio: "1/1", objectFit: "cover", borderRadius: "1cqw", boxShadow: "0 1cqw 3cqw rgba(0,0,0,.4)" }} draggable={false} />
              </div>
            </div>
          )}

          {top === "coverflow" && (
            <div className="relative h-full w-full overflow-hidden" style={{ background: "linear-gradient(#0c0c0e,#1c1c22)" }}>
              <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "120cqw" }}>
                <div className="relative" style={{ transformStyle: "preserve-3d", width: "1px", height: "1px" }}>
                  {COVERS.map((c, i) => {
                    const o = i - cf;
                    const abs = Math.abs(o);
                    if (abs > 5) return null;
                    const sign = Math.sign(o);
                    const x = o === 0 ? 0 : sign * (27 + (abs - 1) * 11);
                    const ry = o === 0 ? 0 : o < 0 ? 58 : -58;
                    const sc = o === 0 ? 1 : 0.82;
                    const isCenter = o === 0;
                    return (
                      <div key={c.cover} className="absolute"
                        style={{
                          left: 0, top: 0, height: "56cqh", aspectRatio: "1 / 1",
                          transform: `translate(-50%,-50%) translateX(${x}cqw) rotateY(${ry}deg) scale(${sc})`,
                          transformStyle: "preserve-3d", zIndex: 100 - abs,
                          opacity: abs > 4 ? 0 : cfFlipped && !isCenter ? 0.3 : 1,
                          transition: "transform .42s cubic-bezier(.2,.7,.1,1), opacity .42s ease",
                        }}>
                        {/* flipper — front is the cover, back is the track list */}
                        <div
                          className="relative h-full w-full"
                          style={{
                            transformStyle: "preserve-3d",
                            transition: "transform .5s cubic-bezier(.2,.7,.1,1)",
                            transform: isCenter && cfFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.cover} alt="" className="absolute inset-0 block h-full w-full" style={{ objectFit: "cover", borderRadius: "1cqw", boxShadow: "0 2cqw 5cqw rgba(0,0,0,.6)", backfaceVisibility: "hidden" }} draggable={false} />
                          {/* back face */}
                          <div
                            className="absolute inset-0 flex flex-col overflow-hidden text-white"
                            style={{
                              transform: "rotateY(180deg)",
                              backfaceVisibility: "hidden",
                              borderRadius: "1cqw",
                              background: "linear-gradient(#191920,#101014)",
                              boxShadow: "0 2cqw 5cqw rgba(0,0,0,.6)",
                            }}
                          >
                            <div className="flex items-center gap-[2cqw] px-[2.5cqw] py-[1.8cqw]" style={{ borderBottom: "1px solid rgba(255,255,255,.14)" }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={c.cover} alt="" style={{ width: "7cqw", aspectRatio: "1/1", objectFit: "cover", borderRadius: "0.6cqw" }} draggable={false} />
                              <div className="min-w-0">
                                <div className="truncate text-[2.9cqw] font-semibold leading-tight">{c.title}</div>
                                <div className="truncate text-[2.3cqw] text-white/55 leading-tight">
                                  {c.tracks.length ? `${c.tracks.length} track${c.tracks.length > 1 ? "s" : ""} on this iPod` : c.artist}
                                </div>
                              </div>
                            </div>
                            {c.tracks.length ? (
                              <div className="min-h-0 flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                {c.tracks.map((tr, ti) => {
                                  const on = isCenter && ti === cfSel;
                                  return (
                                    <div key={tr.src} ref={(n) => { if (isCenter) cfRowRefs.current[ti] = n; }}
                                      className="flex items-center gap-[1.6cqw] px-[2.5cqw] text-[2.7cqw] tracking-tight"
                                      style={{ height: "5.4cqw", color: on ? "#fff" : "rgba(255,255,255,.82)", background: on ? "linear-gradient(#4aa3ff,#1f6fea)" : "transparent" }}>
                                      <span className="text-white/40 tabular-nums" style={{ width: "3.4cqw" }}>{ti + 1}</span>
                                      <span className="truncate">{tr.title}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="flex flex-1 items-center justify-center px-[3cqw] text-center text-[2.8cqw] text-white/45">
                                Not on this iPod — spin to browse, MENU to flip back.
                              </div>
                            )}
                          </div>
                        </div>
                        {/* reflection */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.cover} alt="" aria-hidden className="absolute left-0 block h-full w-full"
                          style={{ top: "100%", objectFit: "cover", transform: "scaleY(-1)", opacity: cfFlipped && isCenter ? 0.08 : 0.28,
                            transition: "opacity .5s ease",
                            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,.6), transparent 55%)",
                            maskImage: "linear-gradient(to bottom, rgba(0,0,0,.6), transparent 55%)" }} draggable={false} />
                      </div>
                    );
                  })}
                </div>
              </div>
              {!cfFlipped && (
                <div className="absolute inset-x-0 text-center text-white" style={{ bottom: "3.5cqh" }}>
                  <div className="truncate text-[5cqw] font-semibold">{COVERS[cf].title}</div>
                  <div className="truncate text-[3.8cqw] text-white/55">{COVERS[cf].artist}</div>
                </div>
              )}
            </div>
          )}

          {top === "brick" && (
            <div className="relative h-full w-full overflow-hidden">
              <BrickGame apiRef={brickApi} />
            </div>
          )}

          {top === "now" && (
            <div className="flex h-full flex-col items-center px-[5cqw] py-[3.5cqw]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={smallArt(cur.art)} alt="" className="block" style={{ width: "34%", aspectRatio: "1/1", objectFit: "cover", borderRadius: "1.4cqw", boxShadow: "0 1cqw 3cqw rgba(0,0,0,.35)" }} draggable={false} />
              <div className="mt-[2.5cqw] w-full text-center">
                <div className="truncate text-[5.2cqw] font-semibold tracking-tight text-black">{cur.title}</div>
                <div className="truncate text-[4.2cqw] text-black/55">{cur.artist}</div>
              </div>
              <div className="mt-auto w-full">
                <div className="flex items-center gap-[2cqw]">
                  <span className="text-[3.4cqw] tabular-nums text-black/55" style={{ minWidth: "8cqw" }}>{fmt(time)}</span>
                  <div className="relative h-[1.6cqw] flex-1 rounded-full" style={{ background: "rgba(0,0,0,.14)" }}>
                    <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: "#1f6fea" }} />
                  </div>
                  <span className="text-[3.4cqw] tabular-nums text-black/55" style={{ minWidth: "8cqw", textAlign: "right" }}>-{fmt(Math.max(0, dur - time))}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={wheelRef} aria-hidden className="absolute cursor-pointer rounded-full"
        style={{ left: `${WHEEL.cx}%`, top: `${WHEEL.cy}%`, width: `${WHEEL.r * 2}%`, transform: "translate(-50%,-50%)", aspectRatio: "1 / 1", touchAction: "none" }} />

      <audio ref={audioRef} preload="metadata"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          // timeupdate fires ~4x/sec; re-render at most ~1Hz (scrubber is 1s-granular)
          const t = e.currentTarget.currentTime;
          if (Math.abs(t - lastTimeRef.current) >= 0.9) {
            lastTimeRef.current = t;
            setTime(t);
          }
        }}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
        onEnded={() => skip(1)} />
    </div>
  );
}
