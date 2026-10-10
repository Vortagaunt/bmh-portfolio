"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ZoomImage } from "../ZoomImage";

type Stop = { id: string; label: string; text: string; alt: string };

/* Real screens from Mustang Studio 1.6 (assets/studio/ui-*.jpg, cut to 1920
   wide in public/images/lrhs-studio). */
const STOPS: Stop[] = [
  {
    id: "templates",
    label: "Pick a template",
    text: "Forty-one of them, sorted by department and season. The ones for whoever's using it — a coach, the band, the front office — come first.",
    alt: "Mustang Studio with the templates panel open beside a game-day post",
  },
  {
    id: "edit",
    label: "Change the words",
    text: "Click the headline and type. The type styles, colours and marks are the brand's own, so there's nothing to set and nothing to get wrong.",
    alt: "Mustang Studio editing the headline of a game-day post, with the brand's text styles in the side panel",
  },
  {
    id: "fill",
    label: "Fill in the blanks",
    text: "Turns a design into a short form. Type the opponent, the date and the place; the layout stays exactly as it was drawn.",
    alt: "Fill-in-the-blanks mode: a form of labelled fields beside the post it fills",
  },
  {
    id: "batch",
    label: "Make a batch",
    text: "Paste a spreadsheet and make every version at once — a staff list becomes every ID card, ganged on Letter sheets with cut marks.",
    alt: "Batch from a spreadsheet: columns matched to fields, with a preview row of staff ID cards",
  },
  {
    id: "carousel",
    label: "Add pages",
    text: "Designs can have pages. An Instagram carousel exports as a ZIP, a newsletter as one PDF.",
    alt: "A four-page game recap carousel, with the page strip along the bottom",
  },
  {
    id: "seasons",
    label: "Switch the season",
    text: "Homecoming, Pink Out, Halloween and winter each bring two planned colours that the brand check accepts.",
    alt: "The seasons panel with Homecoming, Pink Out, Halloween and winter templates",
  },
  {
    id: "sizes",
    label: "Resize it",
    text: "Seventeen sizes, from an Instagram story to a 24 × 36 poster and a six-foot fence banner.",
    alt: "The change-size dialog listing social, screen and print sizes",
  },
  {
    id: "export",
    label: "Export",
    text: "PNG, JPG, PDF, MP4 or GIF. Print sizes come out as print-ready PDFs at 300 dpi, with bleed and crop marks when the print shop wants them.",
    alt: "The export dialog with PNG, JPG, PDF, video and GIF options",
  },
];

const img = (id: string) => `/images/lrhs-studio/ui-${id}.jpg`;

/**
 * A short tour of the app in its own screenshots. A proper tab set: arrow
 * keys move between stops, Home and End jump to the ends.
 */
export function StudioTour() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const stop = STOPS[active];

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = STOPS.length - 1;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? active === last ? 0 : active + 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? active === 0 ? last : active - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
      <div
        role="tablist"
        aria-label="Mustang Studio, step by step"
        aria-orientation="vertical"
        onKeyDown={onKey}
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:col-span-4 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0"
      >
        {STOPS.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`studio-tab-${s.id}`}
              aria-selected={on}
              aria-controls="studio-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-full px-4 py-2 text-left text-[14px] font-medium tracking-tight whitespace-nowrap transition-colors duration-300 lg:flex lg:items-center lg:gap-3 lg:rounded-[14px] lg:px-4 lg:py-3 lg:text-[16px] ${
                on ? "bg-white text-[#0b100d]" : "bg-white/[0.06] text-white/75 hover:bg-white/[0.1] hover:text-white lg:bg-transparent"
              }`}
            >
              <span
                aria-hidden
                className={`hidden h-2 w-2 shrink-0 rounded-full lg:inline-block ${on ? "bg-[#2EA866]" : "bg-white/25"}`}
              />
              {s.label}
            </button>
          );
        })}
      </div>

      <div
        id="studio-panel"
        role="tabpanel"
        aria-labelledby={`studio-tab-${stop.id}`}
        className="lg:col-span-8"
      >
        <div
          className="relative w-full overflow-hidden rounded-[14px] bg-[#0f1411] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
          style={{ aspectRatio: "16 / 10" }}
        >
          <ZoomImage
            key={stop.id}
            src={img(stop.id)}
            alt={stop.alt}
            fill
            sizes="(min-width: 1024px) 860px, 100vw"
            className="animate-in fade-in object-cover duration-500"
            zoomItems={STOPS.map((s) => ({ src: img(s.id), alt: s.alt }))}
            zoomIndex={active}
          />
        </div>
        <p className="mt-5 max-w-[62ch] text-[16px] leading-[1.55] text-white/75 sm:text-[17px]" aria-live="polite">
          <span className="font-medium text-white">{stop.label}.</span> {stop.text}
        </p>
      </div>
    </div>
  );
}
