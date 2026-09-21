"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { observeOnce } from "@/lib/motion/observer";
import { cn } from "@/lib/utils";

// Arm before the first browser paint so the hidden state (opacity 0 + offset)
// is committed before anything shows — no flash of fully-visible content.
// Falls back to useEffect during SSR where useLayoutEffect is a no-op.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type RevealTag = "div" | "section" | "span" | "article" | "li" | "figure";
type RevealVariant = "up" | "scale" | "fade";

interface RevealProps {
  children: ReactNode;
  /** Stagger offset in ms. Use the helpers in `lib/motion/timing.ts` rather than ad-hoc numbers. */
  delay?: number;
  as?: RevealTag;
  variant?: RevealVariant;
  className?: string;
}

/**
 * Timing, easing and travel distance all come from the motion tokens in
 * globals.css — never from literals here — so one edit there retunes every
 * reveal on the site. `--reveal-distance` already drops 24px -> 16px under
 * 768px, which is why the offset needs no JS breakpoint check.
 */
const hiddenStyles: Record<RevealVariant, string> = {
  up: "translate-y-[var(--reveal-distance)] opacity-0",
  scale: "scale-[1.04] opacity-0",
  fade: "opacity-0",
};

const visibleStyles: Record<RevealVariant, string> = {
  up: "translate-y-0 opacity-100",
  scale: "scale-100 opacity-100",
  fade: "opacity-100",
};

export default function Reveal({
  children,
  delay = 0,
  as = "div",
  variant = "up",
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;

    setArmed(true);

    // Threshold and root margin live in the shared observer so every entrance
    // on the site fires on the same line.
    return observeOnce(node, () => setVisible(true));
  }, [reducedMotion]);

  const hidden = armed && !visible;
  const Tag = as as ElementType;

  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[var(--dur-reveal)] ease-[var(--ease-out)] motion-reduce:transition-none",
        hidden ? hiddenStyles[variant] : visibleStyles[variant],
        className
      )}
      style={{ transitionDelay: armed ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
