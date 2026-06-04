import { CaseStudyLayout, type CaseStudyData } from "@/components/CaseStudyLayout";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

const data: CaseStudyData = {
  index: "02",
  category: "Documentary · Film",
  title: "8:46 AM",
  subtitle:
    "A short documentary about the morning of *September 11, 2001* — researched, filmed, edited, and color-graded as a personal exploration of memory, archive footage, and quiet reflection.",
  hero: {
    src: "/images/846am.png",
    alt: "Still frame from the 8:46 AM short documentary",
  },
  meta: [
    { label: "Year", value: "2026" },
    { label: "Role", value: "Director · Editor" },
    { label: "Tools", value: "*Premiere Pro*, *After Effects*" },
    { label: "Runtime", value: "Short · 7 min" },
  ],
  overview:
    "An attempt to tell a familiar story in an unfamiliar register — quiet, slow, and observational. The piece weaves archive material with newly shot footage to create a meditative timeline of a single morning.",
  sections: [
    {
      heading: "Research",
      body: "I started with raw archive — news broadcasts, oral histories, and photographs — looking for the specific small details that don't usually make the news montages: a half-finished coffee cup, the weather report from earlier that morning, a child's drawing. The thesis was that the texture of an ordinary day is what makes the story land.",
      image: "/images/846am.png",
      imageAlt: "Research mood board",
    },
    {
      heading: "Edit & pacing",
      body: "The cut moves at the pace of a slow walk. Long holds on still frames, ambient room tone, and a single recurring motif — a wall clock — that ties the timeline together. I deliberately avoided dramatic music until the final 30 seconds, where it enters and immediately resolves.",
      image: "/images/846am.png",
      imageAlt: "Edit timeline still",
    },
    {
      heading: "Interviews",
      body: "With the help of my team, I managed to interview *Carol Lin* and *Jordan Swonger*. *Carol Lin* is a retired *CNN* anchor, being the first person to ever cover the *9/11* attacks. *Jordan Swonger* was a local student called in to be a First Responder at the *Pentagon*. Both of them cover an amazing story, and capture both sides of the aisle.",
    },
  ],
  gallery: [
    { src: "/images/846am.png", alt: "Opening title card" },
    { src: "/images/846am.png", alt: "Archive footage still" },
    { src: "/images/846am.png", alt: "Wall clock motif" },
    { src: "/images/846am.png", alt: "Newly shot exterior" },
    { src: "/images/846am.png", alt: "Closing frame" },
  ],
  next: {
    slug: "lakewood-ranch-redesign",
    title: "Lakewood Ranch HS — Redesign Concept",
  },
};

export default function ShortDocCaseStudy() {
  return (
    <main className="relative isolate min-h-screen w-full bg-[#f1f1f1] text-[#181818]">
      <SmoothScroll />
      <div className="pointer-events-none fixed inset-0 z-0">
        <GridBackdrop />
      </div>
      <SiteHeader />
      <div className="relative z-10">
        <CaseStudyLayout data={data} />
        <Footer />
      </div>
    </main>
  );
}
