import fs from "fs";
import path from "path";
import { CaseStudyLayout, type CaseStudyData, type MarkLibraryItem } from "@/components/CaseStudyLayout";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

/**
 * Read the Industry-Black font once at build time. We embed it directly
 * inside each text-bearing SVG so the marks render correctly in every
 * browsing context — iOS Safari is fussy about page @font-face reaching
 * inline SVGs in time, but a self-contained font in the SVG's own <defs>
 * works everywhere.
 */
const industryFontBase64 = (() => {
  try {
    return fs
      .readFileSync(path.join(process.cwd(), "public", "fonts", "industry-black.otf"))
      .toString("base64");
  } catch {
    return "";
  }
})();

const EMBEDDED_FONT_STYLE = industryFontBase64
  ? `<defs><style type="text/css"><![CDATA[
      @font-face {
        font-family: 'Industry-Black';
        src: url('data:font/otf;base64,${industryFontBase64}') format('opentype');
        font-weight: 400 900;
        font-style: normal;
      }
      @font-face {
        font-family: 'Industry';
        src: url('data:font/otf;base64,${industryFontBase64}') format('opentype');
        font-weight: 400 900;
        font-style: normal;
      }
    ]]></style></defs>`
  : "";

/**
 * Read an SVG file from /public at build time and prepare it for inline
 * rendering: strip the XML declaration, force the root <svg> tag to fill
 * its container, and inject the Industry-Black font into the SVG's own
 * <defs> so its <text> elements never fall back to a system serif.
 */
function readInlineSvg(publicSrc: string): string | undefined {
  try {
    const fileName = decodeURIComponent(publicSrc.replace(/^\//, ""));
    const fullPath = path.join(process.cwd(), "public", fileName);
    let svg = fs.readFileSync(fullPath, "utf8");
    svg = svg.replace(/<\?xml[^?]*\?>/g, "").trim();
    svg = svg.replace(
      /<svg\b([^>]*)>/i,
      (_m, attrs: string) => {
        let a = attrs.replace(/\s(width|height)="[^"]*"/gi, "");
        if (!/preserveAspectRatio=/i.test(a)) a += ' preserveAspectRatio="xMidYMid meet"';
        return `<svg${a} width="100%" height="100%" style="display:block">${EMBEDDED_FONT_STYLE}`;
      },
    );
    return svg;
  } catch {
    return undefined;
  }
}

/** Mark labels whose SVGs reference Industry-Black and therefore need inline rendering. */
const INLINE_MARK_LABELS = new Set([
  "LRHS Mustang Band",
  "LRHS Mustangs Ahead 1",
  "LRHS Mustangs Ahead 2",
]);

function hydrateMarks(items: MarkLibraryItem[]): MarkLibraryItem[] {
  return items.map((m) =>
    INLINE_MARK_LABELS.has(m.label) ? { ...m, svg: readInlineSvg(m.src) } : m,
  );
}

const data: CaseStudyData = {
  index: "03",
  category: "Brand · Web Concept",
  title: "Lakewood Ranch HS — Redesign Concept",
  subtitle:
    "A speculative rebrand and website concept for *Lakewood Ranch High School* — rebuilding the Mustang identity from the ground up: marks, color, type, voice, and a working website mockup you can actually click through.",
  hero: {
    src: "/images/lrhs-hero.png",
    alt: "The Mustang Brand System — hero",
  },
  meta: [
    { label: "Year", value: "2026" },
    { label: "Role", value: "Designer" },
    { label: "Tools", value: "*Figma*, *Illustrator*" },
    { label: "Type", value: "Concept · Self-initiated" },
  ],
  links: [
    { label: "Explore the brand system", href: "/lrhs-brand-refresh.html", external: true },
  ],
  overview:
    "The existing identity lives in a dozen scattered files and a wordmark that hasn't been refreshed in over a decade. This concept rebuilds the whole system from one confident green, an athletic display face, and a clear voice — then ships it as a live, on-brand website mockup.",
  sections: [
    {
      heading: "Three pillars",
      body: "The brand rests on three ideas. *Proud* — celebrating scholars, athletes, and artists loudly and often, with game-day energy all year. *Grounded* — welcoming and clear for every family; spirited, never corporate. *Together* — one campus, one community, the brand always pulling in the same direction.",
      image: "/images/lrhs-identity.png",
      imageAlt: "Identity pillars — Proud, Grounded, Together",
    },
    {
      heading: "Marks, color & type",
      body: "Five marks for every situation — primary lockup, the *LR* emblem for athletics, a reverse lockup for on-green applications, the Mustang icon, and a stacked wordmark. *Mustang Green* (#033922) leads, partnered with black and white; *Spirit Red* is the only true accent, and it stays rare. Headlines are set in *Industry Black* — uppercase, tracked, unapologetically athletic. *Hanken Grotesk* carries body and UI.",
      image: "/images/lrhs-marks.png",
      imageAlt: "The five Mustang marks",
    },
    {
      heading: "The system, applied",
      body: "Everything above, rolled into a working website mockup. The homepage opens on a single hero photo, then routes *students*, *families*, and *faculty* into the content they actually came for — bell schedule, lunch, calendar, athletics. Voice rules carry through: headlines shout in caps, body stays warm and plain. Less depth, less guessing.",
      image: "/images/lrhs-in-use.png",
      imageAlt: "The system applied — game-day social and website header",
    },
  ],
  gallery: [
    { src: "/images/lrhs-color.png", alt: "Color system — Mustang Green, Spirit Red, Ink, Paper" },
    { src: "/images/lrhs-type.png", alt: "Type specimen — Industry Black & Hanken Grotesk" },
    { src: "/images/lrhs-icons.png", alt: "Iconography — Lucide outline set" },
    { src: "/images/lrhs-voice.png", alt: "Voice — We Do / We Don't" },
    { src: "/images/lrhs-go-mustangs.png", alt: "Go Mustangs — closing splash" },
  ],
  markLibrary: {
    kicker: "Mark Library",
    heading: "Every mark, every variant",
    intro:
      "The full set of *Mustang* marks — current lockups, athletic emblems, and the retired *legacy* artwork kept here for reference. Use the supplied SVGs only; never redraw, recolor, or stretch.",
    items: [
      { src: "/images/lrhs-marks/Full%20LRHS%20Logo.svg", label: "Full LRHS Logo" },
      { src: "/images/lrhs-marks/LRHS%20Emblem.svg", label: "LRHS Emblem" },
      { src: "/images/lrhs-marks/LRHS%20Emblem%20Black.svg", label: "LRHS Emblem Black" },
      { src: "/images/lrhs-marks/LRHS%20Emblem%20White.svg", label: "LRHS Emblem White", bg: "ink" },
      { src: "/images/lrhs-marks/LRHS%20Emblem%20No%20Horse.svg", label: "LRHS Emblem No Horse" },
      { src: "/images/lrhs-marks/LRHS%20Horse.svg", label: "LRHS Horse" },
      { src: "/images/lrhs-marks/LRHS%20Mustang%20Band.svg", label: "LRHS Mustang Band" },
      { src: "/images/lrhs-marks/LRHS%20Mustangs%20Ahead%201.svg", label: "LRHS Mustangs Ahead 1" },
      { src: "/images/lrhs-marks/LRHS%20Mustangs%20Ahead%202.svg", label: "LRHS Mustangs Ahead 2" },
      { src: "/images/lrhs-marks/LRHS%20Retro%20Logo.svg", label: "LRHS Retro Logo" },
      { src: "/images/lrhs-marks/I%20Love%20LRHS.svg", label: "I Love LRHS" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Emblem.svg", label: "Old LRHS Emblem" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Horse.svg", label: "Old LRHS Horse" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Horse%202.svg", label: "Old LRHS Horse 2" },
      { src: "/images/lrhs-marks/Old%20LRHS%20Horse%203.svg", label: "Old LRHS Horse 3" },
    ] as MarkLibraryItem[],
  },
  next: {
    slug: "recent-works",
    title: "Recent Works",
  },
};

export default function LakewoodRanchCaseStudy() {
  // Hydrate the mark library at build time so SVGs with text render inline
  // and have access to Industry-Black loaded by globals.css.
  const hydratedData: CaseStudyData = {
    ...data,
    markLibrary: data.markLibrary
      ? { ...data.markLibrary, items: hydrateMarks(data.markLibrary.items) }
      : undefined,
  };
  return (
    <main className="relative isolate min-h-screen w-full bg-[#f1f1f1] text-[#181818]">
      <SmoothScroll />
      <div className="pointer-events-none fixed inset-0 z-0">
        <GridBackdrop />
      </div>
      <SiteHeader />
      <div className="relative z-10">
        <CaseStudyLayout data={hydratedData} />
        <Footer />
      </div>
    </main>
  );
}
