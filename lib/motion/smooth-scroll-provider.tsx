"use client";

/**
 * SmoothScrollProvider — initializes Lenis once for the whole document and
 * drives it off a single requestAnimationFrame loop (ANIMATION-SYSTEM.md §1).
 *
 * - duration 1.15s, standard Lenis expo-out easing
 * - smoothWheel: true  — eased mouse-wheel / trackpad scroll
 * - syncTouch: false   — this is the spec's `smoothTouch: false`: touch scroll
 *   stays fully native (momentum handled by the OS). Applying inertia to touch
 *   is the #1 "Framer clone feels worse on phones" mistake (§1, §9).
 * - prefers-reduced-motion: reduce  → Lenis is never constructed; the page
 *   uses native scroll and reveal animations render at their end state.
 *
 * Generic and portable — no app-specific config. Wrap the root layout's
 * children with it.
 */

import { useEffect } from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";
import { setLenis } from "./lenis-instance";

const EXPO_OUT = (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: EXPO_OUT,
      smoothWheel: true,
      syncTouch: false,
    });

    setLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };
    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
