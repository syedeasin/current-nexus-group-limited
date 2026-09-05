/**
 * Shared framer-motion variants for the scroll-reveal layer
 * (ANIMATION-SYSTEM.md §2, timing table §8).
 *
 * Every reveal in the site pulls from these three primitives so the motion
 * reads as one system. Numbers mirror the CSS "Motion tokens" block in
 * globals.css — keep the two in sync.
 *
 * The variants are driven by a `custom` payload so a single definition covers
 * desktop/mobile distance, per-item stagger, and the headings-only blur:
 *
 *   <motion.div custom={{ distance, delayIndex, blur }} variants={fadeUp} />
 *
 * The <Reveal> wrapper (reveal.tsx) supplies that payload; components should
 * use <Reveal> rather than wiring variants by hand.
 */
import type { Variants } from "framer-motion";

/** cubic-bezier(0.22, 1, 0.36, 1) — ease-out-quart, "decelerate" (§8 --ease-out) */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** 650ms — §8 --dur-reveal */
export const DUR_REVEAL = 0.65;

/** fade-up translateY: §8 --reveal-distance (24px desktop / 16px mobile) */
export const REVEAL_DISTANCE = 24;
export const REVEAL_DISTANCE_MOBILE = 16;

/** IntersectionObserver threshold — §8 --reveal-threshold */
export const REVEAL_THRESHOLD = 0.15;

/** fires slightly before the element is fully in view — §2 rootMargin */
export const REVEAL_ROOT_MARGIN = "0px 0px -10% 0px";

/** per-item stagger step (§2: 80–100ms increments) and the item cap beyond
 * which every later item shares the last delay so long lists don't "wait". */
export const STAGGER_STEP = 0.09;
export const STAGGER_CAP = 6;

/** headings-only blur-in radius — §2 */
export const HEADING_BLUR = 6;

export interface RevealCustom {
  /** translateY start distance in px; defaults to the desktop token */
  distance?: number;
  /** index within a sibling group; multiplies STAGGER_STEP, capped */
  delayIndex?: number;
  /** include the heading blur-in; forced off on mobile (§5) */
  blur?: boolean;
}

function staggerDelay(delayIndex = 0): number {
  return Math.min(Math.max(delayIndex, 0), STAGGER_CAP - 1) * STAGGER_STEP;
}

function baseTransition(c?: RevealCustom) {
  return { duration: DUR_REVEAL, ease: EASE_OUT, delay: staggerDelay(c?.delayIndex) };
}

/**
 * fade-up (§2) — opacity 0→1, translateY <distance>→0.
 * The core primitive for headings, paragraphs, cards, list items.
 */
export const fadeUp: Variants = {
  hidden: (c?: RevealCustom) => ({
    opacity: 0,
    y: c?.distance ?? REVEAL_DISTANCE,
  }),
  visible: (c?: RevealCustom) => ({
    opacity: 1,
    y: 0,
    transition: baseTransition(c),
  }),
};

/**
 * fade-up + blur-in (§2) — for large headings (h1, section h2) only, giving
 * that "settling into focus" quality. `blur: false` (mobile, §5) collapses
 * this to a plain fade-up with no filter property touched.
 */
export const fadeUpBlur: Variants = {
  hidden: (c?: RevealCustom) => ({
    opacity: 0,
    y: c?.distance ?? REVEAL_DISTANCE,
    ...(c?.blur === false ? {} : { filter: `blur(${HEADING_BLUR}px)` }),
  }),
  visible: (c?: RevealCustom) => ({
    opacity: 1,
    y: 0,
    ...(c?.blur === false ? {} : { filter: "blur(0px)" }),
    transition: baseTransition(c),
  }),
};

/**
 * scale-in (§2) — scale 0.96→1 + fade, same easing/duration as fade-up.
 * For product / screenshot images so they "settle into place" rather than
 * slide. (Distance is unused here; kept in the signature for a uniform API.)
 */
export const scaleIn: Variants = {
  hidden: () => ({
    opacity: 0,
    scale: 0.96,
  }),
  visible: (c?: RevealCustom) => ({
    opacity: 1,
    scale: 1,
    transition: baseTransition(c),
  }),
};

export type RevealVariantName = "fadeUp" | "fadeUpBlur" | "scaleIn";

export const revealVariants: Record<RevealVariantName, Variants> = {
  fadeUp,
  fadeUpBlur,
  scaleIn,
};
