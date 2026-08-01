"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { GridBackdrop } from "@/components/GridBackdrop";
import { Reveal } from "@/components/Reveal";

const PASSCODE = "1q2w3e4r";

const WRONG = [
  "Incorrect passcode.",
  "Still no.",
  "Third strike. The Mac is judging you.",
  "You clicked seven times for this?",
];

export default function SecretGate() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [fails, setFails] = useState(0);
  const [shake, setShake] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pw === PASSCODE) {
      sessionStorage.setItem("vault-unlocked", "1");
      router.push("/vault");
      return;
    }
    setFails((f) => f + 1);
    setShake((s) => s + 1);
    setPw("");
    inputRef.current?.focus();
  };

  return (
    <main className="relative isolate min-h-screen w-full bg-[#f1f1f1] text-[#181818]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <GridBackdrop />
      </div>
      <SiteHeader />

      <div className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 pb-24 sm:px-8">
        {/* Giant outline backdrop */}
        <Reveal
          variant="fade"
          duration={1600}
          as="span"
          className="serif-outline pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap"
          style={{
            fontSize: "clamp(180px, 26vw, 400px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Psst
        </Reveal>

        {/* System 7 security dialog */}
        <Reveal variant="scale" delay={150} duration={1200}>
          <div
            key={shake}
            className={`relative w-[min(92vw,560px)] border-2 border-[#181818] bg-white ${shake ? "dialog-shake" : ""}`}
            style={{ boxShadow: "6px 6px 0 rgba(24,24,24,0.9)" }}
          >
            {/* Title bar with pinstripes */}
            <div className="relative flex h-9 items-center justify-center border-b-2 border-[#181818] px-3">
              <div
                aria-hidden
                className="absolute inset-x-2 top-1/2 h-[14px] -translate-y-1/2"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, #181818 0 1.5px, transparent 1.5px 4px)",
                }}
              />
              <span className="relative bg-white px-3 font-display text-[15px] font-semibold tracking-tight">
                Restricted
              </span>
            </div>

            {/* Body */}
            <form onSubmit={submit} className="flex items-start gap-5 p-6 sm:p-8">
              {/* Key icon */}
              <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" aria-hidden>
                <circle cx="16" cy="16" r="10" fill="none" stroke="#181818" strokeWidth="5" />
                <line x1="23" y1="23" x2="40" y2="40" stroke="#181818" strokeWidth="5" strokeLinecap="round" />
                <line x1="33" y1="33" x2="39" y2="27" stroke="#181818" strokeWidth="5" strokeLinecap="round" />
                <line x1="38" y1="38" x2="43" y2="33" stroke="#181818" strokeWidth="5" strokeLinecap="round" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] leading-[1.5] text-[#181818]">
                  You found the door. Now find the key.
                </p>
                <p className="mt-1 text-[14px] leading-[1.5] text-[#181818]/70">
                  Enter the passcode to open the{" "}
                  <span className="font-serif italic text-[16px]">vault</span>.
                </p>
                <input
                  ref={inputRef}
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="passcode"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-4 w-full border-2 border-[#181818] bg-white px-3 py-2 font-mono text-[15px] tracking-[0.2em] text-[#181818] outline-none placeholder:tracking-normal placeholder:text-[#181818]/35 focus:bg-[#181818]/[0.03]"
                  style={{ boxShadow: "inset 2px 2px 0 rgba(24,24,24,0.15)" }}
                />
                {fails > 0 && (
                  <p className="mt-2 text-[13px] font-medium text-[#aa2121]">
                    {WRONG[Math.min(fails - 1, WRONG.length - 1)]}
                  </p>
                )}
              </div>
            </form>

            {/* Buttons */}
            <div className="flex justify-end gap-3 px-6 pb-6 sm:px-8">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="border-2 border-[#181818]/40 bg-white px-5 py-2 font-display text-[14px] font-semibold tracking-tight text-[#181818]/60 transition-colors duration-300 hover:border-[#181818] hover:text-[#181818]"
                style={{ borderRadius: "8px" }}
              >
                Flee
              </button>
              <button
                type="button"
                onClick={() => submit()}
                className="border-2 border-[#181818] bg-white px-6 py-2 font-display text-[14px] font-semibold tracking-tight transition-colors duration-300 hover:bg-[#181818] hover:text-white"
                style={{ borderRadius: "8px", boxShadow: "0 0 0 3px white, 0 0 0 4.5px #181818" }}
              >
                Unlock
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal variant="up" delay={420} duration={1100}>
          <p className="mt-12 text-[13px] tracking-tight text-[#181818]/55">
            Seven clicks got you here. One password gets you in.
          </p>
        </Reveal>
      </div>
    </main>
  );
}
