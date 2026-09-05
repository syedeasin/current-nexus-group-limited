"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Eased horizontal scrolling for a scroll-snap track.
 *
 * Why this exists rather than `scrollBy({ behavior: "smooth" })`: globals.css
 * sets `.lenis.lenis-smooth { scroll-behavior: auto !important }`, so with the
 * global smooth-scroll engine running every native smooth scroll collapses into
 * an instant jump. Both carousels hit that, so the tween lives here once.
 *
 * Timing mirrors the page-level Lenis feel (expo-out) so an arrow click and a
 * wheel scroll read as the same motion system.
 *
 * Scroll-snap is switched off for the duration of a JS-driven scroll and
 * restored only once the track has settled on a card start, so the browser
 * never fights the animation mid-flight.
 *
 * @see docs/ANIMATION-SYSTEM.md §5
 */

const TWEEN_DURATION_MS = 750;
const SETTLE_EPSILON_PX = 1;
const EXPO_OUT = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export interface CarouselScroll {
  /** Ease the track to an absolute scrollLeft, clamped to the scrollable range. */
  tweenScrollTo: (target: number) => void;
  /** Ease one card forward (1) or back (-1), landing exactly on a card start. */
  scrollByCard: (direction: 1 | -1) => void;
  /** Scroll offsets of every card start, in track coordinates. */
  cardOffsets: () => number[];
  /** Index of the card start nearest the current scroll position. */
  nearestCardIndex: (offsets: number[]) => number;
  /** Abort an in-flight tween and hand snapping back to the browser. */
  cancelTween: () => void;
}

export function useCarouselScroll(
  trackRef: React.RefObject<HTMLDivElement | null>,
  rowRef: React.RefObject<HTMLDivElement | null>
): CarouselScroll {
  const tweenRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
    },
    []
  );

  const cancelTween = useCallback(() => {
    if (tweenRef.current !== undefined) {
      cancelAnimationFrame(tweenRef.current);
      tweenRef.current = undefined;
    }
    const el = trackRef.current;
    if (el) el.style.scrollSnapType = "";
  }, [trackRef]);

  const tweenScrollTo = useCallback(
    (target: number) => {
      const el = trackRef.current;
      if (!el) return;
      cancelTween();

      const maxScroll = el.scrollWidth - el.clientWidth;
      const to = Math.min(Math.max(target, 0), maxScroll);
      const from = el.scrollLeft;
      const distance = to - from;
      if (Math.abs(distance) < SETTLE_EPSILON_PX) return;

      if (prefersReducedMotion()) {
        el.scrollLeft = to;
        return;
      }

      el.style.scrollSnapType = "none";
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / TWEEN_DURATION_MS);
        el.scrollLeft = from + distance * EXPO_OUT(t);
        if (t < 1) {
          tweenRef.current = requestAnimationFrame(step);
          return;
        }
        tweenRef.current = undefined;
        // Already parked on a card start, so re-enabling snap cannot jump.
        el.style.scrollSnapType = "";
      };
      tweenRef.current = requestAnimationFrame(step);
    },
    [cancelTween, trackRef]
  );

  const cardOffsets = useCallback((): number[] => {
    const row = rowRef.current;
    if (!row) return [];
    return Array.from(row.children).map(
      (child) => (child as HTMLElement).offsetLeft - row.offsetLeft
    );
  }, [rowRef]);

  const nearestCardIndex = useCallback(
    (offsets: number[]): number => {
      const el = trackRef.current;
      if (!el || offsets.length === 0) return 0;
      let best = 0;
      let bestDistance = Infinity;
      offsets.forEach((offset, index) => {
        const distance = Math.abs(offset - el.scrollLeft);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      return best;
    },
    [trackRef]
  );

  const scrollByCard = useCallback(
    (direction: 1 | -1) => {
      const el = trackRef.current;
      if (!el) return;
      const offsets = cardOffsets();
      if (offsets.length === 0) {
        tweenScrollTo(el.scrollLeft + el.clientWidth * direction);
        return;
      }
      const next = nearestCardIndex(offsets) + direction;
      const clamped = Math.min(Math.max(next, 0), offsets.length - 1);
      tweenScrollTo(offsets[clamped]);
    },
    [cardOffsets, nearestCardIndex, tweenScrollTo, trackRef]
  );

  return { tweenScrollTo, scrollByCard, cardOffsets, nearestCardIndex, cancelTween };
}
