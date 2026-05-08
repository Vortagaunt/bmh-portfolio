"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const MAC_W = 460;
const MAC_H = Math.round(MAC_W * (420 / 540)); // ~358

export function IntroOverlay() {
  const [phase, setPhase] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  // Mac fixed position (center of screen)
  const [macPos, setMacPos] = useState({ top: 0, left: 0, width: MAC_W, height: MAC_H });
  const [macMoving, setMacMoving] = useState(false);

  // Hello fixed position (starts on mac screen, flies to nav)
  const [helloPos, setHelloPos] = useState({ top: 0, left: 0, width: 0 });
  const [helloFlying, setHelloFlying] = useState(false);

  useEffect(() => {
    const macLeft = window.innerWidth / 2 - MAC_W / 2;
    const macTop = window.innerHeight / 2 - MAC_H / 2;

    setMacPos({ top: macTop, left: macLeft, width: MAC_W, height: MAC_H });

    // Hello sits on the mac screen area
    setHelloPos({
      top: macTop + MAC_H * 0.14,
      left: macLeft + MAC_W * 0.21,
      width: MAC_W * 0.56,
    });

    // Draw path
    const path = pathRef.current;
    if (path) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
    }

    const timers = [
      // Mac fades in
      setTimeout(() => setPhase(1), 400),

      // Hello draws on mac screen
      setTimeout(() => {
        setPhase(2);
        if (pathRef.current) {
          pathRef.current.style.transition =
            "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)";
          pathRef.current.style.strokeDashoffset = "0";
        }
      }, 1100),

      // Hello flies to nav bar (top-left)
      setTimeout(() => {
        setPhase(3);
        setHelloFlying(true);
        setHelloPos({ top: 16, left: 32, width: 64 });
      }, 2700),

      // Mac flies to hero position
      setTimeout(() => {
        setPhase(4);
        const target = document.getElementById("hero-mac-target");
        if (target) {
          const rect = target.getBoundingClientRect();
          setMacMoving(true);
          setMacPos({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        }
      }, 3400),

      // Overlay fades, hero mac reveals
      setTimeout(() => {
        setPhase(5);
        const target = document.getElementById("hero-mac-target");
        if (target) {
          target.style.opacity = "1";
          target.style.transition = "opacity 0.5s ease 0.2s";
        }
      }, 4200),

      // Done
      setTimeout(() => setPhase(6), 5200),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase >= 6) return null;

  return (
    <>
      {/* Black backdrop */}
      <div
        className="fixed inset-0 z-[9997] bg-black"
        style={{
          opacity: phase >= 5 ? 0 : 1,
          transition: phase >= 5 ? "opacity 0.9s ease" : undefined,
          pointerEvents: phase >= 5 ? "none" : "all",
        }}
      />

      {/* Mac — fixed, moves from center to hero position */}
      <div
        className="fixed z-[9998]"
        style={{
          top: macPos.top,
          left: macPos.left,
          width: macPos.width,
          height: macPos.height,
          opacity: phase >= 5 ? 0 : phase >= 1 ? 1 : 0,
          transition: macMoving
            ? "top 0.9s cubic-bezier(0.4,0,0.2,1), left 0.9s cubic-bezier(0.4,0,0.2,1), width 0.9s cubic-bezier(0.4,0,0.2,1), height 0.9s cubic-bezier(0.4,0,0.2,1), opacity 0.7s ease"
            : "opacity 0.9s ease, transform 0.9s ease",
          transform: !macMoving ? (phase >= 1 ? "translateY(0px)" : "translateY(28px)") : undefined,
        }}
      >
        <Image
          src="/images/vintage-mac.png"
          alt=""
          width={540}
          height={420}
          priority
          className="w-full h-auto select-none pointer-events-none"
        />
      </div>

      {/* Hello — separate fixed element, starts on mac screen, flies to nav */}
      <div
        className="fixed z-[9999]"
        style={{
          top: helloPos.top,
          left: helloPos.left,
          width: helloPos.width,
          color: helloFlying ? "white" : "#1c1c1c",
          opacity: phase >= 5 ? 0 : phase >= 2 ? 1 : 0,
          transition: helloFlying
            ? "top 0.9s cubic-bezier(0.4,0,0.2,1), left 0.9s cubic-bezier(0.4,0,0.2,1), width 0.9s cubic-bezier(0.4,0,0.2,1), color 0.5s ease, opacity 0.7s ease"
            : "opacity 0.4s ease",
        }}
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
