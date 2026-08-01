"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Reveal } from "@/components/Reveal";

const RELICS = [
  { t: "05.2026", e: "hello — the intro animation boots for the first time" },
  { t: "05.2026", e: "bronxhanratty.me goes live on Cloudflare" },
  { t: "06.2026", e: "the iPod arrives in the footer, wheel and all" },
  { t: "06.2026", e: "Award of Excellence — Dalí Museum, “Cascade Creation”" },
  { t: "07.2026", e: "Cover Flow learns to flip; Brick ships in the menu" },
  { t: "07.2026", e: "the 404 bomb detonates for the first lost visitor" },
  { t: "07.2026", e: "the site loses 57MB on the WebP diet" },
  { t: "NOW", e: "you clicked a Mac seven times and typed the sacred code" },
];

function LostSoundtrack() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else { a.pause(); setPlaying(false); }
  };
  return (
    <div className="flex items-center gap-5 border border-white/15 bg-white/[0.04] p-5 sm:p-6">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause the lost soundtrack" : "Play the lost soundtrack"}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/25 text-[20px] text-white transition hover:bg-white/10"
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <div className="min-w-0">
        <p className="text-[15px] font-medium tracking-tight text-white">
          The Lost Soundtrack
        </p>
        <p className="mt-1 text-[13px] leading-[1.5] text-white/55">
          This song used to autoplay on the whole site. It was retired… but
          nothing truly leaves the{" "}
          <span className="font-serif italic text-[15px]">vault</span>.
        </p>
      </div>
      <audio ref={audioRef} src="/audio/background.mp3" loop preload="none"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    </div>
  );
}

export default function VaultPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("vault-unlocked") === "1") setAllowed(true);
    else router.replace("/secret");
  }, [router]);

  if (!allowed) {
    return <main className="min-h-screen w-full bg-[#0a0a0a]" />;
  }

  return (
    <main className="relative isolate min-h-screen w-full bg-[#0a0a0a] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <GridBackdrop variant="dark" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1100px] px-5 pt-24 pb-24 sm:px-8 sm:pt-28">
        {/* Giant outline backdrop */}
        <Reveal
          variant="fade"
          duration={1600}
          as="span"
          className="serif-outline serif-outline--dark pointer-events-none absolute left-1/2 top-[300px] -translate-x-1/2 select-none whitespace-nowrap"
          style={{
            fontSize: "clamp(200px, 30vw, 460px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Vault
        </Reveal>

        <Reveal variant="up" duration={1000}>
          <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase text-white/50">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
            Classified · found via seven clicks
          </div>
        </Reveal>

        <Reveal variant="blur" delay={120} duration={1300}>
          <h1
            className="mt-6 font-display text-white"
            style={{
              fontSize: "clamp(56px, 10vw, 140px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            You{" "}
            <span className="font-serif italic" style={{ fontWeight: 400 }}>
              found
            </span>{" "}
            it.
          </h1>
        </Reveal>

        <Reveal variant="up" delay={260} duration={1100}>
          <p className="mt-8 max-w-[560px] text-[17px] leading-[1.55] text-white/75 sm:text-[19px]">
            Most people scroll right past that Mac. You clicked it{" "}
            <span className="font-serif italic text-[21px]">seven</span> times,
            found a locked door, and knew the words. Welcome to the inner
            circle — population: you.
          </p>
        </Reveal>

        {/* Lost soundtrack */}
        <Reveal variant="up" delay={380} duration={1100}>
          <div className="mt-16 max-w-[560px]">
            <h2 className="text-[11px] tracking-[0.18em] uppercase text-white/50">
              Relic 001 — Audio
            </h2>
            <div className="mt-4">
              <LostSoundtrack />
            </div>
          </div>
        </Reveal>

        {/* Vault log */}
        <Reveal variant="up" delay={480} duration={1100}>
          <div className="mt-16 max-w-[640px]">
            <h2 className="text-[11px] tracking-[0.18em] uppercase text-white/50">
              The Vault Log
            </h2>
            <div className="mt-4 border border-white/15 bg-white/[0.03] p-5 font-mono text-[13px] leading-[2] sm:p-6">
              {RELICS.map((r) => (
                <p key={r.e} className="flex gap-4">
                  <span className="shrink-0 text-white/35">{r.t}</span>
                  <span className="text-white/80">{r.e}</span>
                </p>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal variant="up" delay={580} duration={1100}>
          <div className="mt-16 flex flex-wrap gap-3">
            <Link
              href="/"
              className="magnetic group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-6 py-3 text-[14px] font-medium tracking-tight text-white transition-all duration-500 hover:bg-white/[0.12]"
            >
              <span className="transition-transform duration-500 group-hover:-translate-x-1">←</span>
              <span>Back to the surface</span>
            </Link>
          </div>
        </Reveal>

        <Reveal variant="up" delay={680} duration={1100}>
          <p className="mt-12 text-[12px] tracking-tight text-white/35">
            Tell no one. Or tell everyone — honestly, it&apos;s great marketing.
          </p>
        </Reveal>
      </div>
    </main>
  );
}
