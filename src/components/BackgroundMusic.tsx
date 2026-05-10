"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Background music that begins playing as soon as the page loads.
 *
 * Browsers block unmuted autoplay until the user interacts with the page,
 * so we kick playback off muted (always allowed). Then we unmute on the
 * first user gesture — by then the audio has already been streaming, so
 * sound starts the instant the user does anything.
 */
export function BackgroundMusic({
  src = "/audio/background.mp3",
  volume = 0.8,
}: {
  src?: string;
  volume?: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [audible, setAudible] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.preload = "auto";
    // Start muted so the browser permits autoplay immediately.
    audio.muted = true;
    audioRef.current = audio;

    // Begin playback right away (muted, so this is allowed).
    audio.play().catch(() => {
      // Even muted playback occasionally errors; we'll retry on gesture.
    });

    let unmutedOnce = false;
    const goAudible = () => {
      if (unmutedOnce) return;
      unmutedOnce = true;
      audio.muted = false;
      // Ensure the element is actually playing (no-op if already).
      audio.play().catch(() => {});
      setAudible(true);
      window.removeEventListener("pointerdown", goAudible);
      window.removeEventListener("keydown", goAudible);
      window.removeEventListener("scroll", goAudible);
      window.removeEventListener("touchstart", goAudible);
    };

    window.addEventListener("pointerdown", goAudible, { passive: true });
    window.addEventListener("keydown", goAudible);
    window.addEventListener("scroll", goAudible, { passive: true });
    window.addEventListener("touchstart", goAudible, { passive: true });

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      window.removeEventListener("pointerdown", goAudible);
      window.removeEventListener("keydown", goAudible);
      window.removeEventListener("scroll", goAudible);
      window.removeEventListener("touchstart", goAudible);
    };
  }, [src, volume]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    audio.muted = next;
    setMuted(next);
    // If we hadn't yet had a user gesture, this click counts — start playback audibly.
    if (!next && !audible) {
      audio.play().catch(() => {});
      setAudible(true);
    }
  };

  // Icon should reflect whether audio is currently audible to the user.
  const showSoundIcon = !muted && audible;

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? "Unmute background music" : "Mute background music"}
      title={muted ? "Unmute" : "Mute"}
      className="fixed bottom-12 right-6 z-[100] flex h-9 w-9 items-center justify-center rounded-full border border-[#181818]/15 bg-white/70 text-[#181818] backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-white"
    >
      {showSoundIcon ? (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H3v6h3l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 010 7.07" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H3v6h3l5 4V5z" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      )}
    </button>
  );
}
