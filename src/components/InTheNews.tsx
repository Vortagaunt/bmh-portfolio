import Image from "next/image";
import { Reveal } from "./Reveal";
import PRESS from "@/data/press.json";

/**
 * The school's article about the LRHS brand work, at the top of the home page.
 * Until it's out (`published: false` in src/data/press.json) this is a
 * "coming soon" card. When it's published, fill in title, date, url, excerpt
 * (and optionally image, a path under /public) and flip `published` to true —
 * the same card then links to the real article.
 * Public page: no Mustang Studio here.
 */
export function InTheNews() {
  const live = PRESS.published && !!PRESS.url;

  const pill = live ? (
    <a
      href={PRESS.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[15px] font-medium text-[#033922] transition hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
    >
      Read the article <span aria-hidden className="ml-2">↗</span>
    </a>
  ) : (
    <span
      aria-disabled="true"
      className="inline-flex h-11 cursor-default items-center rounded-full border border-white/25 px-5 text-[15px] font-medium text-white/55"
    >
      Read the article
    </span>
  );

  return (
    <section id="in-the-news" aria-labelledby="in-the-news-title" className="relative px-5 pt-6 sm:px-8 sm:pt-10">
      <Reveal variant="up" duration={1200}>
        <div className="media-elevated relative mx-auto max-w-[1280px] overflow-hidden bg-[#033922] text-white">
          {/* the LR, oversized and faint, as the card's ground */}
          <Image
            src="/images/lrhs-marks/LRHS Emblem.svg"
            alt=""
            aria-hidden
            width={600}
            height={600}
            className="pointer-events-none absolute -right-10 -bottom-28 hidden w-[460px] opacity-[0.09] brightness-0 invert select-none md:block"
          />
          <div className="relative grid grid-cols-12 items-center gap-x-6 gap-y-8 p-7 sm:gap-x-8 sm:p-12 lg:p-14">
            <div className={live && PRESS.image ? "col-span-12 lg:col-span-7" : "col-span-12 lg:col-span-9"}>
              <p className="text-[12px] font-medium tracking-[0.14em] text-white/60 uppercase">
                In the news · {live ? PRESS.date || PRESS.outlet : "Coming soon"}
              </p>
              <h2
                id="in-the-news-title"
                className="mt-4 font-display"
                style={{ fontSize: "clamp(28px, 4.2vw, 52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.02 }}
              >
                {live ? PRESS.title : "Lakewood Ranch High School is writing a story about my work"}
              </h2>
              <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.6] text-white/75 sm:text-[18px]">
                {live
                  ? PRESS.excerpt || `An article from ${PRESS.outlet}.`
                  : "It’s about the new Mustang brand system. The article isn’t out yet — it’ll be right here when it is."}
              </p>
              <div className="mt-7">{pill}</div>
            </div>
            {live && PRESS.image && (
              <div className="col-span-12 lg:col-span-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] ring-1 ring-white/10">
                  <Image src={PRESS.image} alt="" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
