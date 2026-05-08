import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { IntroOverlay } from "@/components/IntroOverlay";
import { Hero } from "@/components/Hero";
import { Works } from "@/components/Works";
import { Archive } from "@/components/Archive";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BackgroundMusic } from "@/components/BackgroundMusic";

export default function Home() {
  return (
    <main className="relative isolate min-h-screen w-full bg-[#f1f1f1] text-[#181818]">
      <IntroOverlay />
      <SmoothScroll />
      <BackgroundMusic src="/audio/background.mp3" volume={0.8} />

      {/* Persistent grid lines across the whole page */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <GridBackdrop />
      </div>

      <SiteHeader />

      <div className="relative z-10">
        <Hero />
        <Works />
        <Archive />
        <About />
        <Footer />
      </div>
    </main>
  );
}
