"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "fade" | "scale" | "blur";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  as?: "div" | "section" | "span" | "li" | "article" | "header" | "footer";
  style?: CSSProperties;
}

const variantStyles: Record<RevealVariant, { hidden: CSSProperties; shown: CSSProperties }> = {
  up: {
    hidden: { opacity: 0, transform: "translate3d(0, 28px, 0)" },
    shown: { opacity: 1, transform: "translate3d(0, 0, 0)" },
  },
  fade: {
    hidden: { opacity: 0 },
    shown: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, transform: "scale(0.96)" },
    shown: { opacity: 1, transform: "scale(1)" },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(12px)", transform: "translate3d(0, 16px, 0)" },
    shown: { opacity: 1, filter: "blur(0px)", transform: "translate3d(0, 0, 0)" },
  },
};

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  duration = 1100,
  threshold = 0.15,
  once = true,
  className,
  as: Tag = "div",
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold, once]);

  const v = variantStyles[variant];
  const composed: CSSProperties = {
    ...(visible ? v.shown : v.hidden),
    transition: `opacity ${duration}ms cubic-bezier(0.2,0.7,0.1,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.2,0.7,0.1,1) ${delay}ms, filter ${duration}ms cubic-bezier(0.2,0.7,0.1,1) ${delay}ms`,
    willChange: "opacity, transform, filter",
    ...style,
  };

  return (
    // @ts-expect-error — ref typing across union of tags is fine at runtime
    <Tag ref={ref} className={cn(className)} style={composed}>
      {children}
    </Tag>
  );
}
