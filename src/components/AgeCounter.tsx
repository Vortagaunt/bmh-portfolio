"use client";

import { useEffect, useRef } from "react";

/* 9:03 AM EST, 16 February 2012. */
const BIRTH = Date.parse("2012-02-16T09:03:00-05:00");
const YEAR_MS = 365.2425 * 86_400_000;

const ageAt = (now: number) => ((now - BIRTH) / YEAR_MS).toFixed(9);

/**
 * A live "exact age" line: "14.686123456 years old".
 *
 * Static export: the server renders a fixed placeholder and the ticking only
 * starts in useEffect, so server and client HTML always match. The number is
 * written straight into its span rather than through state, so nothing
 * re-renders 60 times a second. With prefers-reduced-motion it updates once a
 * second instead of every frame, and it follows the setting if it changes.
 *
 * The placeholder only shows until JavaScript runs; bump it after each
 * birthday (next: 16 Feb 2027).
 */
export function AgeCounter({ className }: { className?: string }) {
  const num = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = num.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let timer = 0;

    const paint = () => {
      el.textContent = ageAt(Date.now());
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
    };
    const start = () => {
      stop();
      paint();
      if (reduce.matches) {
        timer = window.setInterval(paint, 1000);
      } else {
        const loop = () => {
          paint();
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      }
    };

    start();
    reduce.addEventListener("change", start);
    return () => {
      stop();
      reduce.removeEventListener("change", start);
    };
  }, []);

  return (
    <p className={`tabular-nums ${className ?? ""}`}>
      <span ref={num}>14.…</span> years old
    </p>
  );
}
