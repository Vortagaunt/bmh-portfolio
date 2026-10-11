import type { Metadata } from "next";
import localFont from "next/font/local";
import { BrandGuidelines } from "@/components/lrhs/guidelines/BrandGuidelines";

/* Hanken Grotesk is the brand's own sans (SIL Open Font License, see
   fonts/OFL.txt), so it ships with the page. Industry Black is licensed and
   never ships: its lettering here is outlined artwork (ib-type.ts). */
const hanken = localFont({
  src: "./fonts/HankenGrotesk-latin-wght.woff2",
  variable: "--font-hanken",
  weight: "100 900",
  display: "swap",
});

const TITLE = "Mustang Brand Guidelines — Lakewood Ranch High School";
const DESCRIPTION =
  "The Mustang brand system for Lakewood Ranch High School: the marks, the colour, the type, the voice, and the system on real surfaces. A concept by Bronx Hanratty.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/lrhs-brand-guidelines",
    siteName: "Bronx Hanratty",
    type: "article",
    images: [{ url: "/og/lakewood-ranch-redesign.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og/lakewood-ranch-redesign.jpg"],
  },
};

export default function Page() {
  return <BrandGuidelines fontClass={hanken.variable} />;
}
