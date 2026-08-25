"use client";

import { useEffect, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface HeroCarouselSlide {
  id: string;
  image: string;
  imagePosition: string;
  ctaHref: string;
  heading: string;
  body: string;
  cta: string;
}

interface HeroCarouselProps {
  slides: HeroCarouselSlide[];
  ariaLabel: string;
  previousSlideLabel: string;
  nextSlideLabel: string;
}

const AUTOPLAY_MS = 6000;
const CROSSFADE_MS = 400;

function ArrowButton({
  direction,
  label,
  onClick,
  size,
}: {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
  size: "edge" | "row";
}) {
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
        direction === "prev"
          ? "border border-neutral-5 text-white hover:bg-white/10"
          : "bg-white text-neutral-1 hover:bg-white/90",
        size === "edge" ? "size-48" : "size-44"
      )}
    >
      <Icon size={24} />
    </button>
  );
}

export default function HeroCarousel({
  slides,
  ariaLabel,
  previousSlideLabel,
  nextSlideLabel,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || hovered || focused) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reducedMotion, hovered, focused, slides.length]);

  function goTo(next: number) {
    setIndex((next + slides.length) % slides.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocused(false);
    }
  }

  const active = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="relative w-full overflow-hidden"
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.id}
          aria-hidden={slideIndex !== index}
          className="absolute inset-0 transition-opacity ease-out"
          style={{
            opacity: slideIndex === index ? 1 : 0,
            transitionDuration: `${CROSSFADE_MS}ms`,
          }}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={slideIndex === 0}
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: slide.imagePosition }}
          />
        </div>
      ))}

      <div
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,13,27,0.2)_0%,rgba(10,13,27,0.69)_69.2515%,rgba(10,13,27,0.9)_100%)]"
        aria-hidden="true"
      />

      <Container className="relative z-10 flex min-h-560 flex-col items-center justify-end gap-40 pt-108 pb-32 md:min-h-720 md:pb-48 xl:min-h-960 xl:pb-110">
        <div aria-live="polite" className="flex w-full flex-col items-center gap-40">
          <div className="flex w-full flex-col items-center gap-19 text-center">
            <Reveal as="div" className="w-full xl:max-w-888">
              <Heading level={1} size="h1" className="text-white text-balance">
                {active.heading}
              </Heading>
            </Reveal>
            <Reveal as="div" delay={80} className="w-full xl:max-w-788">
              <Text size="p1" className="text-neutral-9">
                {active.body}
              </Text>
            </Reveal>
          </div>

          <Reveal as="div" delay={160}>
            <Button href={active.ctaHref} size="xl" className="w-full sm:w-auto">
              {active.cta}
              <ChevronRight size={12} />
            </Button>
          </Reveal>
        </div>

        <div className="flex items-center justify-center gap-24 md:hidden">
          <ArrowButton
            direction="prev"
            label={previousSlideLabel}
            onClick={() => goTo(index - 1)}
            size="row"
          />
          <ArrowButton
            direction="next"
            label={nextSlideLabel}
            onClick={() => goTo(index + 1)}
            size="row"
          />
        </div>
      </Container>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 hidden -translate-y-1/2 md:flex">
        <div className="mx-auto flex w-full max-w-2000 items-center justify-between px-64 xl:px-200">
          <div className="pointer-events-auto">
            <ArrowButton
              direction="prev"
              label={previousSlideLabel}
              onClick={() => goTo(index - 1)}
              size="edge"
            />
          </div>
          <div className="pointer-events-auto">
            <ArrowButton
              direction="next"
              label={nextSlideLabel}
              onClick={() => goTo(index + 1)}
              size="edge"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
