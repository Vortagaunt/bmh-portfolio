"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ZoomImage, type ZoomItem } from "../ZoomImage";
import EXAMPLES from "@/data/lrhs-studio-examples.json";

/** Card height on the row, in px. Every piece keeps its own ratio inside it. */
const ROW_H = { base: 300, sm: 420 };
/** Auto-scroll speed, px per second. Slow enough to read the captions. */
const SPEED = 28;

const src = (f: string) => `/images/lrhs-studio-examples/${f}`;

const zoomItems: ZoomItem[] = EXAMPLES.map((e) => ({
  src: src(e.file),
  alt: e.alt,
  title: e.title,
  medium: e.format,
  project: "Made in Mustang Studio",
}));

/**
 * Real things made with Mustang Studio, on a slow, seamless loop.
 * The set is drawn twice so the row can wrap; the second copy is inert, so
 * screen readers and the keyboard only meet each piece once. It pauses on
 * hover, focus or touch, can be dragged or stepped with the arrows, and with
 * reduced motion it's a plain scroll-snap row that never moves on its own.
 * Clicking a piece opens it in the lightbox (portaled to <body>, no blur).
 */
export function StudioExamples() {
  const rowRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLUListElement>(null);
  const [reduced, setReduced] = useState(false);
  const paused = useRef(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  /** Width of one copy of the set, including the gap after it. */
  const loopWidth = useCallback(() => {
    const set = setRef.current;
    if (!set) return 0;
    const gap = parseFloat(getComputedStyle(set.parentElement!).columnGap) || 0;
    return set.offsetWidth + gap;
  }, []);

  /** Keep scrollLeft inside the first copy so the loop never runs out. */
  const wrap = useCallback(() => {
    const row = rowRef.current;
    const w = loopWidth();
    if (!row || !w) return;
    if (row.scrollLeft >= w) row.scrollLeft -= w;
    else if (row.scrollLeft < 0) row.scrollLeft += w;
  }, [loopWidth]);

  useEffect(() => {
    if (reduced) return;
    const row = rowRef.current;
    if (!row) return;
    let raf = 0;
    let last = performance.now();
    let carry = 0; // sub-pixel progress, since scrollLeft rounds
    const tick = (t: number) => {
      const dt = Math.min(64, t - last);
      last = t;
      const visible = row.getBoundingClientRect();
      const onScreen = visible.bottom > 0 && visible.top < window.innerHeight;
      if (!paused.current && !drag.current && onScreen && !document.hidden) {
        carry += (SPEED * dt) / 1000;
        const step = Math.floor(carry);
        if (step) {
          carry -= step;
          row.scrollLeft += step;
          wrap();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, wrap]);

  const step = (dir: 1 | -1) => {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector("li");
    const by = card ? card.getBoundingClientRect().width + 24 : 360;
    if (!reduced) {
      // Jump back a copy first when stepping left from the start.
      if (dir < 0 && row.scrollLeft < by) row.scrollLeft += loopWidth();
    }
    row.scrollBy({ left: dir * by, behavior: reduced ? "auto" : "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return; // touch scrolls natively
    const row = rowRef.current;
    if (!row) return;
    drag.current = { x: e.clientX, left: row.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const row = rowRef.current;
    if (!d || !row) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    if (d.moved) {
      row.scrollLeft = d.left - dx;
      if (!reduced) wrap();
    }
  };
  const endDrag = () => {
    // Let the click that ends a drag be swallowed (onClickCapture), then clear.
    setTimeout(() => (drag.current = null), 0);
  };

  const cards = (copy: number) =>
    EXAMPLES.map((e, i) => (
      <li key={`${copy}-${e.file}`} className="flex shrink-0 flex-col">
        <div
          className="flex items-center justify-center rounded-[24px] bg-white p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85)] sm:p-4"
          style={{ height: "var(--row-h)" }}
        >
          <ZoomImage
            src={src(e.file)}
            alt={e.alt}
            width={e.width}
            height={e.height}
            sizes="(min-width: 640px) 700px, 520px"
            draggable={false}
            zoomItems={zoomItems}
            zoomIndex={i}
            className="h-full w-auto max-w-none rounded-[12px] object-contain select-none"
          />
        </div>
        <p className="mt-4 text-[15px] leading-tight font-medium text-white">{e.title}</p>
        <p className="mt-1 text-[13px] leading-tight text-white/55">{e.format}</p>
      </li>
    ));

  return (
    <div
      className="relative"
      style={{ ["--row-h" as string]: `${ROW_H.base}px` }}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      onTouchStart={() => (paused.current = true)}
      onTouchEnd={() => setTimeout(() => (paused.current = false), 2500)}
    >
      <style>{`@media (min-width: 640px) { .studio-examples { --row-h: ${ROW_H.sm}px; } }`}</style>
      <div
        ref={rowRef}
        role="region"
        aria-label="Things made in Mustang Studio"
        tabIndex={0}
        className={`studio-examples no-scrollbar -mx-5 cursor-grab overflow-x-auto px-5 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:cursor-grabbing sm:-mx-10 sm:px-10 lg:-mx-14 lg:px-14 ${
          reduced ? "snap-x snap-mandatory" : ""
        }`}
        style={{ scrollbarWidth: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => {
          if (drag.current?.moved) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
      >
        <div className="flex w-max gap-6">
          <ul ref={setRef} className={`flex gap-6 ${reduced ? "[&>li]:snap-start" : ""}`}>
            {cards(0)}
          </ul>
          {!reduced && (
            <ul className="flex gap-6" aria-hidden inert>
              {cards(1)}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => step(dir)}
            aria-label={dir < 0 ? "Previous" : "Next"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[20px] text-white transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
          >
            {dir < 0 ? "‹" : "›"}
          </button>
        ))}
      </div>
    </div>
  );
}
