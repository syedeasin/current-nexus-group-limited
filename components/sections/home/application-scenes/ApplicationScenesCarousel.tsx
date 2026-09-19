"use client";

import { useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import SceneCard from "@/components/ui/SceneCard";
import Carousel, { type CarouselHandle } from "@/components/ui/Carousel";
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

/**
 * Same track as SceneCarousel (right-bled, snap-scrolling scene cards), but the
 * prev/next buttons sit in their own row right above the cards instead of below
 * them — client revision doc point 12: "left-right buttons should move above,
 * easy to miss below". Driven via the imperative ref, same pattern as
 * RelatedProducts' header-row arrows (Figma node 114:99337). The bottom
 * progress bar stays (it's still a useful scroll affordance) — only the button
 * pair moved; `controls` is intentionally omitted from `Carousel` so it
 * doesn't render its own second pair down there.
 */
export default function ApplicationScenesCarousel({
  cards,
  ariaLabel,
  previousLabel,
  nextLabel,
}: ApplicationScenesCarouselProps) {
  const carouselRef = useRef<CarouselHandle>(null);
  const [scrollState, setScrollState] = useState({ canScrollPrev: false, canScrollNext: true });

  return (
    <div className="flex w-full flex-col gap-24">
      <Reveal as="div" className="flex w-full justify-end gap-8">
        <button
          type="button"
          aria-label={previousLabel}
          aria-disabled={!scrollState.canScrollPrev}
          onClick={() => scrollState.canScrollPrev && carouselRef.current?.scrollPrev()}
          className={cn(
            "flex size-48 items-center justify-center rounded-full border-[1.5px] border-neutral-10 text-neutral-1 outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-secondary",
            scrollState.canScrollPrev ? "hover:bg-neutral-11" : "cursor-not-allowed opacity-40"
          )}
        >
          <ArrowLeft size={24} />
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          aria-disabled={!scrollState.canScrollNext}
          onClick={() => scrollState.canScrollNext && carouselRef.current?.scrollNext()}
          className={cn(
            "flex size-48 items-center justify-center rounded-full bg-secondary text-neutral-1 outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-secondary",
            scrollState.canScrollNext ? "hover:bg-secondary/90" : "cursor-not-allowed opacity-40"
          )}
        >
          <ArrowRight size={24} />
        </button>
      </Reveal>

      <Carousel
        ref={carouselRef}
        ariaLabel={ariaLabel}
        progressDelay={stagger(cards.length, CONTENT_BASE_DELAY_MS)}
        onScrollStateChange={setScrollState}
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
    </div>
  );
}
