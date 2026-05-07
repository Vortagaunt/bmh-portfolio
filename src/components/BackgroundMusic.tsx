"use client";

import { useEffect, useRef, useState } from "react";

export function BackgroundMusic({
  src = "/audio/background.mp3",
  volume = 0.8,
}: {
  src?: string;
  volume?: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.preload = "auto";
    audioRef.current = audio;

    let unlocked = false;
    const tryPlay = async () => {
      if (unlocked) return;
      try {
        await audio.play();
        unlocked = true;
        setStarted(true);
      } catch {
        // Autoplay blocked — wait for user gesture
      }
    };

    // First attempt — works if the browser already trusts the site
    tryPlay();

    const onGesture = () => {
      tryPlay();
      if (unlocked) {
        window.removeEventListener("pointerdown", onGesture);
        window.removeEventListener("keydown", onGesture);
        window.removeEventListener("scroll", onGesture);
        window.removeEventListener("touchstart", onGesture);
      }
    };

    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);
    window.addEventListener("scroll", onGesture, { passive: true });
    window.addEventListener("touchstart", onGesture, { passive: true });

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("scroll", onGesture);
      window.removeEventListener("touchstart", onGesture);
    };
  }, [src, volume]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    audio.muted = next;
    setMuted(next);
  };

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? "Unmute background music" : "Mute background music"}
      title={muted ? "Unmute" : "Mute"}
      className="fixed bottom-12 right-6 z-[100] flex h-9 w-9 items-center justify-center rounded-full border border-[#181818]/15 bg-white/70 text-[#181818] backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-white"
    >
      {muted || !started ? (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H3v6h3l5 4V5z" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H3v6h3l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 010 7.07" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
        </svg>
      )}
    </button>
  );
}
