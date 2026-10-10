"use client";

import { useState } from "react";
import { ZoomImage, type ZoomItem } from "../ZoomImage";
import DATA from "@/data/mustang-studio-templates.json";

type Template = (typeof DATA.templates)[number];

const GROUPS = ["Athletics", "Events & clubs", "News & podcast", "School & awards", "ID cards", "Seasons"] as const;

/* The app's size ids, said the way the people choosing them would say them. */
const FORMAT: Record<string, string> = {
  "ig-post": "Instagram post",
  "ig-portrait": "Instagram portrait",
  story: "Story",
  slide: "Screen slide",
  "x-header": "X header",
  "x-post": "X post",
  "fb-event": "Facebook event",
  "yt-thumb": "YouTube thumbnail",
  letter: "Letter flyer",
  half: "Half-letter flyer",
  tabloid: "Poster, 11 × 17 in",
  poster18: "Poster, 18 × 24 in",
  poster24: "Poster, 24 × 36 in",
  banner: "Fence banner, 6 × 2 ft",
  postcard: "Postcard",
  "id-v": "ID card, vertical",
  "id-h": "ID card, horizontal",
};

const format = (t: Template) => `${FORMAT[t.fmt] ?? t.fmt}${t.pages > 1 ? `, ${t.pages} pages` : ""}`;
const src = (t: Template) => `/images/lrhs-studio/templates/${t.id}.jpg`;

/**
 * Every template Mustang Studio ships with, as it opens — nothing here was
 * mocked up for the page. Filter by department; open one for its size.
 */
export function TemplateWall() {
  const [group, setGroup] = useState<string>("All");
  const [expanded, setExpanded] = useState(false);
  const all = DATA.templates;
  const shown = group === "All" ? all : all.filter((t) => t.group === group);
  // The full wall runs to nearly 3,000px; all of it opens on request.
  const clipped = group === "All" && !expanded;

  const zoomItems: ZoomItem[] = shown.map((t) => ({
    src: src(t),
    alt: `${t.name} — a Mustang Studio template`,
    title: t.name,
    medium: format(t),
    project: t.group,
  }));

  const chip = (label: string, n: number) => {
    const on = group === label;
    return (
      <button
        key={label}
        type="button"
        aria-pressed={on}
        onClick={() => setGroup(label)}
        className={`shrink-0 rounded-full px-4 py-2 text-[13.5px] font-medium tracking-tight whitespace-nowrap transition-colors duration-300 ${
          on ? "bg-white text-[#0b100d]" : "bg-white/[0.07] text-white/75 hover:bg-white/[0.12] hover:text-white"
        }`}
      >
        {label} <span className={`tabular-nums ${on ? "text-[#0b100d]/55" : "text-white/40"}`}>{n}</span>
      </button>
    );
  };

  return (
    <div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {chip("All", all.length)}
        {GROUPS.map((g) => chip(g, all.filter((t) => t.group === g).length))}
      </div>

      <div className="relative">
        <ul
          id="template-wall"
          className={`mt-8 columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-5 ${
            clipped ? "max-h-[1100px] overflow-hidden sm:max-h-[1180px]" : ""
          }`}
          aria-live="polite"
        >
          {shown.map((t, i) => (
            <li key={t.id} className="mb-3 break-inside-avoid sm:mb-4">
              <figure className="group">
                <div
                  className="relative w-full overflow-hidden rounded-[10px] bg-[#0f1411] ring-1 ring-white/[0.08]"
                  style={{ aspectRatio: `${t.w} / ${t.h}` }}
                >
                  <ZoomImage
                    src={src(t)}
                    alt={`${t.name} — a Mustang Studio template`}
                    fill
                    sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 46vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-[1.03]"
                    zoomItems={zoomItems}
                    zoomIndex={i}
                  />
                </div>
                <figcaption className="mt-2 flex flex-col">
                  <span className="text-[13px] font-medium tracking-tight text-white/90">{t.name}</span>
                  <span className="text-[12px] text-white/45">{format(t)}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {clipped && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0b100d] via-[#0b100d]/80 to-transparent"
          />
        )}
      </div>

      {clipped && (
        <div className="relative -mt-6 flex justify-center">
          <button
            type="button"
            aria-controls="template-wall"
            aria-expanded={false}
            onClick={() => setExpanded(true)}
            className="magnetic rounded-full bg-white px-5 py-2.5 text-[14px] font-medium tracking-tight text-[#0b100d] hover:bg-white/90"
          >
            Show all {all.length} templates
          </button>
        </div>
      )}
    </div>
  );
}
