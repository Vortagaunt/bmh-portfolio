import type { Metadata } from "next";
import { ZoomImage } from "@/components/ZoomImage";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Recent Works — Bronx Hanratty",
  description: "A gallery of recent projects in Photoshop, Illustrator, and more — posters, album covers, brand marks, and illustrations.",
  openGraph: {
    title: "Recent Works — Bronx Hanratty",
    description: "A gallery of recent projects in Photoshop, Illustrator, and more — posters, album covers, brand marks, and illustrations.",
    url: "/case-study/recent-works",
    siteName: "Bronx Hanratty",
    type: "article",
    images: [{ url: "/og/recent-works.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recent Works — Bronx Hanratty",
    description: "A gallery of recent projects in Photoshop, Illustrator, and more — posters, album covers, brand marks, and illustrations.",
    images: ["/og/recent-works.jpg"],
  },
};

// Sorted from tallest aspect ratio → squares → widest. Last row pairs
// the narrow "Brothers" tile with the wide "Dirty Sara-Soda" logo so the
// grid closes out cleanly.
const photos: { src: string; alt: string; ratio: "square" | "wide" | "tall" | "portrait" }[] = [
  // Posters / portraits
  { src: "/images/raized-wrong.webp", alt: "Raized Wrong — Louder Than Yesterday tour poster", ratio: "portrait" },
  { src: "/images/846am-poster.webp", alt: "8:46 AM — short documentary poster", ratio: "portrait" },
  { src: "/images/yarg.webp", alt: "YARG band poster", ratio: "portrait" },
  { src: "/images/earth-cost.webp", alt: "How much does the Earth cost? — concert visual", ratio: "portrait" },
  // Squares
  { src: "/images/red-portrait.webp", alt: "Painted-text portrait single cover", ratio: "square" },
  { src: "/images/north-west.webp", alt: "北西 / Northwest album cover", ratio: "square" },
  { src: "/images/yeezus.webp", alt: "Yeezus CD reinterpretation", ratio: "square" },
  { src: "/images/kanye-bear.webp", alt: "Kanye bear album cover", ratio: "square" },
  { src: "/images/minidisc.webp", alt: "MiniDisc render", ratio: "square" },
  { src: "/images/guitar-hero-20.webp", alt: "Guitar Hero 20 anniversary mark", ratio: "square" },
  { src: "/images/skydive.webp", alt: "Skydive / red sun illustration", ratio: "square" },
  { src: "/images/vorty.webp", alt: "Vorty sticker design", ratio: "square" },
  // Closer row — narrow + wide pair
  { src: "/images/brothers.webp", alt: "Brothers — early concept work", ratio: "tall" },
  { src: "/images/dirty-sara-soda.webp", alt: "Dirty Sara-Soda Jerks brand mark", ratio: "wide" },
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
        <article className="relative pt-24 pb-24 sm:pt-32 sm:pb-32">
          {/* Header */}
          <header className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
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
                  fontSize: "clamp(44px, 11vw, 140px)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.95,
                }}
              >
                Recent Works
              </h1>
            </Reveal>

            <Reveal variant="up" delay={240} duration={1100}>
              <p className="mt-6 max-w-[640px] text-[17px] leading-[1.5] text-[#181818]/85 sm:mt-8 sm:text-[20px] sm:leading-[1.45]">
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
          <section className="relative mx-auto mt-16 max-w-[1440px] px-5 sm:mt-24 sm:px-8">
            <div className="grid grid-cols-12 gap-4 sm:gap-6">
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
                    <ZoomImage
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 1440px) 700px, (min-width: 768px) 50vw, 100vw"
                      className="card-img-zoom object-cover"
                      zoomItems={photos.map((x) => ({ src: x.src, alt: x.alt }))}
                      zoomIndex={i}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Back to work */}
          <section className="relative mx-auto mt-24 max-w-[1280px] px-5 sm:mt-40 sm:px-8">
            <Reveal variant="up" duration={1100}>
              <Link
                href="/#works"
                className="group block border-t border-[#181818]/15 pt-8 sm:pt-12"
              >
                <div className="flex items-baseline justify-between gap-6 sm:gap-8">
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
                    fontSize: "clamp(32px, 8vw, 88px)",
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
