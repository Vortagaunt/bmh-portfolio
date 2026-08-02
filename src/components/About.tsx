import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about-me" className="relative bg-paper px-5 pt-24 pb-20 sm:px-8 sm:pt-32 sm:pb-24">
      <div className="relative mx-auto max-w-[1280px]">
        {/* Outline italic About backdrop */}
        <Reveal
          variant="fade"
          duration={1600}
          as="span"
          className="serif-outline absolute left-1/2 -top-12 -translate-x-1/2 select-none whitespace-nowrap"
          style={{
            fontSize: "clamp(160px, 24vw, 360px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          About
        </Reveal>

        <div className="relative z-10 grid grid-cols-12 gap-6 pt-32">
          {/* Portrait */}
          <Reveal variant="scale" duration={1300} className="col-span-12 md:col-span-4 md:col-start-2">
            <div
              className="relative w-full max-w-[420px] overflow-hidden"
              style={{ aspectRatio: "420 / 520" }}
            >
              <Image
                src="/images/bronx-portrait.png"
                alt="Bronx Hanratty"
                fill
                sizes="(min-width: 768px) 420px, 100vw"
                className="select-none object-cover object-top grayscale"
              />
            </div>
          </Reveal>

          {/* Bio + CTA */}
          <Reveal
            variant="up"
            delay={200}
            duration={1300}
            className="col-span-12 md:col-span-6 md:col-start-7 flex flex-col justify-end"
          >
            <p className="max-w-[560px] text-[18px] leading-[1.55] text-ink">
              Hello, my name is{" "}
              <span className="font-serif italic text-[20px] tracking-[-0.01em]">
                Bronx Hanratty
              </span>
              . I am a 9th Grade student that specializes in digital
              design using the vast tools of the{" "}
              <span className="font-serif italic text-[20px] tracking-[-0.01em]">
                Adobe Creative Cloud
              </span>
              . I have worked on designing Yearbooks, creating
              Documentarys, and more. I have collaborated with a lot of
              bright people, and hopefully you can be the next.
            </p>
            <div className="mt-12 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="magnetic group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-ink/[0.03] px-5 py-2.5 text-[14px] font-medium tracking-tight text-ink transition-all duration-500 hover:bg-ink/[0.08]"
              >
                <span>Learn more</span>
                <span className="transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/resume"
                className="magnetic group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-ink/[0.03] px-5 py-2.5 text-[14px] font-medium tracking-tight text-ink transition-all duration-500 hover:bg-ink/[0.08]"
              >
                <span>Resume</span>
                <span className="transition-transform duration-500 group-hover:translate-y-0.5">
                  ↓
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
