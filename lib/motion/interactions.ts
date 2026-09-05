/**
 * Shared hover/press vocabulary for cards.
 *
 * Three different card components (product, blog, application scene) had three
 * different lift distances, image scales and durations. They now all pull from
 * here, so "a CNX card" feels the same wherever it appears and a change to the
 * feel is a one-line edit.
 *
 * The pairing is deliberate: the card lifts on the fast token (250ms) so the
 * pointer feels answered immediately, while the photo inside eases for twice as
 * long — that difference is what reads as expensive rather than twitchy. Both
 * animate transform only, never layout or shadow.
 *
 * @see docs/ANIMATION-SYSTEM.md
 */

/** Card container: 4px lift on hover/keyboard focus. */
export const CARD_LIFT =
  "transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-4 focus-visible:-translate-y-4 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0";

/** The <Image> inside a card: slow 4% push-in, GPU-only. */
export const CARD_IMAGE_ZOOM =
  "origin-center transform-gpu transition-transform duration-[var(--dur-image)] ease-[var(--ease-out)] group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100";

/** Title text that tints to the accent colour with its card. */
export const CARD_TITLE_TINT =
  "transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:text-secondary group-focus-visible:text-secondary motion-reduce:transition-none";

/** Trailing chevron that slides in on hover (inline "Learn more" style links). */
export const LINK_CHEVRON =
  "shrink-0 -translate-x-4 opacity-0 transition-[opacity,transform] duration-[var(--dur-slow)] ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:translate-x-0 motion-reduce:opacity-100 motion-reduce:transition-none";
