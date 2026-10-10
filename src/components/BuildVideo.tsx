"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ZoomImage } from "./ZoomImage";

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/**
 * A keynote-style "build": the video plays once, the first time it is half in
 * view, then holds on its last frame — which is the still beside it, so it
 * settles into exactly the image the page would otherwise show. Muted and
 * inline, so browsers let it start on its own; a Replay pill brings it back.
 * Anyone who asks for reduced motion gets the still (zoomable as usual).
 *
 * Fills its parent, like ZoomImage with `fill`.
 */
export function BuildVideo({ src, still, alt }: { src: string; still: string; alt: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(REDUCE).matches, () => false);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        v.play().catch(() => {});
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  if (reduced) {
    return <ZoomImage src={still} alt={alt} fill sizes="(min-width: 1024px) 800px, 100vw" className="object-cover" />;
  }

  return (
    <>
      <video
        ref={ref}
        src={src}
        muted
        playsInline
        preload="auto"
        aria-label={alt}
        onEnded={() => setEnded(true)}
        onPlay={() => setEnded(false)}
        className="absolute inset-0 h-full w-full bg-black object-cover"
      />
      {ended && (
        <button
          type="button"
          onClick={() => {
            const v = ref.current;
            if (!v) return;
            v.currentTime = 0;
            v.play().catch(() => {});
          }}
          className="absolute right-3 bottom-3 rounded-full bg-white/12 px-3 py-1.5 text-[11px] tracking-[0.18em] text-white/80 uppercase transition-colors hover:bg-white/20 hover:text-white sm:right-4 sm:bottom-4"
        >
          Replay
        </button>
      )}
    </>
  );
}
