import Link from "next/link";
import { CaseStudyLayout, type CaseStudyData } from "@/components/CaseStudyLayout";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Reveal } from "@/components/Reveal";

// ─────────────────────────────────────────────────────────────────────
//  TOGGLE: flip to false when the yearbook drops to reveal the full
//  case study. The data/layout below is kept intact and ready.
// ─────────────────────────────────────────────────────────────────────
const COMING_SOON = false;

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
      image: "/images/yearbook-system.png",
      imageAlt: "Yearbook spread system — DMJ 25-26 pages 52-53 in Pictavo",
    },
    {
      heading: "The cover",
      body: "The cover needed to feel like it captured the *Spotify* mood, not a yearbook. One of the new times that judging a book by its cover would be appropriate, because when you saw that for the first time you knew you were in for a treat.",
      image: "/images/yearbook-cover.png",
      imageAlt: "DMJ Wrapped — 2025–2026 yearbook cover proof",
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

function ComingSoon() {
  return (
    <section className="relative flex min-h-[78vh] items-center justify-center px-5 sm:px-8">
      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center text-center">
        {/* Big outline serif backdrop */}
        <Reveal
          variant="fade"
          duration={1600}
          as="span"
          className="serif-outline absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap"
          style={{
            fontSize: "clamp(180px, 26vw, 360px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Soon
        </Reveal>

        <Reveal variant="up" duration={1000}>
          <div className="relative z-10 flex items-baseline gap-4 text-[12px] tracking-[0.16em] uppercase text-[#181818]/60">
            <span>(01)</span>
            <span className="h-px w-10 bg-[#181818]/30" />
            <span>Editorial · Print</span>
          </div>
        </Reveal>

        <Reveal variant="blur" delay={150} duration={1300}>
          <h1
            className="relative z-10 mt-6 font-display text-[#181818]"
            style={{
              fontSize: "clamp(64px, 11vw, 168px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            Coming{" "}
            <span
              className="font-serif italic"
              style={{ fontWeight: 400, letterSpacing: "-0.02em" }}
            >
              Soon
            </span>
          </h1>
        </Reveal>

        <Reveal variant="up" delay={280} duration={1100}>
          <p className="relative z-10 mt-10 max-w-[560px] text-[18px] leading-[1.55] text-[#181818]/80">
            The{" "}
            <span className="font-serif italic tracking-[-0.01em]">
              Yearbook 2025
            </span>{" "}
            case study is being kept under wraps until the book is in
            students&apos; hands. Check back once it&apos;s officially out.
          </p>
        </Reveal>

        <Reveal variant="up" delay={420} duration={1100}>
          <Link
            href="/#works"
            className="group relative z-10 mt-12 inline-flex items-center gap-2 rounded-full border border-[#181818]/15 bg-[#181818]/[0.03] px-6 py-3 text-[14px] font-medium tracking-tight text-[#181818] transition-all duration-500 hover:bg-[#181818]/[0.08] hover:scale-[1.02]"
          >
            <span className="transition-transform duration-500 group-hover:-translate-x-1">
              ←
            </span>
            Back to Work
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function YearbookCaseStudy() {
  return (
    <main className="relative isolate min-h-screen w-full bg-[#f1f1f1] text-[#181818]">
      <SmoothScroll />
      <div className="pointer-events-none fixed inset-0 z-0">
        <GridBackdrop />
      </div>
      <SiteHeader />
      <div className="relative z-10">
        {COMING_SOON ? <ComingSoon /> : <CaseStudyLayout data={data} />}
        <Footer />
      </div>
    </main>
  );
}
