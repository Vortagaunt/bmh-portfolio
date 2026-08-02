"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Wolfenstein 3D, running in the vault.
 *
 * Engine: js-dos — DOSBox compiled to WebAssembly, GPL-2.0, self-hosted here
 * rather than pulled off anyone's CDN. The game is the 1992 **shareware**
 * package: WOLF3D.EXE plus the .WL1 data files. That extension is the marker
 * — the registered six-episode game uses .WL6, and none of it is here.
 *
 * DOSBox owns the keyboard while it runs, so it lives in an iframe. Boots on
 * click, like the other cabinets: nobody pays for 3.4MB of emulator just for
 * walking past.
 */
export function Wolf3DGame() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [booted, setBooted] = useState(false);

  const goFullscreen = useCallback(() => {
    shellRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  return (
    <div className="border border-white/15 bg-white/[0.03] p-5 sm:p-6">
      {/* HUD */}
      <div className="flex items-baseline justify-between font-mono text-[12px] tracking-[0.14em] uppercase">
        <span className="text-white/45">
          Cabinet <span className="text-white/85">Wolfenstein 3D</span>
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
            src="/games/wolf3d/index.html"
            title="Wolfenstein 3D — shareware episode"
            className="absolute inset-0 h-full w-full border-0"
            allow="fullscreen; autoplay; gamepad"
          />
        )}

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
            onClick={() => setBooted(true)}
            className="absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-3"
            style={{ background: "rgba(11,11,14,0.78)" }}
          >
            <span className="font-display text-[30px] font-semibold tracking-tight text-white sm:text-[40px]">
              WOLFENSTEIN 3D
            </span>
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/55">
              Insert coin — click to boot
            </span>
          </button>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] leading-[1.7] tracking-[0.1em] uppercase text-white/35">
        Click the screen first · arrows move · Ctrl fire · Alt strafe · Space
        open · 1-4 weapons · Esc menu
      </p>
      <p className="mt-2 font-mono text-[10px] leading-[1.7] tracking-[0.08em] uppercase text-white/25">
        js-dos / DOSBox (GPL-2.0), self-hosted · id&apos;s 1992 shareware
        episode, freely distributable
      </p>
    </div>
  );
}
