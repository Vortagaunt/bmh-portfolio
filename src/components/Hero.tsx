"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const macRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(120);
  const router = useRouter();

  // Secret: seven quick clicks on the Mac opens the vault gate.
  const secretRef = useRef({ count: 0, last: 0 });
  const [macPulse, setMacPulse] = useState(0);
  const onMacClick = () => {
    const now = Date.now();
    const s = secretRef.current;
    s.count = now - s.last < 1500 ? s.count + 1 : 1;
    s.last = now;
    setMacPulse((p) => p + 1);
    if (s.count >= 7) {
      s.count = 0;
      router.push("/secret");
    }
  };

  useEffect(() => {
    const fit = () => {
      const el = nameRef.current;
      if (!el) return;
      const base = 200;
      const parent = el.parentElement;
      if (!parent) return;
      // Available width = parent inner width minus its horizontal padding
      const ps = getComputedStyle(parent);
      const containerWidth =
        parent.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight);
      // Measure actual text width by temporarily switching to inline-block
      const origDisplay = el.style.display;
      const origFontSize = el.style.fontSize;
      el.style.display = "inline-block";
      el.style.fontSize = `${base}px`;
      const textWidth = el.getBoundingClientRect().width;
      el.style.display = origDisplay;
      el.style.fontSize = origFontSize;
      if (textWidth > 0) {
        setFontSize((containerWidth / textWidth) * base);
      }
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Subtle scroll-driven parallax on the hero mac
  useEffect(() => {
    const mac = macRef.current;
    if (!mac) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        // Move mac up to ~60px as user scrolls past first viewport
        const offset = Math.max(-60, -y * 0.08);
        mac.style.transform = `translate3d(0, ${offset}px, 0)`;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative pt-16 pb-16">
      {/* Name — dynamically sized to fill viewport width */}
      <div className="w-full px-5 sm:px-8">
        <h1
          ref={nameRef}
          className="hero-rise font-display whitespace-nowrap text-[#181818] leading-[0.85] block"
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            animationDelay: "3.6s",
          }}
        >
          <span
            className="font-serif italic"
            style={{ fontWeight: 400, letterSpacing: "-0.02em" }}
          >
            Bronx{" "}
          </span>
          Hanratty
        </h1>
      </div>

      {/* Below-headline content row */}
      <div className="relative mx-auto mt-10 grid max-w-[1280px] grid-cols-12 gap-6 px-5 sm:mt-12 sm:px-8">
        {/* Bio paragraph */}
        <div
          className="col-span-12 hero-rise sm:col-span-4"
          style={{ animationDelay: "3.8s" }}
        >
          <p className="text-[15px] leading-[1.5] text-[#181818] sm:text-[16px]">
            Experimental designer getting his{" "}
            <span className="font-serif italic text-[17px] tracking-[-0.01em] sm:text-[18px]">
              roots
            </span>{" "}
            in the industry of design. Currently{" "}
            <span className="font-serif italic text-[17px] tracking-[-0.01em] sm:text-[18px]">
              exploring
            </span>{" "}
            Figma and Blender.
          </p>
        </div>

        {/* Vintage Mac — revealed by IntroOverlay after it flies into position */}
        <div className="col-span-12 flex justify-center sm:col-span-5 sm:col-start-5">
          <div
            ref={macRef}
            id="hero-mac-target"
            className="relative w-full max-w-[540px] will-change-transform"
            style={{ opacity: 0 }}
          >
            <div className="float-slow">
              {/* Seventh click opens the vault gate — no pointer cursor; secrets stay secret. */}
              <div
                onClick={onMacClick}
                className={macPulse ? "mac-pulse" : undefined}
                key={macPulse}
              >
                <Image
                  src="/images/vintage-mac.webp"
                  alt="Vintage Macintosh with hello handwritten on screen"
                  width={540}
                  height={420}
                  priority
                  className="w-full h-auto select-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column — stacks tightly on mobile, justifies on desktop */}
        <div
          className="col-span-12 hero-rise flex flex-col gap-3 sm:col-span-3 sm:col-start-10 sm:justify-between sm:gap-0 sm:text-right"
          style={{ animationDelay: "4.2s" }}
        >
          <div className="text-[13px] tracking-tight text-[#181818] sm:text-[14px]">
            Designer · Visionary
          </div>
          <p className="text-[13px] leading-[1.55] text-[#181818]/85 sm:mt-auto sm:pt-12">
            Based in Sarasota, Florida;{" "}
            <span className="font-serif italic text-[15px] tracking-[-0.01em]">
              moving
            </span>{" "}
            pixels since 2020. Currently{" "}
            <span className="font-serif italic text-[15px] tracking-[-0.01em]">
              building
            </span>{" "}
            my career foundation one PSD at a time.
          </p>
        </div>
      </div>
    </section>
  );
}
