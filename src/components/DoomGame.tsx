"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * DOOM, running in the vault.
 *
 * Engine: id Software's DOOM source, released under the GPL, compiled to
 * WebAssembly (wasm-doom, MIT). The bundled game data is the **shareware
 * episode** (Knee-Deep in the Dead) — the episode id distributed freely for
 * unlimited copying. Nothing commercial ships here.
 *
 * Facade-first: the 6.8MB binary isn't fetched until the visitor boots it,
 * so the vault stays light for everyone who just came for the log.
 */
const W = 640;
const H = 400;

// Keys the game owns while it's running — stop them scrolling the page.
const TRAPPED = new Set([
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  " ", "Control", "Alt", "Shift", "Tab", "Enter",
]);

export function DoomGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"idle" | "booting" | "running" | "error">("idle");
  const runningRef = useRef(false);

  // Keep arrows/space from scrolling the page while DOOM has the keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (runningRef.current && TRAPPED.has(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const boot = useCallback(async () => {
    if (state !== "idle") return;
    setState("booting");
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { DOOM } = await import("wasm-doom");
      const doom = new DOOM({
        screenWidth: W,
        screenHeight: H,
        wasmURL: "/games/doom.wasm",
        onFrameRender: ({ screen }) => {
          ctx.putImageData(new ImageData(screen, W, H), 0, 0);
        },
      });
      await doom.start();
      runningRef.current = true;
      setState("running");
      canvas.focus();
    } catch (err) {
      console.error("DOOM failed to boot:", err);
      setState("error");
    }
  }, [state]);

  useEffect(() => () => { runningRef.current = false; }, []);

  return (
    <div className="border border-white/15 bg-white/[0.03] p-5 sm:p-6">
      {/* HUD */}
      <div className="flex items-baseline justify-between font-mono text-[12px] tracking-[0.14em] uppercase">
        <span className="text-white/45">
          Cabinet <span className="text-white/85">DOOM</span>
        </span>
        <span className="text-white/45">
          {state === "running" ? "Running" : state === "booting" ? "Loading…" : state === "error" ? "Failed" : "Shareware Ep. 1"}
        </span>
      </div>

      {/* Screen */}
      <div
        className="relative mt-4 overflow-hidden bg-black"
        style={{
          aspectRatio: `${W} / ${H}`,
          boxShadow: "inset 0 0 0 2px rgba(0,0,0,.9), inset 0 0 50px rgba(0,0,0,.8)",
        }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          className="block h-full w-full outline-none"
          style={{ imageRendering: "pixelated" }}
          onClick={() => canvasRef.current?.focus()}
        />
        {/* scanlines, always on — it's a cabinet */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(0,0,0,.22) 0 1px, transparent 1px 3px)",
          }}
        />

        {state !== "running" && (
          <button
            type="button"
            onClick={boot}
            disabled={state === "booting"}
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3"
            style={{ background: "rgba(11,11,14,0.78)" }}
          >
            <span className="font-display text-[30px] font-semibold tracking-tight text-white sm:text-[40px]">
              {state === "error" ? "Cabinet jammed" : "DOOM"}
            </span>
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/55">
              {state === "booting"
                ? "Loading 6.8MB…"
                : state === "error"
                  ? "Reload the page to try again"
                  : "Insert coin — click to boot"}
            </span>
          </button>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] leading-[1.7] tracking-[0.1em] uppercase text-white/35">
        Click the screen first · Arrows move · Ctrl fire · Space open · Alt+arrows strafe · Esc menu
      </p>
      <p className="mt-2 font-mono text-[10px] leading-[1.7] tracking-[0.08em] uppercase text-white/25">
        id Software&apos;s GPL DOOM source, compiled to WebAssembly · shareware episode, freely distributable
      </p>
    </div>
  );
}
