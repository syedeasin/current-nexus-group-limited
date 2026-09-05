/**
 * Shared reveal timing — the JS half of the motion tokens in globals.css.
 *
 * Duration, easing and travel distance live in CSS (`--dur-reveal`,
 * `--ease-out`, `--reveal-distance`) and are read by `<Reveal>`. What CSS
 * cannot express is *ordering*: how far each element in a section is offset
 * behind the one before it. That lives here so no section invents its own
 * cascade and every page ends up with the same pacing.
 *
 * The canonical section cascade is:
 *
 *   eyebrow   -> STEP * 0   (0ms)
 *   heading   -> STEP * 1   (80ms)
 *   body/CTA  -> STEP * 2   (160ms)
 *   content   -> CONTENT_BASE + stagger(index)
 *
 * @see docs/ANIMATION-SYSTEM.md
 */

/** One step of the section cascade, and of any sibling stagger. */
export const REVEAL_STEP_MS = 80;

/**
 * Beyond this many staggered siblings every later item shares the last delay,
 * so a long grid never leaves its final cards visibly "waiting".
 */
export const REVEAL_STAGGER_CAP = 5;

/** Delay for the Nth element of a section header cascade (eyebrow = 0). */
export function cascade(index: number): number {
  return Math.max(index, 0) * REVEAL_STEP_MS;
}

/**
 * Delay for the Nth item of a staggered group (cards, accordion rows, stats),
 * capped so long lists stay responsive.
 *
 * @param index position within the group
 * @param base  delay the group starts at — normally `cascade(n)` for whatever
 *              header sits above it
 */
export function stagger(index: number, base = 0): number {
  return base + Math.min(Math.max(index, 0), REVEAL_STAGGER_CAP) * REVEAL_STEP_MS;
}

/** Header cascade positions, named so sections read as intent rather than arithmetic. */
export const EYEBROW_DELAY_MS = cascade(0);
export const HEADING_DELAY_MS = cascade(1);
export const BODY_DELAY_MS = cascade(2);
export const CTA_DELAY_MS = cascade(3);

/** Where a grid/carousel of content under a centred eyebrow+heading starts. */
export const CONTENT_BASE_DELAY_MS = cascade(2);
