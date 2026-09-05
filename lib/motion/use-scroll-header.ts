"use client";

/**
 * useScrollHeader — direction-aware header show/hide (ANIMATION-SYSTEM.md §3).
 *
 *   scroll DOWN past 80px  → hide  (header translateY(-100%))
 *   scroll UP (any amount)  → show
 *   near the top (< 80px)   → always shown
 *
 * This is an ADDITIVE rule. It deliberately does NOT know anything about the
 * header's colour / background / transparent-over-hero state — that stays
 * owned by HEADER-FIX-PASS2.md and its existing hook. Consumers combine the
 * two: colour state from Pass 2, translateY from here, on the same element.
 *
 * Scroll position is read from Lenis's eased value when it is running
 * (getScrollY, lenis-instance.ts), else window.scrollY — Lenis still emits
 * native scroll events, so one passive listener covers both cases. The
 * handler is throttled through a single requestAnimationFrame — never runs
 * unthrottled per scroll event (§3, §9: main jank source on low-mid Android).
 *
 * Generic: no dimensions or classes from this project, returns primitives
 * only.
 */

import { useEffect, useState } from "react";
import { getScrollY } from "./lenis-instance";

/** px from the top below which the header is always shown (§3) */
export const HEADER_TOP_ZONE = 80;

/** ignore sub-pixel / tiny jitter so the header doesn't flicker */
const DIRECTION_EPSILON = 4;

export interface ScrollHeaderState {
  /** false once hidden by a downward scroll past HEADER_TOP_ZONE */
  isHeaderVisible: boolean;
  /** 0 when shown, -100 when hidden — feed to `translateY(${n}%)` */
  translateY: number;
}

export function useScrollHeader(): ScrollHeaderState {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    let lastY = getScrollY();
    let ticking = false;

    const evaluate = () => {
      ticking = false;
      const y = getScrollY();
      const delta = y - lastY;

      if (y <= HEADER_TOP_ZONE) {
        setIsHeaderVisible(true);
      } else if (delta > DIRECTION_EPSILON) {
        setIsHeaderVisible(false);
        lastY = y;
      } else if (delta < -DIRECTION_EPSILON) {
        setIsHeaderVisible(true);
        lastY = y;
      }

      if (Math.abs(delta) <= DIRECTION_EPSILON) {
        lastY = y;
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(evaluate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return { isHeaderVisible, translateY: isHeaderVisible ? 0 : -100 };
}

export default useScrollHeader;
