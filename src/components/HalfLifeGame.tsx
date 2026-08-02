"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  forgetCopy,
  mountOne,
  mountSaved,
  relPathOf,
  saveCopy,
  savedCopy,
  type HLMeta,
} from "@/lib/hlStore";

/**
 * Half-Life, on the Xash3D FWGS engine.
 *
 * This cabinet ships the engine and nothing else. Xash3D FWGS is a clean-room
 * rebuild of GoldSrc under GPL-3.0 and the web wrapper around it is MIT, so
 * both are free to host. The game logic is the Half-Life SDK compiled to
 * WebAssembly. All of that is code.
 *
 * What it never ships is Valve's game data. Half a gigabyte of maps, models
 * and sounds isn't ours to hand out — the same line the site holds for HL2
 * and Vice City — and a passcode wouldn't change it, since static files stay
 * publicly fetchable whatever the page in front of them says.
 *
 * So the visitor brings their own copy, once. It's read off their disk into
 * IndexedDB and mounted from there on every later visit: no upload, no
 * server round trip, and no picking the folder again.
 */
const ENGINE = "/games/halflife";

type Phase =
  | "checking"
  | "needs-files"
  | "saved"
  | "reading"
  | "mounting"
  | "booting"
  | "running"
  | "error";

const mb = (n: number) => `${(n / 1048576).toFixed(0)}MB`;

export function HalfLifeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pickRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("checking");
  const [meta, setMeta] = useState<HLMeta | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    let alive = true;
    savedCopy().then((m) => {
      if (!alive) return;
      setMeta(m);
      setPhase(m ? "saved" : "needs-files");
    });
    return () => {
      alive = false;
    };
  }, []);

  /** Spin up the engine and hand it a filesystem. */
  const boot = useCallback(
    async (picked: File[] | null) => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { Xash3D } = await import("xash3d-fwgs");
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
        const FS = engine.em?.FS as unknown as Parameters<typeof mountSaved>[0];
        if (!FS) throw new Error("engine did not expose a filesystem");

        setPhase("mounting");
        // Xash's own extras pack — ships with the engine, not with the game.
        const extras = await fetch(`${ENGINE}/valve/extras.pk3`);
        if (extras.ok) {
          await mountOne(FS, "extras.pk3", await extras.blob());
        }

        if (picked) {
          let n = 0;
          for (const f of picked) {
            const rel = relPathOf(f);
            if (rel) await mountOne(FS, rel, f);
            if (++n % 200 === 0) {
              setNote(`Mounting — ${n} / ${picked.length}`);
              await new Promise((r) => setTimeout(r, 0));
            }
          }
        } else {
          await mountSaved(FS, (d, t) => setNote(`Mounting — ${d} / ${t}`));
        }

        setPhase("booting");
        setNote("");
        engine.main();

        // main() returning proves nothing — it hands control to the engine's
        // own loop and comes straight back. Wait for the engine to actually
        // take the canvas (it resizes it off the default 300x150 before it
        // draws) rather than reporting success on faith.
        const drew = await new Promise<boolean>((resolve) => {
          const started = performance.now();
          const tick = () => {
            if (canvas.width > 300 || canvas.height > 150) resolve(true);
            else if (performance.now() - started > 25000) resolve(false);
            else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        if (!drew) {
          throw new Error(
            "the engine started but never took the canvas — no frames drawn",
          );
        }
        setPhase("running");
        canvas.focus();
      } catch (err) {
        console.error("Half-Life failed to boot:", err);
        setPhase("error");
        setNote(err instanceof Error ? err.message : String(err));
      }
    },
    [],
  );

  const onPick = useCallback(
    async (ev: React.ChangeEvent<HTMLInputElement>) => {
      const picked = Array.from(ev.target.files ?? []);
      if (!picked.length) return;

      const looksRight = picked.some((f) =>
        /(^|\/)(halflife\.wad|maps\/|models\/|sound\/)/i.test(relPathOf(f)),
      );
      if (!looksRight) {
        setPhase("error");
        setNote("That doesn't look like a Half-Life 'valve' folder — no halflife.wad, maps or models in it.");
        return;
      }

      setPhase("reading");
      try {
        const saved = await saveCopy(picked, (d, t) =>
          setNote(`Keeping your copy — ${d} / ${t} files`),
        );
        setMeta(saved);
      } catch (err) {
        // Out of quota or private mode: still playable, just not remembered.
        console.warn("could not persist Half-Life files:", err);
        setNote("Couldn't save it for next time — playing from this session only.");
      }
      await boot(picked);
    },
    [boot],
  );

  const forget = useCallback(async () => {
    await forgetCopy();
    setMeta(null);
    setPhase("needs-files");
    setNote("");
  }, []);

  const busy = phase === "reading" || phase === "mounting" || phase === "booting";

  return (
    <div className="border border-white/15 bg-white/[0.03] p-5 sm:p-6">
      {/* HUD */}
      <div className="flex items-baseline justify-between font-mono text-[12px] tracking-[0.14em] uppercase">
        <span className="text-white/45">
          Cabinet <span className="text-white/85">Half-Life</span>
        </span>
        {phase === "saved" && meta ? (
          <button
            type="button"
            onClick={forget}
            className="text-white/45 transition-colors hover:text-white/85"
          >
            Forget my copy ({mb(meta.bytes)})
          </button>
        ) : (
          <span className="text-white/45">
            {phase === "running"
              ? "Running"
              : busy
                ? "Working…"
                : phase === "error"
                  ? "Failed"
                  : "Bring your own copy"}
          </span>
        )}
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
            <span className="max-w-[48ch] font-mono text-[11px] leading-[1.8] tracking-[0.14em] uppercase text-white/55">
              {busy
                ? note || "Working…"
                : phase === "error"
                  ? note
                  : phase === "saved" && meta
                    ? `Your copy is here — ${meta.count} files, ${mb(meta.bytes)}, kept in this browser`
                    : phase === "checking"
                      ? "Looking for a saved copy…"
                      : "The engine is here. The game isn't — bring your own."}
            </span>

            {phase === "saved" && (
              <button
                type="button"
                onClick={() => boot(null)}
                className="mt-1 rounded-full border border-white/25 bg-white/[0.06] px-5 py-2 font-mono text-[11px] tracking-[0.16em] uppercase text-white transition-all duration-500 hover:bg-white/[0.14]"
              >
                Insert coin — boot it
              </button>
            )}
            {(phase === "needs-files" || phase === "error") && (
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
        Pick Half-Life/valve once — it stays in this browser · W A S D move ·
        mouse look · nothing is ever uploaded
      </p>
      <p className="mt-2 font-mono text-[10px] leading-[1.7] tracking-[0.08em] uppercase text-white/25">
        Xash3D FWGS (GPL-3.0) + the HL SDK, compiled to WebAssembly · engine
        hosted here, game data never
      </p>
    </div>
  );
}
