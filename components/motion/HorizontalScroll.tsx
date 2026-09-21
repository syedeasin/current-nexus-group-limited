"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { clamp01, lerp, subscribeToScroll } from "@/lib/motion/scroll-driver";
import { cn } from "@/lib/utils";

interface HorizontalScrollProps {
  /** The row of cards. Rendered inside the moving track — lay it out as a flex row. */
  children: ReactNode;
  /** Optional heading block pinned above the track while the section is held. */
  header?: ReactNode;
  /** Accessible name for the section. */
  ariaLabel?: string;
  /** Extra classes for the outer section (background, borders). */
  className?: string;
  /** Extra classes for the sticky viewport (vertical padding, height tweaks). */
  stickyClassName?: string;
  /** Extra classes for the track itself (gap between cards). */
  trackClassName?: string;
}

/**
 * Vertical scroll drives horizontal movement: the section pins, the row of
 * cards travels sideways, and the page carries on down once the row runs out.
 *
 * Infrastructure only — no section uses it yet. It exists so that when a
 * section is designated horizontal, it gets the same behaviour as every other
 * one instead of a bespoke implementation.
 *
 * How it works, and why this way:
 *
 * - The wrapper's height is *measured*, not guessed: sticky height plus exactly
 *   the horizontal distance the track has to cover. Get this wrong in either
 *   direction and the section either releases before the last card arrives or
 *   holds on an empty rail after it does.
 * - Progress comes from the wrapper's own `getBoundingClientRect().top`, so it
 *   is scroll *position*, never accumulated wheel deltas. Nothing is hijacked:
 *   the page scrolls normally the whole time, including with a scrollbar drag,
 *   keyboard, or a jump to an anchor below the section.
 * - The track eases toward its target rather than snapping to it, which is what
 *   makes the sideways travel feel like the same gesture as the page scroll
 *   instead of a value being scrubbed.
 * - **Below `lg`, none of this runs.** The track becomes an ordinary
 *   swipeable overflow row, which is what a touch device wants anyway, and the
 *   wrapper keeps its natural height. Same under `prefers-reduced-motion`.
 *
 * ```tsx
 * <HorizontalScroll header={heading} ariaLabel={title}>
 *   {items.map((item) => (
 *     <div key={item.id} className="w-[320px] shrink-0">…</div>
 *   ))}
 * </HorizontalScroll>
 * ```
 *
 * @see docs/ANIMATION-SYSTEM.md
 */
export default function HorizontalScroll({
  children,
  header,
  ariaLabel,
  className,
  stickyClassName,
  trackClassName,
}: HorizontalScrollProps) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const enabled = isDesktop && !reducedMotion;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky = stickyRef.current;
    const rail = railRef.current;
    const track = trackRef.current;
    if (!wrapper || !sticky || !rail || !track) return;

    if (!enabled) {
      // Hand every property back so the mobile/reduced-motion row is a plain,
      // natively scrollable flex track with no leftover inline state.
      wrapper.style.height = "";
      track.style.transform = "";
      return;
    }

    let maxTranslate = 0;
    let target = 0;
    let current = 0;

    const measure = () => {
      // Clear last pass's transform first, or scrollWidth is measured against
      // an already-shifted track and the section grows on every resize.
      track.style.transform = "";

      const stickyHeight = sticky.offsetHeight;
      maxTranslate = Math.min(0, rail.clientWidth - track.scrollWidth);
      wrapper.style.height = `${stickyHeight + Math.abs(maxTranslate)}px`;

      current = target;
      track.style.transform = `translate3d(${current}px, 0, 0)`;
    };

    measure();

    // ResizeObserver rather than a window resize listener: the track also
    // changes width when a font loads or an image settles, neither of which
    // fires resize.
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);
    resizeObserver.observe(rail);

    const unsubscribe = subscribeToScroll(() => {
      const travel = wrapper.offsetHeight - sticky.offsetHeight;
      const progress = clamp01(-wrapper.getBoundingClientRect().top / Math.max(1, travel));
      target = maxTranslate * progress;

      const next = lerp(current, target, EASE_AMOUNT);
      // Below a quarter pixel there is nothing left to see; stop writing so an
      // idle section costs no style recalculation at all.
      if (Math.abs(next - current) < 0.25) return;

      current = next;
      track.style.transform = `translate3d(${current.toFixed(2)}px, 0, 0)`;
    });

    return () => {
      resizeObserver.disconnect();
      unsubscribe();
      wrapper.style.height = "";
      track.style.transform = "";
    };
  }, [enabled]);

  return (
    <section
      ref={wrapperRef}
      aria-label={ariaLabel}
      // `overflow-x-clip` (not hidden) contains the track's overhang without
      // turning an ancestor into a scroll container, which would break the
      // sticky child.
      className={cn("relative overflow-x-clip", className)}
    >
      <div
        ref={stickyRef}
        className={cn(
          "flex flex-col justify-center",
          enabled && "sticky top-0 h-screen overflow-hidden",
          stickyClassName
        )}
      >
        {header ? <div className="cnx-container shrink-0">{header}</div> : null}

        <div
          ref={railRef}
          className={cn(
            "cnx-container-inset-l min-w-0",
            // Off the scroll-driven path the row is just a swipeable overflow
            // track, snapped to card starts.
            !enabled &&
              "overflow-x-auto [scroll-snap-type:x_mandatory] [overscroll-behavior-x:contain] scene-carousel-track"
          )}
        >
          <div
            ref={trackRef}
            className={cn("flex w-max", enabled && "will-change-transform", trackClassName)}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

const DESKTOP_QUERY = "(min-width: 1024px)";

/** Per-frame approach rate. Lower is heavier; 0.12 tracks Lenis's own settle. */
const EASE_AMOUNT = 0.12;
