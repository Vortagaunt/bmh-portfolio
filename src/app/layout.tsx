import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/PageTransition";
import { BackgroundMusic } from "@/components/BackgroundMusic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bronxhanratty.me"),
  title: "Bronx (Portfolio 2026)",
  description:
    "Bronx Hanratty, Digital Product Designer. Current: Almabase",
  openGraph: {
    title: "Bronx Hanratty — Portfolio 2026",
    description: "Digital & brand designer based in Sarasota, FL.",
    url: "/",
    siteName: "Bronx Hanratty",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Bronx Hanratty — digital & brand designer, Portfolio 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bronx Hanratty — Portfolio 2026",
    description: "Digital & brand designer based in Sarasota, FL.",
    images: ["/og.jpg"],
  },
};

// Toggle background music site-wide. Flip to `true` to bring it back —
// the BackgroundMusic component is left fully intact below.
const MUSIC_ENABLED = false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bricolage.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PageTransition />
        {MUSIC_ENABLED && (
          <BackgroundMusic src="/audio/background.mp3" volume={0.8} />
        )}
        {children}
      </body>
    </html>
  );
}
