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
    { src: "/images/lrhs-go-mustangs.png", alt: "Go Mustangs — closing splash" },
  ],
  markLibrary: {
    kicker: "Mark Library",
    heading: "Every mark, every variant",
    intro:
      "The full set of *Mustang* marks — current lockups, athletic emblems, and the retired *legacy* artwork kept here for reference. Use the supplied SVGs only; never redraw, recolor, or stretch.",
    items: [
      { src: "/images/lrhs-marks/Full%20LRHS%20Logo.svg", label: "Full LRHS Logo" },
      { src: "/images/lrhs-marks/LRHS%20Emblem.svg", label: "LRHS Emblem" },
      { src: "/images/lrhs-marks/LRHS%20Emblem%20Black.svg", label: "LRHS Emblem Black" },
      { src: "/images/lrhs-marks/LRHS%20Emblem%20White.svg", label: "LRHS Emblem White", bg: "ink" },
      { src: "/images/lrhs-marks/LRHS%20Emblem%20No%20Horse.svg", label: "LRHS Emblem No Horse" },
      { src: "/images/lrhs-marks/LRHS%20Horse.svg", label: "LRHS Horse" },
      { src: "/images/lrhs-marks/LRHS%20Mustang%20Band.svg", label: "LRHS Mustang Band" },
      { src: "/images/lrhs-marks/LRHS%20Mustangs%20Ahead%201.svg", label: "LRHS Mustangs Ahead 1" },
      { src: "/images/lrhs-marks/LRHS%20Mustangs%20Ahead%202.svg", label: "LRHS Mustangs Ahead 2" },
      { src: "/images/lrhs-marks/LRHS%20Retro%20Logo.svg", label: "LRHS Retro Logo" },
      { src: "/images/lrhs-marks/I%20Love%20LRHS.svg", label: "I Love LRHS" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Emblem.svg", label: "Old LRHS Emblem" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Horse.svg", label: "Old LRHS Horse" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Horse%202.svg", label: "Old LRHS Horse 2" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Horse%203.svg", label: "Old LRHS Horse 3" },
    ],
  },
  next: {
    slug: "dirty-sara-soda",
    title: "Dirty Sara-Soda",
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
