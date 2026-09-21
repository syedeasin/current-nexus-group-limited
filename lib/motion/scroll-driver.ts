/**
 * One requestAnimationFrame loop for every scroll-linked effect on the page.
 *
 * Parallax and the sticky horizontal track both need per-frame work, and both
 * need Lenis's *eased* scroll value rather than `window.scrollY` (which jumps in
 * wheel-sized steps while Lenis is interpolating between them, and would make
 * anything driven by it visibly stutter).
 *
 * Rather than each component adding its own scroll listener + rAF loop, they
 * subscribe here. The loop only runs while there is at least one subscriber, so
 * a page with no scroll-linked motion costs nothing. Subscribers receive the
 * current scroll position and never call setState — they write transforms
 * straight to the DOM, so React re-renders zero times during a scroll.
 *
 * @see docs/ANIMATION-SYSTEM.md
 */

import { getScrollY } from "./lenis-instance";

type Subscriber = (scrollY: number) => void;

const subscribers = new Set<Subscriber>();
let frame: number | null = null;

function tick(): void {
  const scrollY = getScrollY();
  for (const subscriber of subscribers) subscriber(scrollY);
  frame = requestAnimationFrame(tick);
}

function start(): void {
  if (frame !== null || typeof window === "undefined") return;
  frame = requestAnimationFrame(tick);
}

function stop(): void {
  if (frame === null) return;
  cancelAnimationFrame(frame);
  frame = null;
}

/**
 * Run `subscriber` on every frame while the page is scrolling-capable.
 * Returns an unsubscribe function; the shared loop stops when the last
 * subscriber leaves.
 */
export function subscribeToScroll(subscriber: Subscriber): () => void {
  subscribers.add(subscriber);
  start();

  // Prime it once so the element is in the right place before the first scroll.
  subscriber(getScrollY());

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) stop();
  };
}

/** Clamp to the 0..1 progress range every scroll-linked effect works in. */
export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Exponential-ish frame-rate-independent lerp toward a target. */
export function lerp(current: number, target: number, amount: number): number {
  return current + (target - current) * amount;
}
