"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function IntroOverlay() {
  const [phase, setPhase] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (path) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
    }

    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => {
        setPhase(2);
        if (pathRef.current) {
          pathRef.current.style.transition =
            "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)";
          pathRef.current.style.strokeDashoffset = "0";
        }
      }, 1200),
      setTimeout(() => setPhase(3), 2700),
      setTimeout(() => setPhase(4), 3500),
      setTimeout(() => setPhase(5), 4400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase >= 5) return null;

  const overlayFading = phase >= 4;
  const helloAtCorner = phase >= 3;

  return (
    <>
      {/* Black backdrop */}
      <div
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black"
        style={{
          opacity: overlayFading ? 0 : 1,
          transition: overlayFading ? "opacity 0.9s ease" : undefined,
          pointerEvents: overlayFading ? "none" : "all",
        }}
      >
        <Image
          src="/images/vintage-mac.png"
          alt=""
          width={300}
          height={234}
          priority
          className="select-none"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "translateY(0px)" : "translateY(24px)",
            transition: "opacity 0.9s ease, transform 0.9s ease",
          }}
        />
      </div>

      {/* Hello handwriting — separate fixed element so overlay opacity doesn't affect it */}
      <div
        className="fixed z-[9999] text-white"
        style={
          helloAtCorner
            ? {
                top: "16px",
                left: "32px",
                width: "64px",
                opacity: overlayFading ? 0 : 1,
                transition:
                  "top 0.9s cubic-bezier(0.4,0,0.2,1), left 0.9s cubic-bezier(0.4,0,0.2,1), width 0.9s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease",
              }
            : {
                top: "calc(50vh - 185px)",
                left: "calc(50vw - 90px)",
                width: "180px",
                opacity: phase >= 2 ? 1 : 0,
                transition: "opacity 0.4s ease",
              }
        }
      >
        <svg
          viewBox="0 0 267 97"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-auto w-full"
        >
          <path
            ref={pathRef}
            d="M 0 74.325 C 18.167 62.158 43.5 45.44 51.5 23.39 C 58.492 4.119 50.501 -5.108 42.5 2.873 C 31 14.344 32.5 56.886 29 84.825 C 30.167 70.194 35.5 46.045 54.5 46.825 C 71.5 47.523 51.613 80.809 65 84.825 C 91.667 92.825 117 45.325 98.5 45.325 C 84.5 45.325 69.5 80.959 98.5 84.825 C 132.25 89.325 157 8.325 139 8.325 C 124 8.325 109 81.325 136.5 83.325 C 173.618 86.025 194.5 11.325 177 9.325 C 159.5 7.325 147 83.5 173.5 83.5 C 194.155 83.5 192 63.386 212.5 48.386 C 204 51.386 184.012 77.95 209.5 85 C 234.425 88.012 239.5 45.325 219.5 46.825 C 207.025 47.761 221 72.825 257 49.325"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(5 5)"
          />
        </svg>
      </div>
    </>
  );
}
