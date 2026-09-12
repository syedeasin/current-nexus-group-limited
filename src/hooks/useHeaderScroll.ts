// src/hooks/useHeaderScroll.ts
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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
const HERO_SENTINEL_SELECTOR = "[data-hero-sentinel]";

function getHeaderHeight() {
  if (typeof window === "undefined") return DESKTOP_HEADER_HEIGHT_PX;
  return window.matchMedia(DESKTOP_HEADER_QUERY).matches ? DESKTOP_HEADER_HEIGHT_PX : MOBILE_HEADER_HEIGHT_PX;
}

/**
 * Store for "is the hero section still under the header's bottom edge?".
 *
 * Read through useSyncExternalStore rather than an effect so the *first* client
 * render already has the answer: the header must not paint white and then swap
 * to transparent once an effect catches up — that white flash on load is
 * exactly what this avoids. The server snapshot is `true` because effectively
 * every page here opens with a full-bleed hero the header floats over; a page
 * with no `[data-hero-sentinel]` corrects to white in the same commit, before
 * the browser paints.
 *
 * The whole hero section is observed (not a thin marker at its bottom edge):
 * a 1px sentinel can't tell "haven't scrolled there yet" apart from "already
 * scrolled past" once the hero is taller than the viewport — both read as
 * not-intersecting. Observing the full section with a top-shrunk rootMargin
 * stays intersecting for as long as any part of the hero is still below the
 * header's bottom edge, which is what "still over the hero" actually means.
 * The header is 56px below xl and 88px at xl and up, so the rootMargin is
 * recomputed from the current viewport rather than a constant.
 */
let heroUnderHeader = false;
const heroListeners = new Set<() => void>();
let heroObserver: IntersectionObserver | null = null;
let heroMql: MediaQueryList | null = null;
let heroRefCount = 0;

function heroGeometrySnapshot(sentinel: Element): boolean {
  return sentinel.getBoundingClientRect().bottom > getHeaderHeight();
}

function setHeroUnderHeader(next: boolean) {
  if (next === heroUnderHeader) return;
  heroUnderHeader = next;
  for (const listener of heroListeners) listener();
}

function attachHeroObserver() {
  heroObserver?.disconnect();
  heroObserver = null;

  const sentinel = document.querySelector(HERO_SENTINEL_SELECTOR);
  if (!sentinel) {
    setHeroUnderHeader(false);
    return;
  }

  // Seed synchronously from geometry rather than waiting on the observer's first
  // callback — browsers can defer that callback (e.g. a backgrounded/occluded
  // tab), which would otherwise leave the header stuck until the next scroll.
  setHeroUnderHeader(heroGeometrySnapshot(sentinel));

  heroObserver = new IntersectionObserver(([entry]) => setHeroUnderHeader(entry.isIntersecting), {
    rootMargin: `-${getHeaderHeight()}px 0px 0px 0px`,
    threshold: 0,
  });
  heroObserver.observe(sentinel);
}

function subscribeHeroUnderHeader(callback: () => void) {
  heroListeners.add(callback);
  if (heroRefCount++ === 0) {
    attachHeroObserver();
    heroMql = window.matchMedia(DESKTOP_HEADER_QUERY);
    heroMql.addEventListener("change", attachHeroObserver);
  }
  return () => {
    heroListeners.delete(callback);
    if (--heroRefCount === 0) {
      heroObserver?.disconnect();
      heroObserver = null;
      heroMql?.removeEventListener("change", attachHeroObserver);
      heroMql = null;
    }
  };
}

const getHeroClientSnapshot = () => heroUnderHeader;
const getHeroServerSnapshot = () => true;

function useHeroUnderHeader(): boolean {
  return useSyncExternalStore(subscribeHeroUnderHeader, getHeroClientSnapshot, getHeroServerSnapshot);
}

export function useHeaderScroll({ forceOpen = false }: UseHeaderScrollOptions = {}): HeaderScrollState {
  const heroVisible = useHeroUnderHeader();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

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
