import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Resume — Bronx Hanratty",
  description:
    "Resume of Bronx Hanratty — digital & brand designer in Sarasota, FL. Yearbook lead design, award-winning documentary work, and real client branding.",
};

const experience = [
  {
    when: "2025 — 2026",
    role: "Lead Designer — DMJ Yearbook 2025–2026",
    org: "Dr. Mona Jain Middle School",
    points: [
      "Led cover, identity, and layout system for a 112-page hardcover yearbook inspired by Spotify Wrapped.",
      "Built a reusable grid + type system the whole yearbook staff could follow in Pictavo and Photoshop.",
    ],
  },
  {
    when: "2026",
    role: "Director & Editor — “8:46 AM”",
    org: "Short documentary",
    points: [
      "Researched, filmed, and edited a 7-minute documentary on the morning of September 11, 2001.",
      "Interviewed retired CNN anchor Carol Lin and Pentagon first responder Jordan Swonger.",
      "Winner — Manatee Film Rush · Jim Harbin Student Festival.",
    ],
  },
  {
    when: "2026",
    role: "Brand Designer — Dirty Sara-Soda",
    org: "Family-run business · Sarasota, FL",
    points: [
      "Designed the launch mark and identity for a real mobile dirty-soda business.",
      "Mascot logo, sticker system, and brand applications from cup to counter.",
    ],
  },
  {
    when: "2026",
    role: "Brand Concept — Lakewood Ranch High School",
    org: "Self-initiated",
    points: [
      "Rebuilt the Mustang identity as a full brand system — marks, color, type, voice — plus a working website mockup.",
    ],
  },
];

const recognition = [
  {
    what: "Award of Excellence — Dalí Museum Student Surrealist Art Exhibit",
    detail:
      "Highest honor given to a middle-school artist; selected from 500+ Florida entries for “Cascade Creation.” (2025)",
  },
  {
    what: "Winner — Manatee Film Rush · Jim Harbin Student Festival",
    detail: "For the short documentary “8:46 AM.” (2026)",
  },
  {
    what: "Press — The Observer",
    detail: "“Local Student Honored at Dalí Museum exhibit,” June 2025.",
  },
];

const skills = [
  "Photoshop",
  "Illustrator",
  "InDesign",
  "Premiere Pro",
  "After Effects",
  "Figma",
  "Blender",
  "Pictavo",
];

export default function ResumePage() {
  return (
    <main className="relative isolate min-h-screen w-full bg-[#f1f1f1] text-[#181818] print:bg-white">
      <div className="pointer-events-none fixed inset-0 z-0 print:hidden">
        <GridBackdrop />
      </div>
      <div className="print:hidden">
        <SiteHeader />
      </div>

      <article className="relative z-10 mx-auto max-w-[880px] px-5 pt-24 pb-24 sm:px-8 sm:pt-28 print:max-w-none print:px-0 print:pt-0 print:pb-0">
        {/* Header */}
        <Reveal variant="up" duration={1000}>
          <header className="border-b border-[#181818]/15 pb-8">
            <h1
              className="font-display"
              style={{ fontSize: "clamp(40px, 7vw, 64px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 0.95 }}
            >
              <span className="font-serif italic" style={{ fontWeight: 400, letterSpacing: "-0.02em" }}>
                Bronx{" "}
              </span>
              Hanratty
            </h1>
            <p className="mt-3 text-[16px] tracking-tight text-[#181818]/75">
              Digital &amp; brand designer — Sarasota, Florida
            </p>
            <p className="mt-2 text-[13px] tracking-tight text-[#181818]/60">
              bronxhanratty.me · bronxhanratty@gmail.com · linkedin.com/in/bronx-hanratty-57a8212b6
            </p>
            <div className="mt-6 flex flex-wrap gap-3 print:hidden">
              <a
                href="/resume.pdf"
                className="magnetic group inline-flex items-center gap-2 rounded-full border border-[#181818]/15 bg-[#181818]/[0.03] px-5 py-2.5 text-[14px] font-medium tracking-tight transition-all duration-500 hover:bg-[#181818]/[0.08]"
              >
                <span>Download PDF</span>
                <span className="transition-transform duration-500 group-hover:translate-y-0.5">↓</span>
              </a>
              <Link
                href="/"
                className="magnetic group inline-flex items-center gap-2 rounded-full border border-[#181818]/15 px-5 py-2.5 text-[14px] font-medium tracking-tight text-[#181818]/70 transition-all duration-500 hover:bg-[#181818]/[0.05]"
              >
                <span className="transition-transform duration-500 group-hover:-translate-x-1">←</span>
                <span>Back home</span>
              </Link>
            </div>
          </header>
        </Reveal>

        {/* Profile */}
        <Reveal variant="up" delay={100} duration={1000}>
          <section className="mt-10">
            <h2 className="text-[11px] tracking-[0.18em] uppercase text-[#181818]/55">Profile</h2>
            <p className="mt-3 max-w-[640px] text-[15px] leading-[1.6] text-[#181818]/90">
              Ninth-grade designer working across brand, editorial, and film.
              Award-winning digital artist with real client work, a published
              yearbook, and a museum wall to show for it. Adobe Creative Cloud
              native; currently exploring Figma and Blender.
            </p>
          </section>
        </Reveal>

        {/* Experience */}
        <Reveal variant="up" delay={160} duration={1000}>
          <section className="mt-12">
            <h2 className="text-[11px] tracking-[0.18em] uppercase text-[#181818]/55">Experience</h2>
            <div className="mt-4">
              {experience.map((e) => (
                <div key={e.role} className="grid grid-cols-12 gap-3 border-t border-[#181818]/10 py-5 first:border-t-0">
                  <span className="col-span-12 text-[12.5px] tracking-tight text-[#181818]/50 sm:col-span-3">
                    {e.when}
                  </span>
                  <div className="col-span-12 sm:col-span-9">
                    <h3 className="text-[16px] font-medium tracking-tight">{e.role}</h3>
                    <p className="text-[13.5px] text-[#181818]/60">{e.org}</p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {e.points.map((p) => (
                        <li key={p} className="text-[14px] leading-[1.55] text-[#181818]/85">
                          — {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Recognition */}
        <Reveal variant="up" delay={220} duration={1000}>
          <section className="mt-12">
            <h2 className="text-[11px] tracking-[0.18em] uppercase text-[#181818]/55">Recognition &amp; Press</h2>
            <div className="mt-4">
              {recognition.map((r) => (
                <div key={r.what} className="border-t border-[#181818]/10 py-4 first:border-t-0">
                  <h3 className="text-[15px] font-medium tracking-tight">{r.what}</h3>
                  <p className="mt-1 text-[13.5px] leading-[1.5] text-[#181818]/65">{r.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Skills + Education */}
        <Reveal variant="up" delay={280} duration={1000}>
          <section className="mt-12 grid grid-cols-12 gap-8">
            <div className="col-span-12 sm:col-span-7">
              <h2 className="text-[11px] tracking-[0.18em] uppercase text-[#181818]/55">Toolkit</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {skills.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-[#181818]/15 bg-[#181818]/[0.03] px-3.5 py-1 text-[13px] font-medium tracking-tight text-[#181818]/80 print:border-[#181818]/40"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-12 sm:col-span-5">
              <h2 className="text-[11px] tracking-[0.18em] uppercase text-[#181818]/55">Education</h2>
              <p className="mt-4 text-[14px] leading-[1.55] text-[#181818]/85">
                Dr. Mona Jain Middle School — Bradenton, FL
                <br />
                <span className="text-[#181818]/60">Currently in 9th grade · Class of 2029</span>
              </p>
            </div>
          </section>
        </Reveal>
      </article>
    </main>
  );
}
