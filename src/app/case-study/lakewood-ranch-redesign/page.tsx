import { CaseStudyLayout, type CaseStudyData } from "@/components/CaseStudyLayout";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

const data: CaseStudyData = {
  index: "03",
  category: "Brand · Web Concept",
  title: "Lakewood Ranch HS — Redesign Concept",
  subtitle:
    "A speculative rebrand and website concept for *Lakewood Ranch High School* — rethinking the identity, type system, and information architecture from the ground up while keeping the spirit of the school intact.",
  hero: {
    src: "/images/brothers.png",
    alt: "Lakewood Ranch High School redesign concept hero",
  },
  meta: [
    { label: "Year", value: "2026" },
    { label: "Role", value: "Designer" },
    { label: "Tools", value: "*Figma*, *Illustrator*" },
    { label: "Type", value: "Concept · Self-initiated" },
  ],
  overview:
    "The existing site is dense, dated, and hard to navigate. The goal of this concept was a calmer, editorial-feeling refresh — one that respects the school's tradition while making information for students, parents, and faculty far easier to reach.",
  sections: [
    {
      heading: "Audit & research",
      body: "I started by mapping every page on the current site and timing how long it took to complete common tasks — finding the bell schedule, registering for an event, locating a teacher's email. The audit surfaced dozens of dead links, three different navigation patterns, and a homepage that buries the things people actually visit for.",
      image: "/images/brothers.png",
      imageAlt: "Information architecture sketches",
    },
    {
      heading: "Identity refresh",
      body: "The new mark keeps the *Mustangs* spirit but trades the heavy 90s wordmark for a tighter, more flexible system. A single display sans for headlines, an italic serif for moments, and a quiet two-color palette that lets photography lead. Every component scales from a phone-screen card up to a full-bleed banner without breaking.",
      image: "/images/brothers.png",
      imageAlt: "Logo and type system exploration",
    },
    {
      heading: "Web concept",
      body: "The homepage opens on a single hero photo and three clear destinations — *Students*, *Parents*, and *Faculty* — each routing into the content that group actually needs. Bell schedule, lunch menu, calendar, and grades are all surfaced within one click. Less depth, less guessing.",
    },
  ],
  gallery: [
    { src: "/images/brothers.png", alt: "Homepage concept" },
    { src: "/images/brothers.png", alt: "Mobile views" },
    { src: "/images/brothers.png", alt: "Type system" },
    { src: "/images/brothers.png", alt: "Component library" },
    { src: "/images/brothers.png", alt: "Identity application" },
  ],
  next: {
    slug: "recent-works",
    title: "Recent Works",
  },
};

export default function LakewoodRanchCaseStudy() {
  return (
    <main className="relative isolate min-h-screen w-full bg-[#f1f1f1] text-[#181818]">
      <SmoothScroll />
      <div className="pointer-events-none fixed inset-0 z-0">
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
