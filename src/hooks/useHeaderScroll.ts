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
  /** current route; re-measures the hero after a client-side navigation */
  pathname?: string;
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
 * The whole hero section is measured (not a thin marker at its bottom edge):
 * a 1px sentinel can't tell "haven't scrolled there yet" apart from "already
 * scrolled past" once the hero is taller than the viewport. The sentinel is
 * re-queried on every measurement instead of being captured once, because the
 * <Navbar> lives in the layout and survives client-side navigation — a captured
 * node would be the *previous* page's detached hero.
 */
let heroUnderHeader: boolean | null = null;
const heroListeners = new Set<() => void>();
let heroRefCount = 0;
let heroFrame = 0;

function measureHeroUnderHeader(): boolean {
  const sentinel = document.querySelector(HERO_SENTINEL_SELECTOR);
  if (!sentinel) return false;
  return sentinel.getBoundingClientRect().bottom > getHeaderHeight();
}

function syncHeroUnderHeader() {
  const next = measureHeroUnderHeader();
  if (next === heroUnderHeader) return;
  heroUnderHeader = next;
  for (const listener of heroListeners) listener();
}

function scheduleHeroSync() {
  if (heroFrame) return;
  heroFrame = window.requestAnimationFrame(() => {
    heroFrame = 0;
    syncHeroUnderHeader();
  });
}

function subscribeHeroUnderHeader(callback: () => void) {
  heroListeners.add(callback);
  if (heroRefCount++ === 0) {
    window.addEventListener("scroll", scheduleHeroSync, { passive: true });
    window.addEventListener("resize", scheduleHeroSync);
  }
  return () => {
    heroListeners.delete(callback);
    if (--heroRefCount === 0) {
      window.removeEventListener("scroll", scheduleHeroSync);
      window.removeEventListener("resize", scheduleHeroSync);
      if (heroFrame) window.cancelAnimationFrame(heroFrame);
      heroFrame = 0;
      heroUnderHeader = null;
    }
  };
}

function getHeroClientSnapshot() {
  if (heroUnderHeader === null) heroUnderHeader = measureHeroUnderHeader();
  return heroUnderHeader;
}

const getHeroServerSnapshot = () => true;

function useHeroUnderHeader(pathname?: string): boolean {
  const heroVisible = useSyncExternalStore(subscribeHeroUnderHeader, getHeroClientSnapshot, getHeroServerSnapshot);

  useEffect(() => {
    syncHeroUnderHeader();
  }, [pathname]);

  return heroVisible;
}

export function useHeaderScroll({ forceOpen = false, pathname }: UseHeaderScrollOptions = {}): HeaderScrollState {
  const heroVisible = useHeroUnderHeader(pathname);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  // A route change keeps the <Navbar> mounted but resets the scroll position,
  // so a header hidden on the previous page would stay hidden on the new one.
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    setHidden(false);
  }, [pathname]);

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
