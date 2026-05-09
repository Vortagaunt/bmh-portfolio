import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Reveal } from "@/components/Reveal";

// Placeholder gallery — swap these out for real images when ready.
// "ratio" controls how each tile is sized in the masonry-ish grid.
const photos: { src: string; alt: string; ratio: "square" | "wide" | "tall" | "portrait" }[] = [
  { src: "/images/brothers.png", alt: "Recent work 01", ratio: "wide" },
  { src: "/images/brothers.png", alt: "Recent work 02", ratio: "tall" },
  { src: "/images/brothers.png", alt: "Recent work 03", ratio: "square" },
  { src: "/images/brothers.png", alt: "Recent work 04", ratio: "portrait" },
  { src: "/images/brothers.png", alt: "Recent work 05", ratio: "wide" },
  { src: "/images/brothers.png", alt: "Recent work 06", ratio: "square" },
  { src: "/images/brothers.png", alt: "Recent work 07", ratio: "tall" },
  { src: "/images/brothers.png", alt: "Recent work 08", ratio: "portrait" },
  { src: "/images/brothers.png", alt: "Recent work 09", ratio: "wide" },
];

const ratioClass: Record<string, string> = {
  wide: "col-span-12 md:col-span-8",
  tall: "col-span-12 md:col-span-4",
  square: "col-span-12 md:col-span-6",
  portrait: "col-span-12 md:col-span-6",
};

const ratioAspect: Record<string, string> = {
  wide: "1.6 / 1",
  tall: "0.9 / 1",
  square: "1 / 1",
  portrait: "0.75 / 1",
};

export default function RecentWorksPage() {
  return (
    <main className="relative isolate min-h-screen w-full bg-[#f1f1f1] text-[#181818]">
      <SmoothScroll />
      <div className="pointer-events-none fixed inset-0 z-0">
        <GridBackdrop />
      </div>
      <SiteHeader />

      <div className="relative z-10">
        <article className="relative pt-32 pb-32">
          {/* Header */}
          <header className="relative mx-auto max-w-[1280px] px-8">
            <Reveal variant="up" duration={1000}>
              <div className="flex items-baseline gap-4 text-[12px] tracking-[0.16em] uppercase text-[#181818]/60">
                <span>(03)</span>
                <span className="h-px w-10 bg-[#181818]/30" />
                <span>Gallery</span>
              </div>
            </Reveal>

            <Reveal variant="blur" delay={120} duration={1300}>
              <h1
                className="mt-6 font-display text-[#181818]"
                style={{
                  fontSize: "clamp(56px, 9vw, 140px)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.95,
                }}
              >
                Recent Works
              </h1>
            </Reveal>

            <Reveal variant="up" delay={240} duration={1100}>
              <p className="mt-8 max-w-[640px] text-[20px] leading-[1.45] text-[#181818]/85">
                A loose photo gallery of recent projects in{" "}
                <span className="font-serif italic text-[22px] tracking-[-0.01em]">
                  Photoshop
                </span>
                ,{" "}
                <span className="font-serif italic text-[22px] tracking-[-0.01em]">
                  Illustrator
                </span>
                , and other tools — explorations, snippets, and finished pieces.
              </p>
            </Reveal>
          </header>

          {/* Gallery grid */}
          <section className="relative mx-auto mt-24 max-w-[1440px] px-8">
            <div className="grid grid-cols-12 gap-6">
              {photos.map((p, i) => (
                <Reveal
                  key={`${p.src}-${i}`}
                  variant="up"
                  delay={(i % 6) * 60}
                  duration={1100}
                  className={ratioClass[p.ratio]}
                >
                  <div
                    className="group relative w-full overflow-hidden rounded-sm bg-[#cfcfcf]"
                    style={{ aspectRatio: ratioAspect[p.ratio] }}
                  >
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 1440px) 700px, (min-width: 768px) 50vw, 100vw"
                      className="card-img-zoom object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Back to work */}
          <section className="relative mx-auto mt-40 max-w-[1280px] px-8">
            <Reveal variant="up" duration={1100}>
              <Link
                href="/#works"
                className="group block border-t border-[#181818]/15 pt-12"
              >
                <div className="flex items-baseline justify-between gap-8">
                  <span className="text-[11px] tracking-[0.18em] uppercase text-[#181818]/55">
                    Back to Work
                  </span>
                  <span className="text-[12px] tracking-[0.18em] uppercase text-[#181818]/55 transition-transform duration-500 group-hover:-translate-x-2">
                    ←
                  </span>
                </div>
                <h3
                  className="mt-4 font-display text-[#181818] transition-transform duration-700 group-hover:-translate-y-1"
                  style={{
                    fontSize: "clamp(40px, 6vw, 88px)",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  All Projects
                </h3>
              </Link>
            </Reveal>
          </section>
        </article>

        <Footer />
      </div>
    </main>
  );
}
