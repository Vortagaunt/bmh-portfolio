import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About — Bronx Hanratty",
  description:
    "Bronx Hanratty — experimental digital & brand designer based in Sarasota, Florida.",
};

const glance = [
  { label: "Based in", value: "Sarasota, Florida" },
  { label: "Focus", value: "Digital & brand design" },
  { label: "Moving pixels since", value: "2020" },
  { label: "Currently", value: "Exploring Figma & Blender" },
];

const recognition = [
  {
    year: "2025",
    title: "Award of Excellence",
    detail:
      "Dalí Museum Student Surrealist Art Exhibit — for the digital piece “Cascade Creation.”",
  },
  {
    year: "2026",
    title: "Lead Designer — DMJ Wrapped Yearbook",
    detail:
      "Cover, system, and editorial layout for Dr. Mona Jain Middle School’s 2025–2026 book.",
  },
  {
    year: "2026",
    title: "“8:46 AM” — Short Documentary",
    detail:
      "Directed and edited a reflective short on 9/11 — winner, Manatee Film Rush · Jim Harbin Student Festival.",
  },
  {
    year: "2026",
    title: "Brand Designer — Dirty Sara-Soda",
    detail: "Launch mark and identity for a family-run mobile soda business.",
  },
  {
    year: "2026",
    title: "Lakewood Ranch HS — Brand Concept",
    detail: "A speculative Mustang identity and working website mockup.",
  },
];

const toolkit = [
  "Photoshop",
  "Illustrator",
  "InDesign",
  "Premiere Pro",
  "After Effects",
  "Figma",
  "Blender",
  "Pictavo",
];

const contact = [
  { label: "Resume", href: "/resume" },
  { label: "Email", href: "mailto:bronxhanratty@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/bronx-hanratty-57a8212b6" },
  { label: "x.com", href: "https://x.com/vortagaunt" },
];

export default function AboutPage() {
  return (
    <main className="relative isolate min-h-screen w-full bg-paper text-ink">
      <SmoothScroll />
      <div className="pointer-events-none fixed inset-0 z-0">
        <GridBackdrop />
      </div>
      <SiteHeader />

      <div className="relative z-10">
        <article className="relative pt-28 pb-24 sm:pt-32 sm:pb-32">
          {/* Intro statement */}
          <header className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <Reveal variant="up" duration={1000}>
              <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase text-ink/55">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" />
                About
              </div>
            </Reveal>
            <Reveal variant="blur" delay={120} duration={1300}>
              <h1
                className="mt-6 max-w-[14ch] font-display text-ink"
                style={{
                  fontSize: "clamp(44px, 8vw, 120px)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.92,
                }}
              >
                Getting my{" "}
                <span className="font-serif italic" style={{ fontWeight: 400 }}>
                  roots
                </span>{" "}
                in design.
              </h1>
            </Reveal>
          </header>

          {/* Portrait + long bio */}
          <section className="mx-auto mt-20 grid max-w-[1280px] grid-cols-12 gap-8 px-5 sm:mt-28 sm:px-8 lg:gap-12">
            <Reveal
              variant="scale"
              duration={1300}
              className="col-span-12 md:col-span-5"
            >
              <div
                className="relative w-full max-w-[460px] overflow-hidden rounded-sm bg-[#cfcfcf]"
                style={{ aspectRatio: "420 / 520" }}
              >
                <Image
                  src="/images/bronx-portrait.png"
                  alt="Bronx Hanratty"
                  fill
                  sizes="(min-width: 768px) 460px, 100vw"
                  className="object-cover object-top grayscale"
                />
              </div>
            </Reveal>

            <div className="col-span-12 flex flex-col justify-center gap-6 md:col-span-6 md:col-start-7">
              <Reveal variant="up" delay={120} duration={1100}>
                <p className="text-[20px] leading-[1.5] text-ink sm:text-[22px]">
                  I&apos;m{" "}
                  <span className="font-serif italic">Bronx Hanratty</span> — a
                  ninth-grade designer who fell for digital design and
                  hasn&apos;t looked back.
                </p>
              </Reveal>
              <Reveal variant="up" delay={200} duration={1100}>
                <p className="text-[16px] leading-[1.6] text-ink/80">
                  Most of my work lives in the{" "}
                  <span className="font-serif italic">Adobe Creative Cloud</span>
                  , but I&apos;ll reach for whatever the idea needs — Figma for
                  interfaces, Blender for 3D, Premiere for film. I&apos;ve
                  designed yearbooks, cut documentaries, built brand systems, and
                  made the occasional surreal art piece that somehow ends up in a
                  museum.
                </p>
              </Reveal>
              <Reveal variant="up" delay={280} duration={1100}>
                <p className="text-[16px] leading-[1.6] text-ink/80">
                  I care about the details most people scroll past — the spacing,
                  the type, the one pixel that makes something feel{" "}
                  <span className="font-serif italic">right</span>. I&apos;ve been
                  lucky to learn from bright people along the way, and I&apos;m
                  always looking for the next thing worth making.
                </p>
              </Reveal>
            </div>
          </section>

          {/* At a glance */}
          <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:mt-32 sm:px-8">
            <Reveal variant="up" duration={1000}>
              <span className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
                At a glance
              </span>
            </Reveal>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
              {glance.map((g, i) => (
                <Reveal key={g.label} variant="up" delay={i * 70} duration={1000}>
                  <div className="flex flex-col gap-1">
                    <dt className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
                      {g.label}
                    </dt>
                    <dd className="text-[16px] tracking-tight text-ink">
                      {g.value}
                    </dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </section>

          {/* Selected recognition */}
          <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:mt-32 sm:px-8">
            <Reveal variant="up" duration={1000}>
              <span className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
                Selected recognition
              </span>
            </Reveal>
            <div className="mt-8">
              {recognition.map((r, i) => (
                <Reveal key={r.title} variant="up" delay={i * 70} duration={1000}>
                  <div className="grid grid-cols-12 items-baseline gap-4 border-t border-ink/15 py-6">
                    <span className="col-span-12 text-[13px] tracking-tight text-ink/50 sm:col-span-2">
                      {r.year}
                    </span>
                    <h3 className="col-span-12 text-[18px] font-medium tracking-tight text-ink sm:col-span-4">
                      {r.title}
                    </h3>
                    <p className="col-span-12 text-[15px] leading-[1.5] text-ink/70 sm:col-span-6">
                      {r.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Toolkit */}
          <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:mt-32 sm:px-8">
            <Reveal variant="up" duration={1000}>
              <span className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
                Toolkit
              </span>
            </Reveal>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {toolkit.map((t, i) => (
                <Reveal key={t} variant="up" delay={i * 40} duration={900} as="li">
                  <span className="inline-block rounded-full border border-ink/15 bg-ink/[0.03] px-4 py-1.5 text-[13px] font-medium tracking-tight text-ink/80">
                    {t}
                  </span>
                </Reveal>
              ))}
            </ul>
          </section>

          {/* Closing / contact */}
          <section className="mx-auto mt-28 max-w-[1280px] px-5 sm:mt-36 sm:px-8">
            <Reveal variant="up" duration={1100}>
              <h2
                className="font-display text-ink"
                style={{
                  fontSize: "clamp(36px, 6vw, 80px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                Let&apos;s make something.
              </h2>
            </Reveal>
            <Reveal variant="up" delay={150} duration={1100}>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
                {contact.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="link-underline font-medium tracking-tight text-ink transition-opacity hover:opacity-80"
                  >
                    {c.label}
                  </a>
                ))}
              </div>
            </Reveal>
            <Reveal variant="up" delay={250} duration={1000}>
              <Link
                href="/#works"
                className="group mt-12 inline-flex items-center gap-2 text-[13px] tracking-[0.18em] uppercase text-ink/55"
              >
                <span className="transition-transform duration-500 group-hover:-translate-x-1">
                  ←
                </span>
                Back to work
              </Link>
            </Reveal>
          </section>
        </article>

        <Footer />
      </div>
    </main>
  );
}
