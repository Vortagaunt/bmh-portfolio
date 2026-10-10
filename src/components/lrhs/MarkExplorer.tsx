"use client";

import Image from "next/image";
import { useState } from "react";
import { ZoomImage, type ZoomItem } from "../ZoomImage";

export type LrhsFamily = { id: string; name: string; dept: string; hero: string; blurb: string };
export type LrhsMark = {
  file: string;
  family?: string;
  name: string;
  use?: string | null;
  ground?: string | null;
  note?: string;
};

const GREEN = "#033922";
const PAPER = "#F4F4F2";
const src = (file: string) => `/images/lrhs-marks/${encodeURI(file)}`;

/**
 * The mark library, browsable by department. The eight family cards are the
 * filter: pick one and the grid below shows only its marks. Every tile opens
 * the lightbox with what the mark is for, straight from the catalogue
 * (src/data/lrhs-marks.json) — the same notes the deck and the PDF print.
 */
export function MarkExplorer({
  families,
  marks,
  retired,
}: {
  families: LrhsFamily[];
  marks: LrhsMark[];
  retired: LrhsMark[];
}) {
  const [filter, setFilter] = useState<string>("all");

  const count = (id: string) => marks.filter((m) => m.family === id).length;
  const familyName = (id?: string) => families.find((f) => f.id === id)?.name;
  const heroGround = (file: string) => marks.find((m) => m.file === file)?.ground === "dark";

  const shown =
    filter === "all" ? marks : filter === "retired" ? retired : marks.filter((m) => m.family === filter);
  const active = families.find((f) => f.id === filter);

  const zoomItems: ZoomItem[] = shown.map((m) => ({
    src: src(m.file),
    alt: m.use ? `${m.use} — ${familyName(m.family) ?? "LRHS"}` : "Retired — kept for reference",
    title: m.name,
    project: m.family ? `${familyName(m.family)} · ${families.find((f) => f.id === m.family)?.dept}` : "Retired artwork",
    description: m.note,
    panel: m.ground === "dark" ? "green" : "paper",
  }));

  const toolbarBtn = (on: boolean) =>
    `rounded-full px-4 py-2 text-[13px] font-medium tracking-tight transition-colors duration-300 ${
      on ? "bg-ink text-paper" : "glass text-ink hover:bg-ink/[0.06]"
    }`;

  return (
    <div>
      {/* Family cards — each one is a filter */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {families.map((f) => {
          const on = filter === f.id;
          const dark = heroGround(f.hero);
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(on ? "all" : f.id)}
              className={`group flex flex-col rounded-[22px] p-2 text-left transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(.2,.7,.1,1)] hover:-translate-y-0.5 ${
                on ? "bg-[#033922] text-white shadow-[0_18px_40px_-18px_rgba(3,57,34,0.8)]" : "glass text-ink"
              }`}
            >
              <span
                className="relative block w-full overflow-hidden rounded-[16px]"
                style={{ aspectRatio: "4 / 3", background: dark ? GREEN : PAPER }}
              >
                <Image
                  src={src(f.hero)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 300px, 45vw"
                  className="object-contain p-[14%] transition-transform duration-700 ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-[1.04]"
                />
              </span>
              <span className="flex items-baseline justify-between gap-3 px-2 pt-3">
                <span className="font-display text-[17px] font-semibold tracking-[-0.02em] sm:text-[19px]">{f.name}</span>
                <span className={`text-[13px] tabular-nums ${on ? "text-white/70" : "text-ink/55"}`}>{count(f.id)}</span>
              </span>
              <span className={`px-2 pt-1 pb-2 text-[13px] leading-[1.4] ${on ? "text-white/75" : "text-ink/65"}`}>{f.dept}</span>
            </button>
          );
        })}
      </div>

      {/* What's showing, and the two ways out of a filter */}
      <div className="mt-10 flex flex-col gap-4 sm:mt-14 sm:flex-row sm:items-end sm:justify-between">
        <div aria-live="polite">
          <p className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">
            {filter === "all"
              ? `All ${marks.length} marks`
              : filter === "retired"
                ? `${retired.length} retired drawings`
                : `${active?.name}: ${shown.length} ${shown.length === 1 ? "mark" : "marks"}`}
          </p>
          <p className="mt-1 max-w-[60ch] text-[15px] leading-[1.5] text-ink/65">
            {filter === "all"
              ? "Use the supplied SVGs only — never redraw, recolour or stretch them. Open any mark to see what it's for."
              : filter === "retired"
                ? "The drawings the system replaces, kept on file so they can be recognised and swapped out. Not for new work."
                : active?.blurb}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")} className={toolbarBtn(filter === "all")}>
            All {marks.length}
          </button>
          <button
            type="button"
            aria-pressed={filter === "retired"}
            onClick={() => setFilter("retired")}
            className={toolbarBtn(filter === "retired")}
          >
            Retired {retired.length}
          </button>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {shown.map((m, i) => (
          <li key={m.file}>
            <figure className="group flex flex-col">
              <div
                className="media-elevated relative w-full overflow-hidden"
                style={{ aspectRatio: "1 / 1", background: m.ground === "dark" ? GREEN : PAPER }}
              >
                <ZoomImage
                  src={src(m.file)}
                  alt={m.name}
                  fill
                  sizes="(min-width: 1024px) 260px, (min-width: 640px) 33vw, 50vw"
                  className={`object-contain p-[16%] transition-transform duration-700 ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-[1.04] ${
                    filter === "retired" ? "opacity-80 grayscale-[35%]" : ""
                  }`}
                  zoomItems={zoomItems}
                  zoomIndex={i}
                />
              </div>
              <figcaption className="mt-3 flex flex-col gap-0.5">
                <span className="text-[14px] font-medium tracking-tight text-ink">{m.name}</span>
                <span className="text-[12.5px] text-ink/55">{m.use ?? "Retired"}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
