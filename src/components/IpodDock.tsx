"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IpodPlayer } from "./IpodPlayer";

/**
 * Footer dock: a small iPod preview that zooms into a fullscreen, fully
 * interactive player when clicked. The live player only mounts while the
 * modal is open, so its audio + state are scoped to the expanded view.
 */
export function IpodDock() {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false); // drives the enter/exit transition
  const [mounted, setMounted] = useState(false); // portal target only exists client-side

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const r = requestAnimationFrame(() => setShow(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(r);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setShow(false);
    window.setTimeout(() => setOpen(false), 320);
  };

  return (
    <>
      {/* Preview */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the iPod music player"
        className="group relative block w-full max-w-[260px] cursor-pointer outline-none"
      >
        <div className="relative transition-transform duration-500 ease-[cubic-bezier(.2,.7,.1,1)] group-hover:-translate-y-1 group-hover:scale-[1.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ipod.webp" alt="iPod music player" className="block w-full" draggable={false} />
          {/* static screen — invites the click */}
          <div
            className="absolute flex flex-col items-center justify-center overflow-hidden rounded-[5px]"
            style={{
              left: "7.91%", top: "4.78%", width: "84.18%", height: "38.13%",
              containerType: "size", background: "linear-gradient(135deg,#7b54d6,#5a34b0)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/dali-bear.jpg" alt="" className="block" draggable={false}
              style={{ width: "40%", aspectRatio: "1/1", objectFit: "cover", borderRadius: "1.5cqw", boxShadow: "0 1cqw 3cqw rgba(0,0,0,.4)" }} />
            <div className="mt-[3cqw] text-center text-white">
              <div className="text-[5cqw] font-semibold tracking-tight">Cascade Creations</div>
              <div className="mt-[1cqw] inline-flex items-center gap-[1.5cqw] text-[3.8cqw] text-white/75">
                <span>▶</span> Tap to open
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Fullscreen modal — portaled to <body> so a transformed ancestor
          (the footer's Reveal scale wrapper) can't trap position:fixed. */}
      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9995] flex items-center justify-center p-6"
          style={{
            // No backdrop-filter: blurring the whole page behind the modal is
            // a continuous GPU cost (brutal on large/ultrawide screens) and was
            // lagging the machine during playback. A solid dim reads the same.
            background: "rgba(14,14,17,0.82)",
            opacity: show ? 1 : 0,
            transition: "opacity .32s ease",
          }}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close player"
            className="absolute right-6 top-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[30px] font-light leading-none text-black shadow-lg transition hover:scale-105"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? "scale(1)" : "scale(0.8)",
              transition: "opacity .32s ease, transform .32s cubic-bezier(.2,.7,.1,1)",
            }}
          >
            ✕
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              height: "min(86vh, 760px)",
              opacity: show ? 1 : 0,
              transform: show ? "scale(1)" : "scale(0.92)",
              transition: "opacity .32s ease, transform .42s cubic-bezier(.2,.7,.1,1)",
            }}
          >
            <div style={{ height: "100%", aspectRatio: "1100 / 1862" }}>
              <IpodPlayer />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
