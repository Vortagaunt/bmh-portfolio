import type { Metadata } from "next";
import { CaseStudyLayout, type CaseStudyData } from "@/components/CaseStudyLayout";
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
      body: "Five marks for every situation — primary lockup, the *LR* emblem for athletics, a reverse lockup for on-green applications, the Mustang icon, and a stacked wordmark. *Mustang Green* (#033922) leads — the school's own dark green — partnered with black and a clean white that stands in for the traditional silver. *Spirit Red* is the only true accent, and it stays rare. Headlines are set in *Industry Black* — uppercase, tracked, unapologetically athletic. *Hanken Grotesk* carries body and UI.",
      image: "/images/lrhs-marks.png",
      imageAlt: "The five Mustang marks",
    },
    {
      heading: "The system, applied",
      body: "Everything above, rolled into a working website mockup. The homepage opens on a single hero photo, then routes *students*, *families*, and *faculty* into the content they actually came for — bell schedule, lunch, calendar, athletics. Voice rules carry through: headlines shout in caps, body stays warm and plain. Less depth, less guessing.",
      image: "/images/lrhs-in-use.png",
      imageAlt: "The system applied — game-day social and website header",
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
      "The full set of *Mustang* marks — current lockups, athletic emblems, and the retired *legacy* artwork kept here for reference. Use the supplied SVGs only; never redraw, recolor, or stretch.",
    items: [
      // current lockups
      { src: "/images/lrhs-marks/LRHS%20Full%20Logo%201.svg", label: "LRHS Full Logo 1" },
      { src: "/images/lrhs-marks/LRHS%20Full%20Logo%202.svg", label: "LRHS Full Logo 2" },
      { src: "/images/lrhs-marks/LRHS%20Full%20Logo%203.svg", label: "LRHS Full Logo 3" },
      // emblems
      { src: "/images/lrhs-marks/LRHS%20Emblem.svg", label: "LRHS Emblem" },
      { src: "/images/lrhs-marks/LRHS%20Emblem%20Black.svg", label: "LRHS Emblem Black" },
      { src: "/images/lrhs-marks/LRHS%20Emblem%20White.svg", label: "LRHS Emblem White", bg: "ink" },
      { src: "/images/lrhs-marks/LRHS%20Emblem%20No%20Horse.svg", label: "LRHS Emblem No Horse" },
      { src: "/images/lrhs-marks/LRHS%20Horse.svg", label: "LRHS Horse" },
      // programme + spirit marks
      { src: "/images/lrhs-marks/LRHS%20Band%201.svg", label: "LRHS Band 1" },
      { src: "/images/lrhs-marks/LRHS%20Band%202.svg", label: "LRHS Band 2" },
      { src: "/images/lrhs-marks/LRHS%20Mustangs%20Ahead%201.svg", label: "LRHS Mustangs Ahead 1" },
      { src: "/images/lrhs-marks/LRHS%20Mustangs%20Ahead%202.svg", label: "LRHS Mustangs Ahead 2" },
      { src: "/images/lrhs-marks/LRHS%20Retro.svg", label: "LRHS Retro" },
      // retired legacy artwork, kept for reference
      { src: "/images/lrhs-marks/I%20Love%20LRHS.svg", label: "I Love LRHS" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Emblem.svg", label: "Old LRHS Emblem" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Horse.svg", label: "Old LRHS Horse" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Horse%202.svg", label: "Old LRHS Horse 2" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Horse%203.svg", label: "Old LRHS Horse 3" },
    ],
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
