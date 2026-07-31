import type { Metadata } from "next";
import { CaseStudyLayout, type CaseStudyData } from "@/components/CaseStudyLayout";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "“8:46 AM” Short Documentary — Bronx Hanratty",
  description: "A reflective short documentary on the morning of September 11, 2001 — researched, filmed, and edited by Bronx Hanratty.",
  openGraph: {
    title: "“8:46 AM” Short Documentary — Bronx Hanratty",
    description: "A reflective short documentary on the morning of September 11, 2001 — researched, filmed, and edited by Bronx Hanratty.",
    url: "/case-study/846-am",
    siteName: "Bronx Hanratty",
    type: "article",
    images: [{ url: "/og/846-am.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "“8:46 AM” Short Documentary — Bronx Hanratty",
    description: "A reflective short documentary on the morning of September 11, 2001 — researched, filmed, and edited by Bronx Hanratty.",
    images: ["/og/846-am.jpg"],
  },
};

const data: CaseStudyData = {
  index: "02",
  category: "Documentary · Film",
  title: "8:46 AM",
  subtitle:
    "A short documentary about the morning of *September 11, 2001* — researched, filmed, edited, and color-graded as a personal exploration of memory, archive footage, and quiet reflection.",
  hero: {
    src: "/images/846-clock.png",
    alt: "8:46 AM — title clock display",
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
      image: "/images/846-research.png",
      imageAlt: "Understanding 9/11 — Television News Archive timeline grid",
    },
    {
      heading: "Edit & pacing",
      body: "The cut moves at the pace of a slow walk. Long holds on still frames, ambient room tone, and a single recurring motif — a wall clock — that ties the timeline together. I deliberately avoided dramatic music until the final 30 seconds, where it enters and immediately resolves.",
      image: "/images/846-breaking-news.png",
      imageAlt: "Archive news still — Breaking News, World Trade Center Disaster",
    },
    {
      heading: "Interviews",
      body: "With the help of my team, I managed to interview *Carol Lin* and *Jordan Swonger*. *Carol Lin* is a retired *CNN* anchor, being the first person to ever cover the *9/11* attacks. *Jordan Swonger* was a local student called in to be a First Responder at the *Pentagon*. Both of them cover an amazing story, and capture both sides of the aisle.",
    },
  ],
  gallery: [
    { src: "/images/846-clock.png", alt: "8:46 AM — recurring clock motif" },
    { src: "/images/846-breaking-news.png", alt: "Breaking News — World Trade Center Disaster archive still" },
    { src: "/images/846-bush.png", alt: "President George W. Bush addressing the nation" },
    { src: "/images/846-jordan.png", alt: "Jordan Swonger — interview still" },
    { src: "/images/846-carol-lin.png", alt: "Carol Lin — CNN anchor interview" },
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
