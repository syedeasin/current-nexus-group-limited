"use client";

/**
 * <AnimatedCounter> — count-up number (ANIMATION-SYSTEM.md §6).
 *
 * - counts 0 → `value` the first time it scrolls into view, once
 * - ease-out (fast start, slow settle) — numbers settle, they don't tick evenly
 * - duration 1400–1800ms, default 1600ms (§8 --dur-counter)
 * - trigger: same IntersectionObserver primitive as the reveal layer, via
 *   framer-motion's useInView, threshold 0.3 (§6: full-width band)
 * - prefix / suffix (`+`, `%`, `MW`, `$`) render static; only the number animates
 * - prefers-reduced-motion: reduce → renders the final value immediately
 *
 * Generic: no project values, formatting is caller-controlled.
 */

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

/** §8 --dur-counter */
export const DUR_COUNTER = 1600;
const COUNTER_AMOUNT = 0.3;

/** ease-out cubic — matches the "settle" feel of §6 */
const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

interface AnimatedCounterProps {
  /** target value to count up to */
  value: number;
  /** decimal places to render (default 0) */
  decimals?: number;
  /** count-up duration in ms (§6: 1400–1800) */
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

function format(n: number, decimals: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function AnimatedCounter({
  value,
  decimals = 0,
  duration = DUR_COUNTER,
  prefix,
  suffix,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, amount: COUNTER_AMOUNT });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(value * easeOut(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reducedMotion, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(display, decimals)}
      {suffix}
    </span>
  );
}
