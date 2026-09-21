"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
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
import { useCarouselScroll } from "@/lib/motion/use-carousel-scroll";
import { cn } from "@/lib/utils";

/** Imperative handle for callers that render their own prev/next buttons outside the
 * component (e.g. in a section header) instead of using the built-in `controls` row —
 * see Related Products, whose Figma puts the arrows next to the heading. */
export interface CarouselHandle {
  scrollPrev: () => void;
  scrollNext: () => void;
}

interface CarouselProps {
  ariaLabel: string;
  /** Pre-rendered row items (each already `Reveal`-wrapped with its own width classes). */
  children: ReactNode;
  /** Extra classes for the row (item gap). Defaults to the Application Scenes gap scale. */
  rowClassName?: string;
  /** Reveal delay for the progress bar / controls row. */
  progressDelay?: number;
  /**
   * How scroll position is shown.
   * - `bar` (default): one full-width track with a growing fill, sitting below
   *   the row with the controls (Figma: Application Scenes).
   * - `segments`: one 2px rule per card, aligned to the card columns and
   *   filling left-to-right (Figma: Latest News, where each blog card carries
   *   its own underline).
   * - `none`: no indicator row at all — the track is the whole component
   *   (Figma: Manufacturing Workflow, which relies only on the edge fade and
   *   drag/scroll affordance, with no bar or arrow buttons).
   */
  progressVariant?: "bar" | "segments" | "none";
  /** `segments` only — how many rules to draw. Defaults to 3. */
  segmentCount?: number;
  /** Prev/Next buttons. Omit for a track-only carousel (e.g. Latest News), or when the
   * caller renders its own buttons externally via the imperative ref + onScrollStateChange. */
  controls?: {
    previousLabel: string;
    nextLabel: string;
  };
  /** Fires whenever scrollability changes — for callers driving external prev/next
   * buttons via the ref, to mirror the same enabled/disabled styling shown here. */
  onScrollStateChange?: (state: { canScrollPrev: boolean; canScrollNext: boolean }) => void;
  /**
   * Extends the track (only — controls/progress row stay put) past the parent
   * Container's right gutter so the last card bleeds to the true edge instead
   * of stopping short of it (Figma: Scene of Applications, node 4199:9760).
   * Cancels `.cnx-container`'s right gutter with an equal negative margin, so
   * it tracks `--gutter` at every breakpoint — the caller must still be inside
   * a Container for the math to land on the edge.
   */
  bleedRight?: boolean;
}

const SCROLL_END_EPSILON_PX = 1;

/** Pointer travel before a mouse press is treated as a drag rather than a click. */
const DRAG_THRESHOLD_PX = 4;

/**
 * Fill percentage for one rule of a segmented indicator: the segments fill in
 * order, so segment `index` is empty until the scroll passes its share of the
 * track and full once the scroll has moved past it.
 */
function segmentFill(progress: number, index: number, count: number): number {
  const span = 100 / count;
  return Math.min(100, Math.max(0, ((progress - index * span) / span) * 100));
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
function Carousel(
  {
    ariaLabel,
    children,
    rowClassName,
    progressDelay = 0,
    progressVariant = "bar",
    segmentCount = 3,
    controls,
    onScrollStateChange,
    bleedRight = false,
  }: CarouselProps,
  ref: React.Ref<CarouselHandle>
) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const dragRef = useRef<{ pointerId: number; startX: number; startScroll: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const { scrollByCard, tweenScrollTo, cardOffsets, nearestCardIndex, cancelTween } =
    useCarouselScroll(trackRef, rowRef);

  useImperativeHandle(ref, () => ({
    scrollPrev: () => scrollByCard(-1),
    scrollNext: () => scrollByCard(1),
  }));

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const ratio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    const nextCanPrev = el.scrollLeft > SCROLL_END_EPSILON_PX;
    const nextCanNext = el.scrollLeft < maxScroll - SCROLL_END_EPSILON_PX;
    setProgress(Math.min(100, Math.max(0, ratio * 100)));
    setCanScrollPrev(nextCanPrev);
    setCanScrollNext(nextCanNext);
    setHasOverflow(maxScroll > SCROLL_END_EPSILON_PX);
    onScrollStateChange?.({ canScrollPrev: nextCanPrev, canScrollNext: nextCanNext });
  }, [onScrollStateChange]);

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
  }, []);

  const handleScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = undefined;
      updateScrollState();
    });
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
          "scene-carousel-track overflow-x-auto outline-none",
          "[scroll-snap-type:x_mandatory] [overscroll-behavior-x:contain]",
          "focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab",
          // `w-full` is a definite width, which wins over flex's stretch default and
          // would stop the negative margin below from growing the box — so the
          // bleeding track relies on plain stretch (no width class) instead, and
          // only the non-bleeding case keeps the explicit w-full it always had.
          bleedRight ? "mr-[calc(var(--gutter)*-1)]" : "w-full"
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

      {progressVariant === "none" ? null : (
      <Reveal
        as="div"
        delay={progressDelay}
        variant="fade"
        // A plain bar is only a scroll affordance, so it is dropped when there
        // is nothing to scroll. The segmented rules are part of the card design
        // (Figma draws them under every blog card) and always render.
        className={cn("w-full", !hasOverflow && progressVariant === "bar" && "hidden")}
      >
        <div
          className={cn(
            "flex w-full items-center gap-16",
            controls && "flex-col min-[600px]:flex-row min-[600px]:gap-24"
          )}
        >
          {progressVariant === "segments" ? (
            <div
              role="presentation"
              className={cn(
                "flex w-full flex-1 gap-[12px] min-[481px]:gap-[16px] lg:gap-[20px] xl:gap-[1.82%]",
                rowClassName
              )}
            >
              {Array.from({ length: segmentCount }, (_, index) => (
                <div
                  key={index}
                  className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-10"
                >
                  <div
                    className="h-full rounded-full bg-neutral-1 transition-[width] duration-150 ease-out motion-reduce:transition-none"
                    style={{ width: `${segmentFill(progress, index, segmentCount)}%` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div role="presentation" className="h-2 w-full flex-1 overflow-hidden rounded-full bg-neutral-10">
              <div
                className="h-full rounded-full bg-neutral-1 transition-[width] duration-150 ease-out motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
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
      )}
    </div>
  );
}

export default forwardRef(Carousel);
