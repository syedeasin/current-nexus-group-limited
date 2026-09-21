"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { observeOnce } from "@/lib/motion/observer";
import { cn } from "@/lib/utils";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type RevealDirection = "up" | "down" | "left" | "right";

interface ImageRevealProps {
  children: ReactNode;
  /** Edge the cover retreats toward. `up` (default) uncovers from the bottom. */
  from?: RevealDirection;
  /** ms before the reveal starts. Use the helpers in `lib/motion/timing.ts`. */
  delay?: number;
  /** Class for the clipping wrapper — put the aspect ratio and radius here. */
  className?: string;
}

/**
 * A photograph is *uncovered*, then settles.
 *
 * Two things move together: the frame's `clip-path` opens from one edge, and
 * the picture inside starts marginally over-scaled and eases back to 1. The
 * over-scale is what stops the reveal reading as a wipe — the image is already
 * alive when the mask clears it, the way a camera settling on a subject looks.
 * Both are compositor-only properties; nothing here touches layout.
 *
 * Use it for editorial photography that carries a section. Cards in a grid stay
 * on `<Reveal variant="scale">` — twelve simultaneous clip-path animations is
 * noise, and a card's photo is not the thing being introduced.
 *
 * ```tsx
 * <ImageReveal className="relative aspect-[630/476] overflow-hidden rounded-16">
 *   <Image src={...} alt={...} fill className="object-cover" />
 * </ImageReveal>
 * ```
 *
 * @see docs/ANIMATION-SYSTEM.md
 */
export default function ImageReveal({
  children,
  from = "up",
  delay = 0,
  className,
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;

    setArmed(true);
    return observeOnce(node, () => setVisible(true));
  }, [reducedMotion]);

  const hidden = armed && !visible;

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      {/* Separate layer for the mask: `clip-path: inset()` clips to a plain
          rectangle and would square off the wrapper's border-radius if it sat
          on the same element. Keeping the radius (and its overflow-hidden) on
          the outer box and the animated inset here preserves both. */}
      <div
        className="relative h-full w-full"
        style={{
          clipPath: hidden ? CLOSED_CLIP[from] : OPEN_CLIP,
          transition: hidden
            ? "none"
            : `clip-path var(--dur-image-reveal) var(--ease-mask) ${delay}ms`,
        }}
      >
        <div
          className="relative h-full w-full transform-gpu"
          style={{
            transform: hidden ? "scale(var(--image-reveal-scale))" : "scale(1)",
            transition: hidden
              ? "none"
              : `transform var(--dur-image-reveal) var(--ease-mask) ${delay}ms`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const OPEN_CLIP = "inset(0% 0% 0% 0%)";

/** `inset()` rather than a polygon so the animation interpolates cleanly. */
const CLOSED_CLIP: Record<RevealDirection, string> = {
  up: "inset(100% 0% 0% 0%)",
  down: "inset(0% 0% 100% 0%)",
  left: "inset(0% 0% 0% 100%)",
  right: "inset(0% 100% 0% 0%)",
};
