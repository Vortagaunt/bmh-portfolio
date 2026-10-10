"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Reveal } from "../Reveal";

/* The case study only loads after the password: it is a separate client chunk
   (ssr: false), so none of it is in the page's HTML and none of it downloads
   until the door opens. */
const LrhsCaseStudy = dynamic(() => import("./LrhsCaseStudy").then((m) => m.LrhsCaseStudy), {
  ssr: false,
  loading: () => <div className="min-h-screen" />,
});

/* The password is stored only as a hash (cyrb53, seeded with the founding
   year), so it can't be read straight out of the page's code. It is still a
   lock on a static site, not real security: anyone determined enough to dig
   through the downloaded scripts could find the content. To change the
   password, run cyrb53("newpassword", 1998) and paste the number here.
   Input is trimmed and lower-cased, so capital letters don't matter. */
const KEY = 8404526184245442;
const STORE = "lrhs-unlocked";

function cyrb53(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

const WRONG = ["That's not it.", "Still not it.", "Still not it — check the spelling."];

/**
 * A password screen in front of the Lakewood Ranch case study. The right
 * password opens the page for the rest of this browser session (until the
 * tab is closed), the way the vault remembers its passcode.
 */
export function LrhsGate() {
  const [state, setState] = useState<"checking" | "locked" | "open">("checking");
  const [pw, setPw] = useState("");
  const [fails, setFails] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      let open = false;
      try {
        open = sessionStorage.getItem(STORE) === "1";
      } catch {
        /* storage blocked — just ask for the password */
      }
      setState(open ? "open" : "locked");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (cyrb53(pw.trim().toLowerCase(), 1998) === KEY) {
      try {
        sessionStorage.setItem(STORE, "1");
      } catch {
        /* fine — it just won't be remembered */
      }
      window.scrollTo(0, 0);
      setState("open");
      return;
    }
    setFails((f) => f + 1);
    setPw("");
    inputRef.current?.focus();
  };

  if (state === "open") return <LrhsCaseStudy />;
  if (state === "checking") return <div className="min-h-[78vh]" />;

  return (
    <section className="relative flex min-h-[78vh] items-center justify-center px-5 sm:px-8">
      <div className="relative mx-auto flex w-full max-w-[1100px] flex-col items-center text-center">
        <Reveal
          variant="fade"
          duration={2200}
          as="span"
          className="serif-outline absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap"
          style={{ fontSize: "clamp(160px, 24vw, 340px)", lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          Mustangs
        </Reveal>

        <Reveal variant="up" duration={1000}>
          <div className="relative z-10 flex items-baseline gap-4 text-[12px] tracking-[0.16em] text-ink/60 uppercase">
            <span>(03)</span>
            <span className="h-px w-10 bg-ink/30" />
            <span>Brand · Web Concept</span>
          </div>
        </Reveal>

        <Reveal variant="blur" delay={150} duration={1400}>
          <h1
            className="relative z-10 mt-6 font-display text-ink"
            style={{ fontSize: "clamp(44px, 8vw, 112px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 0.95 }}
          >
            Lakewood Ranch HS — Redesign Concept
          </h1>
        </Reveal>

        <Reveal variant="up" delay={280} duration={1100}>
          <p className="relative z-10 mt-8 max-w-[480px] text-[17px] leading-[1.55] text-ink/75 sm:text-[18px]">
            This case study is password protected. Enter the password to open it.
          </p>
        </Reveal>

        <Reveal variant="up" delay={400} duration={1100}>
          <form
            key={fails}
            onSubmit={submit}
            className={`relative z-10 mt-8 flex w-[min(92vw,420px)] items-center gap-2 rounded-full p-1.5 glass has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[rgba(96,132,255,0.8)] ${fails ? "dialog-shake" : ""}`}
          >
            <label htmlFor="lrhs-password" className="sr-only">
              Password
            </label>
            <input
              id="lrhs-password"
              ref={inputRef}
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              autoFocus
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={fails > 0}
              aria-describedby={fails > 0 ? errorId : undefined}
              className="min-w-0 flex-1 bg-transparent px-4 py-2 text-[16px] tracking-tight text-ink placeholder:text-ink/40"
              style={{ outline: "none" }}  /* the pill around it shows the focus ring instead */
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium tracking-tight text-paper transition-opacity duration-300 hover:opacity-85"
            >
              Unlock
            </button>
          </form>
        </Reveal>

        <p id={errorId} role="alert" className="relative z-10 mt-4 min-h-[20px] text-[14px] font-medium text-[#c23a3a]">
          {fails > 0 ? WRONG[Math.min(fails - 1, WRONG.length - 1)] : ""}
        </p>

        <Reveal variant="up" delay={520} duration={1100}>
          <Link
            href="/#works"
            className="group relative z-10 mt-8 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-ink/[0.03] px-6 py-3 text-[14px] font-medium tracking-tight text-ink transition-all duration-500 hover:scale-[1.02] hover:bg-ink/[0.08]"
          >
            <span className="transition-transform duration-500 group-hover:-translate-x-1">←</span>
            Back to Work
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
