import { CaseStudyLayout, type CaseStudyData } from "@/components/CaseStudyLayout";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

const data: CaseStudyData = {
  index: "01",
  category: "Editorial · Print",
  title: "Yearbook 2025",
  subtitle:
    "Designing the cover, opening spreads, and editorial layout system for the 2025–2026 school yearbook — a 200+ page printed book documenting a year on campus.",
  hero: {
    src: "/images/yearbook-2025.png",
    alt: "Yearbook 2025 cover and editorial spreads",
  },
  meta: [
    { label: "Year", value: "2026" },
    { label: "Role", value: "Lead Designer" },
    { label: "Tools", value: "*Pictavo*, *Photoshop*" },
    { label: "Format", value: "Hardcover · 112 pages" },
  ],
  overview:
    "For the *DMJ 25-26* yearbook, the theme needed to be represented in the best way possible. The goal was to fully recreate the *Spotify Wrapped* look and feel, while capturing the school year in the most memorable way possible.",
  sections: [
    {
      heading: "The brief",
      body: "Help design the yearbook from the cover down: a fresh visual identity, a flexible grid system, and consistent typographic rules that anyone on the yearbook staff could follow. The book had to feel timeless, photographic, and unmistakably from this year — not a recycled template.",
      image: "/images/yearbook-2025.png",
      imageAlt: "Yearbook cover concept",
    },
    {
      heading: "Building the system",
      body: "I built a 12-column grid with three layout primitives — full-bleed, half-spread, and quote callout — that could be combined into any page type. Type pairs a tight display sans for sections with an italic serif for moments. Every spread is built from the same kit, so the book reads as one document instead of a stack of templates.",
      image: "/images/yearbook-2025.png",
      imageAlt: "Spread system",
    },
    {
      heading: "The cover",
      body: "The cover needed to feel like it captured the *Spotify* mood, not a yearbook. One of the new times that judging a book by its cover would be appropriate, because when you saw that for the first time you knew you were in for a treat.",
    },
  ],
  gallery: [
    { src: "/images/yearbook-2025.png", alt: "Cover detail" },
    { src: "/images/yearbook-2025.png", alt: "Opening spread" },
    { src: "/images/yearbook-2025.png", alt: "Section divider" },
    { src: "/images/yearbook-2025.png", alt: "Sports section" },
    { src: "/images/yearbook-2025.png", alt: "Senior portraits" },
  ],
  next: {
    slug: "846-am",
    title: "8:46 AM — A Short Documentary",
  },
};

export default function YearbookCaseStudy() {
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
