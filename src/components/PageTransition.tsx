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
    // Sit at full opacity briefly so the new page can mount underneath.
    setOpacity(1);
    setActive(true);
    const id = requestAnimationFrame(() => {
      setOpacity(0);
      setTimeout(() => setActive(false), 600);
    });
    return () => cancelAnimationFrame(id);
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

      e.preventDefault();
      setActive(true);
      setOpacity(1);
      window.setTimeout(() => {
        router.push(href);
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
        background: "#f1f1f1",
        opacity,
        pointerEvents: active ? "auto" : "none",
        transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 9990,
      }}
    />
  );
}
