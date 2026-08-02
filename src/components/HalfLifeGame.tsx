"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Half-Life, on the Xash3D FWGS engine.
 *
 * What this cabinet ships is the engine and nothing else. Xash3D FWGS is a
 * clean-room reimplementation of GoldSrc under GPL-3.0, and the web wrapper
 * around it is MIT — both entirely free to host. The game logic is the
 * Half-Life SDK compiled to WebAssembly. All of that is code.
 *
 * What it does NOT ship, and never will, is Valve's game data — the maps,
 * models, sounds and pak files that make up an actual copy of Half-Life.
 * Those aren't ours to hand out, which is the same line the site holds for
 * HL2 and Vice City.
 *
 * So the visitor brings their own. Pick the `valve` folder out of a Half-Life
 * install and it's read straight into the engine's in-browser filesystem —
 * it never leaves the machine, never uploads, never touches the server. If
 * you own the game you can play it here; if you don't, the cabinet politely
 * says so.
 */
const ENGINE = "/games/halflife";

type Phase = "idle" | "loading" | "booting" | "running" | "error";

export function HalfLifeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pickRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [note, setNote] = useState("");

  const onPick = useCallback(async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(ev.target.files ?? []);
    if (!picked.length) return;

    // Sanity: a real valve/ folder has pak0.pak or a maps directory in it.
    const looksRight = picked.some(
      (f) => /(^|\/)(pak0\.pak|maps\/|models\/|sound\/)/i.test(f.webkitRelativePath || f.name),
    );
    if (!looksRight) {
      setPhase("error");
      setNote("That folder doesn't look like a Half-Life 'valve' directory — no pak0.pak, maps or models inside.");
      return;
    }

    setPhase("loading");
    try {
      const { Xash3D } = await import("xash3d-fwgs");
      const canvas = canvasRef.current;
      if (!canvas) return;

      const engine = new Xash3D({
        canvas,
        renderer: "gles3compat",
        arguments: ["-game", "valve"],
        libraries: {
          xash: `${ENGINE}/xash.wasm`,
          filesystem: `${ENGINE}/filesystem_stdio.wasm`,
          menu: `${ENGINE}/libmenu.wasm`,
          server: `${ENGINE}/valve/dlls/hl_emscripten_wasm32.wasm`,
          client: `${ENGINE}/valve/cl_dlls/client_emscripten_wasm32.wasm`,
          render: {
            gles3compat: `${ENGINE}/libref_webgl2.wasm`,
            soft: `${ENGINE}/libref_soft.wasm`,
          },
        },
      });

      await engine.init();
      const em = engine.em;
      if (!em) throw new Error("engine failed to initialise");
      const FS = em.FS as unknown as {
        mkdir: (p: string) => void;
        writeFile: (p: string, d: Uint8Array) => void;
        analyzePath: (p: string) => { exists: boolean };
      };

      const mkdirp = (dir: string) => {
        let cur = "";
        for (const part of dir.split("/").filter(Boolean)) {
          cur += "/" + part;
          try {
            if (!FS.analyzePath(cur).exists) FS.mkdir(cur);
          } catch {
            /* already there */
          }
        }
      };

      // The engine's own extras pack ships with Xash, not with the game.
      mkdirp("/valve");
      const extras = await fetch(`${ENGINE}/valve/extras.pk3`);
      if (extras.ok) {
        FS.writeFile("/valve/extras.pk3", new Uint8Array(await extras.arrayBuffer()));
      }

      // The visitor's own copy, straight into the virtual filesystem.
      let done = 0;
      for (const file of picked) {
        const rel = (file.webkitRelativePath || file.name).split("/").slice(1).join("/");
        if (!rel) continue;
        const dest = `/valve/${rel}`;
        mkdirp(dest.slice(0, dest.lastIndexOf("/")));
        FS.writeFile(dest, new Uint8Array(await file.arrayBuffer()));
        done++;
        if (done % 25 === 0 || done === picked.length) {
          setNote(`Reading your copy — ${done} / ${picked.length} files`);
          await new Promise((r) => setTimeout(r, 0)); // let the UI breathe
        }
      }

      setPhase("booting");
      setNote("");
      engine.main();
      setPhase("running");
      canvas.focus();
    } catch (err) {
      console.error("Half-Life failed to boot:", err);
      setPhase("error");
      setNote(err instanceof Error ? err.message : String(err));
    }
  }, []);

  return (
    <div className="border border-white/15 bg-white/[0.03] p-5 sm:p-6">
      {/* HUD */}
      <div className="flex items-baseline justify-between font-mono text-[12px] tracking-[0.14em] uppercase">
        <span className="text-white/45">
          Cabinet <span className="text-white/85">Half-Life</span>
        </span>
        <span className="text-white/45">
          {phase === "running"
            ? "Running"
            : phase === "loading"
              ? "Reading…"
              : phase === "booting"
                ? "Booting…"
                : phase === "error"
                  ? "Failed"
                  : "Bring your own copy"}
        </span>
      </div>

      {/* Screen */}
      <div
        className="relative mt-4 overflow-hidden bg-black"
        style={{
          aspectRatio: "4 / 3",
          boxShadow: "inset 0 0 0 2px rgba(0,0,0,.9), inset 0 0 50px rgba(0,0,0,.8)",
        }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          className="block h-full w-full outline-none"
          onClick={() => canvasRef.current?.focus()}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(0,0,0,.22) 0 1px, transparent 1px 3px)",
          }}
        />

        <input
          ref={pickRef}
          type="file"
          className="hidden"
          onChange={onPick}
          // Not in React's typings, but every browser that matters honours it.
          {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
        />

        {phase !== "running" && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center"
            style={{ background: "rgba(11,11,14,0.82)" }}
          >
            <span className="font-display text-[30px] font-semibold tracking-tight text-white sm:text-[40px]">
              {phase === "error" ? "Cabinet jammed" : "HALF-LIFE"}
            </span>
            <span className="max-w-[46ch] font-mono text-[11px] leading-[1.8] tracking-[0.14em] uppercase text-white/55">
              {phase === "loading" || phase === "booting"
                ? note || "Working…"
                : phase === "error"
                  ? note
                  : "The engine is here. The game isn't — bring your own."}
            </span>
            {(phase === "idle" || phase === "error") && (
              <button
                type="button"
                onClick={() => pickRef.current?.click()}
                className="mt-1 rounded-full border border-white/25 bg-white/[0.06] px-5 py-2 font-mono text-[11px] tracking-[0.16em] uppercase text-white transition-all duration-500 hover:bg-white/[0.14]"
              >
                Choose your valve folder
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] leading-[1.7] tracking-[0.1em] uppercase text-white/35">
        Point it at Half-Life/valve · W A S D move · mouse look · files stay on
        your machine, nothing uploads
      </p>
      <p className="mt-2 font-mono text-[10px] leading-[1.7] tracking-[0.08em] uppercase text-white/25">
        Xash3D FWGS (GPL-3.0) + the HL SDK, compiled to WebAssembly · engine
        hosted here, game data never
      </p>
    </div>
  );
}
