import { ZoomImage } from "./ZoomImage";
import { FilmPlayer } from "./FilmPlayer";
import Link from "next/link";
import { Reveal } from "./Reveal";

/**
 * Render a string with *word* markers converted to italic serif spans —
 * matches the home page's "roots / exploring / moving" emphasis style.
 */
function RichText({ children }: { children: string }) {
  const parts = children.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return (
            <span key={i} className="font-serif italic tracking-[-0.01em]">
              {part.slice(1, -1)}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export interface CaseStudyMeta {
  label: string;
  value: string;
}

export interface CaseStudySection {
  heading: string;
  body: string;
  image?: string;
  imageAlt?: string;
}

export interface CaseStudyLink {
  label: string;
  href: string;
  /** Set true for hrefs that point to static HTML outside Next.js routing */
  external?: boolean;
  /** Colour the destination paints on first frame, so the exit fade lands on
   *  a matching frame instead of cutting. Only needed for external targets
   *  that do not share the site palette. */
  exitBg?: string;
}

export interface MarkLibraryItem {
  src: string;
  label: string;
  /** "paper" = light tile (default), "ink" = dark tile for white/reverse marks */
  bg?: "paper" | "ink";
}

export interface MarkLibrary {
  kicker?: string;
  heading?: string;
  intro?: string;
  items: MarkLibraryItem[];
}

export interface CaseStudyData {
  index: string; // e.g. "01"
  category: string; // e.g. "Editorial"
  title: string;
  subtitle: string;
  hero: { src: string; alt: string };
  meta: CaseStudyMeta[];
  overview: string;
  sections: CaseStudySection[];
  gallery: { src: string; alt: string }[];
  next: { slug: string; title: string };
  /** Optional CTA buttons rendered below the hero image */
  links?: CaseStudyLink[];
  /** When true, scatter hand-drawn arrows pointing at the CTA button(s). */
  linksDecorated?: boolean;
  /** Optional captioned grid of mark / logo variants */
  markLibrary?: MarkLibrary;
  /** Optional embedded film — renders a CRT set in place of the hero image */
  film?: { videoId: string; poster: string; title: string; caption?: string };
}

export function CaseStudyLayout({ data }: { data: CaseStudyData }) {
  return (
    <article className="relative pt-24 pb-24 sm:pt-32 sm:pb-32">
      {/* Hero */}
      <header className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        <Reveal variant="up" duration={1000}>
          <div className="flex items-baseline gap-4 text-[12px] tracking-[0.16em] uppercase text-ink/60">
            <span>({data.index})</span>
            <span className="h-px w-10 bg-ink/30" />
            <span>{data.category}</span>
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
            {data.title}
          </h1>
        </Reveal>

        <Reveal variant="up" delay={240} duration={1100}>
          <p className="mt-6 max-w-[640px] text-[17px] leading-[1.5] text-ink/85 sm:mt-8 sm:text-[20px] sm:leading-[1.45]">
            <RichText>{data.subtitle}</RichText>
          </p>
        </Reveal>

        {/* Meta grid */}
        <Reveal variant="up" delay={360} duration={1100}>
          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 sm:mt-16 sm:grid-cols-4">
            {data.meta.map((m) => (
              <div key={m.label} className="flex flex-col gap-1">
                <dt className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
                  {m.label}
                </dt>
                <dd className="text-[14px] tracking-tight text-ink sm:text-[15px]">
                  <RichText>{m.value}</RichText>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </header>

      {/* Hero — the film's CRT set when present, otherwise the hero image */}
      {data.film ? (
        <Reveal variant="scale" delay={120} duration={1400}>
          <div className="relative mx-auto mt-12 w-full max-w-[1440px] px-5 sm:mt-20 sm:px-8">
            <FilmPlayer
              videoId={data.film.videoId}
              poster={data.film.poster}
              title={data.film.title}
              caption={data.film.caption}
            />
          </div>
        </Reveal>
      ) : (
        <Reveal variant="scale" delay={120} duration={1400}>
          <div className="relative mx-auto mt-12 w-full max-w-[1440px] px-5 sm:mt-20 sm:px-8">
            <div
              className="media-elevated relative w-full overflow-hidden bg-[#cfcfcf]"
              style={{ aspectRatio: "1.6 / 1" }}
            >
              <ZoomImage
                src={data.hero.src}
                alt={data.hero.alt}
                fill
                priority
                sizes="(min-width: 1440px) 1440px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>
      )}

      {/* Optional CTA buttons below the hero image */}
      {data.links && data.links.length > 0 && (
        <Reveal variant="up" delay={200} duration={1000}>
          <div className="mx-auto mt-10 w-full max-w-[1440px] px-5 text-center sm:mt-12 sm:px-8">
            <div className="relative inline-flex flex-wrap justify-center gap-3">
              {/* Hand-drawn arrows pointing at the button (desktop only) */}
              {data.linksDecorated && (
                <>
                  {/* eslint-disable @next/next/no-img-element */}
                  <img
                    src="/images/arrows/arrow-left-bold.png"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute left-full top-1/2 hidden w-[86px] -translate-y-1/2 select-none md:block"
                    style={{ marginLeft: "14px" }}
                  />
                  <img
                    src="/images/arrows/arrow-left-thin.png"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute right-full top-1/2 hidden w-[84px] -translate-y-1/2 select-none md:block"
                    style={{ marginRight: "14px", transform: "translateY(-50%) scaleX(-1)" }}
                  />
                  <img
                    src="/images/arrows/arrow-curve.png"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute right-full bottom-full hidden w-[66px] select-none md:block"
                    style={{ marginRight: "-6px", marginBottom: "-10px", transform: "scaleX(-1)" }}
                  />
                  {/* eslint-enable @next/next/no-img-element */}
                </>
              )}
              {data.links.map((link) => {
                const isExternal =
                  link.external ||
                  link.href.startsWith("http") ||
                  link.href.endsWith(".html");
                const className =
                  "glass magnetic group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium tracking-tight text-ink transition-all duration-500 hover:-translate-y-0.5";
                const content = (
                  <>
                    <span>{link.label}</span>
                    <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </>
                );
                return isExternal ? (
                  <a
                    key={link.href}
                    href={link.href}
                    data-external
                    data-exit-bg={link.exitBg}
                    className={className}
                  >
                    {content}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} className={className}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}

      {/* Overview row */}
      <section className="relative mx-auto mt-20 grid max-w-[1280px] grid-cols-12 gap-6 px-5 sm:mt-32 sm:gap-8 sm:px-8">
        <Reveal variant="up" duration={1100} className="col-span-12 sm:col-span-3">
          <span className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
            Overview
          </span>
        </Reveal>
        <Reveal
          variant="up"
          delay={150}
          duration={1200}
          className="col-span-12 sm:col-span-8 sm:col-start-5"
        >
          <p className="text-[18px] leading-[1.45] text-ink sm:text-[22px]">
            <RichText>{data.overview}</RichText>
          </p>
        </Reveal>
      </section>

      {/* Numbered sections */}
      <div className="mx-auto mt-20 flex max-w-[1280px] flex-col gap-20 px-5 sm:mt-32 sm:gap-32 sm:px-8">
        {data.sections.map((s, i) => (
          <section
            key={s.heading}
            className="grid grid-cols-12 items-start gap-6 sm:gap-8"
          >
            <Reveal
              variant="up"
              duration={1100}
              className="col-span-12 sm:sticky sm:top-24 sm:col-span-3"
            >
              <div className="flex flex-col gap-3">
                <span className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
                  {String(i + 1).padStart(2, "0")} — Chapter
                </span>
                <h2
                  className="font-display text-ink"
                  style={{
                    fontSize: "clamp(24px, 6vw, 44px)",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {s.heading}
                </h2>
              </div>
            </Reveal>

            <div className="col-span-12 flex flex-col gap-8 sm:col-span-8 sm:col-start-5 sm:gap-10">
              <Reveal variant="up" delay={150} duration={1200}>
                <p className="text-[16px] leading-[1.55] text-ink/90 sm:text-[18px]">
                  <RichText>{s.body}</RichText>
                </p>
              </Reveal>
              {s.image && (
                <Reveal variant="scale" delay={250} duration={1300}>
                  <div
                    className="media-elevated relative w-full overflow-hidden bg-[#cfcfcf]"
                    style={{ aspectRatio: "1.5 / 1" }}
                  >
                    <ZoomImage
                      src={s.image}
                      alt={s.imageAlt ?? s.heading}
                      fill
                      sizes="(min-width: 1024px) 800px, 100vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Mark library — captioned grid of logo / mark variants */}
      {data.markLibrary && data.markLibrary.items.length > 0 && (
        <section className="relative mx-auto mt-24 max-w-[1440px] px-5 sm:mt-40 sm:px-8">
          <div className="grid grid-cols-12 items-end gap-6 sm:gap-8">
            <Reveal variant="up" duration={1100} className="col-span-12 sm:col-span-4">
              <div className="flex flex-col gap-3">
                <span className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
                  {data.markLibrary.kicker ?? "Mark Library"}
                </span>
                <h2
                  className="font-display text-ink"
                  style={{
                    fontSize: "clamp(28px, 6vw, 56px)",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {data.markLibrary.heading ?? "Every variant"}
                </h2>
              </div>
            </Reveal>
            {data.markLibrary.intro && (
              <Reveal
                variant="up"
                delay={120}
                duration={1100}
                className="col-span-12 sm:col-span-7 sm:col-start-6"
              >
                <p className="text-[16px] leading-[1.55] text-ink/80 sm:text-[17px]">
                  <RichText>{data.markLibrary.intro}</RichText>
                </p>
              </Reveal>
            )}
          </div>

          <div className="mt-10 grid grid-cols-12 gap-3 sm:mt-14 sm:gap-4">
            {data.markLibrary.items.map((m, i) => {
              const dark = m.bg === "ink" || /white/i.test(m.label);
              return (
                <Reveal
                  key={m.src}
                  variant="up"
                  delay={(i % 8) * 50}
                  duration={1000}
                  className="col-span-6 sm:col-span-4 lg:col-span-3"
                >
                  <figure className="group flex flex-col">
                    <div
                      className={`relative w-full overflow-hidden rounded-[20px] transition-colors duration-500 ${
                        dark
                          ? "media-elevated border border-ink/40 bg-[#0a0a0a] group-hover:border-ink/60"
                          : "glass"
                      }`}
                      style={{ aspectRatio: "1 / 1" }}
                    >
                      <ZoomImage
                        src={m.src}
                        alt={m.label}
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 640px) 33vw, 50vw"
                        className="object-contain p-6 transition-transform duration-700 group-hover:scale-[1.04] sm:p-8"
                        zoomItems={data.markLibrary!.items.map((x) => ({ src: decodeURI(x.src), alt: x.label }))}
                        zoomIndex={i}
                      />
                    </div>
                    <figcaption className="mt-3 text-[11px] tracking-[0.16em] uppercase text-ink/70">
                      {m.label}
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Gallery */}
      {data.gallery.length > 0 && (
        <section className="relative mx-auto mt-24 max-w-[1440px] px-5 sm:mt-40 sm:px-8">
          <Reveal variant="up" duration={1000}>
            <span className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
              Gallery
            </span>
          </Reveal>
          <div className="mt-10 grid grid-cols-12 gap-6">
            {data.gallery.map((img, i) => (
              <Reveal
                key={img.src}
                variant="up"
                delay={i * 80}
                duration={1100}
                className={
                  i % 3 === 0
                    ? "col-span-12 md:col-span-7"
                    : i % 3 === 1
                      ? "col-span-12 md:col-span-5"
                      : "col-span-12"
                }
              >
                <div
                  className="media-elevated relative w-full overflow-hidden bg-[#cfcfcf]"
                  style={{ aspectRatio: i % 3 === 2 ? "2 / 1" : "1.4 / 1" }}
                >
                  <ZoomImage
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 1024px) 700px, 100vw"
                    className="object-cover object-top"
                    zoomItems={data.gallery}
                    zoomIndex={i}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Next case study */}
      <section className="relative mx-auto mt-24 max-w-[1280px] px-5 sm:mt-40 sm:px-8">
        <Reveal variant="up" duration={1100}>
          <Link
            href={`/case-study/${data.next.slug}`}
            className="group block border-t border-ink/15 pt-8 sm:pt-12"
          >
            <div className="flex items-baseline justify-between gap-6 sm:gap-8">
              <span className="text-[11px] tracking-[0.18em] uppercase text-ink/55">
                Next Project
              </span>
              <span className="text-[12px] tracking-[0.18em] uppercase text-ink/55 transition-transform duration-500 group-hover:translate-x-2">
                →
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
              {data.next.title}
            </h3>
          </Link>
        </Reveal>
      </section>
    </article>
  );
}
