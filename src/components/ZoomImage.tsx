"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ZoomItem = {
  src: string;
  alt: string;
  /** Optional detail panel. Any field may be omitted — rows that have no
   *  value simply aren't rendered, so a piece with only a title still looks
   *  deliberate rather than half-filled. */
  title?: string;
  date?: string;
  medium?: string;
  project?: string;
  description?: string;
  /** Full-resolution file for the download button. The displayed src is
   *  capped at 2560px so phones can decode it; this is the original. When
   *  absent the displayed file already is the original, so src is used. */
  download?: string;
  /** Backing surface for transparent vector art, mirroring the tile the item
   *  came from. Logo marks are black or white with a transparent ground, so
   *  on the bare scrim half of them would be invisible. */
  panel?: "paper" | "ink";
};

type ZoomImageProps = ImageProps & {
  /** The set this image belongs to (for ‹ › navigation). Defaults to just itself. */
  zoomItems?: ZoomItem[];
  /** This image's index within zoomItems. */
  zoomIndex?: number;
};

const hasDetail = (i: ZoomItem) =>
  !!(i.title || i.date || i.medium || i.project || i.description);

/**
 * Drop-in replacement for next/image that opens a fullscreen lightbox on
 * click. Groups navigate with the on-screen arrows or ←/→; Esc, ✕, or a
 * click outside closes. Portaled to <body> (transformed ancestors can't trap
 * it) and deliberately blur-free (solid dim) — GPU lessons learned.
 *
 * When an item carries any detail fields it opens as a two-pane card: the
 * artwork on the left, a panel of title/meta/description on the right.
 * Without them it falls back to the plain centred image, so the case-study
 * and archive galleries are untouched.
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
    (dir: 1 | -1) => setIdx((p) => (p + dir + items.length) % items.length),
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
  const detailed = hasDetail(cur);

  /* Vector art has no useful intrinsic size — an SVG mark whose file says
     150px rendered at 150px, however much room the lightbox had, because
     max-width only ever shrinks. Vectors get an explicit box to fill instead,
     on a backing surface so transparent black and white marks stay legible. */
  const isVector = /\.svg(\?|#|$)/i.test(cur.src);
  const panel = cur.panel ?? (isVector ? "paper" : undefined);

  const rows = (
    [
      ["Date", cur.date],
      ["Medium", cur.medium],
      ["Project", cur.project],
    ] as const
  ).filter((r) => !!r[1]);

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
            className="fixed inset-0 z-[9996] flex flex-col items-center justify-center p-4 sm:p-8"
            style={{ background: "rgba(10,10,12,0.94)" }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={cur.title ?? cur.alt}
          >
            {/* close */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[22px] font-light leading-none text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
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
                  className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-[26px] text-white/85 transition hover:bg-white/10 sm:left-6"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={(e) => { e.stopPropagation(); nav(1); }}
                  className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-[26px] text-white/85 transition hover:bg-white/10 sm:right-6"
                >
                  ›
                </button>
              </>
            )}

            {detailed ? (
              /* ---- two-pane card: artwork + details ---- */
              <div
                className="flex max-h-[90vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[22px] md:flex-row"
                style={{
                  background: "#17171a",
                  boxShadow: "0 30px 100px rgba(0,0,0,.6)",
                  animation: "lightbox-in .28s cubic-bezier(.2,.7,.1,1) both",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex shrink-0 items-center justify-center bg-black/40 p-4 sm:p-7 md:w-[58%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={cur.src}
                    src={cur.src}
                    alt={cur.alt}
                    className="max-h-[42vh] w-auto max-w-full object-contain md:max-h-[76vh]"
                    draggable={false}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto p-6 sm:p-8">
                  <div>
                    <h2 className="font-display text-[24px] font-semibold tracking-tight text-white sm:text-[28px]">
                      {cur.title ?? cur.alt}
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-[13px] text-white/55">
                      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#A82424]" />
                      {cur.alt}
                    </p>
                  </div>

                  {rows.length > 0 && (
                    <dl className="flex flex-col gap-2.5">
                      {rows.map(([label, value]) => (
                        <div key={label} className="flex gap-4">
                          <dt className="w-[70px] shrink-0 pt-px font-mono text-[10px] tracking-[0.16em] uppercase text-white/40">
                            {label}
                          </dt>
                          <dd className="text-[13.5px] leading-[1.5] text-white/85">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {cur.description && (
                    <p className="text-[14px] leading-[1.65] text-white/70">{cur.description}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-4 pt-2">
                    <a
                      href={cur.download ?? cur.src}
                      download={`${cur.title ?? cur.alt}${(cur.download ?? cur.src).replace(/^.*(\.[a-z]+)$/i, "$1")}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 font-mono text-[11px] tracking-[0.16em] uppercase text-white transition hover:bg-white/10"
                    >
                      ↓ Download{cur.download ? " original" : ""}
                    </a>
                    {many && (
                      <span className="font-mono text-[11px] tabular-nums tracking-[0.14em] text-white/40">
                        {idx + 1} / {items.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ---- plain image ---- */
              <div
                className="flex max-h-full max-w-full flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                {panel ? (
                  <div
                    key={cur.src}
                    className="flex items-center justify-center rounded-2xl p-[clamp(28px,5vw,72px)]"
                    style={{
                      width: "min(1080px, 90vw)",
                      height: "min(74vh, 780px)",
                      background: panel === "ink" ? "#0a0a0a" : "#F4F4F2",
                      boxShadow: "0 24px 80px rgba(0,0,0,.55)",
                      animation: "lightbox-in .28s cubic-bezier(.2,.7,.1,1) both",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cur.src}
                      alt={cur.alt}
                      className="h-full w-full object-contain"
                      draggable={false}
                    />
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={cur.src}
                    src={cur.src}
                    alt={cur.alt}
                    className="rounded-2xl object-contain"
                    style={{
                      maxWidth: "min(1400px, 92vw)",
                      maxHeight: "80vh",
                      boxShadow: "0 24px 80px rgba(0,0,0,.55)",
                      animation: "lightbox-in .28s cubic-bezier(.2,.7,.1,1) both",
                    }}
                    draggable={false}
                  />
                )}
                <div className="mt-4 flex items-baseline gap-4 text-center">
                  <p className="max-w-[70ch] text-[13px] tracking-tight text-white/70">{cur.alt}</p>
                  {many && (
                    <span className="text-[12px] tabular-nums tracking-[0.14em] text-white/45">
                      {idx + 1} / {items.length}
                    </span>
                  )}
                </div>
              </div>
            )}

            <style>{`@keyframes lightbox-in { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }`}</style>
          </div>,
          document.body,
        )}
    </>
  );
}
