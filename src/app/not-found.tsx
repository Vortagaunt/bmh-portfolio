import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "404 — Bronx Hanratty",
  description: "Sorry, a system error occurred. This page could not be found.",
};

/* The 404: a classic Mac System 7 bomb dialog, matching the
 * vintage-Macintosh motif that runs through the site. */
export default function NotFound() {
  return (
    <main className="relative isolate min-h-screen w-full bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 z-0">
        <GridBackdrop />
      </div>
      <SiteHeader />

      <div className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 pb-24 sm:px-8">
        {/* Giant outline backdrop */}
        <Reveal
          variant="fade"
          duration={1600}
          as="span"
          className="serif-outline pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap"
          style={{
            fontSize: "clamp(200px, 30vw, 420px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          404
        </Reveal>

        {/* System 7 dialog */}
        <Reveal variant="scale" delay={150} duration={1200}>
          <div
            className="relative w-[min(92vw,560px)] border-2 border-ink bg-surface"
            style={{ boxShadow: "6px 6px 0 rgba(24,24,24,0.9)" }}
          >
            {/* Title bar with pinstripes */}
            <div className="relative flex h-9 items-center justify-center border-b-2 border-ink px-3">
              <div
                aria-hidden
                className="absolute inset-x-2 top-1/2 h-[14px] -translate-y-1/2"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, var(--ink) 0 1.5px, transparent 1.5px 4px)",
                }}
              />
              <span className="relative bg-surface px-3 font-display text-[15px] font-semibold tracking-tight">
                System Error
              </span>
            </div>

            {/* Body */}
            <div className="flex items-start gap-5 p-6 sm:p-8">
              {/* Bomb icon */}
              <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" aria-hidden>
                <circle cx="20" cy="30" r="14" fill="var(--ink)" />
                <rect x="26" y="12" width="7" height="7" fill="var(--ink)" transform="rotate(35 29 15)" />
                <path d="M33 13 C37 8, 42 8, 44 12" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
                <g stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
                  <line x1="44" y1="7" x2="44" y2="10" />
                  <line x1="41" y1="9" x2="43" y2="11" />
                  <line x1="47" y1="9" x2="45" y2="11" />
                </g>
                <circle cx="15" cy="25" r="4" fill="var(--paper)" opacity=".9" />
              </svg>
              <div className="flex-1">
                <p className="text-[16px] leading-[1.5] text-ink">
                  Sorry, a system error occurred.
                </p>
                <p className="mt-2 text-[14px] leading-[1.5] text-ink/70">
                  &ldquo;this page&rdquo; could not be found.{" "}
                  <span className="font-serif italic text-[16px]">Error code: 404</span>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 px-6 pb-6 sm:px-8">
              <Link
                href="/"
                className="border-2 border-ink bg-surface px-6 py-2 font-display text-[14px] font-semibold tracking-tight transition-colors duration-300 hover:bg-ink hover:text-white"
                style={{ borderRadius: "8px", boxShadow: "0 0 0 3px white, 0 0 0 4.5px var(--ink)" }}
              >
                Restart
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal variant="up" delay={420} duration={1100}>
          <p className="mt-12 text-[13px] tracking-tight text-ink/55">
            It&apos;s not a bomb, it&apos;s a feature.
          </p>
        </Reveal>
      </div>
    </main>
  );
}
