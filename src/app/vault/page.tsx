"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Reveal } from "@/components/Reveal";
import { PixelGame } from "@/components/PixelGame";

/* Every major update, straight from the commit history. */
const LOG: [string, string][] = [
  ["03.2026", "repo scaffolded — the template this all grew out of"],
  ["05.2026", "the portfolio lands: hero, works, archive, footer"],
  ["05.2026", "bronxhanratty.me goes live on Cloudflare Pages"],
  ["05.2026", "BMH favicon replaces the default"],
  ["05.2026", "hello — the intro animation boots for the first time"],
  ["05.2026", "the name goes full-bleed, edge to edge"],
  ["05.2026", "case study pages + paper-fade route transitions"],
  ["05.2026", "Recent Works opens as its own gallery"],
  ["06.2026", "Lakewood Ranch brand system ships with its own live pages"],
  ["06.2026", "the mark library — every Mustang variant, captioned"],
  ["06.2026", "DMJ Wrapped: cover, spread system, real yearbook proofs"],
  ["06.2026", "8:46 AM fills with real documentary stills"],
  ["06.2026", "Dalí Museum feature lands under the Digital Archive"],
  ["06.2026", "Dr. Mona Jain block + the Observer article"],
  ["06.2026", "Learn more → a real /about page"],
  ["06.2026", "the iPod replaces the phone in the footer"],
  ["06.2026", "click-to-zoom, Cover Flow, Cascade Creations"],
  ["06.2026", "118 real tracks arrive via iTunes previews"],
  ["06.2026", "the intro learns to replay on every visit"],
  ["07.2026", "the 404 bomb detonates for the first lost visitor"],
  ["07.2026", "share cards — every link finally previews properly"],
  ["07.2026", "analytics switch on; the site starts counting visitors"],
  ["07.2026", "Cover Flow learns to flip; Brick ships in the iPod menu"],
  ["07.2026", "/resume + PDF, and Dirty Sara-Soda becomes case study 04"],
  ["07.2026", "lightbox: the artwork finally opens fullscreen"],
  ["07.2026", "the site loses 57MB on the WebP diet"],
  ["08.2026", "the vault is sealed — seven clicks and a passcode"],
  ["08.2026", "8:46 AM becomes watchable: the CRT set powers on"],
  ["NOW", "you found the door, knew the words, and walked in"],
];

export default function VaultPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (sessionStorage.getItem("vault-unlocked") === "1") setAllowed(true);
      else router.replace("/secret");
    });
    return () => cancelAnimationFrame(id);
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
          className="serif-outline serif-outline--dark pointer-events-none absolute left-1/2 top-[280px] -translate-x-1/2 select-none whitespace-nowrap"
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

        {/* The game */}
        <Reveal variant="up" delay={260} duration={1100}>
          <div className="mt-14 max-w-[720px]">
            <h2 className="text-[11px] tracking-[0.18em] uppercase text-white/50">
              Vault Arcade — Moving Pixels
            </h2>
            <p className="mt-3 text-[15px] leading-[1.55] text-white/60">
              &ldquo;Moving pixels since 2020.&rdquo; Might as well move some now.
            </p>
            <div className="mt-5">
              <PixelGame />
            </div>
          </div>
        </Reveal>

        {/* Vault log */}
        <Reveal variant="up" delay={380} duration={1100}>
          <div className="mt-20 max-w-[720px]">
            <h2 className="text-[11px] tracking-[0.18em] uppercase text-white/50">
              The Vault Log — every major update
            </h2>
            <div className="mt-4 border border-white/15 bg-white/[0.03] p-5 font-mono text-[13px] leading-[1.95] sm:p-6">
              {LOG.map(([when, what]) => (
                <p key={what} className="flex gap-4">
                  <span className="w-[62px] shrink-0 text-white/35">{when}</span>
                  <span className="text-white/80">{what}</span>
                </p>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal variant="up" delay={480} duration={1100}>
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

        <Reveal variant="up" delay={580} duration={1100}>
          <p className="mt-12 text-[12px] tracking-tight text-white/35">
            Tell no one. Or tell everyone — honestly, it&apos;s great marketing.
          </p>
        </Reveal>
      </div>
    </main>
  );
}
