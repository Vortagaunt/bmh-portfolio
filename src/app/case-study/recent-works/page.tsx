import type { Metadata } from "next";
import { ZoomImage, type ZoomItem } from "@/components/ZoomImage";
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
const photos: (ZoomItem & { ratio: "square" | "wide" | "tall" | "portrait" | "poster" | "banner" })[] = [
  // Posters / portraits
  { src: "/images/raized-wrong.jpg", alt: "Raized Wrong — Louder Than Yesterday tour poster", title: "Raized Wrong — Louder Than Yesterday", medium: "Tour poster", project: "Raized Wrong", description: "Tour poster for the Louder Than Yesterday run — type-led, built to read at a distance and survive being stapled to a pole.", ratio: "portrait" },
  { src: "/images/846am-poster.png", alt: "8:46 AM — short documentary poster", title: "8:46 AM", date: "2026", medium: "Film poster", project: "8:46 AM", description: "Poster for the short documentary on September 11th — directed, shot and edited start to finish. Winner, Manatee Film Rush, and a Jim Harbin Student Festival selection.", ratio: "portrait" },
  { src: "/images/yarg.png", alt: "YARG band poster", title: "YARG", medium: "Band poster", description: "Live-shot band poster with a custom display lockup set over the performance.", ratio: "portrait" },
  { src: "/images/earth-cost.png", alt: "How much does the Earth cost? — concert visual", title: "How Much Does the Earth Cost?", medium: "Concert visual", description: "Concert visual — a lone figure on the curve of the planet, built for projection behind a live set.", ratio: "portrait" },
  // Squares
  { src: "/images/red-portrait.png", alt: "Painted-text portrait single cover", title: "Painted Text Portrait", medium: "Single cover", description: "Single cover: a portrait overpainted with hand-drawn type, the lettering following the form of the face rather than sitting on top of it.", ratio: "square" },
  { src: "/images/north-west.png", alt: "北西 / Northwest album cover", title: "北西 / Northwest", medium: "Concept album cover", description: "Concept cover pairing Japanese and Latin type over a high-contrast halftone treatment.", ratio: "square" },
  { src: "/images/yeezus.png", alt: "Yeezus CD reinterpretation", title: "Yeezus — Reinterpretation", medium: "Concept album cover", description: "A reinterpretation of the Yeezus packaging as a physical object — jewel case, price stickers, and the red tape treatment rebuilt from scratch.", ratio: "square" },
  { src: "/images/kanye-bear.png", alt: "Kanye bear album cover", title: "Dropout Bear", medium: "Concept album cover", description: "Concept cover built around the dropout bear, framed in ornamental gold.", ratio: "square" },
  { src: "/images/minidisc.png", alt: "MiniDisc render", title: "MiniDisc", medium: "Product render", description: "Render of a MiniDisc — a study in reflective plastic, chromatic edges and dead-centre composition.", ratio: "square" },
  { src: "/images/guitar-hero-20.png", alt: "Guitar Hero 20 anniversary mark", title: "Guitar Hero 20", medium: "Anniversary mark", description: "Anniversary mark — chrome-and-neon numerals over brick, in the spirit of the original game's packaging.", ratio: "square" },
  { src: "/images/skydive.png", alt: "Skydive / red sun illustration", title: "Skydive", medium: "Illustration", description: "Illustration — a red figure falling through cloud under a red sun, on a hard gradient sky.", ratio: "square" },
  { src: "/images/vorty.png", alt: "Vorty sticker design", title: "Vorty", medium: "Sticker design", description: "Die-cut sticker design — a masked character on orange, drawn to survive being printed small.", ratio: "square" },
  // Closer row — narrow + wide pair
  { src: "/images/brothers.jpg", alt: "Brothers — early concept work", title: "Brothers", medium: "Concept work", description: "Early concept work, kept here as a marker of where the visual language started.", ratio: "tall" },
  { src: "/images/dirty-sara-soda.png", alt: "Dirty Sara-Soda Jerks brand mark", title: "Dirty Sara-Soda Jerks", medium: "Brand mark", project: "Dirty Sara-Soda", description: "Launch mark and identity for a family-run mobile soda business.", ratio: "wide" },

  { src: "/images/vultures3.jpg", alt: "Vultures 3 — album cover", title: "Vultures 3", date: "June 2026", medium: "Concept album cover", description: "Concept cover — stark, near-monochrome, built around a single central figure.", ratio: "square" },
  { src: "/images/selfactualize.jpg", alt: "Self Actualize — album cover", title: "Self Actualize", date: "July 2026", medium: "Concept album cover", description: "Concept cover exploring self-image through layered photographic treatment.", ratio: "square" },
  { src: "/images/bbpb.jpg", alt: "BBPB — album cover", title: "BBPB", date: "January 2026", medium: "Concept album cover", description: "Concept cover — a square composition worked entirely in Photoshop.", ratio: "square" },
  { src: "/images/doomsday.jpg", alt: "Doomsday — poster", title: "Doomsday", date: "July 2026", medium: "Concept film poster", description: "Concept one-sheet — full billing block, title treatment and key art built to the proportions of a real theatrical poster.", ratio: "poster" },
  { src: "/images/google.png", alt: "Google — concept visual", title: "Google — Redesign", date: "March 2026", medium: "Identity concept", description: "Identity concept: the wordmark rebuilt so the search field becomes the second o, set on a full-spectrum gradient.", ratio: "banner" },
  { src: "/images/agr30hr2.jpg", alt: "AGR 30HR2 — 30 Hour Weekend stream art", title: "AUGER — 30 Hour Weekend", date: "October 2025", medium: "Stream key art", project: "AUGER", description: "Key art for a 30-hour charity stream weekend — blackletter title, portrait inset, and the broadcast dates set large.", ratio: "banner" },
];

const ratioClass: Record<string, string> = {
  wide: "col-span-12 md:col-span-8",
  tall: "col-span-12 md:col-span-4",
  square: "col-span-12 md:col-span-6",
  portrait: "col-span-12 md:col-span-6",
  poster: "col-span-12 md:col-span-6",
  banner: "col-span-12",
};

const ratioAspect: Record<string, string> = {
  wide: "1.6 / 1",
  tall: "0.9 / 1",
  square: "1 / 1",
  portrait: "0.75 / 1",
  poster: "0.675 / 1",   // 1944x2880, exact
  banner: "1.75 / 1",    // 3840x2160 and 6979x4000, near-exact
};

export default function RecentWorksPage() {
  return (
    <main className="relative isolate min-h-screen w-full bg-paper text-ink">
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
              <div className="flex items-baseline gap-4 text-[12px] tracking-[0.16em] uppercase text-ink/60">
                <span>(03)</span>
                <span className="h-px w-10 bg-ink/30" />
                <span>Gallery</span>
              </div>
            </Reveal>

            <Reveal variant="blur" delay={120} duration={1300}>
              <h1
                className="mt-6 font-display text-ink"
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
              <p className="mt-6 max-w-[640px] text-[17px] leading-[1.5] text-ink/85 sm:mt-8 sm:text-[20px] sm:leading-[1.45]">
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
                      zoomItems={photos}
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
                className="group block border-t border-ink/15 pt-8 sm:pt-12"
              >
                <div className="flex items-baseline justify-between gap-6 sm:gap-8">
                  <span className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
                    Back to Work
                  </span>
                  <span className="text-[12px] tracking-[0.18em] uppercase text-ink/55 transition-transform duration-500 group-hover:-translate-x-2">
                    ←
                  </span>
                </div>
                <h3
                  className="mt-4 font-display text-ink transition-transform duration-700 group-hover:-translate-y-1"
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
