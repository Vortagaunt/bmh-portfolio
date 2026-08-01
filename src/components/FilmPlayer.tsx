"use client";

import { useState } from "react";

/**
 * The 8:46 AM watch section — a retro CRT television that plays the film.
 *
 * The set sits dark until clicked; pressing play swaps in the YouTube embed
 * and dims the rest of the page (a "lights down" theater moment). Kept
 * facade-first so no YouTube script loads until the visitor actually wants
 * to watch — the page stays fast.
 */
export function FilmPlayer({
  videoId,
  poster,
  title,
}: {
  videoId: string;
  poster: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <>
      {/* Lights-down overlay while the film runs */}
      <div
        aria-hidden
        onClick={() => setPlaying(false)}
        className="fixed inset-0 z-[40]"
        style={{
          background: "rgba(8,8,10,0.88)",
          opacity: playing ? 1 : 0,
          pointerEvents: playing ? "auto" : "none",
          transition: "opacity .6s ease",
        }}
      />

      <div className={`relative ${playing ? "z-[41]" : ""}`}>
        {/* CRT television */}
        <div
          className="relative mx-auto w-full max-w-[980px]"
          style={{
            background: "linear-gradient(#2a2622, #171412)",
            borderRadius: "22px",
            padding: "3.2% 3.2% 8%",
            boxShadow: playing
              ? "0 40px 120px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.09)"
              : "0 24px 70px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.09)",
            transition: "box-shadow .6s ease",
          }}
        >
          {/* Screen bezel */}
          <div
            className="relative overflow-hidden bg-black"
            style={{
              aspectRatio: "16 / 9",
              borderRadius: "12px",
              boxShadow:
                "inset 0 0 0 3px rgba(0,0,0,.9), inset 0 0 40px rgba(0,0,0,.85), 0 0 0 2px rgba(255,255,255,.06)",
            }}
          >
            {playing ? (
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
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-black/40 text-[26px] text-white backdrop-blur-[2px] transition-all duration-500 group-hover:scale-110 group-hover:bg-black/60 sm:h-24 sm:w-24 sm:text-[30px]">
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
                  background: playing ? "#ff4b3e" : "rgba(255,255,255,.14)",
                  boxShadow: playing ? "0 0 10px rgba(255,75,62,.9)" : "none",
                  transition: "all .5s ease",
                }}
              />
            </span>
          </div>
        </div>

        {playing && (
          <p className="mt-6 text-center text-[12px] tracking-[0.16em] uppercase text-white/45">
            Click anywhere outside the set to bring the lights up
          </p>
        )}
      </div>
    </>
  );
}
