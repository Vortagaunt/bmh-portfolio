import type { Metadata } from "next";
import { CaseStudyLayout, type CaseStudyData, type MarkLibraryItem } from "@/components/CaseStudyLayout";
import LRHS_MARKS from "@/data/lrhs-marks.json";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Lakewood Ranch HS — Redesign Concept — Bronx Hanratty",
  description: "A speculative Mustang brand system and working website mockup for Lakewood Ranch High School.",
  openGraph: {
    title: "Lakewood Ranch HS — Redesign Concept — Bronx Hanratty",
    description: "A speculative Mustang brand system and working website mockup for Lakewood Ranch High School.",
    url: "/case-study/lakewood-ranch-redesign",
    siteName: "Bronx Hanratty",
    type: "article",
    images: [{ url: "/og/lakewood-ranch-redesign.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lakewood Ranch HS — Redesign Concept — Bronx Hanratty",
    description: "A speculative Mustang brand system and working website mockup for Lakewood Ranch High School.",
    images: ["/og/lakewood-ranch-redesign.jpg"],
  },
};

/* The mark library is read from the same catalogue the pitch deck and the
   printable PDF are built from (src/data/lrhs-marks.json), so the three can
   never list different marks. Reverse marks get the dark tile. */
const markSrc = (file: string) => `/images/lrhs-marks/${encodeURI(file)}`;
const markItems: MarkLibraryItem[] = [
  ...LRHS_MARKS.marks.map((m) => ({
    src: markSrc(m.file),
    label: m.name,
    ...(m.ground === "dark" ? { bg: "ink" as const } : {}),
  })),
  ...LRHS_MARKS.retired.map((m) => ({ src: markSrc(m.file), label: `${m.name} — retired` })),
];

const data: CaseStudyData = {
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
  links: [
    { label: "Explore the brand system", href: "/lrhs-brand-refresh.html", external: true, exitBg: "#0e0e10" },
  ],
  linksDecorated: true,
  overview:
    "Lakewood Ranch High is a ~2,400-student public school in *Bradenton, Florida*, part of the *Manatee County* district. Its identity today lives in a dozen scattered files and a wordmark that hasn't been refreshed in over a decade. This concept rebuilds the whole system from one confident green, an athletic display face, and a clear voice — then ships it as a live, on-brand website mockup.",
  sections: [
    {
      heading: "Three pillars",
      body: "The brand rests on three ideas. *Proud* — celebrating scholars, athletes, and artists loudly and often; this is a school that once swept both Florida's top academic and all-sports state honors in a single year, so the brand carries game-day energy all year. *Grounded* — welcoming and clear for every family; spirited, never corporate. *Together* — one campus, one community, the brand always pulling in the same direction.",
      image: "/images/lrhs-identity.png",
      imageAlt: "Identity pillars — Proud, Grounded, Together",
    },
    {
      heading: "Marks, color & type",
      body: "Twenty-five marks in seven families — the *LR* emblem for athletics, wordmarks for the front office, the Mustang on its own, the band, a graduation crest, the *Mustangs Ahead* newsletter and podcast, and retro marks for spirit wear. *Mustang Green* (#033922) leads — the school's own dark green — partnered with black and a clean white that stands in for the traditional silver. *Spirit Red* is the only true accent, and it stays rare. Headlines are set in *Industry Black* — uppercase, tracked, unapologetically athletic. *Hanken Grotesk* carries body and UI.",
      image: "/images/lrhs-marks.png",
      imageAlt: "The Mustang marks — wordmark, emblem, reversed emblem and the mustang, with the band, crest, Mustangs Ahead and retro families",
    },
    {
      heading: "The crest",
      body: "For the moments that should feel permanent — *diplomas*, *graduation programmes*, *awards* and ceremonies. The crest is the most formal mark in the system, so it is kept for those: full colour for print, a lighter colourway where that reads too heavy, and a single *Mustang Green* for embossing and foil.",
      image: "/images/lrhs-crest.jpg",
      imageAlt: "The crest in three versions — full colour, light, and one colour",
    },
    {
      heading: "The system, applied",
      body: "Everything above, rolled into a working website mockup. The homepage opens on a single hero photo, then routes *students*, *families*, and *faculty* into the content they actually came for — bell schedule, lunch, calendar, athletics. Voice rules carry through: headlines shout in caps, body stays warm and plain. Less depth, less guessing.",
      image: "/images/lrhs-in-use.png",
      imageAlt: "The system applied — game-day social and website header",
    },
    {
      heading: "Signage",
      body: "The sign on campus today lays the old mustang straight over grey block letters, so the horse and the name fight for the same space. The concept keeps the *same wall* and the *same words*, sets them in the brand's type on *Mustang Green*, and moves the horse back into the field so the name can actually be read.",
      image: "/images/lrhs-signage.jpg",
      imageAlt: "The school sign before and after — the current sign beside the redrawn concept on the same wall",
    },
    {
      heading: "Poster concepts",
      body: "Two posters built from the same parts as the wallpaper — the *Mustang Green* field and the horse. One carries the name for walls, entrances and the stadium; the other, *Go Mustangs!*, is for game week and the student section. A poster, a banner and the sign all read as one school.",
      image: "/images/lrhs-posters.jpg",
      imageAlt: "Two poster concepts — the school name repeated, and Go Mustangs!",
    },
  ],
  gallery: [
    { src: "/images/lrhs-color.png", alt: "Color system — Mustang Green, Spirit Red, Ink, Paper" },
    { src: "/images/lrhs-type.png", alt: "Type specimen — Industry Black & Hanken Grotesk" },
    { src: "/images/lrhs-icons.png", alt: "Iconography — Lucide outline set" },
    { src: "/images/lrhs-voice.png", alt: "Voice — We Do / We Don't" },
    { src: "/images/lrhs-go-mustangs.jpg", alt: "Go Mustangs — closing splash" },
  ],
  markLibrary: {
    kicker: "Mark Library",
    heading: "Every mark, every variant",
    intro:
      "The full set of *Mustang* marks — twenty-five in seven families, from the *LR* emblem to the graduation crest — plus the retired *legacy* artwork, kept here for reference. Use the supplied SVGs only; never redraw, recolor, or stretch.",
    items: markItems,
  },
  photoSets: [
    {
      kicker: "The evidence",
      heading: "Count the horses",
      intro:
        "Before drawing anything, I walked the campus with a phone. Every one of these is on site right now, and all of them were photographed in a *single afternoon* — not hunted for, just noticed on the way to class.",
      cols: 6,
      fit: "cover",
      items: [
      { src: "/images/lrhs-audit/img-4591.jpg", caption: "Scoreboard", alt: "Lakewood Ranch campus signage — scoreboard" },
      { src: "/images/lrhs-audit/img-4605.jpg", caption: "Academic banner", alt: "Lakewood Ranch campus signage — academic banner" },
      { src: "/images/lrhs-audit/img-4608.jpg", caption: "Pole banner", alt: "Lakewood Ranch campus signage — pole banner" },
      { src: "/images/lrhs-audit/img-4609.jpg", caption: "Building sign", alt: "Lakewood Ranch campus signage — building sign" },
      { src: "/images/lrhs-audit/img-4594.jpg", caption: "Field bench", alt: "Lakewood Ranch campus signage — field bench" },
      { src: "/images/lrhs-audit/img-4611.jpg", caption: "Entrance banner", alt: "Lakewood Ranch campus signage — entrance banner" },
      { src: "/images/lrhs-audit/img-4813.jpg", caption: "Parking sign", alt: "Lakewood Ranch campus signage — parking sign" },
      { src: "/images/lrhs-audit/img-4617.jpg", caption: "Band trailer", alt: "Lakewood Ranch campus signage — band trailer" },
      { src: "/images/lrhs-audit/img-4616.jpg", caption: "Band trailer", alt: "Lakewood Ranch campus signage — band trailer" },
      { src: "/images/lrhs-audit/img-4606.jpg", caption: "Pole banner", alt: "Lakewood Ranch campus signage — pole banner" },
      { src: "/images/lrhs-audit/img-4612.jpg", caption: "Cafeteria", alt: "Lakewood Ranch campus signage — cafeteria" },
      { src: "/images/lrhs-audit/7e57aa60-1d8d-4695-84ee-2cf9b2c02b30.jpg", caption: "Midfield", alt: "Lakewood Ranch campus signage — midfield" },
      ],
      note:
        "At least five different horse drawings, greens running from near-black to teal to cyan, and no two lockups built the same way. None of them are wrong — they were each somebody doing their best with whatever file they could find. That is the problem a system solves.",
    },
    {
      kicker: "In use",
      heading: "The part students actually wear",
      intro:
        "Spirit wear is the largest run the school prints each year, and the place a mark takes the most abuse. Embroidery, one-colour print, sublimation and a stitched patch — every one of these comes off the *same file*.",
      cols: 5,
      tile: "paper",
      fit: "contain",
      items: [
      { src: "/images/lrhs-apparel/cap.png", caption: "Cap — embroidered", alt: "Mustang identity on a cap" },
      { src: "/images/lrhs-apparel/hoodie.png", caption: "Hoodie — one-colour print", alt: "Mustang identity on a hoodie" },
      { src: "/images/lrhs-apparel/jersey.png", caption: "Game jersey — sublimated", alt: "Mustang identity on a game jersey" },
      { src: "/images/lrhs-apparel/crewneck.png", caption: "Crewneck — reversed on green", alt: "Mustang identity on a crewneck" },
      { src: "/images/lrhs-apparel/polo.png", caption: "Polo — embroidered patch", alt: "Mustang identity on a polo" },
      ],
    },
  ],
  next: {
    slug: "recent-works",
    title: "Recent Works",
  },
};

export default function LakewoodRanchCaseStudy() {
  return (
    <main className="relative isolate min-h-screen w-full bg-paper text-ink">
      <SmoothScroll />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div aria-hidden className="ambient absolute inset-0" />
        <GridBackdrop />
      </div>
      <SiteHeader />
      <div className="relative z-10">
        <CaseStudyLayout data={data} />
        <Footer />
      </div>
    </main>
  );
}
