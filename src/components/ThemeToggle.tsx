"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "bmh-theme";

/**
 * Light/dark switch for the paper surfaces.
 *
 * The class is put on <html> by a blocking script in the layout before first
 * paint, so this component only ever has to read what's already true — it
 * never decides the theme on mount, which is what causes the white flash.
 *
 * The mark is a circle with one half filled that spins 180° on the flip. It
 * inherits currentColor, so the header's mix-blend-mode: difference keeps it
 * legible over whatever it happens to be sitting on.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setDark(document.documentElement.classList.contains("dark")),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  // Track the OS for as long as the visitor hasn't overridden it themselves.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(KEY)) return;
      } catch {
        return;
      }
      document.documentElement.classList.toggle("dark", e.matches);
      setDark(e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem(KEY, next ? "dark" : "light");
      } catch {
        /* private mode — the theme just won't persist */
      }
      return next;
    });
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light" : "Dark"}
      className="magnetic inline-flex h-7 w-7 items-center justify-center"
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-[17px] w-[17px]">
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M12 3 A9 9 0 0 0 12 21 Z"
          fill="currentColor"
          style={{
            transformOrigin: "12px 12px",
            transform: `rotate(${dark ? 180 : 0}deg)`,
            transition: "transform .55s cubic-bezier(.2,.7,.1,1)",
          }}
        />
      </svg>
    </button>
  );
}
