import Image from "next/image";
import Link from "next/link";
import { ZoomImage } from "./ZoomImage";
import { Reveal } from "./Reveal";

const steps = [
  {
    label: "01 — The idea",
    heading: "Defining the vision",
    body: (
      <>
        It started as a recreation of George Condo&apos;s cover for Kanye
        West&apos;s{" "}
        <span className="font-serif italic">
          My Beautiful Dark Twisted Fantasy
        </span>{" "}
        — then quickly outgrew the reference. The homage became my own reading
        of the image: stranger, louder, and a lot more personal.
      </>
    ),
  },
  {
    label: "02 — The build",
    heading: "Starting the work",
    body: (
      <>
        Everything was built in{" "}
        <span className="font-serif italic">Adobe Photoshop 2025</span>. Over
        about three and a half weeks of layering, masking, and second-guessing,
        a half-joking idea turned into a composite I was genuinely proud of.
      </>
    ),
  },
  {
    label: "03 — The result",
    heading: "Turning it in",
    body: (
      <>
        I entered it into the{" "}
        <span className="font-serif italic">Dalí Museum</span> student
        competition in April, fully expecting nothing — classmates like Sophia
        De La Cruz had made work I thought blew mine away. In May the acceptance
        email landed; in June I accepted the{" "}
        <span className="font-serif italic">Award of Excellence</span> alongside
        my teacher and mentor, Katelyn Reyes.
      </>
    ),
  },
];

export function ArchivePiece() {
  return (
    <section
      id="archive-piece"
      className="relative px-5 pt-24 pb-24 sm:px-8 sm:pt-28 sm:pb-32"
    >
      <div className="relative mx-auto max-w-[1280px]">
        {/* Heading block */}
        <div className="mb-12 max-w-[760px] sm:mb-16">
          <Reveal variant="up" duration={1000}>
            <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase text-ink/55">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" />
              Featured · Award of Excellence
            </div>
          </Reveal>

          <Reveal variant="blur" delay={120} duration={1300}>
            <h2
              className="mt-5 font-display text-ink"
              style={{
                fontSize: "clamp(48px, 8vw, 110px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
              }}
            >
              Dalí Museum
            </h2>
          </Reveal>

          <Reveal variant="up" delay={240} duration={1100}>
            <p className="mt-6 text-[18px] leading-[1.5] text-ink/85 sm:text-[20px]">
              A surreal photo-composite that began as a tribute and became its
              own beast — and somehow won an{" "}
              <span className="font-serif italic">Award of Excellence</span>{" "}
              along the way.
            </p>
          </Reveal>
        </div>

        {/* Image + steps */}
        <div className="grid grid-cols-12 items-start gap-8 lg:gap-12">
          <Reveal
            variant="scale"
            duration={1300}
            className="col-span-12 lg:col-span-6"
          >
            <figure>
              <div className="media-elevated relative w-full overflow-hidden bg-[#cfcfcf]" style={{ aspectRatio: "1 / 1" }}>
                <ZoomImage
                  src="/images/dali-bear.jpg"
                  alt="Dalí Museum — surreal multi-mouthed bear photo-composite"
                  fill
                  sizes="(min-width: 1024px) 620px, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[11px] tracking-[0.16em] uppercase text-ink/55">
                Dalí Museum · Photoshop · 2025
              </figcaption>
            </figure>
          </Reveal>

          <div className="col-span-12 flex flex-col gap-8 lg:col-span-6 lg:gap-10">
            {steps.map((s, i) => (
              <Reveal key={s.heading} variant="up" delay={150 + i * 90} duration={1100}>
                <div className="border-t border-ink/15 pt-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
                      {s.label}
                    </span>
                    <span
                      className="font-display text-ink/20"
                      style={{ fontSize: "28px", fontWeight: 600, lineHeight: 1 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3
                    className="mt-3 font-display text-ink"
                    style={{
                      fontSize: "clamp(24px, 3vw, 34px)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {s.heading}
                  </h3>
                  <p className="mt-3 text-[16px] leading-[1.55] text-ink/85">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* LRHS brand guidelines — laid out like "In the news" at the top of
            the page, on the wallpaper's Field: Mustang Green lit from the top
            left, deep in the bottom right, the mustang ghosted across it.
            Public page: no Mustang Studio here. */}
        <Reveal variant="up" duration={1200} className="mt-16 sm:mt-24">
          <div
            className="media-elevated relative overflow-hidden text-white"
            style={{
              background:
                "radial-gradient(120% 90% at 22% 12%, #0A5733 0%, rgba(10,87,51,0) 62%), " +
                "radial-gradient(110% 100% at 88% 96%, #021A10 0%, rgba(2,26,16,0) 58%), " +
                "linear-gradient(146deg, #04482A 0%, #003C24 44%, #05281A 100%)",
            }}
          >
            {/* the ghost mustang, drifting off the right edge */}
            <Image
              src="/images/lrhs-marks/LRHS Mustang 4.svg"
              alt=""
              aria-hidden
              width={1329}
              height={786}
              className="pointer-events-none absolute top-1/2 -right-[22%] w-[115%] max-w-none -translate-y-[42%] opacity-[0.06] brightness-0 invert select-none sm:-right-[12%] sm:w-[78%]"
            />
            {/* the wallpaper's vignette, pulling the eye to the copy */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(130% 105% at 50% 45%, rgba(0,0,0,0) 38%, rgba(0,0,0,.34) 100%)" }}
            />
            <div className="relative grid grid-cols-12 items-center gap-x-6 gap-y-8 p-7 sm:gap-x-8 sm:p-12 lg:p-14">
              <div className="col-span-12 lg:col-span-9">
                <p className="text-[12px] font-medium tracking-[0.14em] text-white/60 uppercase">
                  LRHS · Mustangs Ahead
                </p>
                <h3
                  className="mt-4 font-display"
                  style={{ fontSize: "clamp(28px, 4.2vw, 52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.02 }}
                >
                  Brand guidelines
                </h3>
                <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.6] text-pretty text-white/75 sm:text-[18px]">
                  The Lakewood Ranch brand system, scene by scene.
                </p>
                <div className="mt-7">
                  <Link
                    href="/lrhs-brand-guidelines"
                    className="group inline-flex h-11 items-center rounded-full bg-white px-5 text-[15px] font-medium text-[#033922] transition hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                  >
                    Read the guidelines
                    <span aria-hidden className="ml-2 transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
