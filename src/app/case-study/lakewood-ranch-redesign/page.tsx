import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Reveal } from "@/components/Reveal";
import { LrhsGate } from "@/components/lrhs/LrhsGate";

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

// ─────────────────────────────────────────────────────────────────────
//  TOGGLE: true hides the case study behind "More to come…" (the same
//  switch as the yearbook page). With it false, the page sits behind a
//  password screen (src/components/lrhs/LrhsGate.tsx, which keeps only a
//  hash of it); the page itself lives in src/components/lrhs/LrhsCaseStudy.tsx.
// ─────────────────────────────────────────────────────────────────────
const COMING_SOON = false;

function ComingSoon() {
  return (
    <section className="relative flex min-h-[78vh] items-center justify-center px-5 sm:px-8">
      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center text-center">
        {/* Big outline serif backdrop — "Ahead", as in Mustangs Ahead */}
        <Reveal
          variant="fade"
          duration={2200}
          as="span"
          className="serif-outline absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap"
          style={{
            fontSize: "clamp(180px, 26vw, 360px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Ahead
        </Reveal>

        <Reveal variant="up" duration={1000}>
          <div className="relative z-10 flex items-baseline gap-4 text-[12px] tracking-[0.16em] uppercase text-ink/60">
            <span>(03)</span>
            <span className="h-px w-10 bg-ink/30" />
            <span>Brand · Web Concept</span>
          </div>
        </Reveal>

        <Reveal variant="blur" delay={150} duration={1600}>
          <h1
            className="relative z-10 mt-6 font-display text-ink"
            style={{
              fontSize: "clamp(64px, 11vw, 168px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            More to{" "}
            <span
              className="font-serif italic"
              style={{ fontWeight: 400, letterSpacing: "-0.02em" }}
            >
              come
            </span>
            <span aria-hidden className="motion-safe:animate-pulse">
              &hellip;
            </span>
          </h1>
        </Reveal>

        <Reveal variant="up" delay={280} duration={1100}>
          <p className="relative z-10 mt-10 max-w-[560px] text-[18px] leading-[1.55] text-ink/80">
            The{" "}
            <span className="font-serif italic tracking-[-0.01em]">
              Lakewood Ranch
            </span>{" "}
            case study has gone dark while something bigger takes shape.
            Updating soon.
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
        {COMING_SOON ? <ComingSoon /> : <LrhsGate />}
        <Footer />
      </div>
    </main>
  );
}
