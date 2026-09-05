// src/hooks/useHeaderScroll.ts
"use client";

import { useEffect, useRef, useState } from "react";

export type HeaderVisual = "transparent" | "white";

export interface HeaderScrollState {
  visual: HeaderVisual;
  hidden: boolean;
}

interface UseHeaderScrollOptions {
  /** mega menu, mobile drawer, or search is open — force white + visible */
  forceOpen?: boolean;
}

const DESKTOP_HEADER_HEIGHT_PX = 88;
const MOBILE_HEADER_HEIGHT_PX = 56;
/** The header swaps from the 56px compact bar to the 88px desktop bar at xl. */
const DESKTOP_HEADER_QUERY = "(min-width: 1280px)";
const HIDE_THRESHOLD_PX = 8;

function getHeaderHeight() {
  if (typeof window === "undefined") return DESKTOP_HEADER_HEIGHT_PX;
  return window.matchMedia(DESKTOP_HEADER_QUERY).matches ? DESKTOP_HEADER_HEIGHT_PX : MOBILE_HEADER_HEIGHT_PX;
}

/**
 * hasHero is derived from the presence of a `[data-hero-sentinel]` element
 * (the hero section's own root — see components/sections/home/hero/HeroCarousel.tsx)
 * rather than a prop, so every page — hero or not — works with a bare `<Navbar />`.
 *
 * The whole hero section is observed (not a thin marker at its bottom edge):
 * a 1px sentinel can't tell "haven't scrolled there yet" apart from "already
 * scrolled past" once the hero is taller than the viewport — both read as
 * not-intersecting. Observing the full section with a top-shrunk rootMargin
 * stays intersecting for as long as any part of the hero is still below the
 * header's bottom edge, which is what "still over the hero" actually means.
 *
 * The header is 56px below xl and 88px at xl and up, so the rootMargin/hide
 * threshold are recomputed from the current viewport rather than a constant.
 */
export function useHeaderScroll({ forceOpen = false }: UseHeaderScrollOptions = {}): HeaderScrollState {
  const [heroVisible, setHeroVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const sentinel = document.querySelector("[data-hero-sentinel]");
    if (!sentinel) return;

    const mql = window.matchMedia(DESKTOP_HEADER_QUERY);
    let observer: IntersectionObserver | null = null;

    function observe() {
      observer?.disconnect();

      // Set the initial value synchronously from geometry rather than waiting on the
      // observer's first callback — browsers can defer that callback (e.g. a
      // backgrounded/occluded tab), which would otherwise leave the header stuck in
      // the wrong state until the next scroll.
      const headerHeight = getHeaderHeight();
      const rect = (sentinel as Element).getBoundingClientRect();
      setHeroVisible(rect.bottom > headerHeight);

      observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
        rootMargin: `-${headerHeight}px 0px 0px 0px`,
        threshold: 0,
      });
      observer.observe(sentinel as Element);
    }

    observe();
    mql.addEventListener("change", observe);
    return () => {
      observer?.disconnect();
      mql.removeEventListener("change", observe);
    };
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;

    function evaluate() {
      const headerHeight = getHeaderHeight();
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (delta > HIDE_THRESHOLD_PX && currentScrollY > headerHeight) {
        setHidden(true);
        lastScrollY.current = currentScrollY;
      } else if (delta < -HIDE_THRESHOLD_PX) {
        setHidden(false);
        lastScrollY.current = currentScrollY;
      }
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(evaluate);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (forceOpen) {
    return { visual: "white", hidden: false };
  }

  if (heroVisible) {
    return { visual: "transparent", hidden: false };
  }

  return { visual: "white", hidden };
}
