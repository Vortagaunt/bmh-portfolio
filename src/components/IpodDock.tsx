"use client";

import { useEffect, useState } from "react";
import { IpodPlayer } from "./IpodPlayer";

/**
 * Footer dock: a small iPod preview that zooms into a fullscreen, fully
 * interactive player when clicked. The live player only mounts while the
 * modal is open, so its audio + state are scoped to the expanded view.
 */
export function IpodDock() {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false); // drives the enter/exit transition

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

      {/* Fullscreen modal */}
      {open && (
        <div
          className="fixed inset-0 z-[9995] flex items-center justify-center p-6"
          style={{
            background: "rgba(10,10,12,0.72)",
            backdropFilter: "blur(10px)",
            opacity: show ? 1 : 0,
            transition: "opacity .32s ease",
          }}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close player"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-[22px] text-white/80 transition hover:bg-white/10"
          >
            ×
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
        </div>
      )}
    </>
  );
}
