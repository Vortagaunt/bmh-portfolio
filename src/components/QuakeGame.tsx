"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Quake, running in the vault.
 *
 * Engine: WebQuake — a WebGL reimplementation of id Software's Quake, whose
 * source id released under the GPL. The game data is the **shareware episode**
 * (Dimension of the Doomed): pak0.pak only, E1M1–E1M8 + start. Verified before
 * shipping — the archive's directory lists 21 .bsp lumps, all episode 1.
 * pak1.pak, which holds the registered episodes, is not here and never will be.
 *
 * The engine is 36 modules of globals-on-window, so it runs in an iframe
 * rather than fighting React for the namespace. Facade-first: the 18MB pak
 * isn't fetched until the visitor boots it.
 */
export function QuakeGame() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [booted, setBooted] = useState(false);

  const boot = useCallback(() => setBooted(true), []);

  const goFullscreen = useCallback(() => {
    shellRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  return (
    <div className="border border-white/15 bg-white/[0.03] p-5 sm:p-6">
      {/* HUD */}
      <div className="flex items-baseline justify-between font-mono text-[12px] tracking-[0.14em] uppercase">
        <span className="text-white/45">
          Cabinet <span className="text-white/85">Quake</span>
        </span>
        {booted ? (
          <button
            type="button"
            onClick={goFullscreen}
            className="text-white/45 transition-colors hover:text-white/85"
          >
            Fullscreen ⤢
          </button>
        ) : (
          <span className="text-white/45">Shareware Ep. 1</span>
        )}
      </div>

      {/* Screen */}
      <div
        ref={shellRef}
        className="relative mt-4 overflow-hidden bg-black"
        style={{
          aspectRatio: "4 / 3",
          boxShadow: "inset 0 0 0 2px rgba(0,0,0,.9), inset 0 0 50px rgba(0,0,0,.8)",
        }}
      >
        {booted && (
          <iframe
            src="/games/quake/index.html"
            title="Quake — shareware episode"
            className="absolute inset-0 h-full w-full border-0"
            allow="fullscreen; autoplay; gamepad"
          />
        )}

        {/* scanlines, always on — it's a cabinet */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(0,0,0,.22) 0 1px, transparent 1px 3px)",
          }}
        />

        {!booted && (
          <button
            type="button"
            onClick={boot}
            className="absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-3"
            style={{ background: "rgba(11,11,14,0.78)" }}
          >
            <span className="font-display text-[30px] font-semibold tracking-tight text-white sm:text-[40px]">
              QUAKE
            </span>
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/55">
              Insert coin — click to boot
            </span>
          </button>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] leading-[1.7] tracking-[0.1em] uppercase text-white/35">
        Click the screen first · W A S D move · mouse look · click fire · Space jump · Esc menu
      </p>
      <p className="mt-2 font-mono text-[10px] leading-[1.7] tracking-[0.08em] uppercase text-white/25">
        WebQuake, a WebGL port of id&apos;s GPL Quake source · shareware episode, freely distributable
      </p>
    </div>
  );
}
