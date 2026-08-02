"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Page transition: fades a paper-colored overlay in before navigation,
 * then back out after the new route mounts. Gives a soft cross-fade
 * between routes that matches the site's aesthetic.
 */
export function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const [opacity, setOpacity] = useState(0);
  const [active, setActive] = useState(false);
  const firstRender = useRef(true);

  // Fade overlay out whenever the path changes (new page has mounted).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Reset scroll position to the top so every new route starts at the hero.
    // We try Lenis first (the smooth-scroll engine has its own internal target);
    // if it isn't ready yet during the route swap, fall back to window.scrollTo.
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
    // Sit at full opacity briefly so the new page can mount underneath, then
    // fade out. State updates happen inside rAF callbacks (not synchronously
    // in the effect body) so React never cascades renders mid-commit.
    let fadeId = 0;
    let doneId: ReturnType<typeof setTimeout> | undefined;
    const showId = requestAnimationFrame(() => {
      setOpacity(1);
      setActive(true);
      fadeId = requestAnimationFrame(() => {
        setOpacity(0);
        doneId = setTimeout(() => setActive(false), 600);
      });
    });
    return () => {
      cancelAnimationFrame(showId);
      cancelAnimationFrame(fadeId);
      if (doneId) clearTimeout(doneId);
    };
  }, [pathname]);

  // Intercept internal link clicks to fade the overlay IN before routing.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Honor modifier keys (open in new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const target = (e.target as HTMLElement | null)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;
      if (target.getAttribute("target") === "_blank") return;
      // Same-path click — let it scroll naturally
      if (href === pathname) return;

      // External (static HTML outside Next.js routing) — fade out, then use
      // a full browser navigation. Otherwise use the Next.js client router.
      const isExternalStatic =
        target.tagName === "A" &&
        (target.getAttribute("rel")?.includes("external") ||
          target.hasAttribute("data-external"));

      e.preventDefault();
      setActive(true);
      setOpacity(1);
      window.setTimeout(() => {
        if (isExternalStatic) {
          window.location.href = href;
        } else {
          router.push(href);
        }
      }, 420);
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [pathname, router]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--paper)",
        opacity,
        pointerEvents: active ? "auto" : "none",
        transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 9990,
      }}
    />
  );
}
