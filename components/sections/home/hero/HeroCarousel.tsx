"use client";

import { useEffect, useState } from "react";
import type { FocusEvent, KeyboardEvent, TouchEvent } from "react";
import Image from "@/components/ui/Picture";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import { ArrowRight as ArrowRightIcon } from "@/components/icons/ArrowRight";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { HERO_HEADER_OFFSET } from "@/src/layout/headerOffset";
import {
  HERO_BODY_DELAY_MS,
  HERO_CTA_DELAY_MS,
  HERO_HEADING_DELAY_MS,
} from "@/lib/motion/timing";
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

  // Phones: a horizontal swipe of 40px or more changes slide.
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(delta) < 40) return;
    goTo(delta < 0 ? index + 1 : index - 1);
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
      {/* Fills most of the screen (90svh, not 100): the photo takes whatever the
          copy below leaves, never less than 336px. */}
      <div
        className="flex min-h-[90svh] flex-col lg:hidden"
        onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative min-h-336 w-full flex-1">
          <Image
            src={active.image}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: active.imagePosition }}
          />
          {/* Light shade behind the header so the white logo reads on bright
              skies, clear photo in the middle, solid dark at the foot. The layer
              runs 1px past the photo so no seam shows above the heading. */}
          <div
            className="absolute inset-x-0 top-0 -bottom-px bg-[linear-gradient(to_bottom,rgba(10,13,27,0.55)_0%,rgba(10,13,27,0)_22%,rgba(10,13,27,0)_45%,rgba(10,13,27,0.6)_72%,#0a0d1b_96%)]"
            aria-hidden="true"
          />
        </div>

        {/* The small-screen hero is its own block, so it needs the same entrance
            as the desktop one rather than arriving flat. Same cascade, and the
            mask tokens already tighten under 768px. */}
        <Container className="relative -mt-px flex flex-col items-center bg-neutral-1 pb-80">
          <TextReveal delay={HERO_HEADING_DELAY_MS}>
            <Heading level={1} size="h1" className="text-center font-bold text-white text-balance">
              {active.heading}
            </Heading>
          </TextReveal>
          <Reveal as="div" delay={HERO_BODY_DELAY_MS}>
            <p className="mt-12 text-center text-p2 text-neutral-9">{active.body}</p>
          </Reveal>
          <Reveal as="div" delay={HERO_CTA_DELAY_MS}>
            <Button href={active.ctaHref} size="lg" className="mt-27 h-56 px-28">
              {active.cta}
              <ArrowRightIcon size={BUTTON_ICON_SIZE} />
            </Button>
          </Reveal>

          {/* Swipe the photo, or tap a dot, to change slide. */}
          <div className="mt-32 flex items-center gap-8" role="group" aria-label={ariaLabel}>
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`${slideIndex + 1} / ${slides.length}`}
                aria-current={slideIndex === index ? "true" : undefined}
                className="flex h-24 items-center px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                <span
                  className={cn(
                    "block h-8 rounded-full transition-[width,background-color] duration-300",
                    slideIndex === index ? "w-28 bg-secondary" : "w-8 bg-white/35"
                  )}
                />
              </button>
            ))}
          </div>
        </Container>
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

        {/* Same idea as the phone hero: dark under the copy at the bottom,
            fading to a completely clear photo at the top. */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,13,27,0.95)_0%,rgba(10,13,27,0.8)_25%,rgba(10,13,27,0.45)_50%,rgba(10,13,27,0)_75%)]"
          aria-hidden="true"
        />

        <Container className="relative z-10 flex min-h-720 flex-col items-center justify-end gap-40 pt-108 pb-48 xl:min-h-960 xl:pb-110">
          <div aria-live="polite" className="flex w-full flex-col items-center gap-40">
            <div className="flex w-full flex-col items-center gap-19 text-center">
              <TextReveal delay={HERO_HEADING_DELAY_MS} className="w-full xl:max-w-888">
                <Heading level={1} size="h1" className="font-bold text-white text-balance">
                  {active.heading}
                </Heading>
              </TextReveal>
              {/* A line break in the copy (Pages editor) is kept on desktop only. */}
              <Reveal as="div" delay={HERO_BODY_DELAY_MS} className="w-full xl:max-w-747">
                <Text size="p1" className="whitespace-pre-line text-neutral-9">
                  {active.body}
                </Text>
              </Reveal>
            </div>

            <Reveal as="div" delay={HERO_CTA_DELAY_MS}>
              <Button href={active.ctaHref} size="xl" className="w-full sm:w-auto">
                {active.cta}
                <ArrowRightIcon size={BUTTON_ICON_SIZE} />
              </Button>
            </Reveal>
          </div>
        </Container>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2">
          <div className="cnx-container-inset flex w-full items-center justify-between">
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
