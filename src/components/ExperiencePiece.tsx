import Image from "next/image";
import { Reveal } from "./Reveal";

const ARTICLE_URL =
  "https://www.yourobserver.com/news/2025/jun/17/mona-jain-art-student-award/";

const tags = [
  "Product Design",
  "Brand Identity Design",
  "Branding",
  "Packaging Design",
  "Mockup Design",
  "Yearbook Design",
];

export function ExperiencePiece() {
  return (
    <section
      id="experience"
      className="relative bg-paper px-5 pt-10 pb-24 sm:px-8 sm:pt-14 sm:pb-32"
    >
      <div className="relative mx-auto max-w-[1280px] border-t border-ink/10 pt-16 sm:pt-20">
        <div className="grid grid-cols-12 items-start gap-8 lg:gap-12">
          {/* Left — copy */}
          <div className="col-span-12 flex flex-col lg:col-span-6">
            <Reveal variant="up" duration={1000}>
              <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase text-ink/55">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" />
                Experience
              </div>
            </Reveal>

            <Reveal variant="blur" delay={120} duration={1300}>
              <h2
                className="mt-5 font-display text-ink"
                style={{
                  fontSize: "clamp(40px, 7vw, 84px)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.96,
                }}
              >
                Dr. Mona Jain Middle School
              </h2>
            </Reveal>

            <Reveal variant="up" delay={240} duration={1100}>
              <p className="mt-6 max-w-[540px] text-[18px] leading-[1.5] text-ink/85 sm:text-[19px]">
                Dr. Mona Jain Middle School gave me the biggest opportunity of my
                life. With the help of the greatest teacher of all time —{" "}
                <span className="font-serif italic">Mrs. Reyes</span> — I&apos;ve
                been able to accomplish things that will shape my future and
                career.
              </p>
            </Reveal>

            <Reveal variant="up" delay={340} duration={1100}>
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-ink/15 bg-ink/[0.03] px-4 py-1.5 text-[13px] font-medium tracking-tight text-ink/80"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal variant="up" delay={440} duration={1100}>
              <div className="mt-10">
                <a
                  href={ARTICLE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="magnetic group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-ink/[0.03] px-5 py-2.5 text-[14px] font-medium tracking-tight text-ink transition-all duration-500 hover:bg-ink/[0.08]"
                >
                  <span>View full article</span>
                  <span className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
                    ↗
                  </span>
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right — article clipping */}
          <Reveal
            variant="scale"
            duration={1300}
            className="col-span-12 lg:col-span-6"
          >
            <figure>
              <a
                href={ARTICLE_URL}
                target="_blank"
                rel="noreferrer"
                className="group block"
                aria-label="Read the full Observer article"
              >
                <div
                  className="relative w-full overflow-hidden rounded-sm border border-ink/10 bg-surface"
                  style={{ aspectRatio: "1.32 / 1" }}
                >
                  <Image
                    src="/images/mona-jain-article.jpg"
                    alt="Your Observer — Local Student Honored at Dalí Museum exhibit"
                    fill
                    sizes="(min-width: 1024px) 620px, 100vw"
                    className="object-cover object-top transition-transform duration-[1.6s] ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-[1.03]"
                  />
                </div>
              </a>
              <figcaption className="mt-3 text-[11px] tracking-[0.16em] uppercase text-ink/55">
                YourObserver.com · June 2025
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
