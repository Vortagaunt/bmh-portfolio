"use client";

import { useEffect, useState } from "react";

type Swatch = { name: string; hex: string; role: string; share: number; light?: boolean };

/* From the brand guidelines (public/lrhs-brand-refresh.html). `share` is how
   much of a typical piece each colour covers — green leads, red stays rare —
   and it sets each swatch's width, so the strip reads as the rule itself. */
const SWATCHES: Swatch[] = [
  { name: "Mustang Green", hex: "#033922", role: "Leads everything", share: 44 },
  { name: "Field Green", hex: "#144B2C", role: "Depth", share: 14 },
  { name: "Bright Pine", hex: "#1C6E40", role: "Accents", share: 10 },
  { name: "Spirit Red", hex: "#AA2121", role: "Game day only", share: 5 },
  { name: "Ink", hex: "#0B0B0B", role: "Type and contrast", share: 13 },
  { name: "Paper", hex: "#FBFBF9", role: "Ground", share: 14, light: true },
];

/** The palette at its working proportions. Click a colour to copy its hex. */
export function Swatches() {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="media-elevated flex flex-col overflow-hidden md:h-[320px] md:flex-row">
      {SWATCHES.map((s) => (
        <button
          key={s.hex}
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(s.hex).then(
              () => setCopied(s.hex),
              () => {},
            );
          }}
          aria-label={`${s.name}, ${s.hex}. Copy the hex code`}
          className={`group relative flex min-h-[84px] flex-col justify-end p-4 text-left transition-[flex-grow] duration-500 ease-[cubic-bezier(.2,.7,.1,1)] md:min-h-0 md:min-w-[104px] md:p-5 ${
            s.light ? "text-[#0B0B0B]" : "text-white"
          }`}
          style={{ background: s.hex, flexGrow: s.share, flexBasis: 0 }}
        >
          <span className="text-[15px] leading-tight font-medium tracking-tight">{s.name}</span>
          <span className={`mt-0.5 text-[12.5px] tabular-nums ${s.light ? "text-black/55" : "text-white/65"}`}>
            {copied === s.hex ? "Copied" : s.hex}
            <span className="md:hidden"> · {s.role}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
