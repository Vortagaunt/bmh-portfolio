"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

/**
 * Brick — the classic iPod game, rendered on a canvas that fills the iPod
 * screen. All game state lives in refs (zero React re-renders per frame).
 *
 * Controlled through `apiRef` by the click wheel:
 *   spin(deltaDeg)  — move the paddle (smooth, proportional to wheel angle)
 *   press()         — serve / pause / restart
 */
export type BrickApi = { spin: (deltaDeg: number) => void; press: () => void };

const COLS = 7;
const ROWS = 4;

export function BrickGame({ apiRef }: { apiRef: MutableRefObject<BrickApi | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* --- sizing --- */
    let W = 320, H = 240, dpr = 1;
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(120, r.width);
      H = Math.max(90, r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    /* --- game state (all in closure) --- */
    type Mode = "ready" | "run" | "over" | "win";
    let mode: Mode = "ready";
    let paddleX = 0.5; // center, normalized 0..1
    let ball = { x: 0.5, y: 0.7, vx: 0.32, vy: -0.5 }; // normalized units/sec
    let bricks: boolean[] = [];
    let score = 0, lives = 3, level = 1, speed = 1;

    const resetWall = () => { bricks = Array(COLS * ROWS).fill(true); };
    const resetBall = () => { ball = { x: paddleX, y: 0.72, vx: 0.32, vy: -0.5 }; mode = "ready"; };
    const fullReset = () => { score = 0; lives = 3; level = 1; speed = 1; paddleX = 0.5; resetWall(); resetBall(); };
    fullReset();

    /* --- wheel API --- */
    apiRef.current = {
      spin: (d) => {
        paddleX = Math.min(1, Math.max(0, paddleX + d * 0.004));
        if (mode === "ready") ball.x = paddleX;
      },
      press: () => {
        if (mode === "ready") mode = "run";
        else if (mode === "run") mode = "ready" as Mode; // soft pause: ball re-serves from paddle
        else if (mode === "over" || mode === "win") fullReset();
        if (mode === "ready") { ball.y = 0.72; ball.x = paddleX; }
      },
    };

    /* --- geometry (normalized) --- */
    const HUD_H = 0.09;
    const BRICK_TOP = 0.13, BRICK_BOT = 0.42, GAP = 0.012;
    const PADDLE_Y = 0.92, PADDLE_W = 0.2, PADDLE_H = 0.028;
    const R = 0.016; // ball radius (of height)

    const brickRect = (i: number) => {
      const c = i % COLS, r = Math.floor(i / COLS);
      const bw = (1 - GAP * (COLS + 1)) / COLS;
      const bh = (BRICK_BOT - BRICK_TOP - GAP * (ROWS - 1)) / ROWS;
      return { x: GAP + c * (bw + GAP), y: BRICK_TOP + r * (bh + GAP), w: bw, h: bh, row: r };
    };

    /* --- loop --- */
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      if (mode === "run") {
        ball.x += ball.vx * speed * dt;
        ball.y += ball.vy * speed * dt;
        // walls
        if (ball.x < R) { ball.x = R; ball.vx = Math.abs(ball.vx); }
        if (ball.x > 1 - R) { ball.x = 1 - R; ball.vx = -Math.abs(ball.vx); }
        if (ball.y < HUD_H + R) { ball.y = HUD_H + R; ball.vy = Math.abs(ball.vy); }
        // paddle
        if (ball.vy > 0 && ball.y > PADDLE_Y - R && ball.y < PADDLE_Y + PADDLE_H &&
            Math.abs(ball.x - paddleX) < PADDLE_W / 2 + R) {
          const off = (ball.x - paddleX) / (PADDLE_W / 2); // -1..1
          const ang = off * 1.05; // radians-ish steering
          const sp = Math.hypot(ball.vx, ball.vy);
          ball.vx = Math.sin(ang) * sp;
          ball.vy = -Math.abs(Math.cos(ang) * sp);
          ball.y = PADDLE_Y - R;
        }
        // death
        if (ball.y > 1 + R * 2) {
          lives -= 1;
          if (lives <= 0) mode = "over";
          else resetBall();
        }
        // bricks
        for (let i = 0; i < bricks.length; i++) {
          if (!bricks[i]) continue;
          const b = brickRect(i);
          if (ball.x > b.x - R && ball.x < b.x + b.w + R && ball.y > b.y - R && ball.y < b.y + b.h + R) {
            bricks[i] = false;
            score += 10 * level;
            // reflect on the shallower penetration axis
            const dx = Math.min(ball.x - (b.x - R), b.x + b.w + R - ball.x);
            const dy = Math.min(ball.y - (b.y - R), b.y + b.h + R - ball.y);
            if (dx < dy) ball.vx = -ball.vx; else ball.vy = -ball.vy;
            break;
          }
        }
        if (bricks.every((b) => !b)) {
          level += 1;
          if (level > 5) { mode = "win"; }
          else { speed *= 1.12; resetWall(); resetBall(); }
        }
      } else if (mode === "ready") {
        ball.x = paddleX;
        ball.y = 0.72;
      }

      /* --- draw --- */
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0b0b0e";
      ctx.fillRect(0, 0, W, H);

      // HUD
      ctx.fillStyle = "rgba(241,241,241,0.9)";
      ctx.font = `600 ${Math.max(9, H * 0.055)}px ui-monospace, monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE ${String(score).padStart(4, "0")}`, W * 0.03, H * HUD_H * 0.55);
      ctx.textAlign = "right";
      ctx.fillText(`LV${level}`, W * 0.7, H * HUD_H * 0.55);
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = i < lives ? 1 : 0.22;
        ctx.fillRect(W * (0.76 + i * 0.07), H * HUD_H * 0.55 - H * 0.014, H * 0.028, H * 0.028);
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = "rgba(241,241,241,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, H * HUD_H); ctx.lineTo(W, H * HUD_H); ctx.stroke();

      // bricks
      const rowAlpha = [0.95, 0.8, 0.62, 0.46];
      for (let i = 0; i < bricks.length; i++) {
        if (!bricks[i]) continue;
        const b = brickRect(i);
        ctx.fillStyle = `rgba(241,241,241,${rowAlpha[b.row] ?? 0.5})`;
        ctx.fillRect(b.x * W, b.y * H, b.w * W, b.h * H);
      }

      // paddle
      ctx.fillStyle = "#f1f1f1";
      const pw = PADDLE_W * W, ph = Math.max(3, PADDLE_H * H);
      ctx.beginPath();
      ctx.roundRect((paddleX - PADDLE_W / 2) * W, PADDLE_Y * H, pw, ph, ph / 2);
      ctx.fill();

      // ball
      ctx.beginPath();
      ctx.arc(ball.x * W, ball.y * H, Math.max(2.5, R * H), 0, Math.PI * 2);
      ctx.fill();

      // overlays
      if (mode !== "run") {
        ctx.fillStyle = "rgba(11,11,14,0.55)";
        ctx.fillRect(0, H * 0.46, W, H * 0.22);
        ctx.fillStyle = "#f1f1f1";
        ctx.textAlign = "center";
        ctx.font = `700 ${Math.max(12, H * 0.075)}px ui-monospace, monospace`;
        const msg = mode === "ready" ? "PRESS ⏺ TO SERVE" : mode === "over" ? "GAME OVER" : "YOU WIN!";
        ctx.fillText(msg, W / 2, H * 0.545);
        if (mode !== "ready") {
          ctx.font = `500 ${Math.max(9, H * 0.05)}px ui-monospace, monospace`;
          ctx.fillText("press center to restart", W / 2, H * 0.625);
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      apiRef.current = null;
    };
  }, [apiRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
