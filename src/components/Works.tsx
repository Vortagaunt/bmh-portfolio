"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./Reveal";
import type { CaseStudy } from "@/types";

const projects: CaseStudy[] = [
  {
    slug: "yearbook-2025",
    title: "Yearbook 2025",
    description: "Editorial layout and cover design for the school yearbook",
    image: "/images/yearbook-2025.png",
    href: "/case-study/yearbook-2025",
  },
  {
    slug: "846-am",
    title: "“8:46 AM” Short Documentary",
    description: "Filming and editing a documentary short on the 9/11 terrorist attacks",
    image: "/images/846am.png",
    href: "/case-study/846-am",
  },
  {
    slug: "motion-studies",
    title: "Motion Studies",
    description: "Brand explorations and looping motion design experiments",
    image: "/images/brothers.png",
    href: "/case-study/motion-studies",
  },
];

export function Works() {
  return (
    <section id="works" className="relative px-8 pt-32 pb-24">
      {/* Heading area with outline backdrop */}
      <div className="relative mx-auto flex max-w-[1280px] flex-col items-center pb-20">
        <Reveal
          variant="fade"
          duration={1400}
          as="span"
          className="serif-outline absolute left-1/2 top-0 -translate-x-1/2 select-none whitespace-nowrap"
          style={{
            fontSize: "clamp(140px, 22vw, 320px)",
            lineHeight: 1,
            top: "-30px",
            letterSpacing: "-0.02em",
          }}
        >
          Selected
        </Reveal>
        <Reveal variant="up" delay={120}>
          <p className="relative z-10 text-[14px] tracking-tight text-[#181818]">
            2020-2026
          </p>
        </Reveal>
        <Reveal variant="blur" delay={200} duration={1300}>
          <h2
            className="relative z-10 font-display text-[#181818]"
            style={{
              fontSize: "clamp(60px, 9vw, 124px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            Works
          </h2>
        </Reveal>
      </div>

      {/* Project cards stacked */}
      <div className="mx-auto flex max-w-[1280px] flex-col gap-16">
        {projects.map((p, i) => (
          <Reveal key={p.slug} variant="up" delay={i * 80} duration={1200}>
            <Link
              href={p.href}
              className="group flex flex-col gap-5 card-hover"
            >
              <div
                className="relative w-full overflow-hidden bg-[#cfcfcf]"
                style={{ aspectRatio: "1.46 / 1" }}
              >
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(min-width: 1280px) 1280px, 100vw"
                  className="card-img-zoom object-cover"
                />
                {p.video && (
                  <video
                    src={p.video}
                    poster={p.poster}
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[20px] font-medium tracking-tight text-[#181818]">
                  {p.title}
                </h3>
                <p className="max-w-[640px] text-[16px] text-[#181818]/70 leading-snug">
                  {p.description}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
