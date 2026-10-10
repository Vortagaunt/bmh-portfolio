import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import LRHS_MARKS from "@/data/lrhs-marks.json";
import STUDIO_TEMPLATES from "@/data/mustang-studio-templates.json";
import { CaseStudyHero, RichText, type CaseStudyData } from "../CaseStudyLayout";
import { Reveal } from "../Reveal";
import { ZoomImage } from "../ZoomImage";
import { BuildVideo } from "../BuildVideo";
import { CompareSlider } from "./CompareSlider";
import { MarkExplorer } from "./MarkExplorer";
import { IdCards } from "./IdCards";
import { StudioTour } from "./StudioTour";
import { TemplateWall } from "./TemplateWall";
import { Swatches } from "./Swatches";

/* ─────────────────────────────────────────────────────────────────────
   Lakewood Ranch — the Mustang brand system, as it stands after the
   principal approved the logos (October 2026). Mustang Studio is the
   surprise: it is revealed after "One more thing…", in the same order as the
   deck, and nothing before that point mentions it.

   Counts come from the catalogues, never typed in: the marks and families
   from src/data/lrhs-marks.json (the same file the deck and the PDF read),
   the templates from src/data/mustang-studio-templates.json. The only
   hand-kept numbers are Mustang Studio 1.6's sizes, checks and icons.
   ───────────────────────────────────────────────────────────────────── */

const GREEN = "#033922";
const PAPER_TILE = "#F4F4F2";
const STUDIO_BG = "#0b100d";

const MARKS = LRHS_MARKS.marks;
const FAMILIES = LRHS_MARKS.families;
const RETIRED = LRHS_MARKS.retired;
const TEMPLATES = STUDIO_TEMPLATES.templates.length;
const STUDIO_SIZES = 17;
const STUDIO_CHECKS = 28;
const STUDIO_ICONS = 134;

const mark = (file: string) => `/images/lrhs-marks/${encodeURI(file)}`;

/* Numbers written out where they open a sentence or a heading. */
const WORDS: Record<number, string> = {
  5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten", 25: "twenty-five",
  26: "twenty-six", 27: "twenty-seven", 28: "twenty-eight", 29: "twenty-nine", 30: "thirty",
  40: "forty", 41: "forty-one", 42: "forty-two",
};
const say = (n: number) => WORDS[n] ?? String(n);
const Say = (n: number) => say(n).charAt(0).toUpperCase() + say(n).slice(1);

/* The top of the page — name, cover and description — exactly as the case
   study has always opened. The "Open Mustang Studio" button that used to sit
   beside the guidelines link is left out on purpose: the app is the surprise
   further down the page. */
const HERO: Pick<CaseStudyData, "index" | "category" | "title" | "subtitle" | "hero" | "meta" | "links" | "linksDecorated"> = {
  index: "03",
  category: "Brand · Web Concept",
  title: "Lakewood Ranch HS — Redesign Concept",
  subtitle:
    "A speculative rebrand and website concept for *Lakewood Ranch High School* — my school, home of the *Mustangs* in Bradenton, Florida since 1998. Rebuilding the identity from the ground up: marks, color, type, voice, and a working website mockup you can actually click through.",
  hero: {
    src: "/images/lrhs-hero.png",
    alt: "The Mustang Brand System — hero",
  },
  meta: [
    { label: "Year", value: "2026" },
    { label: "Role", value: "Designer" },
    { label: "Tools", value: "*Figma*, *Illustrator*" },
    { label: "Type", value: "Concept · Self-initiated" },
  ],
  links: [{ label: "Explore the brand system", href: "/lrhs-brand-refresh.html", external: true, exitBg: "#0e0e10" }],
  linksDecorated: true,
};

/* ── Small building blocks ─────────────────────────────────────────── */

function CtaLink({
  href,
  children,
  exitBg,
  tone = "page",
}: {
  href: string;
  children: ReactNode;
  exitBg?: string;
  tone?: "page" | "green" | "studio";
}) {
  const external = href.endsWith(".html") || href.startsWith("/studio");
  const className =
    tone === "page"
      ? "glass magnetic inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium tracking-tight text-ink"
      : tone === "green"
        ? "magnetic inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-medium tracking-tight text-[#033922] hover:bg-white/90"
        : "magnetic inline-flex items-center gap-2 rounded-full bg-[#2EA866] px-5 py-2.5 text-[14px] font-medium tracking-tight text-[#04140b] hover:bg-[#38b872]";
  return external ? (
    <a href={href} data-external data-exit-bg={exitBg} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** A chapter of the story: number, title and a short lede, then its work. */
function Chapter({
  n,
  id,
  title,
  lede,
  children,
}: {
  n: number;
  id: string;
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative mx-auto mt-28 max-w-[1440px] scroll-mt-24 px-5 sm:mt-44 sm:px-8">
      <Reveal variant="up" duration={1000}>
        <div className="grid grid-cols-12 gap-x-6 gap-y-5 border-t border-line pt-6 sm:gap-x-8 sm:pt-8">
          <div className="col-span-12 flex items-start gap-4 lg:col-span-6">
            <span className="mt-[0.35em] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#033922] text-[12.5px] font-medium text-white tabular-nums ring-1 ring-white/10 sm:h-9 sm:w-9 sm:text-[13px]">
              {String(n).padStart(2, "0")}
            </span>
            <h2
              className="font-display text-ink"
              style={{ fontSize: "clamp(32px, 5.2vw, 68px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 0.98 }}
            >
              {title}
            </h2>
          </div>
          {lede && (
            <p className="col-span-12 max-w-[58ch] text-[17px] leading-[1.55] text-ink/75 sm:text-[18px] lg:col-span-5 lg:col-start-8 lg:pt-2">
              <RichText>{lede}</RichText>
            </p>
          )}
        </div>
      </Reveal>
      <div className="mt-10 sm:mt-16">{children}</div>
    </section>
  );
}

/** A sub-heading inside a chapter, with its paragraph beside it. */
function Part({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="mt-20 grid grid-cols-12 gap-x-6 gap-y-8 sm:mt-28 sm:gap-x-8">
      <div className="col-span-12 lg:col-span-4">
        <h3
          className="font-display text-ink"
          style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}
        >
          {title}
        </h3>
        <p className="mt-4 max-w-[46ch] text-[16px] leading-[1.6] text-ink/75 sm:text-[17px]">
          <RichText>{body}</RichText>
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8">{children}</div>
    </div>
  );
}

/** Caption under a piece of work. */
function Caption({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <figcaption className="mt-3 flex flex-col gap-0.5">
      <span className="text-[14px] font-medium tracking-tight text-ink">{title}</span>
      {children && <span className="text-[13px] leading-[1.45] text-ink/60">{children}</span>}
    </figcaption>
  );
}

/* ── Data ──────────────────────────────────────────────────────────── */

const AUDIT = [
  ["img-4591.jpg", "Scoreboard"],
  ["img-4605.jpg", "Academic banner"],
  ["img-4608.jpg", "Pole banner"],
  ["img-4609.jpg", "Building sign"],
  ["img-4594.jpg", "Field bench"],
  ["img-4611.jpg", "Entrance banner"],
  ["img-4813.jpg", "Parking sign"],
  ["img-4617.jpg", "Band trailer"],
  ["img-4616.jpg", "Band trailer"],
  ["img-4606.jpg", "Pole banner"],
  ["img-4612.jpg", "Cafeteria"],
  ["7e57aa60-1d8d-4695-84ee-2cf9b2c02b30.jpg", "Midfield"],
].map(([file, caption]) => ({
  src: `/images/lrhs-audit/${file}`,
  alt: `A horse on campus today — ${caption.toLowerCase()}`,
  title: caption,
}));

const APPAREL = [
  ["cap.png", "Cap", "Embroidered"],
  ["hoodie.png", "Hoodie", "One-colour print"],
  ["jersey.png", "Game jersey", "Sublimated"],
  ["crewneck.png", "Crewneck", "Reversed on green"],
  ["polo.png", "Polo", "Embroidered patch"],
].map(([file, name, how]) => ({
  src: `/images/lrhs-apparel/${file}`,
  alt: `The Mustang identity on a ${name.toLowerCase()} — ${how.toLowerCase()}`,
  name,
  how,
}));

const POWERHOUSE = [
  {
    src: "/images/lrhs-powerhouse/powerhouse-ai-original.png",
    alt: "The Academic Powerhouse badge in use today — an AI-generated picture",
    title: "Today",
    note: "The original. AI-generated, a flat picture.",
  },
  {
    src: mark("LRHS Academic Powerhouse.svg"),
    alt: "The Academic Powerhouse badge redrawn as vector artwork, with the LR",
    title: "Redrawn, with the LR",
    note: "The system's mustang inside the LR.",
  },
  {
    src: mark("LRHS Academic Powerhouse 2.svg"),
    alt: "The Academic Powerhouse badge redrawn as vector artwork, with the mustang alone",
    title: "Redrawn, the mustang",
    note: "The horse alone, drawn larger.",
  },
];

const PILLARS = [
  ["Proud", "We celebrate our scholars, athletes, and artists loudly and often. Game-day energy, all year."],
  ["Grounded", "Welcoming and clear for every family. Spirited, never corporate; confident, never loud for its own sake."],
  ["Together", "One campus, one community. We ride together — and the brand always pulls in the same direction."],
];
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
const CRIES = ["Go Mustangs", "Home of the Mustangs", "Ride together", "Mustang pride", "One Ranch", "Join the herd"];

/* ── The page ──────────────────────────────────────────────────────── */

export function LrhsCaseStudy() {
  return (
    <article className="relative pt-24 pb-24 sm:pt-32 sm:pb-32">
      {/* The case study's own name, cover and description, kept as they were. */}
      <CaseStudyHero data={HERO} />

      <section className="relative mx-auto mt-20 grid max-w-[1440px] grid-cols-12 gap-6 px-5 sm:mt-28 sm:gap-8 sm:px-8">
        <Reveal variant="up" duration={1100} className="col-span-12 lg:col-span-9">
          <p className="text-[21px] leading-[1.4] tracking-[-0.01em] text-ink sm:text-[28px] sm:leading-[1.35]">
            <RichText>
              {
                "Walk around Lakewood Ranch High and you can count at least *five different horses* — on the scoreboard, the banners, the band trailer — each drawn differently, in a different green. None of them are wrong; each one was someone doing their best with whatever file they could find. This project draws one horse, builds a system around it, and puts it on the things the school actually uses — the signs, the posters, the shirts and the cards in everyone's pocket. In October 2026, the principal approved the logos."
              }
            </RichText>
          </p>
        </Reveal>
      </section>

      {/* ── 01 The problem ────────────────────────────────────────── */}
      <Chapter
        n={1}
        id="count-the-horses"
        title="Count the horses"
        lede="Before drawing anything, I walked the campus with a phone. Every one of these is on site right now, photographed in a *single afternoon* — not hunted for, just noticed on the way to class."
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {AUDIT.map((p, i) => (
            <li key={p.src}>
              <figure>
                <div className="media-elevated relative w-full overflow-hidden bg-[#cfcfcf]" style={{ aspectRatio: "1 / 1" }}>
                  <ZoomImage
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 230px, (min-width: 640px) 32vw, 48vw"
                    className="object-cover"
                    zoomItems={AUDIT}
                    zoomIndex={i}
                  />
                </div>
                <figcaption className="mt-2.5 text-[13px] tracking-tight text-ink/60">{p.title}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-[64ch] text-[16px] leading-[1.6] text-ink/70 sm:text-[17px]">
          At least five different horse drawings, greens running from near-black to teal to cyan, and no two lockups built
          the same way. That&rsquo;s the problem a system solves.
        </p>
      </Chapter>

      {/* ── 02 The redraw ─────────────────────────────────────────── */}
      <Chapter
        n={2}
        id="one-horse"
        title="One horse, drawn once"
        lede="The retired emblem beside the redraw. One silhouette and one green, built on a single grid, so the same file holds up on a scoreboard, a jersey and a favicon."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {[
            { file: "Old LRHS Emblem.svg", title: "Before", note: "The retired emblem, kept on file for reference, not for use." },
            { file: "LRHS Emblem.svg", title: "After", note: "Redrawn: a cleaner silhouette, one green, legible down to a favicon." },
          ].map((m) => (
            <figure key={m.file}>
              <div className="media-elevated relative w-full overflow-hidden" style={{ aspectRatio: "4 / 3", background: PAPER_TILE }}>
                <ZoomImage
                  src={mark(m.file)}
                  alt={`${m.title}: ${m.note}`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-contain p-[14%]"
                />
              </div>
              <Caption title={m.title}>{m.note}</Caption>
            </figure>
          ))}
        </div>

        <Part
          title="Softer corners, same LR"
          body={`Every corner on the *LR* is now very slightly rounded — about the softness of an app icon — and the same change runs through all *seven emblem files*, from the full-colour emblem to the band marks. The outline, the white keyline and the green letter round together, so the outline stays even. Where one letter tucks under the other, the corner stays sharp. Drag across the picture to compare.`}
        >
          <CompareSlider
            before={{ src: "/images/lrhs-corners/LRHS-Emblem-square.svg", alt: "The emblem with square corners", label: "Square" }}
            after={{ src: mark("LRHS Emblem.svg"), alt: "The emblem with subtly rounded corners", label: "Rounded" }}
            aspect="16 / 10"
            fit="contain"
            ground={PAPER_TILE}
            initial={50}
            inset="6%"
            zoom={{ scale: 2.8, origin: "15% 1%", on: "Close-up of the L", off: "Whole emblem" }}
          />
        </Part>
      </Chapter>

      {/* ── 03 The family ─────────────────────────────────────────── */}
      <Chapter
        n={3}
        id="marks"
        title="One family, every department"
        lede={`${Say(MARKS.length)} marks in ${say(FAMILIES.length)} families. Each part of the school gets marks built for its job, and every one still reads as the same school. Choose a department to see its marks, and open any mark for what it's for.`}
      >
        <MarkExplorer families={FAMILIES} marks={MARKS} retired={RETIRED} />
      </Chapter>

      {/* ── 04 Crest and Academics ────────────────────────────────── */}
      <Chapter
        n={4}
        id="crest"
        title="For the moments that should feel permanent"
        lede="Two families sit apart from game day. The *crest* is the most formal mark in the system, kept for diplomas, graduation programmes, awards and ceremonies. *Academics* gives classroom honours a badge of their own."
      >
        <figure>
          <div className="media-elevated overflow-hidden bg-[#f1f1ef] px-[2%] pt-[4%] pb-[1%]">
            <div className="relative w-full" style={{ aspectRatio: "1920 / 855" }}>
              <ZoomImage
                src="/images/lrhs-crest-trio.jpg"
                alt="The crest in three versions — full colour, light, and one colour"
                fill
                sizes="(min-width: 1440px) 1380px, 100vw"
                className="object-contain"
              />
            </div>
          </div>
          <Caption title="The crest, founded 1998">
            Full colour for print, a lighter colourway where that reads too heavy, and Mustang Green alone for embossing
            and foil.
          </Caption>
        </figure>

        <Part
          title="Academic Powerhouse"
          body="The badge in use on campus today began as an AI-generated picture — a flat image that blurs when it's enlarged and can't be recoloured. It's redrawn here as vector artwork in two versions, both on the system's own mustang, so they print sharp at any size. Together they're the *Academics* family."
        >
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {POWERHOUSE.map((p, i) => (
              <li key={p.src}>
                <figure>
                  <div className="media-elevated relative w-full overflow-hidden" style={{ aspectRatio: "1 / 1", background: i === 0 ? "#ffffff" : PAPER_TILE }}>
                    <ZoomImage
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 1024px) 280px, (min-width: 640px) 32vw, 100vw"
                      className={i === 0 ? "object-contain p-[6%]" : "object-contain p-[12%]"}
                      zoomItems={POWERHOUSE.map((x) => ({ src: x.src, alt: x.alt }))}
                      zoomIndex={i}
                    />
                  </div>
                  <Caption title={p.title}>{p.note}</Caption>
                </figure>
              </li>
            ))}
          </ul>
        </Part>
      </Chapter>

      {/* ── 05 Colour, type, voice ────────────────────────────────── */}
      <Chapter
        n={5}
        id="basics"
        title="Colour, type and voice"
        lede="One confident green does most of the work and *Spirit Red* is saved for game day. The type is athletic where it shouts and plain where it explains, and the voice sounds like the school on its best day."
      >
        <Swatches />
        <p className="mt-4 text-[13px] text-ink/55">
          <span className="hidden md:inline">Each colour is as wide as its share of a typical piece. </span>
          Click a colour to copy its hex.
        </p>

        <Part
          title="An athletic face, a plain sans"
          body="*Industry Black* sets the headlines: capitals, tracked, unapologetically athletic. *Hanken Grotesk* carries everything people actually read, from body copy to captions and labels."
        >
          <div className="media-elevated overflow-hidden" style={{ background: "#04231B" }}>
            <div className="relative w-full" style={{ aspectRatio: "1240 / 350" }}>
              <Image
                src="/images/lrhs-type-display.jpg"
                alt="Go Mustangs set in Industry Black, with the alphabet and figures"
                fill
                sizes="(min-width: 1024px) 900px, 100vw"
                className="object-contain"
              />
            </div>
            <div className="relative mx-auto w-[86%] max-w-[700px] pb-4" style={{ aspectRatio: "950 / 230" }}>
              <Image
                src="/images/lrhs-type-scale.jpg"
                alt="The type scale: display, heading, eyebrow and body"
                fill
                sizes="(min-width: 1024px) 700px, 86vw"
                className="object-contain"
              />
            </div>
          </div>
        </Part>

        <Part
          title="How the school sounds"
          body="Direct, warm and unfussy. Proud without the hard sell. The voice rules sit in the same document as the marks, because a brand that only governs logos governs nothing."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PILLARS.map(([word, line]) => (
              <div key={word} className="glass rounded-[20px] p-5 sm:p-6">
                <p className="font-display text-[24px] font-semibold tracking-[-0.03em] text-ink">{word}</p>
                <p className="mt-2 text-[14.5px] leading-[1.55] text-ink/70">{line}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { title: "We do", items: VOICE_DO, dot: "bg-[#2EA866]" },
              { title: "We don't", items: VOICE_DONT, dot: "bg-[#AA2121]" },
            ].map((v) => (
              <div key={v.title} className="rounded-[20px] p-5 text-white sm:p-6" style={{ background: GREEN }}>
                <p className="flex items-center gap-2 text-[15px] font-medium">
                  <span className={`h-2 w-2 rounded-full ${v.dot}`} aria-hidden />
                  {v.title}
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {v.items.map((line) => (
                    <li key={line} className="text-[15px] leading-[1.5] text-white/80">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-[13px] text-ink/55">Rallying cries, used sparingly</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {CRIES.map((c) => (
                <li key={c} className="rounded-full border border-line px-3.5 py-1.5 text-[14px] font-medium tracking-tight text-ink">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Part>
      </Chapter>

      {/* ── 06 Applied ────────────────────────────────────────────── */}
      <Chapter
        n={6}
        id="applied"
        title="On the things the school uses"
        lede="The test of a system is whether it still looks like one school once other people start using it — on a wall, a poster, a shirt."
      >
        <div className="grid grid-cols-12 gap-x-6 gap-y-8 sm:gap-x-8">
          <div className="col-span-12 lg:col-span-4">
            <h3
              className="font-display text-ink"
              style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >
              The same wall, redrawn
            </h3>
            <p className="mt-4 max-w-[46ch] text-[16px] leading-[1.6] text-ink/75 sm:text-[17px]">
              <RichText>
                {
                  "The sign on campus today lays the old mustang straight over grey block letters, so the horse and the name fight for the same space. The concept keeps the *same wall* and the *same words*, sets them in the brand's type on Mustang Green, and moves the horse back into the field so the name can be read."
                }
              </RichText>
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <CompareSlider
              before={{ src: "/images/lrhs-signage/sign-before.jpg", alt: "The school sign as it hangs today", label: "Today" }}
              after={{ src: "/images/lrhs-signage/sign-after.jpg", alt: "The same wall with the sign redrawn on Mustang Green", label: "Redrawn" }}
              aspect="924 / 693"
              initial={55}
              sizes="(min-width: 1024px) 900px, 100vw"
            />
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:mt-28 sm:grid-cols-2 sm:gap-6">
          {[
            ["/images/lrhs-signage/poster-name.jpg", "The name", "For walls, entrances and the stadium."],
            ["/images/lrhs-signage/poster-go-mustangs.jpg", "Go Mustangs!", "For game week and the student section."],
          ].map(([src, title, note]) => (
            <figure key={src}>
              <div className="media-elevated relative w-full overflow-hidden bg-[#033922]" style={{ aspectRatio: "16 / 9" }}>
                <ZoomImage src={src} alt={`Poster concept — ${title}`} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
              <Caption title={`Poster: ${title}`}>{note}</Caption>
            </figure>
          ))}
        </div>

        <Part
          title="The part students actually wear"
          body="Spirit wear is the largest run the school prints each year, and the place a mark takes the most abuse. Embroidery, one-colour print, sublimation and a stitched patch — every one of these comes off the *same file*."
        >
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
            {APPAREL.map((a, i) => (
              <li key={a.src}>
                <figure>
                  <div className="media-elevated relative w-full overflow-hidden bg-[#e9ecea]" style={{ aspectRatio: "3 / 4" }}>
                    <ZoomImage
                      src={a.src}
                      alt={a.alt}
                      fill
                      sizes="(min-width: 1024px) 180px, 45vw"
                      className="object-contain p-3"
                      zoomItems={APPAREL.map((x) => ({ src: x.src, alt: x.alt }))}
                      zoomIndex={i}
                    />
                  </div>
                  <Caption title={a.name}>{a.how}</Caption>
                </figure>
              </li>
            ))}
          </ul>
        </Part>
      </Chapter>

      {/* ── 07 The cards ──────────────────────────────────────────── */}
      <Chapter
        n={7}
        id="ids"
        title="The card every student carries"
        lede="The one piece of the system everybody has on them. Credit-card size, with the photo and name first and the barcode clear so it scans first time. The back keeps the *24/7 support lines* from today's card and adds a return address."
      >
        <div
          className="relative overflow-hidden rounded-[28px] px-5 py-14 sm:rounded-[36px] sm:px-10 sm:py-20 lg:px-16"
          style={{ background: "radial-gradient(90% 90% at 50% 0%, #0b4a2d 0%, #033922 55%, #022a1a 100%)" }}
        >
          <IdCards />
          <p className="mx-auto mt-14 max-w-[60ch] text-center text-[13.5px] leading-[1.5] text-white/55">
            Staff cards turn horizontal and full green, so they read differently from students across a corridor. The
            student number shown is a sample, not a real ID.
          </p>
        </div>
      </Chapter>

      {/* ── One more thing… → Mustang Studio ────────────────────────
          The surprise, as in the deck: nothing above this mentions the app —
          not the hero, the numbers, the links or the copy — so the black
          stage holds on "One more thing…" and Mustang Studio is revealed
          underneath it. Keep it that way when adding anything above. */}
      <section id="one-more-thing" className="relative mx-auto mt-28 max-w-[1440px] scroll-mt-24 px-3 sm:mt-44 sm:px-6">
        <div
          className="overflow-hidden rounded-[28px] text-white sm:rounded-[36px]"
          style={{ background: `linear-gradient(180deg, #000 0px, #000 calc(100vh + 600px), ${STUDIO_BG} calc(100vh + 1100px))` }}
        >
          {/* the pause — a full screen of black and four words */}
          <div className="flex min-h-[100svh] items-center justify-center px-5 py-24">
            <Reveal variant="fade" duration={2000} threshold={0.6}>
              <h2
                className="text-center font-display"
                style={{ fontSize: "clamp(44px, 8vw, 120px)", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 1 }}
              >
                One more thing&hellip;
              </h2>
            </Reveal>
          </div>

          <div id="studio" className="scroll-mt-24 px-5 pb-10 sm:px-10 sm:pb-14 lg:px-14 lg:pb-16">
            {/* the reveal */}
            <Reveal variant="up" duration={1400} threshold={0.4}>
              <div className="flex flex-col items-center pt-6 text-center sm:pt-10">
                <Image
                  src="/images/lrhs-studio/app-icon.png"
                  alt="The Mustang Studio app icon"
                  width={128}
                  height={128}
                  className="h-24 w-24 rounded-[24px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] sm:h-32 sm:w-32 sm:rounded-[30px]"
                />
                <h2
                  className="mt-8 font-display"
                  style={{ fontSize: "clamp(56px, 10.5vw, 168px)", fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 0.9 }}
                >
                  Mustang Studio
                </h2>
                <p className="mt-6 max-w-[34ch] text-[19px] leading-[1.45] text-white/75 sm:mt-8 sm:text-[23px]">
                  A brand only works if people can use it, so I built the app for it: a design editor that only speaks
                  Mustang.
                </p>
              </div>
            </Reveal>

            <div className="mt-20 grid grid-cols-12 gap-x-6 gap-y-8 sm:mt-28 sm:gap-x-8">
              <div className="col-span-12 lg:col-span-7">
                <p className="font-display text-[30px] leading-none font-semibold tracking-[-0.035em] sm:text-[44px]">
                  On brand, every time
                </p>
                <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.6] text-white/75 sm:text-[17px]">
                  A coach, a club sponsor or the front office picks a template, changes the words and exports — and it
                  comes out on brand. It&rsquo;s free, with no licence, no account and no subscription, and it runs on
                  Windows, a Mac, a Chromebook or in any browser, even offline.
                </p>
                <div className="mt-6">
                  <CtaLink href="/studio/" exitBg={STUDIO_BG} tone="studio">
                    Open Mustang Studio
                  </CtaLink>
                </div>
              </div>
              <dl className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-5 self-end lg:col-span-4 lg:col-start-9">
                {[
                  [TEMPLATES, "templates"],
                  [STUDIO_SIZES, "sizes"],
                  [STUDIO_CHECKS, "brand checks"],
                  [STUDIO_ICONS, "icons"],
                ].map(([n, label]) => (
                  <div key={label} className="flex flex-col-reverse gap-1 border-t border-white/10 pt-3">
                    <dt className="text-[13px] text-white/55">{label}</dt>
                    <dd className="font-display text-[30px] leading-none font-semibold tracking-[-0.04em] tabular-nums sm:text-[36px]">{n}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-14 sm:mt-20">
              <StudioTour />
            </div>

            <div className="mt-20 grid grid-cols-12 gap-x-6 gap-y-8 sm:mt-28 sm:gap-x-8">
              <div className="col-span-12 lg:col-span-4">
                <h3 className="font-display text-[28px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[36px]">
                  It checks the work for you
                </h3>
                <p className="mt-4 max-w-[46ch] text-[16px] leading-[1.6] text-white/75 sm:text-[17px]">
                  {`${Say(STUDIO_CHECKS)} rules run while you work: text that’s hard to read, a mark on the wrong ground, a tilted or faded mark, off-brand colours, too much Spirit Red, text too small to print or too close to the trim. Each one comes with a one-click fix.`}
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <CompareSlider
                  before={{
                    src: "/images/lrhs-studio/ui-check-before.jpg",
                    alt: "A game-day post with two mistakes flagged: the emblem is tilted and the headline is green on green",
                    label: "Two problems",
                  }}
                  after={{
                    src: "/images/lrhs-studio/ui-check-after.jpg",
                    alt: "The same post after one click: on brand, nothing to fix",
                    label: "One click later",
                  }}
                  aspect="16 / 10"
                  initial={50}
                  dark
                />
              </div>
            </div>

            <div className="mt-20 sm:mt-28">
              <div className="grid grid-cols-12 gap-x-6 gap-y-4 sm:gap-x-8">
                <h3 className="col-span-12 font-display text-[28px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[36px] lg:col-span-6">
                  {Say(TEMPLATES)} templates, ready on day one
                </h3>
                <p className="col-span-12 max-w-[56ch] text-[16px] leading-[1.6] text-white/75 sm:text-[17px] lg:col-span-6">
                  Sorted by department, plus a set for every season — Homecoming, Pink Out, Halloween and the winter
                  holidays. These are the templates exactly as the app opens them, and everything in them stays editable.
                </p>
              </div>
              <div className="mt-8">
                <TemplateWall />
              </div>
            </div>

            <div className="mt-20 sm:mt-28">
              <h3 className="font-display text-[28px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[36px]">
                Everything it does, on one page
              </h3>
              <div className="relative mt-8 w-full overflow-hidden rounded-[16px] ring-1 ring-white/10" style={{ aspectRatio: "3 / 2" }}>
                <BuildVideo
                  src="/videos/mustang-studio-bento-motion.mp4"
                  still="/images/lrhs-studio-bento.jpg"
                  alt="A one-page summary of Mustang Studio — the editor, fill in the blanks, a staff list becoming ID cards, the templates, carousels, motion, seasons, the brand check, where it runs and what it exports"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The whole system, on one page ──────────────────────────
          The recap. It has a Mustang Studio tile, so it sits after the reveal
          (in the deck too: Studio, then this, then the QR). */}
      <section id="mustangs-ahead" className="relative mx-auto mt-28 max-w-[1440px] scroll-mt-24 px-5 sm:mt-44 sm:px-8">
        <Reveal variant="up" duration={1000}>
          <div className="grid grid-cols-12 gap-x-6 gap-y-5 border-t border-line pt-6 sm:gap-x-8 sm:pt-8">
            <h2
              className="col-span-12 font-display text-ink lg:col-span-6"
              style={{ fontSize: "clamp(32px, 5.2vw, 68px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 0.98 }}
            >
              Mustangs Ahead, on one page
            </h2>
            <p className="col-span-12 max-w-[58ch] text-[17px] leading-[1.55] text-ink/75 sm:text-[18px] lg:col-span-5 lg:col-start-8 lg:pt-2">
              Everything above on a single sheet — the LR, the student ID, the marks, colour and type, the crest,
              posters, apparel and Mustang Studio — built in like a keynote recap. It&rsquo;s the page to send when
              someone asks what the system actually is.
            </p>
          </div>
        </Reveal>
        <div className="relative mt-10 w-full overflow-hidden rounded-[18px] bg-black sm:mt-16 sm:rounded-[24px]" style={{ aspectRatio: "3 / 2" }}>
          <BuildVideo
            src="/videos/lrhs-bento-motion.mp4"
            still="/images/lrhs-bento.jpg"
            alt="Mustangs Ahead on one page — the LR emblem, the student ID, the mark library, colour, type, the crest, the band and podcast marks, Spirit Red, posters, apparel, the voice, Mustang Studio and a code that leads to this site"
          />
        </div>
      </section>

      {/* ── What happens next ─────────────────────────────────────── */}
      <section className="relative mx-auto mt-28 max-w-[1440px] px-5 sm:mt-40 sm:px-8">
        <div className="grid grid-cols-12 gap-x-6 gap-y-8 border-t border-line pt-8 sm:gap-x-8">
          <h2
            className="col-span-12 font-display text-ink lg:col-span-5"
            style={{ fontSize: "clamp(30px, 4.4vw, 56px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 }}
          >
            What happens next
          </h2>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <p className="text-[18px] leading-[1.5] text-ink sm:text-[21px]">
              The logos are approved. Next is getting the files — and Mustang Studio — into the hands of the people who
              make things for the school: athletics, the band, graduation and the newsletter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/studio/" exitBg={STUDIO_BG}>
                Open Mustang Studio
              </CtaLink>
              <CtaLink href="/lrhs-brand-refresh.html" exitBg="#0e0e10">
                Read the brand guidelines
              </CtaLink>
            </div>
            <p className="mt-8 text-[13px] leading-[1.5] text-ink/50">
              A self-initiated student project. Not affiliated with the school district.
            </p>
          </div>
        </div>
      </section>

      {/* ── Next case study ───────────────────────────────────────── */}
      <section className="relative mx-auto mt-24 max-w-[1280px] px-5 sm:mt-40 sm:px-8">
        <Reveal variant="up" duration={1100}>
          <Link href="/case-study/recent-works" className="group block border-t border-ink/15 pt-8 sm:pt-12">
            <div className="flex items-baseline justify-between gap-6 sm:gap-8">
              <span className="text-[11px] tracking-[0.18em] text-ink/55 uppercase">Next Project</span>
              <span className="text-[12px] tracking-[0.18em] text-ink/55 uppercase transition-transform duration-500 group-hover:translate-x-2">
                →
              </span>
            </div>
            <h3
              className="mt-4 font-display text-ink transition-transform duration-700 group-hover:-translate-y-1"
              style={{ fontSize: "clamp(32px, 8vw, 88px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              Recent Works
            </h3>
          </Link>
        </Reveal>
      </section>
    </article>
  );
}
