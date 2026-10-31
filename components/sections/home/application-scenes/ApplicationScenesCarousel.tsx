"use client";

import { useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import SceneCard from "@/components/ui/SceneCard";
import Carousel, { type CarouselHandle, type CarouselScrollState } from "@/components/ui/Carousel";
import { ArrowLeft } from "@/components/icons/ArrowLeft";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { stagger, CONTENT_BASE_DELAY_MS } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

interface ApplicationScenesCarouselCard {
  key: string;
  title: string;
  description: string;
  image: string;
  href?: string;
}

interface ApplicationScenesCarouselProps {
  cards: ApplicationScenesCarouselCard[];
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
}

const ARROW =
  "flex size-48 shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-secondary";

/**
 * Scene of Applications track (right-bled, snap-scrolling scene cards) with
 * one control row centred under the cards: previous arrow, position dots (the
 * same gold-pill dots as the homepage hero, each one clickable), next arrow.
 * The row replaces the old top-right arrows and the bottom progress line, so
 * the heading sits the standard 48px above the cards. Driven via the
 * Carousel's imperative ref and scroll state.
 */
export default function ApplicationScenesCarousel({
  cards,
  ariaLabel,
  previousLabel,
  nextLabel,
}: ApplicationScenesCarouselProps) {
  const carouselRef = useRef<CarouselHandle>(null);
  const [scroll, setScroll] = useState<CarouselScrollState>({
    canScrollPrev: false,
    canScrollNext: true,
    positions: 1,
    activeIndex: 0,
  });

  return (
    <div className="flex w-full flex-col gap-32 md:gap-40">
      <Carousel
        ref={carouselRef}
        ariaLabel={ariaLabel}
        progressVariant="none"
        onScrollStateChange={setScroll}
        bleedRight
      >
        {cards.map((card, index) => (
          <Reveal
            key={card.key}
            as="div"
            delay={stagger(index, CONTENT_BASE_DELAY_MS)}
            className="w-[85vw] shrink-0 [scroll-snap-align:start] min-[481px]:w-[64%] lg:w-[36%] xl:w-[32.1%]"
          >
            <SceneCard
              href={card.href}
              image={card.image}
              title={card.title}
              description={card.description}
              imageSizes="(min-width: 1280px) 32vw, (min-width: 1024px) 36vw, (min-width: 481px) 64vw, 85vw"
            />
          </Reveal>
        ))}
      </Carousel>

      {scroll.positions > 1 && (
        <Reveal as="div" delay={stagger(cards.length, CONTENT_BASE_DELAY_MS)} className="flex items-center justify-center gap-20">
          <button
            type="button"
            aria-label={previousLabel}
            aria-disabled={!scroll.canScrollPrev}
            onClick={() => scroll.canScrollPrev && carouselRef.current?.scrollPrev()}
            className={cn(
              ARROW,
              "border-[1.5px] border-neutral-10 text-neutral-1",
              scroll.canScrollPrev ? "hover:bg-neutral-11" : "cursor-not-allowed opacity-40"
            )}
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex items-center gap-8" role="group" aria-label={ariaLabel}>
            {Array.from({ length: scroll.positions }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => carouselRef.current?.scrollTo(index)}
                aria-label={`${index + 1} / ${scroll.positions}`}
                aria-current={index === scroll.activeIndex ? "true" : undefined}
                className="flex h-24 items-center px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                <span
                  className={cn(
                    "block h-8 rounded-full transition-[width,background-color] duration-300",
                    index === scroll.activeIndex ? "w-28 bg-secondary" : "w-8 bg-neutral-9 hover:bg-neutral-7"
                  )}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label={nextLabel}
            aria-disabled={!scroll.canScrollNext}
            onClick={() => scroll.canScrollNext && carouselRef.current?.scrollNext()}
            className={cn(
              ARROW,
              "bg-secondary text-neutral-1",
              scroll.canScrollNext ? "hover:bg-secondary/90" : "cursor-not-allowed opacity-40"
            )}
          >
            <ArrowRight size={24} />
          </button>
        </Reveal>
      )}
    </div>
  );
}
