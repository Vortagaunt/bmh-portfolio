import Image from "next/image";
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
      className="relative bg-[#f1f1f1] px-5 pt-24 pb-24 sm:px-8 sm:pt-28 sm:pb-32"
    >
      <div className="relative mx-auto max-w-[1280px]">
        {/* Heading block */}
        <div className="mb-12 max-w-[760px] sm:mb-16">
          <Reveal variant="up" duration={1000}>
            <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase text-[#181818]/55">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#181818]" />
              Featured · Award of Excellence
            </div>
          </Reveal>

          <Reveal variant="blur" delay={120} duration={1300}>
            <h2
              className="mt-5 font-display text-[#181818]"
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
            <p className="mt-6 text-[18px] leading-[1.5] text-[#181818]/85 sm:text-[20px]">
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
              <div className="relative w-full overflow-hidden rounded-sm bg-[#cfcfcf]" style={{ aspectRatio: "1 / 1" }}>
                <Image
                  src="/images/dali-bear.jpg"
                  alt="Dalí Museum — surreal multi-mouthed bear photo-composite"
                  fill
                  sizes="(min-width: 1024px) 620px, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[11px] tracking-[0.16em] uppercase text-[#181818]/55">
                Dalí Museum · Photoshop · 2025
              </figcaption>
            </figure>
          </Reveal>

          <div className="col-span-12 flex flex-col gap-8 lg:col-span-6 lg:gap-10">
            {steps.map((s, i) => (
              <Reveal key={s.heading} variant="up" delay={150 + i * 90} duration={1100}>
                <div className="border-t border-[#181818]/15 pt-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[11px] tracking-[0.18em] uppercase text-[#181818]/55">
                      {s.label}
                    </span>
                    <span
                      className="font-display text-[#181818]/20"
                      style={{ fontSize: "28px", fontWeight: 600, lineHeight: 1 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3
                    className="mt-3 font-display text-[#181818]"
                    style={{
                      fontSize: "clamp(24px, 3vw, 34px)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {s.heading}
                  </h3>
                  <p className="mt-3 text-[16px] leading-[1.55] text-[#181818]/85">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
