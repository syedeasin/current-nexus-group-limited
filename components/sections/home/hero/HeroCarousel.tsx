"use client";

import { useEffect, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { HERO_HEADER_OFFSET } from "@/src/layout/headerOffset";
import { BODY_DELAY_MS, EYEBROW_DELAY_MS, HEADING_DELAY_MS } from "@/lib/motion/timing";
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
const CROSSFADE_MS = 1200;
const CROSSFADE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

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

  // Per-activation key for the desktop Ken Burns zoom. Only the slide that just
  // became active gets a fresh key (monotonic, unique), which remounts its
  // image layer and restarts the @keyframes zoom from scale(1) — including when
  // the carousel loops back to slide 0. Slides that are leaving keep their key,
  // so their transform holds (animation-fill-mode) and the crossfade-out stays
  // smooth instead of snapping back to 1.
  const [zoomKeys, setZoomKeys] = useState<number[]>(() => slides.map(() => 0));

  // Bump the active slide's key during render (React's "adjust state on prop
  // change" pattern) rather than in an effect, so the remount happens before
  // paint and there's no setState-in-effect for the lint rule to flag.
  const [prevIndex, setPrevIndex] = useState(index);
  if (prevIndex !== index) {
    setPrevIndex(index);
    setZoomKeys((prev) => {
      const next = [...prev];
      next[index] = Math.max(...prev) + 1;
      return next;
    });
  }

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
      id="hero-section"
      data-hero-sentinel
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn("relative w-full overflow-hidden", HERO_HEADER_OFFSET)}
    >
      {/* মোবাইল হিরো — Figma exact লেআউট (< lg) */}
      <div className="lg:hidden">
        <div className="relative h-336 w-full">
          <Image
            src={active.image}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: active.imagePosition }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-1/60 to-neutral-1"
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-col items-center bg-neutral-1 px-20 pb-40">
          <Heading level={1} size="h1" className="text-center font-bold text-white text-balance">
            {active.heading}
          </Heading>
          <p className="mt-12 text-center text-h4 font-medium text-neutral-9">{active.body}</p>
          <Button href={active.ctaHref} size="lg" className="mt-27">
            {active.cta}
            <ChevronRight size={BUTTON_ICON_SIZE} />
          </Button>
        </div>
      </div>

      {/* ডেস্কটপ হিরো — বিদ্যমান ক্যারোসেল (>= lg) */}
      <div className="hidden lg:block">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            aria-hidden={slideIndex !== index}
            className="absolute inset-0 transition-opacity"
            style={{
              opacity: slideIndex === index ? 1 : 0,
              transitionDuration: `${CROSSFADE_MS}ms`,
              transitionTimingFunction: CROSSFADE_EASE,
            }}
          >
            {reducedMotion ? (
              <Image
                src={slide.image}
                alt=""
                fill
                priority={slideIndex === 0}
                sizes="100vw"
                style={{ objectFit: "cover", objectPosition: slide.imagePosition }}
              />
            ) : (
              <div
                key={zoomKeys[slideIndex]}
                className="hero-slide-kenburns absolute inset-0"
                style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
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
            )}
          </div>
        ))}

        <div
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,13,27,0.2)_0%,rgba(10,13,27,0.69)_69.2515%,rgba(10,13,27,0.9)_100%)]"
          aria-hidden="true"
        />

        <Container className="relative z-10 flex min-h-720 flex-col items-center justify-end gap-40 pt-108 pb-48 xl:min-h-960 xl:pb-110">
          <div aria-live="polite" className="flex w-full flex-col items-center gap-40">
            <div className="flex w-full flex-col items-center gap-19 text-center">
              <Reveal as="div" delay={EYEBROW_DELAY_MS} className="w-full xl:max-w-888">
                <Heading level={1} size="h1" className="font-bold text-white text-balance">
                  {active.heading}
                </Heading>
              </Reveal>
              <Reveal as="div" delay={HEADING_DELAY_MS} className="w-full xl:max-w-747">
                <Text size="p1" className="text-neutral-9">
                  {active.body}
                </Text>
              </Reveal>
            </div>

            <Reveal as="div" delay={BODY_DELAY_MS}>
              <Button href={active.ctaHref} size="xl" className="w-full sm:w-auto">
                {active.cta}
                <ChevronRight size={BUTTON_ICON_SIZE} />
              </Button>
            </Reveal>
          </div>
        </Container>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2">
          <div className="mx-auto flex w-full max-w-1600 items-center justify-between px-64 xl:px-140">
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
      </div>
    </section>
  );
}
