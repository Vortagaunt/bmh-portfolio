"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  FlaskConical,
  Flag,
  GraduationCap,
  Heart,
  MapPin,
  Megaphone,
  Music,
  Shield,
  Star,
  Ticket,
  Trophy,
  Users,
  X,
} from "lucide-react";
import LRHS_MARKS from "@/data/lrhs-marks.json";
import LRHS_HOLIDAYS from "@/data/lrhs-holidays.json";
import { ZoomImage, type ZoomItem } from "../../ZoomImage";
import { CompareSlider } from "../CompareSlider";
import { IB, IB_CAP, type IbPhrase } from "./ib-type";
import s from "./guidelines.module.css";

/* ── Data ──────────────────────────────────────────────────────────────
   Everything countable comes from the mark catalogue, like the deck and the
   case study, so the three can't disagree. The words are the deck's own
   (deck/slides-lrhs.js). Mustang Studio is deliberately not on this page: it
   is public, and the app is still the surprise. */

type Tone = "green" | "ink" | "paper" | "mist";
type SceneInfo = { id: string; label: string; chapter: string; tone: Tone };

const SCENES: SceneInfo[] = [
  { id: "top", label: "Lakewood Ranch High School", chapter: "Brand guidelines", tone: "green" },
  { id: "lockup", label: "The core lockup", chapter: "Identity", tone: "paper" },
  { id: "pillars", label: "Proud, grounded, together", chapter: "Identity", tone: "green" },
  { id: "library", label: "Every Mustang, captioned", chapter: "Marks", tone: "paper" },
  { id: "departments", label: "One family, every department", chapter: "Marks", tone: "mist" },
  { id: "full-set", label: "Every mark, in one family", chapter: "Marks", tone: "ink" },
  { id: "crest", label: "The crest", chapter: "Marks", tone: "paper" },
  { id: "academics", label: "Academic Powerhouse", chapter: "Marks", tone: "mist" },
  { id: "clawed", label: "The LR, clawed", chapter: "Marks", tone: "paper" },
  { id: "redrawn", label: "The emblem, redrawn", chapter: "Marks", tone: "green" },
  { id: "corners", label: "Softer corners, same LR", chapter: "Marks", tone: "paper" },
  { id: "one-horse", label: "One horse, drawn once", chapter: "Marks", tone: "green" },
  { id: "colour", label: "Green leads, red accents", chapter: "Colour", tone: "ink" },
  { id: "type", label: "Two typefaces", chapter: "Type", tone: "green" },
  { id: "scale", label: "The type scale", chapter: "Type", tone: "paper" },
  { id: "icons", label: "Iconography", chapter: "Icons", tone: "ink" },
  { id: "voice", label: "How the school sounds", chapter: "Voice", tone: "paper" },
  { id: "cries", label: "Rallying cries", chapter: "Voice", tone: "green" },
  { id: "signage", label: "The same wall, redrawn", chapter: "In use", tone: "ink" },
  { id: "posters", label: "Two posters, one system", chapter: "In use", tone: "paper" },
  { id: "student-id", label: "Student ID", chapter: "In use", tone: "mist" },
  { id: "staff-id", label: "Staff ID", chapter: "In use", tone: "paper" },
  { id: "apparel", label: "Apparel", chapter: "In use", tone: "mist" },
  { id: "holidays", label: "Holiday emblems", chapter: "In use", tone: "paper" },
  { id: "game-day", label: "Game day", chapter: "In use", tone: "green" },
  { id: "website", label: "The website", chapter: "In use", tone: "ink" },
  { id: "rules", label: "The rules, on one page", chapter: "The rules", tone: "paper" },
  { id: "end", label: "Go Mustangs", chapter: "Go Mustangs", tone: "green" },
];
const indexOf = (id: string) => SCENES.findIndex((x) => x.id === id);
const DARK: Tone[] = ["green", "ink"];

const MARKS = LRHS_MARKS.marks;
const FAMILIES = LRHS_MARKS.families;
const GREEN = "#033922";
const TILE = "#F4F4F2";
const mark = (file: string) => `/images/lrhs-marks/${encodeURI(file)}`;
const ground = (file: string) => (MARKS.find((m) => m.file === file)?.ground === "dark" ? GREEN : TILE);

const WORDS: Record<number, string> = {
  2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
  20: "twenty", 21: "twenty-one", 22: "twenty-two", 23: "twenty-three", 24: "twenty-four",
  25: "twenty-five", 26: "twenty-six", 27: "twenty-seven", 28: "twenty-eight", 29: "twenty-nine", 30: "thirty",
};
const say = (n: number) => WORDS[n] ?? String(n);
const Say = (n: number) => say(n).charAt(0).toUpperCase() + say(n).slice(1);

/** stagger: delay for an entrance, in ms */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const maskOf = (file: string, position = "center"): CSSProperties => ({
  WebkitMaskImage: `url("${mark(file)}")`,
  maskImage: `url("${mark(file)}")`,
  WebkitMaskPosition: position,
  maskPosition: position,
});

const PILLARS: [IbPhrase, string][] = [
  ["PROUD", "We celebrate our scholars, athletes and artists loudly and often. Game-day energy, all year."],
  ["GROUNDED", "Welcoming and clear for every family. Spirited, never corporate; confident, never loud for its own sake."],
  ["TOGETHER", "One campus, one community. We ride together — and the brand always pulls in the same direction."],
];

const LIBRARY = [
  ["LRHS Wordmark 2.svg", "Primary lockup", "Official — the front office and signage"],
  ["LRHS Emblem.svg", "LR emblem", "Athletics and the whole school"],
  ["LRHS Emblem Mono.svg", "Reversed emblem", "Mustang Green and dark grounds"],
  ["LRHS Mustang 3.svg", "Mustang", "Icons, avatars and watermarks"],
] as const;

const CRESTS = [
  ["LRHS Grad Mark.svg", "Full colour", "Diplomas, programmes and awards"],
  ["LRHS Grad Mark Alt.svg", "Light", "Where the full crest reads too heavy"],
  ["LRHS Grad Mark Mono.svg", "One colour", "Embossing, foil and single-ink print"],
] as const;

const POWERHOUSE = [
  ["/images/lrhs-powerhouse/powerhouse-ai-original.png", "Today", "The original", "AI-generated · in use now"],
  [mark("LRHS Powerhouse 1.svg"), "Redrawn", "With the LR", "The LR breaks out of the shield"],
  [mark("LRHS Powerhouse 2.svg"), "Redrawn", "The mustang", "The horse alone, clawed"],
] as const;

/* The Clawed family (Oct 12), from the catalogue: one vector, one 4000 px PNG */
const CLAWED = MARKS.filter((m) => m.family === "clawed").map((m) =>
  m.file.endsWith(".png")
    ? ([m.file, "Raster · PNG", "Across both letters", "4000 px · screens and print"] as const)
    : ([m.file, "Vector · SVG", "Through the R", "Prints at any size"] as const),
);

/* The departments grid ends on a count tile that fills whatever is left of
   the last row, at each breakpoint (2, 3 and 5 columns). Literal class names,
   so Tailwind sees them. */
const fill = (cols: number) => cols - (LRHS_MARKS.families.length % cols) || cols;
const SPAN_BASE: Record<number, string> = { 1: "col-span-1", 2: "col-span-2" };
const SPAN_SM: Record<number, string> = { 1: "sm:col-span-1", 2: "sm:col-span-2", 3: "sm:col-span-3" };
const SPAN_LG: Record<number, string> = { 1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4", 5: "lg:col-span-5" };
const COUNT_SPAN = `${SPAN_BASE[fill(2)]} ${SPAN_SM[fill(3)]} ${SPAN_LG[fill(5)]}`;

type Swatch = { name: string; hex: string; role: string; share: number; light?: boolean };
const SWATCHES: Swatch[] = [
  { name: "Mustang Green", hex: "#033922", role: "Leads everything", share: 44 },
  { name: "Field Green", hex: "#144B2C", role: "Depth", share: 14 },
  { name: "Bright Pine", hex: "#1C6E40", role: "Accents", share: 10 },
  { name: "Spirit Red", hex: "#AA2121", role: "Game day only", share: 5 },
  { name: "Ink", hex: "#0B0B0B", role: "Type and contrast", share: 13 },
  { name: "Paper", hex: "#FBFBF9", role: "Ground", share: 14, light: true },
];

const ICONS = [
  [GraduationCap, "Graduation"],
  [Trophy, "Athletics"],
  [CalendarDays, "Calendar"],
  [Users, "Clubs"],
  [MapPin, "Wayfinding"],
  [Megaphone, "Announcements"],
  [BookOpen, "Library"],
  [Star, "Honours"],
  [Ticket, "Tickets"],
  [Bell, "Bell schedule"],
  [Heart, "Wellbeing"],
  [Shield, "Safety"],
  [Flag, "Events"],
  [Music, "The band"],
  [FlaskConical, "Science"],
  [Award, "Awards"],
] as const;

const VOICE_DO = [
  "Speak as we; address the reader as you.",
  "Headlines and labels in capitals; body in sentence case.",
  "Lead with pride and clarity.",
  "Use rallying cries sparingly.",
];
const VOICE_DONT = [
  "No corporate jargon or buzzwords.",
  "No emoji in flagship materials.",
  "No trailing periods on headlines.",
  "Never snarky or talking down.",
];
const CRIES_A: IbPhrase[] = ["GO MUSTANGS", "HOME OF THE MUSTANGS", "RIDE TOGETHER"];
const CRIES_B: IbPhrase[] = ["MUSTANG PRIDE", "ONE RANCH", "JOIN THE HERD"];

const APPAREL = [
  ["cap", "Cap", "Embroidered"],
  ["hoodie", "Hoodie", "One-colour print"],
  ["jersey", "Game jersey", "Sublimated"],
  ["crewneck", "Crewneck", "Reversed on green"],
  ["polo", "Polo", "Embroidered patch"],
] as const;

/* holiday editions of the LR, in school-year order — the deck's list */
const HOLIDAYS = LRHS_HOLIDAYS.holidays;

const RULES = [
  ["Use the supplied files", "Every mark comes as an SVG (one as a large PNG). Never redraw, recolour, stretch or tilt one."],
  ["Pick the mark for the job", "Each department has its family: the emblem for athletics, the wordmark for the front office, the crest for graduation."],
  ["Green leads", "Mustang Green carries everything. Spirit Red is the one accent, and it's saved for game day."],
  ["Two typefaces", "Industry Black for headlines and numbers, in capitals. Hanken Grotesk for everything else."],
  ["Give it room", "Keep clear space equal to the height of the L on every side of a lockup."],
  ["Sound like us", "Speak as we, to you. Proud and plain — no jargon, and no emoji in official work."],
] as const;

const WEBSITE = "/lrhs-brand-system/website-concept.html";
const CASE_STUDY = "/case-study/lakewood-ranch-redesign";

/* ── Small pieces ──────────────────────────────────────────────────── */

/** Industry Black lettering, as outlined artwork. Size it by height. */
function Ib({ p, className, style }: { p: IbPhrase; className?: string; style?: CSSProperties }) {
  const g = IB[p];
  const words = p.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <svg
      viewBox={`0 ${-IB_CAP} ${g.w} ${IB_CAP + g.below}`}
      className={`${s.ib} ${className ?? ""}`}
      style={style}
      role="img"
      aria-label={words}
    >
      <path d={g.d} />
    </svg>
  );
}

function Scene({
  id,
  children,
  center,
  className,
  innerClassName,
}: {
  id: string;
  children: ReactNode;
  center?: boolean;
  className?: string;
  innerClassName?: string;
}) {
  const i = indexOf(id);
  const info = SCENES[i];
  return (
    <section
      id={id}
      data-scene={i}
      aria-labelledby={`${id}-title`}
      className={`${s.scene} ${s[info.tone]} ${className ?? ""}`}
    >
      <div className={`${s.inner} ${center ? s.center : ""} ${innerClassName ?? ""}`}>{children}</div>
    </section>
  );
}

/** The deck's slide head: numbered kicker, title, lede and the italic note. */
function Head({
  id,
  kicker,
  title,
  lede,
  note,
  wide,
  size,
  className,
}: {
  id: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  note?: ReactNode;
  wide?: boolean;
  /** "m" for scenes with a lot under the title */
  size?: "m";
  className?: string;
}) {
  const n = indexOf(id);
  return (
    <div className={className}>
      <div className={s.eyebrow} data-r="up">
        <span className={s.badge}>{String(n).padStart(2, "0")}</span>
        {kicker}
      </div>
      <h2 id={`${id}-title`} className={`${s.title} ${wide ? s.titleWide : ""} ${size === "m" ? s.titleM : ""}`} data-r="up" style={d(90)}>
        {title}
      </h2>
      {lede && (
        <p className={s.lede} data-r="up" style={d(180)}>
          {lede}
        </p>
      )}
      {note && (
        <p className={s.note} data-r="up" style={d(260)}>
          {note}
        </p>
      )}
    </div>
  );
}

function Cap({ tag, name, use, red, className }: { tag?: string; name: string; use?: string; red?: boolean; className?: string }) {
  return (
    <figcaption className={`mt-4 ${className ?? ""}`}>
      {tag && <span className={`${s.label} ${red ? s.red : ""}`}>{tag}</span>}
      <span className={`block ${s.capName}`}>{name}</span>
      {use && <span className={`mt-1 block ${s.label}`}>{use}</span>}
    </figcaption>
  );
}

function Swatches() {
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1600);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <div className={`${s.swatches} mt-8 min-h-[300px] md:mt-10`}>
      {SWATCHES.map((w, i) => (
        <button
          key={w.hex}
          type="button"
          data-r="wipe"
          style={{ ...d(120 + i * 110), background: w.hex, flexGrow: w.share, flexBasis: 0, color: w.light ? "#0B0B0B" : "#fff" }}
          className={s.swatch}
          aria-label={`${w.name}, ${w.hex}. Copy the hex code`}
          onClick={() => navigator.clipboard?.writeText(w.hex).then(() => setCopied(w.hex), () => {})}
        >
          <span className="text-[15px] leading-tight font-semibold tracking-tight">{w.name}</span>
          <span className="mt-1 text-[12.5px] tabular-nums opacity-70">{copied === w.hex ? "Copied" : w.hex}</span>
          <span className="mt-0.5 hidden text-[12.5px] opacity-70 lg:block">{w.role}</span>
        </button>
      ))}
    </div>
  );
}

/* ── The scenes ─────────────────────────────────────────────────────
   Memoised with no props, so moving between scenes only re-renders the
   chrome (bar and rail), never the page itself. */

const Scenes = memo(function Scenes() {
  const fullSet: ZoomItem[] = MARKS.map((m) => ({
    src: mark(m.file),
    alt: m.name,
    title: m.name,
    project: `${FAMILIES.find((f) => f.id === m.family)?.name} · ${m.use}`,
    description: m.note,
    panel: m.ground === "dark" ? "green" : "paper",
  }));

  return (
    <>
      {/* ── Title ─────────────────────────────────────────────────── */}
      <Scene id="top">
        <div
          aria-hidden
          className={s.ghost}
          style={{ ...maskOf("LRHS Mustang 4.svg", "left bottom"), left: "-14%", bottom: "-20%", width: "92%", aspectRatio: "1.6 / 1" }}
        />
        <div className="grid flex-1 items-center gap-8 md:grid-cols-[1.55fr_1fr] md:gap-12">
          <div className="order-2 md:order-1">
            <div className={s.eyebrow} data-r="up">
              <span className="h-2 w-2 rounded-full bg-[#e25656]" />
              Brand guidelines · Lakewood Ranch High School
            </div>
            <h1 id="top-title" className={s.hero} data-r="up" style={d(120)}>
              Lakewood Ranch
              <br />
              High School
            </h1>
            <p className={s.lede} data-r="up" style={d(240)}>
              A Mustang brand system — {say(MARKS.length)} marks, and the colour, type and voice that hold them together.
            </p>
          </div>
          <div
            className="relative order-1 mx-auto aspect-square w-[min(62vw,46svh)] md:order-2 md:w-full md:max-w-[520px]"
            data-r="zoom"
            style={d(200)}
          >
            <Image src={mark("LRHS Emblem Mono.svg")} alt="The LR emblem" fill priority sizes="(min-width: 768px) 520px, 62vw" className="object-contain" />
          </div>
        </div>
        <div className="mt-8 flex items-end justify-between gap-6 text-[11px] font-semibold tracking-[0.24em] uppercase" data-r="up" style={d(420)}>
          <span className="text-[#e25656]">Mustangs Ahead</span>
          <span className={s.scrollCue}>
            Scroll
            <ChevronDown size={16} strokeWidth={2} />
          </span>
          <span className="hidden text-white/55 md:inline">Concept work · not affiliated with the school district</span>
        </div>
      </Scene>

      {/* ── 01 The core lockup ────────────────────────────────────── */}
      <Scene id="lockup">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Head
            id="lockup"
            kicker="Identity"
            title="The core lockup"
            lede="The LR, the mustang and the school name, resolved into lockups that survive a jersey, a letterhead and a favicon without being redrawn."
            note="Clear space equal to the height of the L on every side."
          />
          <figure data-r="zoom" style={d(220)}>
            {/* the dashed box sits one L-height (the L of LAKEWOOD) out from the
                lockup on every side: 8.2% of the lockup's width */}
            <div className={`${s.clear} rounded-[6px] bg-white`} style={{ padding: "7.05%" }}>
              {(["top", "bottom", "left", "right"] as const).map((side) => (
                <span
                  key={side}
                  aria-hidden
                  className={s.clearMark}
                  style={{
                    width: "7.05%",
                    aspectRatio: "1",
                    ...(side === "top" && { top: 0, left: "50%", transform: "translateX(-50%)" }),
                    ...(side === "bottom" && { bottom: 0, left: "50%", transform: "translateX(-50%)" }),
                    ...(side === "left" && { left: 0, top: "50%", transform: "translateY(-50%)" }),
                    ...(side === "right" && { right: 0, top: "50%", transform: "translateY(-50%)" }),
                  }}
                >
                  L
                </span>
              ))}
              <div className="relative w-full" style={{ aspectRatio: "2449 / 1500" }}>
                <Image src={mark("LRHS Wordmark 2.svg")} alt="The stacked lockup: the mustang above LAKEWOOD RANCH HIGH SCHOOL, HOME OF THE MUSTANGS" fill sizes="(min-width: 1024px) 640px, 90vw" className="object-contain" />
              </div>
            </div>
            <figcaption className={`mt-4 ${s.label}`}>The stacked lockup · clear space shown in red</figcaption>
          </figure>
        </div>
      </Scene>

      {/* ── 02 Proud, grounded, together ──────────────────────────── */}
      <Scene id="pillars" center>
        <div className={s.eyebrow} data-r="up">
          <span className={s.badge}>{String(indexOf("pillars")).padStart(2, "0")}</span>
          What the brand stands for
        </div>
        <h2 id="pillars-title" className="sr-only">
          Proud, grounded, together
        </h2>
        <div className="mt-10 grid gap-8 md:mt-14 md:gap-12">
          {PILLARS.map(([word, text], i) => (
            <div key={word} className="grid items-end gap-3 md:grid-cols-[1.25fr_1fr] md:gap-12" data-r="up" style={d(140 + i * 170)}>
              <Ib p={word} className={`h-[clamp(44px,8.4vw,124px)] ${i === 2 ? "text-[#2EA866]" : ""}`} />
              <p className={`${s.lede} !mt-0 md:pb-2`}>{text}</p>
            </div>
          ))}
        </div>
      </Scene>

      {/* ── 03 The mark library ───────────────────────────────────── */}
      <Scene id="library">
        <Head
          id="library"
          kicker="The mark library"
          title="Every Mustang, captioned"
          lede="The emblem, the clawed emblems, the wordmarks, the mustang, the band, a graduation crest, the Academic Powerhouse badge, the Mustangs Ahead publications and the retro marks. Supplied as SVG, plus one PNG."
          note={`${Say(MARKS.length)} marks in ${say(FAMILIES.length)} families, each with its own permitted use.`}
          wide
        />
        <div className="mt-8 grid flex-1 grid-cols-2 content-end gap-3 sm:gap-4 lg:grid-cols-4">
          {LIBRARY.map(([file, name, use], i) => (
            <figure key={file} data-r="up" style={d(260 + i * 90)}>
              <div className={`${s.tile} aspect-square max-h-[max(120px,calc(100svh-510px))]`} style={{ background: ground(file) }}>
                <Image src={mark(file)} alt={name} fill sizes="(min-width: 1024px) 320px, 45vw" className="object-contain p-[15%]" />
              </div>
              <Cap name={name} use={use} />
            </figure>
          ))}
        </div>
      </Scene>

      {/* ── 04 Departments ────────────────────────────────────────── */}
      <Scene id="departments">
        <Head
          id="departments"
          kicker="Where each mark lives"
          title="One family, every department"
          lede="Each part of the school gets a mark built for it — and every one of them still reads as the same school."
          wide
          size="m"
        />
        <div className="mx-auto mt-8 grid w-full flex-1 grid-cols-2 content-center gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4" style={{ maxWidth: "min(100%, calc((100svh - 330px) * 2.45))" }}>
          {FAMILIES.map((f, i) => (
            <div key={f.id} className="flex flex-col rounded-[18px] bg-white p-2.5 shadow-[0_20px_40px_-28px_rgba(3,57,34,0.45)]" data-r="up" style={d(200 + i * 60)}>
              <div className={`${s.tile} aspect-[16/11] max-h-[max(72px,calc((100svh-600px)/2))] !rounded-[12px]`} style={{ background: ground(f.hero) }}>
                <Image src={mark(f.hero)} alt="" fill sizes="(min-width: 1024px) 260px, 45vw" className="object-contain p-[13%]" />
              </div>
              <div className="px-1.5 pt-3 pb-1">
                <span className={s.label}>
                  {f.name} · {MARKS.filter((m) => m.family === f.id).length}
                </span>
                <span className="mt-1 block text-[15px] leading-[1.25] font-semibold tracking-[-0.01em]">{f.dept}</span>
              </div>
            </div>
          ))}
          <div className={`flex flex-col justify-center rounded-[18px] bg-[#033922] p-6 text-white ${COUNT_SPAN}`} data-r="up" style={d(200 + FAMILIES.length * 60)}>
            <span className="text-[clamp(56px,6vw,96px)] leading-[0.9] font-extrabold tracking-[-0.04em]">{MARKS.length}</span>
            <span className="mt-2 text-[11px] font-semibold tracking-[0.24em] text-[#84C9A2] uppercase">marks</span>
            <span className={`${s.note} !text-[#D6E2DA]`}>
              {Say(FAMILIES.length)} families. One school.
            </span>
          </div>
        </div>
      </Scene>

      {/* ── 05 The full set ───────────────────────────────────────── */}
      <Scene id="full-set">
        <Head
          id="full-set"
          kicker="The full set"
          title="Every mark, in one family"
          lede={`${Say(MARKS.length)} marks in ${say(FAMILIES.length)} families. Open any of them to see what it's for.`}
          wide
        />
        <div
          className="mx-auto mt-8 grid w-full flex-1 grid-cols-3 content-center gap-x-3 gap-y-4 sm:grid-cols-6 lg:grid-cols-10"
          style={{ maxWidth: "min(100%, calc((100svh - 420px) * 3.05))" }}
        >
          {MARKS.map((m, i) => (
            <figure key={m.file} className="group min-w-0" data-r="up" style={d(160 + (i % 10) * 40 + Math.floor(i / 10) * 90)}>
              <div className={`${s.tile} aspect-square !rounded-[14px]`} style={{ background: m.ground === "dark" ? GREEN : TILE }}>
                <ZoomImage
                  src={mark(m.file)}
                  alt={m.name}
                  fill
                  sizes="(min-width: 1024px) 140px, 30vw"
                  className="object-contain p-[16%] transition-transform duration-700 group-hover:scale-[1.06]"
                  zoomItems={fullSet}
                  zoomIndex={i}
                />
              </div>
              <figcaption className="mt-2 truncate text-[12px] text-white/60">{m.name}</figcaption>
            </figure>
          ))}
        </div>
      </Scene>

      {/* ── 06 The crest ──────────────────────────────────────────── */}
      <Scene id="crest">
        <Head
          id="crest"
          kicker="The crest"
          title="For the moments that should feel permanent"
          lede="The most formal mark in the system — diplomas, graduation programmes, awards and ceremonies. Keep it for those, so it keeps its weight."
          wide
        />
        <div className="mt-8 grid flex-1 grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
          {CRESTS.map(([file, name, use], i) => (
            <figure key={file} className="flex min-h-[260px] flex-col text-center" data-r="rise" style={d(220 + i * 140)}>
              <div className="relative min-h-0 flex-1">
                <Image src={mark(file)} alt={`The graduation crest — ${name.toLowerCase()}`} fill sizes="(min-width: 640px) 33vw, 80vw" className="object-contain" />
              </div>
              <Cap name={name} use={use} />
            </figure>
          ))}
        </div>
      </Scene>

      {/* ── 07 Academic Powerhouse ────────────────────────────────── */}
      <Scene id="academics">
        <Head
          id="academics"
          kicker="Academic Powerhouse"
          title="From a generated image to a real mark"
          lede="The badge in use today began as an AI-generated picture — a flat image that blurs when it is enlarged and can't be recoloured. Both new versions are vector artwork built on the system's mustang, so they print sharp at any size."
          wide
        />
        <div className="mt-8 grid flex-1 grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {POWERHOUSE.map(([src, tag, name, use], i) => (
            <figure key={src} className="flex min-h-[180px] flex-col text-center" data-r="up" style={d(220 + i * 140)}>
              <div className="relative aspect-[4/3] min-h-0 rounded-[26px] bg-white shadow-[0_30px_70px_-34px_rgba(12,12,12,0.4)] sm:aspect-auto sm:flex-1">
                <Image src={src} alt={`Academic Powerhouse — ${name.toLowerCase()}`} fill sizes="(min-width: 640px) 30vw, 80vw" className="object-contain p-[12%]" />
              </div>
              <Cap tag={tag} name={name} use={use} red={i > 0} />
            </figure>
          ))}
        </div>
      </Scene>

      {/* ── 07b The LR, clawed (Oct 12) ───────────────────────────── */}
      <Scene id="clawed">
        <Head
          id="clawed"
          kicker="Clawed"
          title="The LR, clawed"
          lede="The emblem with claw marks torn through it, for the days the school should be loud — pep rallies and spirit week. The letters and the horse don't change; the claws do the shouting."
          wide
        />
        <div className="mx-auto mt-8 grid w-full max-w-[1180px] flex-1 grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10">
          {CLAWED.map(([file, tag, name, use], i) => (
            <figure key={file} className="flex min-h-[180px] flex-col text-center" data-r="up" style={d(220 + i * 140)}>
              <div className="relative aspect-[4/3] min-h-0 rounded-[26px] bg-white shadow-[0_30px_70px_-34px_rgba(12,12,12,0.4)] sm:aspect-auto sm:flex-1">
                <Image src={mark(file)} alt={`The LR emblem, clawed — ${name.toLowerCase()}`} fill sizes="(min-width: 640px) 45vw, 80vw" className={`object-contain ${file.endsWith(".png") ? "p-[6%]" : "p-[10%]"}`} />
              </div>
              <Cap tag={tag} name={name} use={use} red />
            </figure>
          ))}
        </div>
      </Scene>

      {/* ── 08 Before / after ─────────────────────────────────────── */}
      <Scene id="redrawn">
        <Head id="redrawn" kicker="Before / after" title="The emblem, redrawn" />
        <div className="mt-8 grid flex-1 grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          {(
            [
              ["Old LRHS Emblem.svg", "Before", "The retired emblem — kept on file for reference, not for use."],
              ["LRHS Emblem.svg", "After", "Redrawn on a single grid: cleaner silhouette, one green, legible at a favicon."],
            ] as const
          ).map(([file, tag, note], i) => (
            <figure key={file} className="flex min-h-[260px] flex-col" data-r={i ? "right" : "left"} style={d(200 + i * 160)}>
              <div className={`relative min-h-0 flex-1 rounded-[22px] bg-[#F0F2F0] ${i ? "shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)]" : ""}`}>
                <Image src={mark(file)} alt={`The emblem — ${tag.toLowerCase()}`} fill sizes="(min-width: 768px) 45vw, 90vw" className="object-contain p-[10%]" />
              </div>
              <figcaption className="mt-4">
                <span className={`${s.label} ${i ? s.red : ""}`}>{tag}</span>
                <span className="mt-1 block max-w-[46ch] text-[15px] leading-[1.5] text-[#D6E2DA]">{note}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Scene>

      {/* ── 09 Corners ────────────────────────────────────────────── */}
      <Scene id="corners">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <Head
            id="corners"
            kicker="Corners"
            title="Softer corners, same LR"
            lede="Every corner on the LR is now very slightly rounded — about the softness of an app icon — and the same change runs through all seven emblem files. Where one letter tucks under the other, the corner stays sharp."
            note="Drag across the picture to compare."
          />
          <div data-r="zoom" style={d(220)}>
            <CompareSlider
              before={{ src: "/images/lrhs-corners/LRHS-Emblem-square.svg", alt: "The emblem with square corners", label: "Square" }}
              after={{ src: mark("LRHS Emblem.svg"), alt: "The emblem with subtly rounded corners", label: "Rounded" }}
              aspect="16 / 10"
              fit="contain"
              ground={TILE}
              initial={50}
              inset="6%"
              sizes="(min-width: 1024px) 760px, 100vw"
              zoom={{ scale: 2.8, origin: "15% 1%", on: "Close-up of the L", off: "Whole emblem" }}
            />
          </div>
        </div>
      </Scene>

      {/* ── 10 One horse, drawn once ──────────────────────────────── */}
      <Scene id="one-horse">
        <div
          aria-hidden
          className={s.ghost}
          style={{ ...maskOf("LRHS Mustang 4.svg", "right center"), right: "-18%", top: "4%", width: "96%", aspectRatio: "1.6 / 1" }}
        />
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative aspect-square w-[min(72vw,34svh)]" data-r="big" style={d(80)}>
            <Image src={mark("LRHS Emblem Mono.svg")} alt="The LR emblem, reversed on Mustang Green" fill sizes="52vh" className="object-contain" />
          </div>
        </div>
        <div className="relative max-w-[900px]">
          <div className={s.eyebrow} data-r="up" style={d(300)}>
            <span className={s.badge}>{String(indexOf("one-horse")).padStart(2, "0")}</span>
            The result
          </div>
          <h2 id="one-horse-title" className={s.title} data-r="up" style={d(380)}>
            One horse, drawn once
          </h2>
          <p className={s.lede} data-r="up" style={d(460)}>
            The horses on campus today each carry their own outline, their own shading and their own green. This is one silhouette in one colour — the same file on a scoreboard, a jersey and a favicon.
          </p>
        </div>
      </Scene>

      {/* ── 11 Colour ─────────────────────────────────────────────── */}
      <Scene id="colour">
        <Head
          id="colour"
          kicker="Colour"
          title="Green leads, red accents"
          lede="Mustang Green is the school's own dark green and carries the system. Spirit Red is the single true accent, reserved for game day. Ink and Paper do everything else."
          note="One dominant, one accent, two neutrals. Nothing else."
          wide
        />
        <Swatches />
        <p className={`mt-3 ${s.label}`} data-r="up" style={d(900)}>
          Each colour is as wide as the share of a typical piece it covers · click one to copy its hex
        </p>
      </Scene>

      {/* ── 12 Type ───────────────────────────────────────────────── */}
      <Scene id="type">
        <Head id="type" kicker="Typography" title="An athletic display face, a plain sans" note="Two families. Nothing else." wide size="m" />
        <div className="mt-8 grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr] lg:gap-5">
          <div className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-white/[0.04] p-6 sm:p-9" data-r="up" style={d(220)}>
            <span className={s.label}>Display — Industry Black</span>
            <div className="my-[clamp(12px,3svh,32px)] flex flex-wrap items-end gap-x-[0.28em] gap-y-3" style={{ fontSize: "clamp(40px, min(5.5vw, 10svh), 92px)" }}>
              <Ib p="GO" className="h-[0.72em]" />
              <Ib p="MUSTANGS" className="h-[0.72em] text-[#2EA866]" />
            </div>
            <div className="grid gap-3 text-white/85">
              <Ib p="ABCDEFGHIJKLMNOPQRSTUVWXYZ" className="h-[clamp(12px,1.35vw,20px)] max-w-full" />
              <Ib p="0123456789" className="h-[clamp(12px,1.35vw,20px)]" />
            </div>
            <p className="mt-[clamp(10px,2.4svh,24px)] max-w-[48ch] text-[15px] leading-[1.5] text-[#D6E2DA]">
              Uppercase, tracked and unapologetically athletic. Headlines, numbers and anything that should shout.
            </p>
          </div>
          <div className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-white/[0.04] p-6 sm:p-9" data-r="up" style={d(340)}>
            <span className={s.label}>Body — Hanken Grotesk</span>
            <span className="my-[clamp(8px,2.4svh,24px)] text-[clamp(80px,min(11vw,16svh),176px)] leading-[0.9] font-bold tracking-[-0.05em]">Aa</span>
            <p className="max-w-[40ch] text-[clamp(17px,1.4vw,21px)] leading-[1.5] text-white/90">
              From Friday-night lights to the science fair, there&rsquo;s a place for every Mustang to compete, create and belong.
            </p>
            <p className="mt-[clamp(10px,2.4svh,24px)] max-w-[48ch] text-[15px] leading-[1.5] text-[#D6E2DA]">Everything functional: body copy, captions, forms and the website.</p>
          </div>
        </div>
      </Scene>

      {/* ── 13 The scale ──────────────────────────────────────────── */}
      <Scene id="scale">
        <Head
          id="scale"
          kicker="The type scale"
          title="One ramp, from scoreboard to caption"
          lede="Headlines shout in capitals; body stays warm and plain. Five steps cover everything the school prints or posts."
          wide
        />
        <div className="mt-8 flex flex-1 flex-col justify-center divide-y divide-black/10 border-y border-black/10">
          {(
            [
              ["Display", "Industry Black · capitals", <Ib key="d" p="RIDE TOGETHER" className="h-[clamp(30px,min(5vw,8svh),76px)] max-w-full text-[#033922]" />],
              ["Heading", "Industry Black · capitals", <Ib key="h" p="MUSTANG NEWS" className="h-[clamp(20px,2.6vw,38px)] max-w-full" />],
              ["Eyebrow", "Hanken Grotesk · capitals, tracked", <span key="e" className="text-[14px] font-semibold tracking-[0.26em] text-[#1C6E40] uppercase">One Ranch</span>],
              ["Body", "Hanken Grotesk · sentence case", <span key="b" className="text-[clamp(17px,1.5vw,21px)]">Sentence-case body, warm and plain.</span>],
              ["Caption", "Hanken Grotesk · small capitals", <span key="c" className="text-[12px] font-semibold tracking-[0.18em] text-black/60 uppercase">7:00 PM · Stadium</span>],
            ] as const
          ).map(([role, spec, sample], i) => (
            <div key={role} className="grid items-center gap-2 py-4 sm:grid-cols-[150px_1fr_auto] sm:gap-8 sm:py-[clamp(8px,1.8svh,20px)]" data-r="up" style={d(200 + i * 90)}>
              <span className={s.label}>{role}</span>
              <div className="min-w-0">{sample}</div>
              <span className="text-[13px] text-black/50">{spec}</span>
            </div>
          ))}
        </div>
      </Scene>

      {/* ── 14 Icons ──────────────────────────────────────────────── */}
      <Scene id="icons">
        <Head
          id="icons"
          kicker="Iconography"
          title="One line weight, drawn on a grid"
          lede="A small icon set for wayfinding, athletics and the site — every glyph on the same grid at the same stroke weight, so a new one can be added later without the set falling apart."
          wide
          size="m"
        />
        <div className="mx-auto mt-8 grid w-full flex-1 grid-cols-4 content-center gap-3 sm:grid-cols-8" style={{ maxWidth: "min(100%, calc((100svh - 460px) * 3.9))" }}>
          {ICONS.map(([Icon, name], i) => (
            <div key={name} className="flex flex-col items-center gap-2" data-r="zoom" style={d(180 + i * 35)}>
              <div className={`${s.iconTile} w-full`}>
                <Icon className="h-[42%] w-[42%]" strokeWidth={2} aria-hidden />
              </div>
              <span className="text-center text-[11px] text-white/55">{name}</span>
            </div>
          ))}
        </div>
        <p className={`mt-6 ${s.label}`} data-r="up" style={d(800)}>
          Lucide outline set · 2 px stroke · current colour · no emoji in official use
        </p>
      </Scene>

      {/* ── 15 Voice ──────────────────────────────────────────────── */}
      <Scene id="voice">
        <Head
          id="voice"
          kicker="Voice"
          title="How the school sounds"
          lede="Direct, warm and unfussy. Proud without the hard sell. The voice guidance sits in the same document as the marks, because a brand that only governs logos governs nothing."
          note="Written for staff, not for designers."
          wide
        />
        <div className="mt-8 grid flex-1 content-center gap-4 md:grid-cols-2 md:gap-5">
          {(
            [
              ["We do", VOICE_DO, true],
              ["We don't", VOICE_DONT, false],
            ] as const
          ).map(([head, items, ok], i) => (
            <div key={head} className="rounded-[24px] bg-white p-6 shadow-[0_24px_60px_-40px_rgba(12,12,12,0.35)] sm:p-8" data-r="up" style={d(280 + i * 140)}>
              <span className={`${s.label} ${ok ? "!text-[#1C6E40]" : s.red}`}>{head}</span>
              <ul className="mt-5 grid gap-3.5">
                {items.map((t) => (
                  <li key={t} className="flex gap-3 text-[clamp(15px,1.25vw,18px)] leading-[1.45]">
                    <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${ok ? "bg-[#1C6E40]" : "bg-[#AA2121]"} text-white`}>
                      {ok ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Scene>

      {/* ── 16 Rallying cries ─────────────────────────────────────── */}
      <Scene id="cries" innerClassName="!px-0">
        <div className="px-[clamp(20px,5vw,72px)]">
          <Head
            id="cries"
            kicker="Rallying cries"
            title="Six lines, used sparingly"
            lede="They're what the student section shouts, so they only work if they aren't on everything."
            wide
          />
        </div>
        <div className="mt-10 flex flex-1 flex-col justify-center gap-5 overflow-hidden sm:gap-8" data-r="up" style={d(300)}>
          {[CRIES_A, CRIES_B].map((row, r) => (
            <div key={r} className={`${s.marquee} ${r ? s.marqueeBack : ""}`}>
              {[0, 1].map((copy) =>
                row.map((p) => (
                  <span key={`${copy}-${p}`} className="flex items-center gap-[clamp(28px,4vw,64px)]" aria-hidden={copy === 1}>
                    <Ib p={p} className={`h-[clamp(40px,6.4vw,100px)] ${r ? "text-[#2EA866]" : ""}`} />
                    <span className="h-3 w-3 flex-none rounded-full bg-[#e25656]" />
                  </span>
                )),
              )}
            </div>
          ))}
        </div>
      </Scene>

      {/* ── 17 Signage ────────────────────────────────────────────── */}
      <Scene id="signage">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <Head id="signage" kicker="Signage" title="The same wall, redrawn" />
            <div className="mt-8 grid gap-5">
              {(
                [
                  ["Before", "The sign as it hangs today — the old mustang laid over grey block letters, the two fighting for the same space."],
                  ["After", "The same words and the same wall, set in the brand's type on Mustang Green, with the horse moved back into the field so the name can be read."],
                ] as const
              ).map(([tag, text], i) => (
                <p key={tag} className="max-w-[52ch] text-[15px] leading-[1.55] text-[#D6E2DA]" data-r="up" style={d(260 + i * 120)}>
                  <span className={`mb-1 block ${s.label} ${i ? s.red : ""}`}>{tag}</span>
                  {text}
                </p>
              ))}
            </div>
          </div>
          <div data-r="zoom" style={d(220)}>
            <CompareSlider
              before={{ src: "/images/lrhs-signage/sign-before.jpg", alt: "The school sign as it hangs today", label: "Before" }}
              after={{ src: "/images/lrhs-signage/sign-after.jpg", alt: "The same wall with the sign redrawn on Mustang Green", label: "After" }}
              aspect="924 / 693"
              initial={52}
              dark
              sizes="(min-width: 1024px) 760px, 100vw"
            />
          </div>
        </div>
      </Scene>

      {/* ── 18 Posters ────────────────────────────────────────────── */}
      <Scene id="posters">
        <Head
          id="posters"
          kicker="Poster concepts"
          title="Two posters, one system"
          lede="Both built on the same Mustang Green field and horse as the wallpaper, so a poster, a banner and the sign all read as one school."
          wide
        />
        <div className="mx-auto mt-8 grid w-full flex-1 grid-cols-1 content-center gap-6 md:grid-cols-2 md:gap-8" style={{ maxWidth: "min(100%, calc((100svh - 400px) * 3.6))" }}>
          {(
            [
              ["/images/lrhs-signage/poster-name.jpg", "The name", "Walls, entrances and the stadium"],
              ["/images/lrhs-signage/poster-go-mustangs.jpg", "Go Mustangs!", "Game week and the student section"],
            ] as const
          ).map(([src, name, use], i) => (
            <figure key={src} data-r="up" style={d(240 + i * 150)}>
              <div className="relative aspect-video overflow-hidden rounded-[18px] shadow-[0_34px_80px_-36px_rgba(12,12,12,0.6)]">
                <ZoomImage src={src} alt={`Poster concept — ${name}`} fill sizes="(min-width: 768px) 46vw, 92vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
              </div>
              <Cap name={name} use={use} />
            </figure>
          ))}
        </div>
      </Scene>

      {/* ── 19 Student ID ─────────────────────────────────────────── */}
      <Scene id="student-id">
        <Head
          id="student-id"
          kicker="Student ID"
          title="A card every student carries"
          lede="Credit-card size and vertical, for the lanyard. The photo and name lead, the barcode sits clear so it scans first time, and the 24/7 support lines stay on the back."
          wide
        />
        <div className="mt-8 flex flex-1 items-center justify-center gap-[clamp(20px,6vw,110px)]">
          {(
            [
              ["front", "student-front", "Front", "Photo, name, grade and barcode", "Shown at the door and the library"],
              ["back", "student-back", "Back", "Support lines and return address", "The same helplines as today's card"],
            ] as const
          ).map(([side, file, tag, name, use], i) => (
            <figure key={file} className="flex flex-col items-center text-center" style={{ zIndex: side === "front" ? 2 : 1 }}>
              <div data-r="fade" data-card={side} style={d(160 + i * 120)} className="relative h-[min(34svh,400px)] drop-shadow-[0_30px_40px_rgba(12,12,12,0.25)]">
                <Image src={`/images/lrhs-ids/${file}.png`} alt={`Student ID — ${tag.toLowerCase()}: ${name.toLowerCase()}`} width={1007} height={1600} sizes="300px" className="h-full w-auto" />
              </div>
              <Cap tag={tag} name={name} use={use} className="max-w-[260px]" />
            </figure>
          ))}
        </div>
      </Scene>

      {/* ── 20 Staff ID ───────────────────────────────────────────── */}
      <Scene id="staff-id">
        <Head
          id="staff-id"
          kicker="Staff ID"
          title="Staff, at a glance"
          lede="Horizontal and full Mustang Green, so staff read differently from students across a corridor. The back carries the return address, the same support lines and an employee ID."
          wide
        />
        <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-8 md:flex-row md:gap-[clamp(20px,4vw,72px)]">
          {(
            [
              ["front", "staff-front", "Front", "Photo, name, title and department", "Worn on campus all day"],
              ["back", "staff-back", "Back", "Return address, support lines, employee ID", "Printed for each member of staff"],
            ] as const
          ).map(([side, file, tag, name, use], i) => (
            <figure key={file} className="flex w-full max-w-[520px] flex-col items-center text-center md:w-[min(44%,calc((100svh-430px)*1.45))]" style={{ zIndex: side === "front" ? 2 : 1 }}>
              <div data-r="fade" data-card={side} style={d(160 + i * 120)} className="w-full drop-shadow-[0_30px_40px_rgba(12,12,12,0.25)]">
                <Image src={`/images/lrhs-ids/${file}.png`} alt={`Staff ID — ${tag.toLowerCase()}: ${name.toLowerCase()}`} width={1600} height={1007} sizes="(min-width: 768px) 520px, 90vw" className="h-auto w-full" />
              </div>
              <Cap tag={tag} name={name} use={use} />
            </figure>
          ))}
        </div>
      </Scene>

      {/* ── 21 Apparel ────────────────────────────────────────────── */}
      <Scene id="apparel">
        <Head
          id="apparel"
          kicker="Apparel"
          title="The part students actually wear"
          lede="The largest run the school prints each year — and every one of these comes off the same file."
          wide
        />
        <div className="mt-8 grid flex-1 grid-cols-2 items-end gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {APPAREL.map(([file, name, how], i) => (
            <figure key={file} data-r="rise" style={d(200 + i * 110)}>
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[min(240px,calc((100svh-490px)*0.8))] drop-shadow-[0_26px_30px_rgba(12,12,12,0.18)]">
                <Image src={`/images/lrhs-apparel/${file}.png`} alt={`The Mustang identity on a ${name.toLowerCase()} — ${how.toLowerCase()}`} fill sizes="(min-width: 1024px) 240px, 45vw" className="object-contain object-bottom" />
              </div>
              <Cap name={name} use={how} />
            </figure>
          ))}
        </div>
      </Scene>

      {/* ── 22 Holiday emblems ────────────────────────────────────── */}
      <Scene id="holidays">
        <Head
          id="holidays"
          kicker="Holiday emblems"
          title="The LR, all year round"
          lede={`${Say(HOLIDAYS.length)} holiday editions of the emblem, from Pink Out in October to the Fourth of July. The letters and the horse keep their shapes; only the colours and a few details change for the day.`}
          size="m"
          wide
        />
        <ul className="mt-8 grid flex-1 grid-cols-2 content-center gap-x-4 gap-y-6 lg:grid-cols-4 lg:gap-x-6">
          {HOLIDAYS.map((h, i) => (
            <li key={h.file} data-r="rise" style={d(200 + i * 70)}>
              <figure>
                <div className="relative aspect-[4/3] w-full rounded-[20px] bg-white shadow-[0_24px_60px_-30px_rgba(12,12,12,0.4)] lg:aspect-auto lg:h-[clamp(110px,calc((100svh-560px)/2),300px)]">
                  <Image
                    src={`/images/lrhs-holidays/${encodeURI(h.file)}`}
                    alt={`The LR emblem for ${h.name.replace(" Alt", "")} — ${h.detail.toLowerCase()}`}
                    fill
                    sizes="(min-width: 1024px) 300px, 45vw"
                    className="object-contain p-[7%]"
                  />
                </div>
                <figcaption className="mt-3 flex flex-col gap-1 lg:flex-row lg:items-baseline lg:justify-between lg:gap-3">
                  <span className={`${s.capName} !mt-0`}>{h.name}</span>
                  <span className={s.label}>{h.when}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Scene>

      {/* ── 23 Game day ───────────────────────────────────────────── */}
      <Scene id="game-day" innerClassName="!pt-0 !px-0">
        <div className="relative h-[40svh] min-h-[220px] w-full overflow-hidden" data-r="fade">
          <Image src="/images/lrhs-go-mustangs.jpg" alt="Game-day graphic: the wordmark and GO MUSTANGS on Mustang Green" fill sizes="100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#02200f] to-transparent" />
        </div>
        <div className="flex flex-1 flex-col justify-center px-[clamp(20px,5vw,72px)] pt-8">
          <Head
            id="game-day"
            kicker="Game day"
            title="Where Spirit Red earns its keep"
            lede="Social posts and match-day graphics — the one place the accent runs at full volume."
            wide
          />
          <div className="mt-6 inline-flex items-center gap-3 self-start rounded-full bg-[#AA2121] py-2 pr-4 pl-2 text-[13px] font-semibold" data-r="up" style={d(340)}>
            <span className="h-6 w-6 rounded-full bg-white/20" />
            Spirit Red · #AA2121 · game day only
          </div>
        </div>
      </Scene>

      {/* ── 24 The website ────────────────────────────────────────── */}
      <Scene id="website" center>
        <div
          aria-hidden
          className={s.ghost}
          style={{ ...maskOf("LRHS Mustang 4.svg"), left: "50%", top: "50%", width: "min(1400px, 130vw)", aspectRatio: "1.6 / 1", transform: "translate(-50%, -50%)", opacity: 0.05 }}
        />
        <div className="relative mx-auto flex max-w-[860px] flex-col items-center text-center">
          <div className={s.eyebrow} data-r="up">
            <span className={s.badge}>{String(indexOf("website")).padStart(2, "0")}</span>
            The system, applied
          </div>
          <h2 id="website-title" className={`${s.title} ${s.titleWide} mx-auto`} data-r="up" style={d(100)}>
            See it come to life
          </h2>
          <p className={`${s.lede} mx-auto`} data-r="up" style={d(200)}>
            Everything above, built into a living product. Step into the Lakewood Ranch High School website — an interactive, on-brand mockup.
          </p>
          <a href={WEBSITE} data-external className={`${s.cta} mt-9`} data-r="up" style={d(300)}>
            Launch the website mockup
            <ArrowRight size={18} strokeWidth={2.2} />
          </a>
          <span className={`mt-4 ${s.label}`} data-r="up" style={d(380)}>
            Opens the website concept · a separate experience
          </span>
        </div>
      </Scene>

      {/* ── 25 The rules ──────────────────────────────────────────── */}
      <Scene id="rules">
        <Head id="rules" kicker="The rules" title="The whole system, in six rules" lede="If you remember nothing else from these pages, remember these." wide />
        <ol className="mt-8 grid flex-1 grid-cols-1 content-center gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {RULES.map(([title, text], i) => (
            <li key={title} className="flex flex-col rounded-[22px] bg-[#EEF1EF] p-6 sm:p-[clamp(16px,3svh,28px)]" data-r="up" style={d(180 + i * 80)}>
              <span className="flex items-baseline gap-3">
                <span className="text-[clamp(26px,min(3vw,5svh),44px)] leading-none font-extrabold tracking-[-0.04em] text-[#033922]">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[19px] font-bold tracking-[-0.02em]">{title}</span>
              </span>
              <span className="mt-2 text-[15px] leading-[1.5] text-[#5A6A61]">{text}</span>
            </li>
          ))}
        </ol>
      </Scene>

      {/* ── Go Mustangs ───────────────────────────────────────────── */}
      <Scene id="end" center>
        <div
          aria-hidden
          className={s.ghost}
          style={{ ...maskOf("LRHS Mustang 4.svg", "left bottom"), left: "-14%", bottom: "-24%", width: "92%", aspectRatio: "1.6 / 1" }}
        />
        <div className="relative mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center text-center">
          <div className="relative aspect-square w-[min(34vw,24svh)]" data-r="zoom">
            <Image src={mark("LRHS Emblem Mono.svg")} alt="" fill sizes="24vh" className="object-contain" />
          </div>
          <h2 id="end-title" className="mt-10 w-full" data-r="up" style={d(160)}>
            <Ib p="GO MUSTANGS" className="mx-auto h-[clamp(40px,8.6vw,132px)] max-w-full" />
          </h2>
          <p className={`${s.lede} mx-auto`} data-r="up" style={d(280)}>
            Lakewood Ranch High School · Home of the Mustangs since 1998
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3" data-r="up" style={d(380)}>
            <Link href={CASE_STUDY} className={s.cta}>
              <ArrowLeft size={18} strokeWidth={2.2} />
              Back to the case study
            </Link>
            <a href={WEBSITE} data-external className={`${s.cta} ${s.ctaGhost}`}>
              The website mockup
            </a>
          </div>
        </div>
        <p className="relative mt-8 text-center text-[11px] font-semibold tracking-[0.22em] text-white/45 uppercase">
          Concept work by Bronx Hanratty · not affiliated with the school district
        </p>
      </Scene>
    </>
  );
});

/* ── The page ──────────────────────────────────────────────────────── */

export function BrandGuidelines({ fontClass }: { fontClass: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /* Snapping lives on <html>, only while this page is mounted: mandatory
     where every scene fits the window, proximity on phones and short windows
     so a tall scene can still be read top to bottom. */
  useEffect(() => {
    const html = document.documentElement;
    const mq = window.matchMedia("(min-width: 768px) and (min-height: 620px)");
    const apply = () => {
      html.style.scrollSnapType = mq.matches ? "y mandatory" : "y proximity";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      html.style.scrollSnapType = "";
    };
  }, []);

  /* One wheel gesture, one scene. CSS snapping alone decides by distance on
     some mice and trackpads, so a short flick can spring back to the scene it
     started on. Where snapping is mandatory, a gesture that has moved a
     couple of dozen pixels goes to the next scene (or the previous one) and
     the rest of that gesture, momentum included, is absorbed. A scene taller
     than the window scrolls normally until its edge. Pinch-zoom, sideways
     scrolling and an open lightbox are left alone. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mq = window.matchMedia("(min-width: 768px) and (min-height: 620px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let last = 0;
    let acc = 0;
    let moved = false;
    let lockUntil = 0;
    const onWheel = (e: WheelEvent) => {
      if (!mq.matches || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (document.body.style.overflow === "hidden") return;
      const list = Array.from(el.querySelectorAll<HTMLElement>("[data-scene]"));
      const y = window.scrollY;
      const vh = window.innerHeight;
      let i = 0;
      list.forEach((n, k) => {
        if (n.offsetTop <= y + 4) i = k;
      });
      const cur = list[i];
      if (cur.offsetHeight > vh + 4) {
        const atTop = y <= cur.offsetTop + 4;
        const atBottom = y + vh >= cur.offsetTop + cur.offsetHeight - 4;
        if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
      }
      e.preventDefault();
      const now = performance.now();
      if (now - last > 200) {
        acc = 0;
        moved = false;
      }
      last = now;
      if (moved || now < lockUntil) return;
      acc += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      if (Math.abs(acc) < 24) return;
      const next = list[Math.max(0, Math.min(list.length - 1, i + (acc > 0 ? 1 : -1)))];
      if (next === cur) return;
      moved = true;
      lockUntil = now + 700;
      /* going up into a tall scene lands on its bottom, where the reader left it */
      const top = acc < 0 && next.offsetHeight > vh + 4 ? next.offsetTop + next.offsetHeight - vh : next.offsetTop;
      window.scrollTo({ top, behavior: reduce.matches ? "auto" : "smooth" });
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  /* The scene that crosses the middle of the window is the current one. The
     first time a scene gets there it plays its entrance (gets .in), once. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const scenes = Array.from(el.querySelectorAll<HTMLElement>("[data-scene]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const node = e.target as HTMLElement;
          node.classList.add(s.in);
          setActive(Number(node.dataset.scene));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    scenes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const info = SCENES[active];
  const light = !DARK.includes(info.tone);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div ref={root} className={`${s.page} ${fontClass}`}>
      <noscript>
        <style>{`[data-r],[data-card]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
      </noscript>

      <header className={`${s.bar} ${light ? s.barLight : ""}`}>
        <Link href={CASE_STUDY} className={s.pill} aria-label="Back to the Lakewood Ranch case study">
          <ArrowLeft size={15} strokeWidth={2.2} />
          <span className="hidden sm:inline">Case study</span>
        </Link>
        <span className={`${s.barTitle} hidden md:inline`}>Mustang Brand Guidelines</span>
        <span className={s.pill} aria-live="polite">
          <span className="max-w-[44vw] truncate">{info.chapter}</span>
          <span className={s.barCount}>
            {String(active + 1).padStart(2, "0")}/{SCENES.length}
          </span>
        </span>
      </header>

      <nav className={`${s.rail} ${light ? s.railLight : ""}`} aria-label="Sections">
        {SCENES.map((x, i) => (
          <button
            key={x.id}
            type="button"
            className={`${s.dot} ${i === active ? s.dotOn : ""}`}
            aria-label={x.label}
            aria-current={i === active ? "true" : undefined}
            onClick={() => go(x.id)}
          >
            <span className={s.dotLabel}>{x.label}</span>
          </button>
        ))}
      </nav>

      <main>
        <Scenes />
      </main>
    </div>
  );
}
