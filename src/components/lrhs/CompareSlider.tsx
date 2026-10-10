"use client";

import Image from "next/image";
import { useState, type CSSProperties, type PointerEvent } from "react";

type Side = { src: string; alt: string; label: string };

/**
 * Before / after, on one frame. Drag anywhere on the picture (or use the arrow
 * keys once it has focus) to move the divider. The "before" layer is clipped
 * over the "after" one, so both pictures must share a frame — the corner
 * study works because the square and rounded emblems share one viewBox.
 *
 * Touch keeps vertical scrolling (touch-action: pan-y); only a sideways drag
 * moves the divider. Keyboard and screen readers get a real range input.
 */
export function CompareSlider({
  before,
  after,
  aspect = "4 / 3",
  fit = "cover",
  ground,
  zoom,
  initial = 50,
  sizes = "(min-width: 1024px) 900px, 100vw",
  dark = false,
  inset = "0",
}: {
  before: Side;
  after: Side;
  /** CSS aspect-ratio of the frame */
  aspect?: string;
  fit?: "cover" | "contain";
  /** Opaque ground behind transparent artwork (both layers need one) */
  ground?: string;
  /** Optional close-up: both layers scale together from the same origin */
  zoom?: { scale: number; origin: string; on: string; off: string };
  initial?: number;
  sizes?: string;
  /** Pills and handle tuned for a dark surrounding stage */
  dark?: boolean;
  /** Breathing room around contained artwork, as a CSS inset (e.g. "6%") */
  inset?: string;
}) {
  const [pos, setPos] = useState(initial);
  const [zoomed, setZoomed] = useState(!!zoom);
  const [dragging, setDragging] = useState(false);

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    setPos(Math.min(100, Math.max(0, x)));
  };

  const layer: CSSProperties = {
    transform: zoom && zoomed ? `scale(${zoom.scale})` : "scale(1)",
    transformOrigin: zoom?.origin ?? "50% 50%",
    background: ground,
  };
  const imgClass = fit === "cover" ? "object-cover" : "object-contain";
  const pill =
    "pointer-events-none absolute top-3 rounded-full px-3 py-1 text-[12px] font-medium tracking-tight sm:top-4";

  return (
    <figure>
      <div
        className={`media-elevated relative w-full cursor-ew-resize touch-pan-y overflow-hidden select-none has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-4 has-[input:focus-visible]:outline-[rgba(96,132,255,0.8)] ${
          dragging ? "" : "[&_.cmp-move]:transition-[clip-path,left] [&_.cmp-move]:duration-300"
        }`}
        style={{ aspectRatio: aspect, background: ground }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          fromPointer(e);
        }}
        onPointerMove={(e) => {
          if (dragging) fromPointer(e);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {/* after — the full frame */}
        <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(.2,.7,.1,1)]" style={layer}>
          <div className="absolute" style={{ inset }}>
            <Image src={after.src} alt={after.alt} fill sizes={sizes} className={imgClass} draggable={false} />
          </div>
        </div>

        {/* before — clipped to the left of the divider */}
        <div className="cmp-move absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(.2,.7,.1,1)]" style={layer}>
            <div className="absolute" style={{ inset }}>
              <Image src={before.src} alt={before.alt} fill sizes={sizes} className={imgClass} draggable={false} />
            </div>
          </div>
        </div>

        {/* divider + handle */}
        <div aria-hidden className="cmp-move pointer-events-none absolute inset-y-0 w-0" style={{ left: `${pos}%` }}>
          <span className="absolute inset-y-0 -left-px w-[2px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_0_18px_rgba(0,0,0,0.25)]" />
          <span className="absolute top-1/2 left-0 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[3px] rounded-full bg-white text-[#033922] shadow-[0_6px_20px_rgba(0,0,0,0.3)]">
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden>
              <path d="M6 1 1 6l5 5M14 1l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <span className={`${pill} left-3 sm:left-4 ${dark ? "bg-black/55 text-white" : "bg-white/90 text-[#0B0B0B]"}`}>
          {before.label}
        </span>
        <span className={`${pill} right-3 sm:right-4 bg-[#033922] text-white`}>{after.label}</span>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Compare ${before.label.toLowerCase()} and ${after.label.toLowerCase()}`}
          aria-valuetext={`${Math.round(pos)}% ${before.label.toLowerCase()}`}
          className="sr-only"
        />
      </div>

      {zoom && (
        <button
          type="button"
          onClick={() => setZoomed((z) => !z)}
          aria-pressed={zoomed}
          className="glass magnetic mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium tracking-tight text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            {!zoomed && <path d="M7 4.5v5M4.5 7h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
            {zoomed && <path d="M4.5 7h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
          </svg>
          {zoomed ? zoom.off : zoom.on}
        </button>
      )}
    </figure>
  );
}
