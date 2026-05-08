"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState(120);

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

  return (
    <section className="relative pt-16 pb-16">
      {/* Name — dynamically sized to fill viewport width */}
      <div className="w-full px-8">
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
      <div className="relative mx-auto mt-12 grid max-w-[1280px] px-8 grid-cols-12 gap-6">
        {/* Bio paragraph */}
        <div
          className="col-span-12 sm:col-span-4 hero-rise"
          style={{ animationDelay: "3.8s" }}
        >
          <p className="text-[16px] leading-[1.5] text-[#181818]">
            Experimental designer getting his{" "}
            <span className="font-serif italic text-[18px] tracking-[-0.01em]">
              roots
            </span>{" "}
            in the industry of design. Currently{" "}
            <span className="font-serif italic text-[18px] tracking-[-0.01em]">
              exploring
            </span>{" "}
            Figma and Blender.
          </p>
        </div>

        {/* Vintage Mac — revealed by IntroOverlay after it flies into position */}
        <div className="col-span-12 sm:col-span-5 sm:col-start-5 flex justify-center">
          <div
            id="hero-mac-target"
            className="relative w-full max-w-[540px] float-slow"
            style={{ opacity: 0 }}
          >
            <Image
              src="/images/vintage-mac.png"
              alt="Vintage Macintosh with hello handwritten on screen"
              width={540}
              height={420}
              priority
              className="w-full h-auto select-none"
            />
          </div>
        </div>

        {/* Right column */}
        <div
          className="col-span-12 sm:col-span-3 sm:col-start-10 flex flex-col justify-between text-right hero-rise"
          style={{ animationDelay: "4.2s" }}
        >
          <div className="text-[14px] text-[#181818] tracking-tight">
            Designer · Visionary
          </div>
          <p className="mt-auto pt-12 text-[13px] leading-[1.55] text-[#181818]/85">
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
