"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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
  const [progress, setProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(true);

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
  }, []);

  const handleScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = undefined;
      updateScrollState();
    });
  };

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    const row = rowRef.current;
    if (!el || !row) return;
    const first = row.children[0] as HTMLElement | undefined;
    const second = row.children[1] as HTMLElement | undefined;
    const step = first && second ? second.offsetLeft - first.offsetLeft : el.clientWidth;
    el.scrollBy({
      left: step * direction,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <div className="flex w-full flex-col gap-32 md:gap-48">
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onScroll={handleScroll}
        className={cn(
          "scene-carousel-track w-full overflow-x-auto outline-none",
          "[scroll-snap-type:x_mandatory] [scroll-behavior:smooth] motion-reduce:[scroll-behavior:auto]",
          "focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset"
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
