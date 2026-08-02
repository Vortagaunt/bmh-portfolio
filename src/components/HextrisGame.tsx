"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hextris — the 2014 puzzle game by Logan Engstrom, Garrett Finucane,
 * Noah Moroze and Michael Yang — rebuilt from scratch for the vault.
 *
 * The rules are theirs and kept faithfully: blocks fall inward at a rotating
 * hexagon, you spin it to steer where they land, and three or more touching
 * blocks of a kind clear together — counting both up a single face and
 * sideways across neighbouring faces at the same depth. Cascades combo.
 *
 * The look is ours. Hextris matches on colour and this site doesn't have a
 * palette to lend it, so the four block types are a luminance ramp whose
 * last member is outlined instead of filled — four states you can separate
 * at a glance with no hue at all.
 *
 * Same shape as the Moving Pixels cabinet: canvas, all live state in refs,
 * so a running game never re-renders React.
 */
const SIDES = 6;
const MAX_H = 5; // stack depth per face before the hexagon chokes
const SECT = (Math.PI * 2) / SIDES;
const TONES = 4;

// Fills, brightest to dimmest. Index 3 is drawn hollow — at this size a fourth
// grey would sit too close to the board to read, an outline never does.
const FILL = ["#f2f2f4", "#9a9aa3", "#53535d", "#15151b"];
const EDGE = ["#ffffff", "#b4b4bd", "#6e6e79", "#d6d6de"];

type Cell = { tone: number; born: number };
type Faller = { side: number; tone: number; r: number };
type Fx = { side: number; h: number; tone: number; t: number };

const mod = (n: number, m: number) => ((n % m) + m) % m;

export function HextrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<"idle" | "run" | "over">("idle");
  const startRef = useRef<() => void>(() => {});

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const stored = Number(localStorage.getItem("vault-hextris-best") || 0);
      if (stored) setBest(stored);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ---- geometry, recomputed on resize ---- */
    let W = 0, H = 0, cx = 0, cy = 0, R0 = 0, BT = 0, REF = 0, dpr = 1;

    // Where a block for a given face should start: just past the edge of the
    // board on that face's own heading. The screen is 4:3, so the six headings
    // reach the edge at different distances — spawning them all on one circle
    // would make the ones from top and bottom show up late.
    const edgeR = (side: number) => {
      const a = side * SECT + SECT / 2;
      const c = Math.abs(Math.cos(a));
      const s = Math.abs(Math.sin(a));
      const tx = c > 1e-6 ? W / 2 / c : Infinity;
      const ty = s > 1e-6 ? H / 2 / s : Infinity;
      return Math.min(tx, ty) + BT * 1.6;
    };
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height || r.width * 0.75;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
      const avail = Math.min(W, H) / 2 - 10;
      R0 = avail * 0.24;
      BT = (avail - R0) / (MAX_H + 0.6);
      REF = Math.min(W, H) / 2; // yardstick for fall speed, so it's rig-independent
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    /* ---- game state ---- */
    // Seeded with six empty faces, not [], because the paint loop starts
    // before the first reset() and would otherwise read undefined.length.
    let stacks: Cell[][] = Array.from({ length: SIDES }, () => []);
    let fallers: Faller[] = [];
    let fx: Fx[] = [];
    let rotSteps = 0;      // logical rotation, in 60° notches
    let rotAngle = 0;      // rendered rotation, eased toward rotSteps
    let alive = false;
    let localScore = 0;
    let combo = 0;
    let comboLeft = 0;     // ms of combo window remaining
    let spawnLeft = 0;
    let shake = 0;
    let last = performance.now();

    const travelMs = () => Math.max(950, 2600 - localScore * 1.6);
    const spawnMs = () => Math.max(430, 1150 - localScore * 0.85);

    const reset = () => {
      stacks = Array.from({ length: SIDES }, () => []);
      fallers = [];
      fx = [];
      rotSteps = 0;
      rotAngle = 0;
      localScore = 0;
      combo = 0;
      comboLeft = 0;
      spawnLeft = 700;
      shake = 0;
      setScore(0);
      alive = true;
      setStatus("run");
    };
    startRef.current = reset;

    const turn = (dir: 1 | -1) => {
      if (alive) rotSteps += dir;
    };

    /* ---- matching: flood fill over (face, depth) ---- */
    const resolve = () => {
      let chain = 0;
      for (;;) {
        const seen = Array.from({ length: SIDES }, (_, s) =>
          new Array(stacks[s].length).fill(false),
        );
        const doomed: [number, number][] = [];

        for (let s = 0; s < SIDES; s++) {
          for (let h = 0; h < stacks[s].length; h++) {
            if (seen[s][h]) continue;
            const tone = stacks[s][h].tone;
            const group: [number, number][] = [];
            const queue: [number, number][] = [[s, h]];
            seen[s][h] = true;

            while (queue.length) {
              const [qs, qh] = queue.pop()!;
              group.push([qs, qh]);
              // up/down the same face, and sideways onto the two neighbours
              // at equal depth — those blocks share an edge on the hexagon.
              const near: [number, number][] = [
                [qs, qh - 1],
                [qs, qh + 1],
                [mod(qs + 1, SIDES), qh],
                [mod(qs - 1, SIDES), qh],
              ];
              for (const [ns, nh] of near) {
                if (nh < 0 || nh >= stacks[ns].length) continue;
                if (seen[ns][nh]) continue;
                if (stacks[ns][nh].tone !== tone) continue;
                seen[ns][nh] = true;
                queue.push([ns, nh]);
              }
            }
            if (group.length >= 3) doomed.push(...group);
          }
        }

        if (!doomed.length) break;

        chain += 1;
        combo = comboLeft > 0 ? combo + 1 : chain;
        comboLeft = 2600;

        const kill = new Set(doomed.map(([s, h]) => `${s}:${h}`));
        for (const [s, h] of doomed) {
          fx.push({ side: s, h, tone: stacks[s][h].tone, t: 0 });
        }
        // Filtering in place compacts each face inward — the blocks above
        // simply fall down into the gap, which is what the original does.
        for (let s = 0; s < SIDES; s++) {
          stacks[s] = stacks[s].filter((_, h) => !kill.has(`${s}:${h}`));
        }

        localScore += doomed.length * 10 * Math.max(1, combo);
        setScore(localScore);
        shake = Math.min(9, 3 + doomed.length * 0.7);
      }
    };

    const land = (f: Faller) => {
      // A faller travels a fixed direction in world space; which face catches
      // it depends on where the hexagon has been spun to by the time it hits.
      const side = mod(f.side - rotSteps, SIDES);
      if (stacks[side].length >= MAX_H) {
        alive = false;
        setStatus("over");
        setBest((b) => {
          const nb = Math.max(b, localScore);
          localStorage.setItem("vault-hextris-best", String(nb));
          return nb;
        });
        return;
      }
      stacks[side].push({ tone: f.tone, born: performance.now() });
      resolve();
    };

    /* ---- input ----
     * Bound to the canvas, not the window: the vault stacks several playable
     * cabinets on one page, and a window listener would let a single arrow
     * press drive every one of them at once. */
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") {
        e.preventDefault();
        if (alive) turn(-1);
        else reset();
      } else if (k === "arrowright" || k === "d") {
        e.preventDefault();
        if (alive) turn(1);
        else reset();
      } else if (k === " " || k === "enter") {
        e.preventDefault();
        if (!alive) reset();
      }
    };
    canvas.addEventListener("keydown", onKey);

    const onPointer = (e: PointerEvent) => {
      canvas.focus();
      if (!alive) { reset(); return; }
      const r = canvas.getBoundingClientRect();
      turn(e.clientX - r.left < r.width / 2 ? -1 : 1);
    };
    canvas.addEventListener("pointerdown", onPointer);

    /* ---- drawing ----
     * dx/dy slide a shape bodily outward without resizing it. Fallers are
     * drawn as a ring-0 trapezoid pushed out along its own face normal, so a
     * block keeps one constant size all the way in and arrives exactly the
     * shape of the slot it lands in — rather than ballooning with radius. */
    const trap = (
      r1: number, r2: number, a1: number, a2: number,
      dx = 0, dy = 0,
    ) => {
      const p = (r: number, a: number) =>
        ctx.lineTo(cx + Math.cos(a) * r + dx, cy + Math.sin(a) * r + dy);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * r1 + dx, cy + Math.sin(a1) * r1 + dy);
      p(r1, a2);
      p(r2, a2);
      p(r2, a1);
      ctx.closePath();
    };

    const block = (
      r1: number, r2: number, a1: number, a2: number,
      tone: number, alpha = 1, pop = 0, dx = 0, dy = 0,
    ) => {
      const gap = 0.014;
      const push = pop * BT * 0.35;
      ctx.globalAlpha = alpha;
      trap(r1 + 1.1 + push, r2 - 1.1 + push, a1 + gap, a2 - gap, dx, dy);
      ctx.fillStyle = FILL[tone];
      ctx.fill();
      // The hollow tone needs its edge; the solids get a faint one for depth.
      ctx.strokeStyle = EDGE[tone];
      ctx.lineWidth = tone === 3 ? 1.6 : 1;
      ctx.globalAlpha = alpha * (tone === 3 ? 0.9 : 0.16);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;

      if (W) {
        /* ---- step ---- */
        rotAngle += (rotSteps * SECT - rotAngle) * Math.min(1, dt / 90);
        if (shake > 0) shake = Math.max(0, shake - dt * 0.03);
        if (comboLeft > 0) {
          comboLeft -= dt;
          if (comboLeft <= 0) combo = 0;
        }

        if (alive) {
          spawnLeft -= dt;
          if (spawnLeft <= 0) {
            spawnLeft = spawnMs();
            const side = Math.floor(Math.random() * SIDES);
            fallers.push({
              side,
              tone: Math.floor(Math.random() * TONES),
              r: edgeR(side),
            });
          }
          const speed = (REF - R0) / travelMs();
          for (let i = fallers.length - 1; i >= 0; i--) {
            const f = fallers[i];
            f.r -= speed * dt;
            // rests on top of whatever the currently-facing stack has grown to
            const rest = R0 + stacks[mod(f.side - rotSteps, SIDES)].length * BT;
            if (f.r <= rest) {
              fallers.splice(i, 1);
              land(f);
            }
          }
        }

        for (let i = fx.length - 1; i >= 0; i--) {
          fx[i].t += dt / 240;
          if (fx[i].t >= 1) fx.splice(i, 1);
        }

        /* ---- paint ---- */
        ctx.save();
        if (shake > 0) {
          ctx.translate(
            (Math.random() - 0.5) * shake,
            (Math.random() - 0.5) * shake,
          );
        }
        ctx.fillStyle = "#0b0b0e";
        ctx.fillRect(-20, -20, W + 40, H + 40);

        // the grid, echoing GridBackdrop like the Pixels cabinet does
        const g = Math.max(26, Math.round(W / 22));
        ctx.strokeStyle = "rgba(255,255,255,0.045)";
        ctx.lineWidth = 1;
        for (let x = g; x < W; x += g) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = g; y < H; y += g) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // the core
        ctx.beginPath();
        for (let s = 0; s < SIDES; s++) {
          const a = rotAngle + s * SECT;
          const x = cx + Math.cos(a) * R0;
          const y = cy + Math.sin(a) * R0;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // stacked blocks
        for (let s = 0; s < SIDES; s++) {
          const a1 = rotAngle + s * SECT;
          const a2 = a1 + SECT;
          for (let h = 0; h < stacks[s].length; h++) {
            const c = stacks[s][h];
            const age = (now - c.born) / 170;
            const settle = age < 1 ? (1 - age) * 0.5 : 0;
            block(R0 + h * BT, R0 + (h + 1) * BT, a1, a2, c.tone, 1, settle);
          }
        }

        // clearing blocks: flare outward and fade
        for (const e of fx) {
          const a1 = rotAngle + e.side * SECT;
          block(
            R0 + e.h * BT, R0 + (e.h + 1) * BT, a1, a1 + SECT,
            e.tone, 1 - e.t, e.t * 1.4,
          );
        }

        // fallers, sliding in along fixed world directions
        for (const f of fallers) {
          const a1 = f.side * SECT;
          const mid = a1 + SECT / 2;
          const d = f.r - R0;
          block(
            R0, R0 + BT, a1, a1 + SECT, f.tone, 1, 0,
            Math.cos(mid) * d, Math.sin(mid) * d,
          );
        }

        // combo, in the middle of the hexagon — the one number that matters
        if (combo > 1 && comboLeft > 0) {
          ctx.fillStyle = `rgba(255,255,255,${Math.min(1, comboLeft / 700)})`;
          ctx.font = `600 ${Math.round(R0 * 0.62)}px ui-monospace, monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`×${combo}`, cx, cy + 1);
        }
        ctx.restore();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const start = useCallback(() => startRef.current(), []);

  return (
    <div className="border border-white/15 bg-white/[0.03] p-5 sm:p-6">
      {/* HUD */}
      <div className="flex items-baseline justify-between font-mono text-[12px] tracking-[0.14em] uppercase">
        <span className="text-white/45">
          Score{" "}
          <span className="tabular-nums text-white/85">
            {String(score).padStart(5, "0")}
          </span>
        </span>
        <span className="text-white/45">
          Best{" "}
          <span className="tabular-nums text-white/85">
            {String(best).padStart(5, "0")}
          </span>
        </span>
      </div>

      <div className="relative mt-4">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          className="block w-full touch-none outline-none"
          style={{ aspectRatio: "4 / 3" }}
        />

        {status !== "run" && (
          <button
            type="button"
            onClick={() => {
              start();
              canvasRef.current?.focus();
            }}
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3"
            style={{ background: "rgba(11,11,14,0.72)" }}
          >
            <span className="font-display text-[26px] font-semibold tracking-tight text-white sm:text-[32px]">
              {status === "idle" ? "Hextris" : `You scored ${score}`}
            </span>
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/55">
              {status === "idle"
                ? "Click or press ← → to start"
                : "Click to play again"}
            </span>
          </button>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] leading-[1.7] tracking-[0.1em] uppercase text-white/35">
        Click the board first · ← → or A D spins the hexagon · tap either side
        on touch · land three alike to clear
      </p>
      <p className="mt-2 font-mono text-[10px] leading-[1.7] tracking-[0.08em] uppercase text-white/25">
        After Hextris by Engstrom, Finucane, Moroze &amp; Yang · rebuilt from
        scratch, restyled for the vault
      </p>
    </div>
  );
}
