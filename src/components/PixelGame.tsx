"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * "Moving Pixels" — the vault's hidden game, named for the tagline
 * ("moving pixels since 2020"). A monochrome snake on the site's grid:
 * collect pixels, don't eat yourself, don't hit the walls.
 *
 * Canvas-rendered with all game state in refs, so a running game never
 * re-renders React (score/best are the only state that surface).
 */
const COLS = 24;
const ROWS = 16;
const START_MS = 140;

type Pt = { x: number; y: number };

export function PixelGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<"idle" | "run" | "over">("idle");
  const startRef = useRef<() => void>(() => {});

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const stored = Number(localStorage.getItem("vault-pixels-best") || 0);
      if (stored) setBest(stored);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cell = 20, dpr = 1;
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cell = r.width / COLS;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(cell * ROWS * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    let snake: Pt[] = [];
    let dir: Pt = { x: 1, y: 0 };
    let queued: Pt[] = [];
    let food: Pt = { x: 0, y: 0 };
    let alive = false;
    let acc = 0, stepMs = START_MS, last = performance.now();
    let localScore = 0;

    const placeFood = () => {
      let p: Pt;
      do {
        p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      } while (snake.some((s) => s.x === p.x && s.y === p.y));
      food = p;
    };

    const reset = () => {
      snake = [{ x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }];
      dir = { x: 1, y: 0 };
      queued = [];
      stepMs = START_MS;
      localScore = 0;
      setScore(0);
      placeFood();
      alive = true;
      setStatus("run");
    };
    startRef.current = reset;

    const turn = (nd: Pt) => {
      const ref = queued.length ? queued[queued.length - 1] : dir;
      if (ref.x === -nd.x && ref.y === -nd.y) return; // no 180s
      if (ref.x === nd.x && ref.y === nd.y) return;
      if (queued.length < 2) queued.push(nd);
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const map: Record<string, Pt> = {
        arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 },
      };
      if (map[k]) { e.preventDefault(); if (alive) turn(map[k]); else reset(); }
      else if (k === " " || k === "enter") { e.preventDefault(); if (!alive) reset(); }
    };
    window.addEventListener("keydown", onKey);

    // touch swipe
    let tsx = 0, tsy = 0;
    const onTS = (e: TouchEvent) => { tsx = e.touches[0].clientX; tsy = e.touches[0].clientY; };
    const onTE = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tsx;
      const dy = e.changedTouches[0].clientY - tsy;
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) { if (!alive) reset(); return; }
      if (!alive) return;
      turn(Math.abs(dx) > Math.abs(dy)
        ? { x: dx > 0 ? 1 : -1, y: 0 }
        : { x: 0, y: dy > 0 ? 1 : -1 });
    };
    canvas.addEventListener("touchstart", onTS, { passive: true });
    canvas.addEventListener("touchend", onTE, { passive: true });

    const stepGame = () => {
      if (queued.length) dir = queued.shift()!;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (
        head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS ||
        snake.some((s) => s.x === head.x && s.y === head.y)
      ) {
        alive = false;
        setStatus("over");
        setBest((b) => {
          const nb = Math.max(b, localScore);
          localStorage.setItem("vault-pixels-best", String(nb));
          return nb;
        });
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        localScore += 1;
        setScore(localScore);
        stepMs = Math.max(65, START_MS - localScore * 3.5);
        placeFood();
      } else snake.pop();
    };

    let raf = 0;
    const loop = (now: number) => {
      const dt = now - last; last = now;
      if (alive) { acc += dt; while (acc >= stepMs) { stepGame(); acc -= stepMs; } }

      const W = COLS * cell, H = ROWS * cell;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0b0b0e";
      ctx.fillRect(0, 0, W, H);

      // grid — echoes the site's GridBackdrop
      ctx.strokeStyle = "rgba(255,255,255,0.045)";
      ctx.lineWidth = 1;
      for (let x = 1; x < COLS; x++) { ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, H); ctx.stroke(); }
      for (let y = 1; y < ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * cell); ctx.lineTo(W, y * cell); ctx.stroke(); }

      // food — a lone bright pixel
      const pad = cell * 0.26;
      ctx.fillStyle = "#f1f1f1";
      ctx.fillRect(food.x * cell + pad, food.y * cell + pad, cell - pad * 2, cell - pad * 2);

      // snake — head bright, tail fading
      snake.forEach((s, i) => {
        const t = 1 - i / Math.max(12, snake.length);
        ctx.fillStyle = i === 0 ? "#ffffff" : `rgba(241,241,241,${0.35 + t * 0.5})`;
        const p = cell * 0.1;
        ctx.fillRect(s.x * cell + p, s.y * cell + p, cell - p * 2, cell - p * 2);
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("touchstart", onTS);
      canvas.removeEventListener("touchend", onTE);
    };
  }, []);

  const start = useCallback(() => startRef.current(), []);

  return (
    <div className="border border-white/15 bg-white/[0.03] p-5 sm:p-6">
      {/* HUD */}
      <div className="flex items-baseline justify-between font-mono text-[12px] tracking-[0.14em] uppercase">
        <span className="text-white/45">
          Score <span className="tabular-nums text-white/85">{String(score).padStart(3, "0")}</span>
        </span>
        <span className="text-white/45">
          Best <span className="tabular-nums text-white/85">{String(best).padStart(3, "0")}</span>
        </span>
      </div>

      <div className="relative mt-4">
        <canvas ref={canvasRef} className="block w-full" style={{ aspectRatio: `${COLS} / ${ROWS}` }} />

        {status !== "run" && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3"
            style={{ background: "rgba(11,11,14,0.72)" }}
          >
            <span className="font-display text-[26px] font-semibold tracking-tight text-white sm:text-[32px]">
              {status === "idle" ? "Moving Pixels" : `You collected ${score}`}
            </span>
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/55">
              {status === "idle" ? "Click or press any arrow to start" : "Click to play again"}
            </span>
          </button>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] leading-[1.7] tracking-[0.1em] uppercase text-white/35">
        Arrows / WASD to steer · swipe on touch · collect the pixels, avoid yourself
      </p>
    </div>
  );
}
