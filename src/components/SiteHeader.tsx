"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HelloHandwritingIcon, SparkleIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Two headers in one, swapped at the first scroll.
 *
 * At the top of the page the bar is transparent and blended with
 * mix-blend-mode: difference, which is the site's own trick and looks great
 * over flat paper. The moment content scrolls underneath it that trick
 * breaks down — over the yearbook cover the nav was very nearly unreadable —
 * so past the threshold the blend is dropped and a floating glass bar fades
 * in behind the same content.
 *
 * The swap is invisible because the two states resolve to almost the same
 * colour: white through difference over #f1f1f1 paper is #0e0e0e, and --ink
 * is #181818. Dark theme lands equally close. So only the glass moves.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // One colour for both states — see the note above on why this doesn't pop.
  const tone = scrolled ? "text-ink" : "text-white";

  return (
    <header
      className="sticky top-0 z-50 h-16 w-full"
      style={{ mixBlendMode: scrolled ? "normal" : "difference" }}
    >
      {/* The glass bar. Small and fixed-height, so frosting it is cheap —
          this is the one place .glass-frost is used. */}
      <div
        aria-hidden
        className={`glass glass-frost pointer-events-none absolute inset-x-2 inset-y-1.5 rounded-[20px] transition-[opacity,transform] duration-500 ease-[cubic-bezier(.2,.7,.1,1)] sm:inset-x-4 sm:inset-y-2 ${
          scrolled ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
        }`}
      />

      {/* Side columns match each other so the centre nav stays centred. They
          widened from 160px when the theme toggle joined "Open to work" —
          at 160 the label wrapped onto two lines. On phones they size to
          their contents instead, which is tighter than a fixed third. */}
      <div className="relative grid h-full grid-cols-[auto_1fr_auto] items-center px-0 sm:grid-cols-[210px_1fr_210px]">
        {/* Logo */}
        <div className="flex items-center justify-start pl-5 sm:pl-8">
          <Link
            href="/"
            aria-label="Home"
            className={`block w-[56px] transition-colors duration-500 sm:w-[64px] ${tone}`}
          >
            <HelloHandwritingIcon className="h-auto w-full" />
          </Link>
        </div>

        {/* Center nav — hidden on mobile to save space */}
        <nav
          className={`hidden items-center justify-center gap-6 text-[14px] transition-colors duration-500 sm:flex sm:gap-10 sm:text-[15px] ${tone}`}
        >
          <Link href="#works" className="link-underline magnetic font-medium tracking-tight">
            (Works)
          </Link>
          <Link href="#about-me" className="link-underline magnetic font-medium tracking-tight">
            (About)
          </Link>
          <Link href="#about-me" className="link-underline magnetic font-medium tracking-tight">
            (Contact)
          </Link>
        </nav>

        {/* Mobile-only compact nav (center column on phones) */}
        <nav
          className={`flex items-center justify-center gap-4 text-[13px] transition-colors duration-500 sm:hidden ${tone}`}
        >
          <Link href="#works" className="link-underline font-medium tracking-tight">
            (Works)
          </Link>
          <Link href="#about-me" className="link-underline font-medium tracking-tight">
            (About)
          </Link>
        </nav>

        {/* Right — Open to work (shortened on mobile) */}
        <div
          className={`flex items-center justify-end gap-2 pr-5 text-[12px] whitespace-nowrap transition-colors duration-500 sm:gap-4 sm:pr-8 sm:text-[14px] ${tone}`}
        >
          <span className="magnetic inline-flex items-center gap-1.5">
            <SparkleIcon className="h-3 w-3 shrink-0 transition-transform duration-700 hover:rotate-90 sm:h-3.5 sm:w-3.5" />
            <span className="font-medium tracking-tight">
              <span className="hidden sm:inline">Open to work</span>
              <span className="sm:hidden">Available</span>
            </span>
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
