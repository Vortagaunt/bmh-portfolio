"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ZoomItem = { src: string; alt: string };

type ZoomImageProps = ImageProps & {
  /** The set this image belongs to (for ‹ › navigation). Defaults to just itself. */
  zoomItems?: ZoomItem[];
  /** This image's index within zoomItems. */
  zoomIndex?: number;
};

/**
 * Drop-in replacement for next/image that opens a fullscreen lightbox on
 * click. Groups navigate with the on-screen arrows or ←/→; Esc, ✕, or a
 * click outside closes. Portaled to <body> (transformed ancestors can't trap
 * it) and deliberately blur-free (solid dim) — GPU lessons learned.
 */
export function ZoomImage({ zoomItems, zoomIndex = 0, ...imgProps }: ZoomImageProps) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(zoomIndex);

  const items: ZoomItem[] =
    zoomItems && zoomItems.length
      ? zoomItems
      : [{ src: String(imgProps.src), alt: String(imgProps.alt ?? "") }];
  const many = items.length > 1;

  const close = useCallback(() => setOpen(false), []);
  const nav = useCallback(
    (dir: 1 | -1) =>
      setIdx((p) => (p + dir + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" && many) nav(1);
      else if (e.key === "ArrowLeft" && many) nav(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, many, close, nav]);

  const cur = items[Math.min(idx, items.length - 1)];

  return (
    <>
      <Image
        {...imgProps}
        alt={imgProps.alt ?? ""}
        className={`${imgProps.className ?? ""} cursor-zoom-in`}
        onClick={() => {
          setIdx(zoomIndex);
          setOpen(true);
        }}
      />

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9996] flex flex-col items-center justify-center p-5 sm:p-10"
            style={{ background: "rgba(14,14,17,0.92)" }}
            onClick={close}
            role="dialog"
            aria-modal="true"
          >
            {/* close */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[24px] font-light leading-none text-black shadow-lg transition hover:scale-105 sm:right-6 sm:top-6"
            >
              ✕
            </button>

            {/* arrows */}
            {many && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={(e) => { e.stopPropagation(); nav(-1); }}
                  className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-[26px] text-white/85 transition hover:bg-white/10 sm:left-6"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={(e) => { e.stopPropagation(); nav(1); }}
                  className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-[26px] text-white/85 transition hover:bg-white/10 sm:right-6"
                >
                  ›
                </button>
              </>
            )}

            {/* image */}
            <div
              className="flex max-h-full max-w-full flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={cur.src}
                src={cur.src}
                alt={cur.alt}
                className="rounded-sm object-contain"
                style={{
                  maxWidth: "min(1400px, 92vw)",
                  maxHeight: "80vh",
                  boxShadow: "0 24px 80px rgba(0,0,0,.55)",
                  animation: "lightbox-in .28s cubic-bezier(.2,.7,.1,1) both",
                }}
                draggable={false}
              />
              <div className="mt-4 flex items-baseline gap-4 text-center">
                <p className="max-w-[70ch] text-[13px] tracking-tight text-white/70">{cur.alt}</p>
                {many && (
                  <span className="text-[12px] tabular-nums tracking-[0.14em] text-white/45">
                    {idx + 1} / {items.length}
                  </span>
                )}
              </div>
            </div>

            <style>{`@keyframes lightbox-in { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }`}</style>
          </div>,
          document.body,
        )}
    </>
  );
}
