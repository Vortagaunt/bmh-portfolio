"use client";

import Image from "next/image";

export function Hero() {
  return (
    <section className="relative pt-16 pb-16">
      {/* Name — fixed size */}
      <div className="w-full overflow-hidden px-2">
        <h1
          className="hero-rise font-display whitespace-nowrap text-[#181818] leading-[0.85] block"
          style={{
            fontSize: "123.17262830482115px",
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
