import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudyLayout, type CaseStudyData } from "@/components/CaseStudyLayout";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "DMJ Yearbook 2025-2026 — Bronx Hanratty",
  description: "Cover, layout system, and editorial design for Dr. Mona Jain Middle School’s 2025–2026 yearbook — a Spotify Wrapped-inspired book.",
  openGraph: {
    title: "DMJ Yearbook 2025-2026 — Bronx Hanratty",
    description: "Cover, layout system, and editorial design for Dr. Mona Jain Middle School’s 2025–2026 yearbook — a Spotify Wrapped-inspired book.",
    url: "/case-study/yearbook-2025",
    siteName: "Bronx Hanratty",
    type: "article",
    images: [{ url: "/og/yearbook-2025.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DMJ Yearbook 2025-2026 — Bronx Hanratty",
    description: "Cover, layout system, and editorial design for Dr. Mona Jain Middle School’s 2025–2026 yearbook — a Spotify Wrapped-inspired book.",
    images: ["/og/yearbook-2025.jpg"],
  },
};

// ─────────────────────────────────────────────────────────────────────
//  TOGGLE: flip to false when the yearbook drops to reveal the full
//  case study. The data/layout below is kept intact and ready.
// ─────────────────────────────────────────────────────────────────────
const COMING_SOON = false;

const data: CaseStudyData = {
  index: "01",
  category: "Editorial · Print",
  title: "DMJ Yearbook 2025-2026",
  subtitle:
    "Designing the cover, opening spreads, and editorial layout system for the 2025–2026 school yearbook — a 200+ page printed book documenting a year on campus.",
  hero: {
    src: "/images/yearbook-2025.png",
    alt: "DMJ Yearbook 2025-2026 cover and editorial spreads",
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
      image: "/images/yearbook-brief.jpg",
      imageAlt: "Spotify 2024 Wrapped — the visual reference for the DMJ Wrapped concept",
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
      image: "/images/yearbook-cover.jpg",
      imageAlt: "DMJ Wrapped — 2025–2026 yearbook cover proof",
    },
  ],
  gallery: [
    { src: "/images/yearbook-fun-times.png", alt: "Fun Times — dress-up days spread" },
    { src: "/images/yearbook-mash.png", alt: "MASH — interactive fortune game spread" },
    { src: "/images/yearbook-tsa.png", alt: "Technology Student Association spread" },
    { src: "/images/yearbook-soccer.png", alt: "Boys Soccer spread" },
    { src: "/images/yearbook-science.png", alt: "Science spread" },
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
          <div className="relative z-10 flex items-baseline gap-4 text-[12px] tracking-[0.16em] uppercase text-ink/60">
            <span>(01)</span>
            <span className="h-px w-10 bg-ink/30" />
            <span>Editorial · Print</span>
          </div>
        </Reveal>

        <Reveal variant="blur" delay={150} duration={1300}>
          <h1
            className="relative z-10 mt-6 font-display text-ink"
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
          <p className="relative z-10 mt-10 max-w-[560px] text-[18px] leading-[1.55] text-ink/80">
            The{" "}
            <span className="font-serif italic tracking-[-0.01em]">
              DMJ Yearbook 2025-2026
            </span>{" "}
            case study is being kept under wraps until the book is in
            students&apos; hands. Check back once it&apos;s officially out.
          </p>
        </Reveal>

        <Reveal variant="up" delay={420} duration={1100}>
          <Link
            href="/#works"
            className="group relative z-10 mt-12 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-ink/[0.03] px-6 py-3 text-[14px] font-medium tracking-tight text-ink transition-all duration-500 hover:bg-ink/[0.08] hover:scale-[1.02]"
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
    <main className="relative isolate min-h-screen w-full bg-paper text-ink">
      <SmoothScroll />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div aria-hidden className="ambient absolute inset-0" />
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
