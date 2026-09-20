"use client";

import { useRef, useState } from "react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Carousel, { type CarouselHandle } from "@/components/ui/Carousel";
import { ArrowLeft } from "@/components/icons/ArrowLeft";
import { ArrowRight } from "@/components/icons/ArrowRight";
import ManufacturingProductCard from "@/components/sections/manufacturing/ProductCard";
import { cn } from "@/lib/utils";
import type { RelatedProductsSection } from "@/lib/data/products/types";

const CARD_STEP_MS = 80;
const CARD_STAGGER_CAP_MS = 400;

export default function RelatedProducts({
  data,
  learnMoreLabel,
  previousLabel,
  nextLabel,
}: {
  data: RelatedProductsSection;
  learnMoreLabel: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const carouselRef = useRef<CarouselHandle>(null);
  const [scrollState, setScrollState] = useState({ canScrollPrev: false, canScrollNext: true });

  return (
    <section className="w-full bg-white pt-100 pb-80">
      <Container className="flex flex-col gap-48">
        {/* Figma node 114:99337: the prev/next buttons sit in the header row next to the
            heading, not below the cards like Carousel's own built-in controls — driven
            here via the imperative ref instead. */}
        <Reveal as="div" className="flex items-center gap-48">
          <div className="flex flex-1 flex-col gap-12">
            <SectionEyebrow label={data.eyebrow} />
            {/* Figma H2 spec here tracks -1.2px, not the shared --text-h2 token's -0.72px. */}
            <Heading level={2} size="h2" className="text-balance tracking-[-1.2px]!">
              {data.heading}
            </Heading>
          </div>
          <div className="flex shrink-0 items-center gap-8">
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
          </div>
        </Reveal>

        {/* Figma card row (114:99355): a fixed 24px gap, not Carousel's default
            variable-width scale — forced with `!` since Carousel's own responsive gap
            utilities resolve this conflict by generation order, not source order (see
            Hero.tsx's pt/py fix for precedent). */}
        <Carousel
          ref={carouselRef}
          ariaLabel={data.heading}
          progressVariant="none"
          rowClassName="gap-24!"
          onScrollStateChange={setScrollState}
        >
          {data.items.map((item, index) => {
            const delay = Math.min(index * CARD_STEP_MS, CARD_STAGGER_CAP_MS);
            return (
              <Reveal
                key={item.title}
                as="div"
                delay={delay}
                className="w-[85vw] shrink-0 snap-start sm:w-400 lg:w-648"
              >
                <ManufacturingProductCard
                  href={item.href}
                  image={item.image}
                  imageAlt={item.imageAlt}
                  title={item.title}
                  description={item.body}
                  learnMoreLabel={learnMoreLabel}
                  featured={item.featured}
                />
              </Reveal>
            );
          })}
        </Carousel>
      </Container>
    </section>
  );
}
