"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import Reveal from "@/components/ui/Reveal";
import { ArrowLeft } from "@/components/icons/ArrowLeft";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { cn } from "@/lib/utils";

interface CarouselProps {
  ariaLabel: string;
  /** Pre-rendered row items (each already `Reveal`-wrapped with its own width classes). */
  children: ReactNode;
  /** Extra classes for the row (item gap). Defaults to the Application Scenes gap scale. */
  rowClassName?: string;
  /** Reveal delay for the progress bar / controls row. */
  progressDelay?: number;
  /** Prev/Next buttons. Omit for a track-only carousel (e.g. Latest News). */
  controls?: {
    previousLabel: string;
    nextLabel: string;
  };
}

const SCROLL_END_EPSILON_PX = 1;

/**
 * Horizontal scrolling is driven by our own rAF tween rather than
 * `scrollBy({ behavior: "smooth" })`, because globals.css sets
 * `.lenis.lenis-smooth { scroll-behavior: auto !important }` — with Lenis
 * running, every native smooth scroll collapses into an instant jump.
 *
 * Timing mirrors the page-level Lenis feel (expo-out easing) so an arrow click
 * and a wheel scroll read as the same motion system.
 */
const TWEEN_DURATION_MS = 750;
const EXPO_OUT = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Pointer travel before a mouse press is treated as a drag rather than a click. */
const DRAG_THRESHOLD_PX = 4;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Generic scroll-snap carousel: track + scroll-derived progress fill, with
 * optional prev/next buttons. Extracted from Application Scenes' SceneCarousel
 * so Latest News can reuse the identical scroll mechanics and geometry.
 *
 * Scroll-snap is switched off for the duration of any JS-driven scroll (arrow
 * tween, pointer drag) and switched back on once the track has settled on a
 * card start, so the browser never fights the animation mid-flight.
 */
export default function Carousel({
  ariaLabel,
  children,
  rowClassName,
  progressDelay = 0,
  controls,
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const tweenRef = useRef<number | undefined>(undefined);
  const dragRef = useRef<{ pointerId: number; startX: number; startScroll: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const ratio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    setProgress(Math.min(100, Math.max(0, ratio * 100)));
    setCanScrollPrev(el.scrollLeft > SCROLL_END_EPSILON_PX);
    setCanScrollNext(el.scrollLeft < maxScroll - SCROLL_END_EPSILON_PX);
    setHasOverflow(maxScroll > SCROLL_END_EPSILON_PX);
  }, []);

  useLayoutEffect(() => {
    updateScrollState();
  }, [updateScrollState]);

  useEffect(() => {
    const onResize = () => updateScrollState();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateScrollState]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
  }, []);

  const handleScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = undefined;
      updateScrollState();
    });
  };

  /** Stop any in-flight tween and hand snapping back to the browser. */
  const cancelTween = useCallback(() => {
    if (tweenRef.current !== undefined) {
      cancelAnimationFrame(tweenRef.current);
      tweenRef.current = undefined;
    }
    const el = trackRef.current;
    if (el) el.style.scrollSnapType = "";
  }, []);

  const tweenScrollTo = useCallback(
    (target: number) => {
      const el = trackRef.current;
      if (!el) return;
      cancelTween();

      const maxScroll = el.scrollWidth - el.clientWidth;
      const to = Math.min(Math.max(target, 0), maxScroll);
      const from = el.scrollLeft;
      const distance = to - from;
      if (Math.abs(distance) < SCROLL_END_EPSILON_PX) return;

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
    [cancelTween]
  );

  /** Scroll offsets of every card start, in track coordinates. */
  const cardOffsets = useCallback((): number[] => {
    const row = rowRef.current;
    if (!row) return [];
    return Array.from(row.children).map((child) => (child as HTMLElement).offsetLeft - row.offsetLeft);
  }, []);

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
    []
  );

  const scrollByCard = (direction: 1 | -1) => {
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
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Any user input wins over an animation that is still running.
    cancelTween();
    // Touch keeps native momentum scrolling; only mouse gets drag-to-scroll.
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = trackRef.current;
    if (!drag || !el || event.pointerId !== drag.pointerId) return;

    const dx = event.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
      drag.moved = true;
      setIsDragging(true);
      el.setPointerCapture(drag.pointerId);
      el.style.scrollSnapType = "none";
    }
    el.scrollLeft = drag.startScroll - dx;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = trackRef.current;
    if (!drag || !el || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;

    if (!drag.moved) return;
    if (el.hasPointerCapture(drag.pointerId)) el.releasePointerCapture(drag.pointerId);
    setIsDragging(false);
    // Swallow the click the browser fires on the card link after a drag.
    suppressClickRef.current = true;

    const offsets = cardOffsets();
    if (offsets.length === 0) {
      el.style.scrollSnapType = "";
      return;
    }
    // Ease onto the nearest card start instead of letting snap teleport there.
    tweenScrollTo(offsets[nearestCardIndex(offsets)]);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="flex w-full flex-col gap-32 md:gap-48">
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onScroll={handleScroll}
        onWheel={cancelTween}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleClickCapture}
        className={cn(
          "scene-carousel-track w-full overflow-x-auto outline-none",
          "[scroll-snap-type:x_mandatory] [overscroll-behavior-x:contain]",
          "focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        )}
      >
        <div
          ref={rowRef}
          className={cn(
            "flex gap-[12px] pb-4 min-[481px]:gap-[16px] lg:gap-[20px] xl:gap-[1.82%]",
            rowClassName
          )}
        >
          {children}
        </div>
      </div>

      <Reveal
        as="div"
        delay={progressDelay}
        variant="fade"
        className={cn("w-full", !hasOverflow && "hidden")}
      >
        <div
          className={cn(
            "flex w-full items-center gap-16",
            controls && "flex-col min-[600px]:flex-row min-[600px]:gap-24"
          )}
        >
          <div role="presentation" className="h-2 w-full flex-1 overflow-hidden rounded-full bg-neutral-10">
            <div
              className="h-full rounded-full bg-neutral-1 transition-[width] duration-150 ease-out motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          {controls ? (
            <div className="flex shrink-0 items-center gap-12 self-end min-[600px]:self-auto">
              <button
                type="button"
                aria-label={controls.previousLabel}
                aria-disabled={!canScrollPrev}
                onClick={() => canScrollPrev && scrollByCard(-1)}
                className={cn(
                  "flex size-48 items-center justify-center rounded-full border border-neutral-10 text-neutral-1 outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-secondary",
                  canScrollPrev ? "hover:bg-neutral-11" : "cursor-not-allowed opacity-40"
                )}
              >
                <ArrowLeft size={24} />
              </button>
              <button
                type="button"
                aria-label={controls.nextLabel}
                aria-disabled={!canScrollNext}
                onClick={() => canScrollNext && scrollByCard(1)}
                className={cn(
                  "flex size-48 items-center justify-center rounded-full bg-secondary text-neutral-1 outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-secondary",
                  canScrollNext ? "hover:bg-secondary/90" : "cursor-not-allowed opacity-40"
                )}
              >
                <ArrowRight size={24} />
              </button>
            </div>
          ) : null}
        </div>
      </Reveal>
    </div>
  );
}
