import { FloretIcon } from "./icons";
import { Reveal } from "./Reveal";
import { IpodDock } from "./IpodDock";

const contactLinks = [
  { label: "(Email)", href: "mailto:bronxhanratty@gmail.com" },
  { label: "(LinkedIn)", href: "https://www.linkedin.com/in/bronx-hanratty-57a8212b6" },
  { label: "(x.com)", href: "https://x.com/vortagaunt" },
];

export function Footer() {
  return (
    <footer className="relative">
      {/* Let's talk reveal area */}
      <div className="relative overflow-hidden px-5 pt-16 pb-20 sm:px-8 sm:pb-24">
        <div className="relative mx-auto min-h-[520px] max-w-[1280px] sm:min-h-[640px]">
          {/* Outline italic Let's Talk backdrop */}
          <Reveal
            variant="fade"
            duration={1600}
            as="span"
            className="serif-outline absolute left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-center"
            style={{
              fontSize: "clamp(180px, 28vw, 380px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              bottom: "5%",
            }}
          >
            Let&apos;s Talk
          </Reveal>

          {/* iPod music player + caption row */}
          <div className="relative z-10 grid grid-cols-12 gap-6 pt-8">
            <Reveal variant="scale" duration={1300} className="col-span-12 md:col-span-4 md:col-start-2">
              <div className="relative w-full max-w-[260px]">
                <span className="absolute -top-7 left-0 z-10 px-1 text-[11px] tracking-tight text-ink/70">
                  now-playing.obj
                </span>
                <IpodDock />
              </div>
            </Reveal>

            <Reveal
              variant="up"
              delay={150}
              duration={1200}
              className="col-span-12 md:col-span-4 md:col-start-6 pt-2 md:pt-12"
            >
              <p className="max-w-[260px] text-[15px] leading-[1.45] text-ink">
                If you&apos;ve scrolled this far, we should probably talk.
              </p>
            </Reveal>
          </div>

          {/* Contact links bottom-right */}
          <Reveal
            variant="up"
            delay={300}
            duration={1100}
            className="relative z-10 mt-24 flex flex-wrap justify-start gap-x-8 gap-y-3 text-[14px] text-ink sm:mt-48 sm:justify-end sm:gap-12"
          >
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="link-underline font-medium tracking-tight transition-opacity hover:opacity-80"
              >
                {link.label}
              </a>
            ))}
          </Reveal>
        </div>
      </div>

      {/* Black status bar */}
      <div className="bg-black py-3 text-center text-[13px] tracking-tight text-white">
        <span className="inline-flex items-center gap-2">
          Bronx Hanratty
          <FloretIcon className="inline h-3 w-3" />
          (WIP 2020 - Present)
        </span>
      </div>
    </footer>
  );
}
