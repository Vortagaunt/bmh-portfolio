"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { ZoomImage } from "./ZoomImage";

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/**
 * A silent loop, like a GIF but a fraction of the weight: it plays while it
 * is on screen and pauses when it scrolls away, so a wall of them doesn't
 * run all at once. Nothing downloads until it comes near the viewport.
 * Anyone who asks for reduced motion gets the poster (zoomable as usual).
 *
 * Fills its parent, like ZoomImage with `fill`.
 */
export function LoopVideo({
  src,
  poster,
  alt,
  sizes = "(min-width: 1024px) 800px, 100vw",
}: {
  src: string;
  poster: string;
  alt: string;
  sizes?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(REDUCE).matches, () => false);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload !== "auto") v.preload = "auto";
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  if (reduced) {
    return <ZoomImage src={poster} alt={alt} fill sizes={sizes} className="object-cover" />;
  }

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={alt}
      className="absolute inset-0 h-full w-full bg-[#033922] object-cover"
    />
  );
}
