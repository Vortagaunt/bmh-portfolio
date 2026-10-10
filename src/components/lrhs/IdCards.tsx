"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { ZoomImage, type ZoomItem } from "../ZoomImage";

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

type Card = { src: string; alt: string; title: string; w: number; h: number };

const STUDENT: Card[] = [
  {
    src: "/images/lrhs-ids/student-front.png",
    alt: "Student ID front — photo, name, grade and barcode",
    title: "Student ID · front",
    w: 1007,
    h: 1600,
  },
  {
    src: "/images/lrhs-ids/student-back.png",
    alt: "Student ID back — the 24/7 support lines and the return address",
    title: "Student ID · back",
    w: 1007,
    h: 1600,
  },
];
const STAFF: Card[] = [
  {
    src: "/images/lrhs-ids/staff-front.png",
    alt: "Staff ID front — full Mustang Green, with photo, name, title and department",
    title: "Staff ID · front",
    w: 1600,
    h: 1007,
  },
  {
    src: "/images/lrhs-ids/staff-back.png",
    alt: "Staff ID back — return address, support lines and an employee ID",
    title: "Staff ID · back",
    w: 1600,
    h: 1007,
  },
];
const ALL = [...STUDENT, ...STAFF];
const zoomItems: ZoomItem[] = ALL.map((c) => ({ src: c.src, alt: c.alt, title: c.title }));

/**
 * The deck's ID slides, on the page: both pairs rise as a stack, spread and
 * straighten the first time they're in view — the same build the PowerPoint
 * plays. Reduced motion gets the cards already laid out.
 */
export function IdCards() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(REDUCE).matches, () => false);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reduced]);

  const settled = inView || reduced;

  /* Each pair starts as one stack in the middle of its row: the front card
     slides in from the right of the gap, the back from the left. */
  const motion = (side: "front" | "back", delay: number): CSSProperties => ({
    transform: settled
      ? "translate3d(0,0,0) rotate(0deg)"
      : side === "front"
        ? "translate3d(52%, 14%, 0) rotate(-7deg)"
        : "translate3d(-52%, 18%, 0) rotate(6deg)",
    opacity: settled ? 1 : 0,
    transition: reduced
      ? undefined
      : `transform 1.25s cubic-bezier(.2,.7,.1,1) ${delay}ms, opacity .7s ease ${delay}ms`,
  });

  const card = (c: Card, side: "front" | "back", delay: number, width: string) => (
    <div
      key={c.src}
      className={`relative ${width} drop-shadow-[0_22px_34px_rgba(0,0,0,0.45)]`}
      style={{ ...motion(side, delay), aspectRatio: `${c.w} / ${c.h}`, zIndex: side === "front" ? 2 : 1 }}
    >
      <ZoomImage
        src={c.src}
        alt={c.alt}
        fill
        sizes="(min-width: 1024px) 420px, 45vw"
        className="object-contain"
        zoomItems={zoomItems}
        zoomIndex={ALL.indexOf(c)}
      />
    </div>
  );

  return (
    <div ref={ref} className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.35fr] lg:items-center lg:gap-10">
      <figure className="flex flex-col items-center">
        <div className="flex w-full justify-center gap-4 sm:gap-7">
          {card(STUDENT[0], "front", 0, "w-[44%] max-w-[250px]")}
          {card(STUDENT[1], "back", 110, "w-[44%] max-w-[250px]")}
        </div>
        <figcaption className="mt-8 text-center">
          <span className="block font-display text-[19px] font-semibold tracking-[-0.02em] text-white">Student ID</span>
          <span className="mt-1 block text-[14px] text-white/65">Vertical, for the lanyard. Front and back.</span>
        </figcaption>
      </figure>

      <figure className="flex flex-col items-center">
        <div className="flex w-full flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-6">
          {card(STAFF[0], "front", 260, "w-[82%] max-w-[400px] sm:w-[48%]")}
          {card(STAFF[1], "back", 370, "w-[82%] max-w-[400px] sm:w-[48%]")}
        </div>
        <figcaption className="mt-8 text-center">
          <span className="block font-display text-[19px] font-semibold tracking-[-0.02em] text-white">Staff ID</span>
          <span className="mt-1 block text-[14px] text-white/65">Horizontal and full green. Front and back.</span>
        </figcaption>
      </figure>
    </div>
  );
}
