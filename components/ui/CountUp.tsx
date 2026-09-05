"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface CountUpProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function CountUp({ value, suffix = "", duration = 1600, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return;
        hasRun.current = true;
        observer.unobserve(node);

        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      // threshold 0 (any overlap) — a higher threshold needs the element to still be
      // ≥N% visible on the exact frame the browser samples, which fast mobile
      // momentum-scroll flings routinely skip past between frames, so the counter
      // never crosses it and is left stuck at 0.
      { threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // value/duration intentionally excluded: static per stat instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <span
      ref={ref}
      className={cn("inline-block tabular-nums", className)}
      style={{ minWidth: `${String(value).length + suffix.length}ch` }}
    >
      {reducedMotion ? value : display}
      {suffix}
    </span>
  );
}
