"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

/**
 * The 8:46 AM watch section — a retro CRT television that plays the film.
 *
 * At rest the set sits in the page as a facade (poster + scanlines), so no
 * YouTube script loads until the visitor chooses to watch. Pressing play
 * dims the whole page and lifts the set into a centred "theater" layer.
 *
 * Both the dim and the live set are portaled to <body>: this component
 * renders inside a Reveal wrapper whose transform would otherwise trap
 * position:fixed inside its own box (which cut a hard-edged rectangle).
 * The original set stays in the flow — hidden but occupying space — so the
 * page never jumps when the lights go down.
 */
export function FilmPlayer({
  videoId,
  poster,
  title,
  caption,
}: {
  videoId: string;
  poster: string;
  title: string;
  caption?: string;
}) {
  const [playing, setPlaying] = useState(false);

  const television = (live: boolean) => (
    <div
      className="relative mx-auto w-full max-w-[980px]"
      style={{
        background: "linear-gradient(#2a2622, #171412)",
        borderRadius: "22px",
        padding: "3.2% 3.2% 8%",
        boxShadow: live
          ? "0 40px 120px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.09)"
          : "0 24px 70px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.09)",
      }}
    >
      {/* Screen bezel */}
      <div
        className="media-elevated relative overflow-hidden bg-black"
        style={{
          aspectRatio: "16 / 9",
          borderRadius: "12px",
          boxShadow:
            "inset 0 0 0 3px rgba(0,0,0,.9), inset 0 0 40px rgba(0,0,0,.85), 0 0 0 2px rgba(255,255,255,.06)",
        }}
      >
        {live ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:opacity-85 group-hover:scale-[1.02]"
              draggable={false}
            />
            {/* scanlines + vignette */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,.28) 0 1px, transparent 1px 3px)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.75) 100%)",
              }}
            />
            {/* play button */}
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-ink/40 text-[26px] text-white backdrop-blur-[2px] transition-all duration-500 group-hover:scale-110 group-hover:bg-ink/60 sm:h-24 sm:w-24 sm:text-[30px]">
                ▶
              </span>
              <span className="text-[11px] tracking-[0.22em] uppercase text-white/75">
                Play the film · 7 min
              </span>
            </span>
          </button>
        )}
      </div>

      {/* TV chin: brand + dials */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-[5%] pb-[2.4%] pt-[1.4%]">
        <span className="font-display text-[11px] tracking-[0.2em] uppercase text-white/35 sm:text-[12px]">
          A BMH Production
        </span>
        <span className="flex items-center gap-3" aria-hidden>
          <span className="block h-3 w-3 rounded-full bg-white/15 sm:h-4 sm:w-4" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,.8)" }} />
          <span className="block h-3 w-3 rounded-full bg-white/15 sm:h-4 sm:w-4" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,.8)" }} />
          <span
            className="block h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5"
            style={{
              background: live ? "#ff4b3e" : "rgba(255,255,255,.14)",
              boxShadow: live ? "0 0 10px rgba(255,75,62,.9)" : "none",
            }}
          />
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* In-flow set — hidden while the theater layer is up, but still
          occupying its space so the page never jumps. */}
      <div style={playing ? { visibility: "hidden" } : undefined} aria-hidden={playing}>
        {television(false)}
        <div className="relative mt-6 h-[16px]">
          {caption && (
            <p className="absolute inset-x-0 text-center text-[11px] tracking-[0.16em] uppercase text-ink/55">
              {caption}
            </p>
          )}
        </div>
      </div>

      {playing &&
        createPortal(
          <div className="fixed inset-0 z-[9994] flex items-center justify-center px-5 sm:px-8">
            {/* lights-down vignette — no hard edges anywhere */}
            <div
              aria-hidden
              onClick={() => setPlaying(false)}
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(130% 100% at 50% 50%, rgba(8,8,10,0.74) 0%, rgba(8,8,10,0.91) 55%, rgba(8,8,10,0.97) 100%)",
                animation: "lights-down .7s ease both",
              }}
            />
            <div
              className="relative w-full max-w-[980px]"
              style={{ animation: "theater-in .5s cubic-bezier(.2,.7,.1,1) both" }}
              onClick={(e) => e.stopPropagation()}
            >
              {television(true)}
              <p className="mt-6 text-center text-[11px] tracking-[0.16em] uppercase text-white/40">
                Click outside to bring the lights up
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
