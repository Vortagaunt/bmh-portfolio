import type { Metadata } from "next";
import { CaseStudyLayout, type CaseStudyData } from "@/components/CaseStudyLayout";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Dirty Sara-Soda — Bronx Hanratty",
  description:
    "Real branding for a real business — the launch mark and identity for Dirty Sara-Soda, a family-run mobile dirty-soda stand in Sarasota, FL.",
  openGraph: {
    title: "Dirty Sara-Soda — Bronx Hanratty",
    description:
      "Real branding for a real business — the launch mark and identity for Dirty Sara-Soda, a family-run mobile dirty-soda stand in Sarasota, FL.",
    url: "/case-study/dirty-sara-soda",
    siteName: "Bronx Hanratty",
    type: "article",
    images: [{ url: "/og/dirty-sara-soda.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dirty Sara-Soda — Bronx Hanratty",
    description:
      "Real branding for a real business — the launch mark and identity for Dirty Sara-Soda, a family-run mobile dirty-soda stand in Sarasota, FL.",
    images: ["/og/dirty-sara-soda.jpg"],
  },
};

const data: CaseStudyData = {
  index: "04",
  category: "Brand · Client Work",
  title: "Dirty Sara-Soda",
  subtitle:
    "Real branding for a real business — the launch mark and identity for *Dirty Sara-Soda*, a family-run mobile dirty-soda stand rolling through *Sarasota, Florida*.",
  hero: {
    src: "/images/dirty-sara-soda.webp",
    alt: "Dirty Sara-Soda — the Dirty Soda Jerks brand mark",
  },
  meta: [
    { label: "Year", value: "2026" },
    { label: "Role", value: "Brand Designer" },
    { label: "Tools", value: "*Illustrator*, *Photoshop*" },
    { label: "Type", value: "Client · Family business" },
  ],
  overview:
    "My first real client. A new mobile *dirty soda* business needed a face before launch — something fun enough to stop foot traffic, bold enough to read from across a parking lot, and flexible enough to live on cups, stickers, and the stand itself.",
  sections: [
    {
      heading: "The brief",
      body: "Dirty sodas are loud, sweet, and a little chaotic — the brand had to be too. The name came with personality built in, so the job was giving it a body: a mark that felt like a soda-shop mascot from another era, wearing sunglasses in the *Florida* sun.",
    },
    {
      heading: "The mark",
      body: "A strutting soda-cup mascot in shades, mid-fizz, wrapped in a bubbly hand-lettered script. The sticker-style white outline keeps it punchy on any background, and the *Dirty Soda Jerks* banner locks up location and attitude in one line. Bubblegum pink and cream soda blue carry the palette.",
      image: "/images/dirty-sara-soda.webp",
      imageAlt: "The Dirty Sara-Soda mascot mark",
    },
    {
      heading: "On the road",
      body: "The brand launched with the business itself — on the stand, the cups, and the socials — and the launch even caught the attention of the local news. Nothing beats seeing your work hand people actual drinks.",
    },
  ],
  gallery: [
    { src: "/images/dirty-sara-soda.webp", alt: "Dirty Sara-Soda brand mark" },
  ],
  next: {
    slug: "recent-works",
    title: "Recent Works",
  },
};

export default function DirtySaraSodaCaseStudy() {
  return (
    <main className="relative isolate min-h-screen w-full bg-paper text-ink">
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
