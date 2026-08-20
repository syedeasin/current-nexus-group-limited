"use client";

import { createElement, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  up: "translate-y-16 opacity-0",
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
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

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
  }, []);

  const hidden = armed && !visible;

  return createElement(
    as,
    {
      ref,
      className: cn(
        "transition-[opacity,transform] duration-700 ease-out",
        hidden ? hiddenStyles[variant] : visibleStyles[variant],
        className
      ),
      style: { transitionDelay: armed ? `${delay}ms` : undefined },
    },
    children
  );
}
