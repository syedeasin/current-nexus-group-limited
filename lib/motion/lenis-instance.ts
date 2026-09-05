/**
 * Module-level handle to the single active Lenis instance.
 *
 * Scroll-linked logic (the header show/hide hook now, image parallax later)
 * must read Lenis's *eased* scroll value rather than `window.scrollY` to stay
 * jitter-free (ANIMATION-SYSTEM.md §1). Rather than pollute `window`, the
 * provider registers the instance here and consumers pull it via
 * `getLenis()` / `getScrollY()`, both of which degrade gracefully to native
 * scroll when Lenis is not running (reduced-motion, SSR, pre-mount).
 */
import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(next: Lenis | null): void {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}

/**
 * Current vertical scroll position from Lenis if it is running, else the
 * native value. Safe to call during SSR (returns 0).
 */
export function getScrollY(): number {
  if (instance) return instance.scroll;
  if (typeof window !== "undefined") return window.scrollY;
  return 0;
}
