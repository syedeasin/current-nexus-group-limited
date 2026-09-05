"use client";

/**
 * <Reveal> — the single wrapper every scroll-reveal in the site goes through
 * (ANIMATION-SYSTEM.md §2). It maps §2 straight onto framer-motion's
 * `whileInView` + `viewport={{ once: true, amount: 0.15 }}` so no component
 * hand-rolls an IntersectionObserver.
 *
 * Behaviour:
 * - Animates once. Scrolling back up never replays it (§2, §9).
 * - prefers-reduced-motion: reduce → renders a plain wrapper, content at its
 *   end state, no transition (§1, §10).
 * - Mobile (matchMedia('(max-width: 768px)'), not just a CSS breakpoint, §5):
 *   reveal distance drops 24px → 16px and the heading blur-in is skipped.
 *
 * Usage:
 *   <Reveal variant="fadeUpBlur"><h2>Section title</h2></Reveal>
 *   {items.map((it, i) => (
 *     <Reveal key={it.id} delayIndex={i}><Card {...it} /></Reveal>
 *   ))}
 *
 * ---------------------------------------------------------------------------
 * TODO(§2 image parallax) — NOT IMPLEMENTED YET (no image components exist).
 * When hero/section <Image> components land, add a `useParallax` hook here:
 *   - Large hero/section images get a slow parallax: translateY roughly
 *     -40px → 40px mapped to the element's scroll progress through the
 *     viewport.
 *   - Use `transform: translate3d(0, y, 0)` ONLY — GPU-accelerated, never
 *     animate top/left.
 *   - Drive `y` off Lenis's eased scroll value via getScrollY()/getLenis()
 *     (lenis-instance.ts), throttled with requestAnimationFrame — never an
 *     unthrottled scroll listener (§1, §9: battery/perf on low-mid Android).
 *   - Disable entirely on mobile: gate on matchMedia('(max-width: 768px)')
 *     (or touch capability). Scroll-linked parallax on touch stutters and is
 *     the most common source of janky mobile scroll in Framer clones (§5).
 *   - Product/screenshot images (not hero) use `scaleIn` only, no parallax.
 * ---------------------------------------------------------------------------
 */

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import {
  REVEAL_DISTANCE,
  REVEAL_DISTANCE_MOBILE,
  REVEAL_ROOT_MARGIN,
  REVEAL_THRESHOLD,
  revealVariants,
  type RevealCustom,
  type RevealVariantName,
} from "./variants";

const MOBILE_QUERY = "(max-width: 768px)";

interface RevealProps {
  children: ReactNode;
  /** which §2 primitive to use — defaults to plain fade-up */
  variant?: RevealVariantName;
  /** position within a sibling group; drives the 90ms stagger (§2), capped */
  delayIndex?: number;
  className?: string;
}

export function Reveal({ children, variant = "fadeUp", delayIndex = 0, className }: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery(MOBILE_QUERY);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const custom: RevealCustom = {
    distance: isMobile ? REVEAL_DISTANCE_MOBILE : REVEAL_DISTANCE,
    delayIndex,
    blur: !isMobile,
  };

  return (
    <motion.div
      className={className}
      custom={custom}
      variants={revealVariants[variant]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: REVEAL_THRESHOLD, margin: REVEAL_ROOT_MARGIN }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
