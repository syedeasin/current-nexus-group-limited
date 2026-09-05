"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

// Arm before the first browser paint so the hidden state (opacity 0 + offset)
// is committed before anything shows — no flash of fully-visible content.
// Falls back to useEffect during SSR where useLayoutEffect is a no-op.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type RevealTag = "div" | "section" | "span" | "article" | "li" | "figure";
type RevealVariant = "up" | "scale" | "fade";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  as?: RevealTag;
  variant?: RevealVariant;
  className?: string;
}

const hiddenStyles: Record<RevealVariant, string> = {
  up: "translate-y-[40px] opacity-0",
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const hidden = armed && !visible;
  const Tag = as as ElementType;

  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        hidden ? hiddenStyles[variant] : visibleStyles[variant],
        className
      )}
      style={{ transitionDelay: armed ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
