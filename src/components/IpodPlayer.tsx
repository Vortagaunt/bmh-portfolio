"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ----------------------------------------------------------------------------
 * iPod geometry — measured from the device artwork (public/images/ipod.webp),
 * expressed as % of the image box. Tweak these to re-register overlays if the
 * art is ever swapped.
 * --------------------------------------------------------------------------*/
const SCREEN = { left: 9.64, top: 5.72, width: 71.93, height: 37.22 };
const WHEEL = { cx: 50, cy: 68.5, r: 27, center: 10.5 }; // r / center are % of WIDTH

/* ----------------------------------------------------------------------------
 * Playlist. Swap `src` for real audio files dropped in /public/audio — every
 * track currently points at the existing background loop as a placeholder so
 * skipping/playing is fully demonstrable today.
 * --------------------------------------------------------------------------*/
type Track = { title: string; artist: string; art: string; src: string };
const TRACKS: Track[] = [
  { title: "Cascade Creation", artist: "Bronx Hanratty", art: "/images/dali-bear.jpg", src: "/audio/background.mp3" },
  { title: "北西 — Northwest", artist: "Bronx Hanratty", art: "/images/north-west.png", src: "/audio/background.mp3" },
  { title: "Yeezus, Reimagined", artist: "Bronx Hanratty", art: "/images/yeezus.png", src: "/audio/background.mp3" },
  { title: "How Much Does the Earth Cost?", artist: "Bronx Hanratty", art: "/images/earth-cost.png", src: "/audio/background.mp3" },
  { title: "Red Tape", artist: "Bronx Hanratty", art: "/images/red-portrait.png", src: "/audio/background.mp3" },
];

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function angleDiff(a: number, b: number) {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

export function IpodPlayer() {
  const [view, setView] = useState<"list" | "now">("list");
  const [sel, setSel] = useState(0); // highlighted row in list
  const [cur, setCur] = useState(0); // currently loaded track
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* keep refs to live state for the imperative pointer handlers */
  const stateRef = useRef({ view, sel, cur, playing, dur });
  stateRef.current = { view, sel, cur, playing, dur };

  /* ----- audio wiring ----- */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = TRACKS[cur].src;
    a.load();
    if (playing) a.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  const playTrack = useCallback((i: number) => {
    setCur(i);
    setView("now");
    setPlaying(true);
    const a = audioRef.current;
    if (a) {
      a.src = TRACKS[i].src;
      a.currentTime = 0;
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
    setCur((c) => {
      const next = (c + dir + TRACKS.length) % TRACKS.length;
      return next;
    });
    setPlaying(true);
    const a = audioRef.current;
    if (a) {
      // play after src effect runs
      requestAnimationFrame(() => a.play().then(() => setPlaying(true)).catch(() => {}));
    }
  }, []);

  /* keep highlighted row in view */
  useEffect(() => {
    rowRefs.current[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  /* ----- click-wheel pointer logic: spin to scroll, tap edges, center select ----- */
  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;

    let dragging = false;
    let lastAngle = 0;
    let accum = 0; // accumulated rotation for stepping
    let moved = 0; // total absolute motion (deg)
    let downX = 0, downY = 0;

    const centerOf = () => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, radius: r.width / 2 };
    };

    const scrollStep = (dir: 1 | -1) => {
      const s = stateRef.current;
      if (s.view === "list") {
        setSel((p) => Math.min(TRACKS.length - 1, Math.max(0, p + dir)));
      } else {
        const a = audioRef.current;
        if (a && a.duration) {
          a.currentTime = Math.min(a.duration, Math.max(0, a.currentTime + dir * Math.max(2, a.duration * 0.03)));
          setTime(a.currentTime);
        }
      }
    };

    const onDown = (e: PointerEvent) => {
      const c = centerOf();
      downX = e.clientX; downY = e.clientY;
      lastAngle = (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI;
      dragging = true; accum = 0; moved = 0;
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const c = centerOf();
      const ang = (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI;
      const d = angleDiff(ang, lastAngle);
      lastAngle = ang;
      accum += d; moved += Math.abs(d);
      const STEP = 26;
      while (accum >= STEP) { scrollStep(1); accum -= STEP; }
      while (accum <= -STEP) { scrollStep(-1); accum += STEP; }
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const c = centerOf();
      const dx = e.clientX - c.x, dy = e.clientY - c.y;
      const dist = Math.hypot(dx, dy);
      const movedPx = Math.hypot(e.clientX - downX, e.clientY - downY);
      // A drag (big rotation / travel) already scrolled — no tap action.
      if (moved > 14 || movedPx > 10) return;

      const s = stateRef.current;
      const centerR = c.radius * (WHEEL.center / WHEEL.r); // center btn radius
      if (dist < centerR) {
        // CENTER — select
        if (s.view === "list") playTrack(s.sel);
        else togglePlay();
        return;
      }
      // RING tap — quadrant → action
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (ang >= -135 && ang < -45) {
        // top — MENU
        if (s.view === "now") setView("list");
      } else if (ang >= -45 && ang < 45) {
        skip(1); // right — next
      } else if (ang >= 45 && ang < 135) {
        togglePlay(); // bottom — play/pause
      } else {
        if (s.view === "now") skip(-1); // left — prev
        else setSel((p) => Math.max(0, p - 1));
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
  }, [playTrack, togglePlay, skip]);

  const track = TRACKS[cur];
  const pct = dur ? (time / dur) * 100 : 0;

  return (
    <div className="relative w-full select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/ipod.webp"
        alt="iPod music player"
        className="pointer-events-none block w-full"
        draggable={false}
      />

      {/* SCREEN overlay */}
      <div
        className="absolute overflow-hidden rounded-[6px] bg-white"
        style={{
          left: `${SCREEN.left}%`,
          top: `${SCREEN.top}%`,
          width: `${SCREEN.width}%`,
          height: `${SCREEN.height}%`,
          containerType: "inline-size",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-[3.5cqw] text-[5.6cqw] font-semibold text-black/80"
          style={{
            height: "15.5cqw",
            background: "linear-gradient(#f3f4f6,#cdd3dd)",
            borderBottom: "0.4cqw solid rgba(0,0,0,.18)",
          }}
        >
          <span className="inline-flex items-center gap-[1.5cqw]">
            {playing ? (
              <span style={{ fontSize: "4.6cqw" }}>▶</span>
            ) : null}
          </span>
          <span className="tracking-tight">
            {view === "list" ? "Music" : "Now Playing"}
          </span>
          {/* battery */}
          <span className="inline-flex items-center" aria-hidden>
            <span
              style={{
                width: "8cqw",
                height: "4.4cqw",
                border: "0.5cqw solid rgba(0,0,0,.55)",
                borderRadius: "0.8cqw",
                padding: "0.5cqw",
                display: "inline-block",
              }}
            >
              <span style={{ display: "block", width: "70%", height: "100%", background: "#3bd15f", borderRadius: "0.3cqw" }} />
            </span>
          </span>
        </div>

        {view === "list" ? (
          /* ---------- LIST VIEW ---------- */
          <div className="flex h-[calc(100%_-_15.5cqw)] min-h-0">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {TRACKS.map((tr, i) => {
                const on = i === sel;
                return (
                  <div
                    key={tr.title}
                    ref={(n) => { rowRefs.current[i] = n; }}
                    className="flex items-center justify-between gap-[2cqw] px-[3.5cqw] text-[5.4cqw] tracking-tight"
                    style={{
                      height: "11.5cqw",
                      color: on ? "#fff" : "#111",
                      background: on
                        ? "linear-gradient(#4aa3ff,#1f6fea)"
                        : "transparent",
                      borderBottom: "0.3cqw solid rgba(0,0,0,.06)",
                    }}
                  >
                    <span className="truncate">{tr.title}</span>
                    {on && <span style={{ fontSize: "5cqw", opacity: 0.9 }}>›</span>}
                  </div>
                );
              })}
            </div>
            {/* album art pane */}
            <div
              className="flex shrink-0 items-center justify-center"
              style={{
                width: "40%",
                background: "linear-gradient(135deg,#7b54d6,#5a34b0)",
                padding: "5cqw",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TRACKS[sel].art}
                alt=""
                className="block w-full"
                style={{ aspectRatio: "1/1", objectFit: "cover", borderRadius: "1cqw", boxShadow: "0 1cqw 3cqw rgba(0,0,0,.4)" }}
                draggable={false}
              />
            </div>
          </div>
        ) : (
          /* ---------- NOW PLAYING ---------- */
          <div className="flex h-[calc(100%_-_15.5cqw)] min-h-0 flex-col items-center px-[5cqw] py-[3.5cqw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={track.art}
              alt=""
              className="block"
              style={{ width: "34%", aspectRatio: "1/1", objectFit: "cover", borderRadius: "1.4cqw", boxShadow: "0 1cqw 3cqw rgba(0,0,0,.35)" }}
              draggable={false}
            />
            <div className="mt-[2.5cqw] w-full text-center">
              <div className="truncate text-[5.4cqw] font-semibold tracking-tight text-black">{track.title}</div>
              <div className="truncate text-[4.4cqw] text-black/55">{track.artist}</div>
            </div>
            <div className="mt-auto w-full">
              <div className="flex items-center gap-[2cqw]">
                <span className="text-[3.6cqw] tabular-nums text-black/55" style={{ minWidth: "8cqw" }}>{fmt(time)}</span>
                <div className="relative h-[1.6cqw] flex-1 rounded-full" style={{ background: "rgba(0,0,0,.14)" }}>
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: "#1f6fea" }} />
                </div>
                <span className="text-[3.6cqw] tabular-nums text-black/55" style={{ minWidth: "8cqw", textAlign: "right" }}>-{fmt(Math.max(0, dur - time))}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CLICK WHEEL hit-area (transparent, over the printed wheel) */}
      <div
        ref={wheelRef}
        aria-hidden
        className="absolute cursor-pointer rounded-full"
        style={{
          left: `${WHEEL.cx}%`,
          top: `${WHEEL.cy}%`,
          width: `${WHEEL.r * 2}%`,
          transform: "translate(-50%,-50%)",
          aspectRatio: "1 / 1",
          touchAction: "none",
        }}
      />

      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
        onEnded={() => skip(1)}
      />
    </div>
  );
}
