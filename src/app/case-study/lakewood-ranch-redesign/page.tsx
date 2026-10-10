import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudyLayout, type CaseStudyData, type MarkLibraryItem } from "@/components/CaseStudyLayout";
import LRHS_MARKS from "@/data/lrhs-marks.json";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Lakewood Ranch HS — Redesign Concept — Bronx Hanratty",
  description: "A speculative Mustang brand system and working website mockup for Lakewood Ranch High School.",
  openGraph: {
    title: "Lakewood Ranch HS — Redesign Concept — Bronx Hanratty",
    description: "A speculative Mustang brand system and working website mockup for Lakewood Ranch High School.",
    url: "/case-study/lakewood-ranch-redesign",
    siteName: "Bronx Hanratty",
    type: "article",
    images: [{ url: "/og/lakewood-ranch-redesign.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lakewood Ranch HS — Redesign Concept — Bronx Hanratty",
    description: "A speculative Mustang brand system and working website mockup for Lakewood Ranch High School.",
    images: ["/og/lakewood-ranch-redesign.jpg"],
  },
};

// ─────────────────────────────────────────────────────────────────────
//  TOGGLE: flip to false to bring the full case study back. Same switch
//  as the yearbook page — everything below is kept intact and ready.
// ─────────────────────────────────────────────────────────────────────
const COMING_SOON = true;

/* The mark library is read from the same catalogue the pitch deck and the
   printable PDF are built from (src/data/lrhs-marks.json), so the three can
   never list different marks. Reverse marks get the dark tile. */
const markSrc = (file: string) => `/images/lrhs-marks/${encodeURI(file)}`;
const markItems: MarkLibraryItem[] = [
  ...LRHS_MARKS.marks.map((m) => ({
    src: markSrc(m.file),
    label: m.name,
    ...(m.ground === "dark" ? { bg: "ink" as const } : {}),
  })),
  ...LRHS_MARKS.retired.map((m) => ({ src: markSrc(m.file), label: `${m.name} — retired` })),
];

const data: CaseStudyData = {
  index: "03",
  category: "Brand · Web Concept",
  title: "Lakewood Ranch HS — Redesign Concept",
  subtitle:
    "A speculative rebrand and website concept for *Lakewood Ranch High School* — my school, home of the *Mustangs* in Bradenton, Florida since 1998. Rebuilding the identity from the ground up: marks, color, type, voice, and a working website mockup you can actually click through.",
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
    { label: "Explore the brand system", href: "/lrhs-brand-refresh.html", external: true, exitBg: "#0e0e10" },
    { label: "Open Mustang Studio", href: "/studio/", external: true, exitBg: "#0b100d" },
  ],
  linksDecorated: true,
  overview:
    "Lakewood Ranch High is a ~2,400-student public school in *Bradenton, Florida*, part of the *Manatee County* district. Its identity today lives in a dozen scattered files and a wordmark that hasn't been refreshed in over a decade. This concept rebuilds the whole system from one confident green, an athletic display face, and a clear voice — then ships it as a live, on-brand website mockup.",
  sections: [
    {
      heading: "Three pillars",
      body: "The brand rests on three ideas. *Proud* — celebrating scholars, athletes, and artists loudly and often; this is a school that once swept both Florida's top academic and all-sports state honors in a single year, so the brand carries game-day energy all year. *Grounded* — welcoming and clear for every family; spirited, never corporate. *Together* — one campus, one community, the brand always pulling in the same direction.",
      image: "/images/lrhs-identity.png",
      imageAlt: "Identity pillars — Proud, Grounded, Together",
    },
    {
      heading: "Marks, color & type",
      body: "Twenty-seven marks in eight families — the *LR* emblem for athletics, wordmarks for the front office, the Mustang on its own, the band, a graduation crest, the *Academic Powerhouse* badge, the *Mustangs Ahead* newsletter and podcast, and retro marks for spirit wear. *Mustang Green* (#033922) leads — the school's own dark green — partnered with black and a clean white that stands in for the traditional silver. *Spirit Red* is the only true accent, and it stays rare. Headlines are set in *Industry Black* — uppercase, tracked, unapologetically athletic. *Hanken Grotesk* carries body and UI.",
      image: "/images/lrhs-marks.png",
      imageAlt: "The Mustang marks — wordmark, emblem, reversed emblem and the mustang, with the band, crest, Academic Powerhouse, Mustangs Ahead and retro families",
    },
    {
      heading: "The crest",
      body: "For the moments that should feel permanent — *diplomas*, *graduation programmes*, *awards* and ceremonies. The crest is the most formal mark in the system, so it is kept for those: full colour for print, a lighter colourway where that reads too heavy, and a single *Mustang Green* for embossing and foil.",
      image: "/images/lrhs-crest.jpg",
      imageAlt: "The crest in three versions — full colour, light, and one colour",
    },
    {
      heading: "Academic Powerhouse",
      body: "The *Academic Powerhouse* badge in use on campus began as an AI-generated picture — a flat image that blurs when it's enlarged and can't be recoloured. It's rebuilt here as vector artwork in two versions, one with the *LR* and one with the *mustang* on its own, both on the system's horse so they print sharp at any size. Both are now in the mark library as their own family, *Academics*.",
      image: "/images/lrhs-powerhouse.jpg",
      imageAlt: "The AI-generated Academic Powerhouse badge beside the two redrawn vector versions",
    },
    {
      heading: "Softer corners",
      body: "Every corner on the *LR* is now very slightly rounded — about the softness of an app icon — and the same change runs through all *seven emblem files*, from the full-colour emblem to the band marks. The outline, the white keyline and the green letter round together, so the outline stays even. Where one letter tucks under the other, the corner stays sharp.",
      image: "/images/lrhs-corners.jpg",
      imageAlt: "The LR emblem with square corners beside the subtly rounded version, with a close-up of the top of the L before and after",
    },
    {
      heading: "The system, applied",
      body: "Everything above, rolled into a working website mockup. The homepage opens on a single hero photo, then routes *students*, *families*, and *faculty* into the content they actually came for — bell schedule, lunch, calendar, athletics. Voice rules carry through: headlines shout in caps, body stays warm and plain. Less depth, less guessing.",
      image: "/images/lrhs-in-use.png",
      imageAlt: "The system applied — game-day social and website header",
    },
    {
      heading: "Signage",
      body: "The sign on campus today lays the old mustang straight over grey block letters, so the horse and the name fight for the same space. The concept keeps the *same wall* and the *same words*, sets them in the brand's type on *Mustang Green*, and moves the horse back into the field so the name can actually be read.",
      image: "/images/lrhs-signage.jpg",
      imageAlt: "The school sign before and after — the current sign beside the redrawn concept on the same wall",
    },
    {
      heading: "Poster concepts",
      body: "Two posters built from the same parts as the wallpaper — the *Mustang Green* field and the horse. One carries the name for walls, entrances and the stadium; the other, *Go Mustangs!*, is for game week and the student section. A poster, a banner and the sign all read as one school.",
      image: "/images/lrhs-posters.jpg",
      imageAlt: "Two poster concepts — the school name repeated, and Go Mustangs!",
    },
    {
      heading: "Student ID",
      body: "The one piece of the system every student carries. *Credit-card size* and vertical, for the lanyard: the photo and name lead, and the barcode sits clear at the bottom so it scans first time. The back keeps the *24/7 support lines* from today's card and adds a return address. The number on this concept is a sample, not a real student ID.",
      image: "/images/lrhs-ids-student.jpg",
      imageAlt: "Student ID concept, front and back — photo, name, grade and barcode on the front; support lines and return address on the back",
    },
    {
      heading: "Staff ID",
      body: "*Horizontal* and full *Mustang Green*, so staff read differently from students across a corridor. The front carries the photo, name, title and department; the back carries the return address, the same support lines and an employee ID.",
      image: "/images/lrhs-ids-staff.jpg",
      imageAlt: "Staff ID concept, front and back — a horizontal green card with photo and name, and a back with the return address, support lines and employee ID",
    },
    {
      heading: "Mustang Studio",
      body: "A brand only works if people can actually use it, so I built the app for it. *Mustang Studio* is a design editor that only speaks Mustang: a coach, a club sponsor or the front office picks a template, changes the words and exports — and it comes out on brand every time. Every mark, colour and type style is already inside, and a *brand check* flags anything that's off (text that's hard to read, a mark on the wrong ground, too much Spirit Red) with a one-click fix. It runs on *Windows*, a *Mac*, a *Chromebook* or in any browser — open it at bronxhanratty.me/studio.",
      image: "/images/lrhs-studio.jpg",
      imageAlt: "Mustang Studio, the brand-locked design app, open on a game-day post with the templates drawer and the brand check",
    },
    {
      heading: "Forty-one templates",
      body: "Ready on day one and sorted by department — *Athletics*, *Events & clubs*, *News & podcast*, *School & awards* and the *ID cards* — plus a set for every season: *Homecoming*, *Pink Out*, *Halloween* and the *winter holidays*, each with two planned colours the brand check accepts. Seventeen sizes, from an Instagram story to a 24 × 36 poster and a six-foot fence banner. Everything in them stays editable.",
      image: "/images/lrhs-studio-templates.jpg",
      imageAlt: "All forty-one Mustang Studio templates, grouped by department: athletics, events and clubs, news and podcast, school and awards, ID cards and seasons",
    },
    {
      heading: "Made for people who aren't designers",
      body: "Version 1.6 is built around the people who'll actually use it. *Fill in the blanks* turns a design into a form, so nothing can slide off brand. A *batch from a spreadsheet* turns a pasted staff list into every ID card, ganged on Letter sheets with cut marks. Designs can have pages — an *Instagram carousel* exports as a ZIP, a newsletter as one PDF — and they can *move*, as an MP4 or a GIF. Anyone can save a design as their own template, and a *Who are you?* start screen puts the right templates first.",
      image: "/images/lrhs-studio-new.jpg",
      imageAlt: "Mustang Studio 1.6 — fill-in-the-blanks mode, a sheet of staff ID cards made from a spreadsheet, and a four-page Instagram carousel",
    },
    {
      heading: "Mustang Studio, on one page",
      body: "Everything the app does on a single sheet, built in the same way as the system's own recap: the *game-day editor*, *fill in the blanks*, a *staff list* turned into ID cards, *forty-one templates*, carousels, motion, the four *seasons*, the *brand check*, the *Who are you?* start screen, where it runs and what it exports — and the address to try it.",
      image: "/images/lrhs-studio-bento.jpg",
      video: "/videos/mustang-studio-bento-motion.mp4",
      imageAlt: "A one-page bento of Mustang Studio — the app open on a game-day post, fill-in-the-blanks mode, a staff list becoming a sheet of ID cards, the forty-one templates, carousels, motion, seasons, the brand check, the start screen, platforms, export formats and bronxhanratty.me/studio",
    },
    {
      heading: "One more thing…",
      body: "*Mustangs Ahead* — everything above on a single sheet, laid out like a keynote recap, and built in like one: the *LR*, the new *student ID*, the *mark library*, the colours, type, crest, posters and apparel, *Mustang Studio*, and a code that leads to this site. It's the page to send when someone asks what the system actually is.",
      image: "/images/lrhs-bento.jpg",
      video: "/videos/lrhs-bento-motion.mp4",
      imageAlt: "A one-page bento of the Mustang brand system — the LR emblem, the student ID front and back, the mark library, colour strips, type, the crest, the band and podcast marks, Spirit Red, posters, apparel, the voice, the Mustang Studio design app and a QR code to the site",
    },
  ],
  gallery: [
    { src: "/images/lrhs-color.png", alt: "Color system — Mustang Green, Spirit Red, Ink, Paper" },
    { src: "/images/lrhs-type.png", alt: "Type specimen — Industry Black & Hanken Grotesk" },
    { src: "/images/lrhs-icons.png", alt: "Iconography — Lucide outline set" },
    { src: "/images/lrhs-voice.png", alt: "Voice — We Do / We Don't" },
    { src: "/images/lrhs-go-mustangs.jpg", alt: "Go Mustangs — closing splash" },
  ],
  markLibrary: {
    kicker: "Mark Library",
    heading: "Every mark, every variant",
    intro:
      "The full set of *Mustang* marks — twenty-seven in eight families, from the *LR* emblem to the graduation crest and the *Academic Powerhouse* badge — plus the retired *legacy* artwork, kept here for reference. Use the supplied SVGs only; never redraw, recolor, or stretch.",
    items: markItems,
  },
  photoSets: [
    {
      kicker: "The evidence",
      heading: "Count the horses",
      intro:
        "Before drawing anything, I walked the campus with a phone. Every one of these is on site right now, and all of them were photographed in a *single afternoon* — not hunted for, just noticed on the way to class.",
      cols: 6,
      fit: "cover",
      items: [
      { src: "/images/lrhs-audit/img-4591.jpg", caption: "Scoreboard", alt: "Lakewood Ranch campus signage — scoreboard" },
      { src: "/images/lrhs-audit/img-4605.jpg", caption: "Academic banner", alt: "Lakewood Ranch campus signage — academic banner" },
      { src: "/images/lrhs-audit/img-4608.jpg", caption: "Pole banner", alt: "Lakewood Ranch campus signage — pole banner" },
      { src: "/images/lrhs-audit/img-4609.jpg", caption: "Building sign", alt: "Lakewood Ranch campus signage — building sign" },
      { src: "/images/lrhs-audit/img-4594.jpg", caption: "Field bench", alt: "Lakewood Ranch campus signage — field bench" },
      { src: "/images/lrhs-audit/img-4611.jpg", caption: "Entrance banner", alt: "Lakewood Ranch campus signage — entrance banner" },
      { src: "/images/lrhs-audit/img-4813.jpg", caption: "Parking sign", alt: "Lakewood Ranch campus signage — parking sign" },
      { src: "/images/lrhs-audit/img-4617.jpg", caption: "Band trailer", alt: "Lakewood Ranch campus signage — band trailer" },
      { src: "/images/lrhs-audit/img-4616.jpg", caption: "Band trailer", alt: "Lakewood Ranch campus signage — band trailer" },
      { src: "/images/lrhs-audit/img-4606.jpg", caption: "Pole banner", alt: "Lakewood Ranch campus signage — pole banner" },
      { src: "/images/lrhs-audit/img-4612.jpg", caption: "Cafeteria", alt: "Lakewood Ranch campus signage — cafeteria" },
      { src: "/images/lrhs-audit/7e57aa60-1d8d-4695-84ee-2cf9b2c02b30.jpg", caption: "Midfield", alt: "Lakewood Ranch campus signage — midfield" },
      ],
      note:
        "At least five different horse drawings, greens running from near-black to teal to cyan, and no two lockups built the same way. None of them are wrong — they were each somebody doing their best with whatever file they could find. That is the problem a system solves.",
    },
    {
      kicker: "In use",
      heading: "The part students actually wear",
      intro:
        "Spirit wear is the largest run the school prints each year, and the place a mark takes the most abuse. Embroidery, one-colour print, sublimation and a stitched patch — every one of these comes off the *same file*.",
      cols: 5,
      tile: "paper",
      fit: "contain",
      items: [
      { src: "/images/lrhs-apparel/cap.png", caption: "Cap — embroidered", alt: "Mustang identity on a cap" },
      { src: "/images/lrhs-apparel/hoodie.png", caption: "Hoodie — one-colour print", alt: "Mustang identity on a hoodie" },
      { src: "/images/lrhs-apparel/jersey.png", caption: "Game jersey — sublimated", alt: "Mustang identity on a game jersey" },
      { src: "/images/lrhs-apparel/crewneck.png", caption: "Crewneck — reversed on green", alt: "Mustang identity on a crewneck" },
      { src: "/images/lrhs-apparel/polo.png", caption: "Polo — embroidered patch", alt: "Mustang identity on a polo" },
      ],
    },
  ],
  next: {
    slug: "recent-works",
    title: "Recent Works",
  },
};

function ComingSoon() {
  return (
    <section className="relative flex min-h-[78vh] items-center justify-center px-5 sm:px-8">
      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center text-center">
        {/* Big outline serif backdrop — "Ahead", as in Mustangs Ahead */}
        <Reveal
          variant="fade"
          duration={2200}
          as="span"
          className="serif-outline absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap"
          style={{
            fontSize: "clamp(180px, 26vw, 360px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Ahead
        </Reveal>

        <Reveal variant="up" duration={1000}>
          <div className="relative z-10 flex items-baseline gap-4 text-[12px] tracking-[0.16em] uppercase text-ink/60">
            <span>(03)</span>
            <span className="h-px w-10 bg-ink/30" />
            <span>Brand · Web Concept</span>
          </div>
        </Reveal>

        <Reveal variant="blur" delay={150} duration={1600}>
          <h1
            className="relative z-10 mt-6 font-display text-ink"
            style={{
              fontSize: "clamp(64px, 11vw, 168px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            More to{" "}
            <span
              className="font-serif italic"
              style={{ fontWeight: 400, letterSpacing: "-0.02em" }}
            >
              come
            </span>
            <span aria-hidden className="motion-safe:animate-pulse">
              &hellip;
            </span>
          </h1>
        </Reveal>

        <Reveal variant="up" delay={280} duration={1100}>
          <p className="relative z-10 mt-10 max-w-[560px] text-[18px] leading-[1.55] text-ink/80">
            The{" "}
            <span className="font-serif italic tracking-[-0.01em]">
              Lakewood Ranch
            </span>{" "}
            case study has gone dark while something bigger takes shape.
            Updating soon.
          </p>
        </Reveal>

        <Reveal variant="up" delay={420} duration={1100}>
          <Link
            href="/#works"
            className="group relative z-10 mt-12 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-ink/[0.03] px-6 py-3 text-[14px] font-medium tracking-tight text-ink transition-all duration-500 hover:bg-ink/[0.08] hover:scale-[1.02]"
          >
            <span className="transition-transform duration-500 group-hover:-translate-x-1">
              ←
            </span>
            Back to Work
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function LakewoodRanchCaseStudy() {
  return (
    <main className="relative isolate min-h-screen w-full bg-paper text-ink">
      <SmoothScroll />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div aria-hidden className="ambient absolute inset-0" />
        <GridBackdrop />
      </div>
      <SiteHeader />
      <div className="relative z-10">
        {COMING_SOON ? <ComingSoon /> : <CaseStudyLayout data={data} />}
        <Footer />
      </div>
    </main>
  );
}
