"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import { ArrowLeft } from "@/components/icons/ArrowLeft";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { useCarouselScroll } from "@/lib/motion/use-carousel-scroll";
import { cn } from "@/lib/utils";

interface NewsCarouselProps {
  heading: string;
  previousLabel: string;
  nextLabel: string;
  /** Each child pre-wrapped in `Reveal` with its own width + `[scroll-snap-align:start]` classes, same convention as Latest News. */
  children: ReactNode;
}

const SCROLL_END_EPSILON_PX = 1;

export default function NewsCarousel({ heading, previousLabel, nextLabel, children }: NewsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const { scrollByCard, cancelTween } = useCarouselScroll(trackRef, rowRef);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollPrev(el.scrollLeft > SCROLL_END_EPSILON_PX);
    setCanScrollNext(el.scrollLeft < maxScroll - SCROLL_END_EPSILON_PX);
  }, []);

  useLayoutEffect(() => {
    updateScrollState();
  }, [updateScrollState]);

  useEffect(() => {
    const onResize = () => updateScrollState();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateScrollState]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const handleScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = undefined;
      updateScrollState();
    });
  };


  return (
    <>
      <Container>
        <Reveal as="div" className="flex items-center justify-between gap-24">
          <Heading level={2} size="h2" className="text-balance">
            {heading}
          </Heading>
          <div className="flex shrink-0 items-center gap-8">
            <button
              type="button"
              aria-label={previousLabel}
              aria-disabled={!canScrollPrev}
              onClick={() => canScrollPrev && scrollByCard(-1)}
              className={cn(
                "flex size-48 items-center justify-center rounded-full border-[1.5px] border-neutral-10 text-neutral-1 outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-secondary",
                canScrollPrev ? "hover:bg-neutral-11" : "cursor-not-allowed opacity-40"
              )}
            >
              <ArrowLeft size={24} />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              aria-disabled={!canScrollNext}
              onClick={() => canScrollNext && scrollByCard(1)}
              className={cn(
                "flex size-48 items-center justify-center rounded-full bg-neutral-1 text-white outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-secondary",
                canScrollNext ? "hover:bg-neutral-2" : "cursor-not-allowed opacity-40"
              )}
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </Reveal>
      </Container>

      <div
        ref={trackRef}
        role="region"
        aria-label={heading}
        tabIndex={0}
        onScroll={handleScroll}
        onWheel={cancelTween}
        onTouchStart={cancelTween}
        className="news-carousel-track mx-auto mt-48 w-full max-w-1600 overflow-x-auto pl-20 outline-none [scroll-snap-type:x_mandatory] [overscroll-behavior-x:contain] focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset md:pl-64 xl:pl-140"
      >
        <div ref={rowRef} className="flex gap-24 pb-4">
          {children}
        </div>
      </div>
    </>
  );
}
