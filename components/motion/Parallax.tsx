"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { clamp01, subscribeToScroll } from "@/lib/motion/scroll-driver";
import { cn } from "@/lib/utils";

interface ParallaxProps {
  children: ReactNode;
  /**
   * Total travel in px across the element's full pass through the viewport.
   * Keep it small — anything past ~80px stops reading as depth and starts
   * reading as a bug, because the photo visibly slides inside its own frame.
   */
  distance?: number;
  className?: string;
}

/**
 * Scroll-linked depth for a single element: it drifts against the page as it
 * crosses the viewport, so a photograph feels set *into* the layout rather than
 * pasted onto it.
 *
 * Deliberately narrow in scope:
 *
 * - **Desktop pointer only.** Parallax on touch stutters on mid-range Android
 *   and is the single most common reason a site of this style feels worse on a
 *   phone than a static one would. Below `lg` the subscription is never made.
 * - **No React state.** The transform is written straight to the node from the
 *   shared rAF loop, so a scroll re-renders nothing.
 * - **Reads Lenis's eased scroll**, not `window.scrollY`, which would step in
 *   wheel-sized jumps while Lenis interpolates between them.
 *
 * The element must be taller than its frame (or sit inside an
 * `overflow-hidden` parent) — otherwise the drift exposes an edge. Pair it with
 * a photo scaled slightly past its box.
 *
 * @see docs/ANIMATION-SYSTEM.md
 */
export default function Parallax({ children, distance = 48, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const hasFinePointer = useMediaQuery(DESKTOP_QUERY);

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion || !hasFinePointer) return;

    return subscribeToScroll(() => {
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Skip the measurement work entirely for anything off screen — on a long
      // page that is most of the subscribers on most frames.
      if (rect.bottom < 0 || rect.top > viewportHeight) return;

      // 0 when the element's top edge first touches the bottom of the viewport,
      // 1 when its bottom edge leaves the top. -0.5..0.5 centres the drift so
      // the element sits at its natural position mid-screen and no layout ever
      // depends on the offset.
      const progress = clamp01((viewportHeight - rect.top) / (viewportHeight + rect.height));
      const offset = (progress - 0.5) * distance;

      node.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });
  }, [distance, hasFinePointer, reducedMotion]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";
