"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { observeOnce } from "@/lib/motion/observer";
import { cn } from "@/lib/utils";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Mirrors `--mask-stagger` in globals.css, including its phone override. */
const MASK_STAGGER_MS = 70;
const MASK_STAGGER_PHONE_MS = 45;
const PHONE_QUERY = "(max-width: 768px)";

interface TextRevealProps {
  /** A heading (or any element) whose text should rise out of its own line box. */
  children: ReactNode;
  /** ms before the first word starts. Use the helpers in `lib/motion/timing.ts`. */
  delay?: number;
  className?: string;
}

/**
 * The site's display-type entrance: every word starts below its own line,
 * masked by that line, and rises into place one after another.
 *
 * This is the only entrance that splits text. It is reserved for display
 * typography — hero H1s and major section H2s — because it is the slowest and
 * loudest motion in the system; running it on body copy is what makes a site
 * read as "animated" rather than as considered. Paragraphs, cards and controls
 * use `<Reveal>`.
 *
 * Usage is a one-word swap at the call site:
 *
 * ```tsx
 * <TextReveal delay={cascade(1)}>
 *   <Heading level={2} size="h2">{title}</Heading>
 * </TextReveal>
 * ```
 *
 * Why wrap rather than take a `text` prop: the children arrive as a rendered
 * element tree, so the heading keeps its own tag, size classes and any rich
 * formatting (`<strong>`, `<br className="hidden md:block">`) while only the
 * bare text nodes get split. Splitting into inline-block *words* rather than
 * lines keeps native wrapping intact — no measured line breaks to go stale on
 * resize, and no layout shift.
 *
 * Timing, easing and travel come from the motion tokens in globals.css
 * (`--dur-mask`, `--ease-mask`, `--mask-stagger`, `--mask-travel`), which
 * already tighten on phones.
 *
 * @see docs/ANIMATION-SYSTEM.md
 */
export default function TextReveal({ children, delay = 0, className }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  // The one number CSS cannot supply: a per-word transition-delay has to be
  // index * stagger, and calc() on a custom property cannot multiply into a
  // delay list. So the token is mirrored here, gated on the same 768px
  // breakpoint globals.css uses — one matchMedia subscription per heading,
  // not per word.
  const isPhone = useMediaQuery(PHONE_QUERY);
  const staggerMs = isPhone ? MASK_STAGGER_PHONE_MS : MASK_STAGGER_MS;
  // Same arm-then-reveal dance as <Reveal>: the server renders the finished
  // state, so a reader without JS (or before hydration) sees the headline
  // rather than an empty box. Arming happens before the first paint.
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;

    setArmed(true);
    return observeOnce(node, () => setVisible(true));
  }, [reducedMotion]);

  const hidden = armed && !visible;
  const counter = { index: 0 };

  return (
    <span ref={ref} className={cn("block", className)}>
      {splitWords(children, counter, hidden, delay, staggerMs)}
    </span>
  );
}

interface Counter {
  index: number;
}

/**
 * Walks the rendered child tree and replaces bare text with masked word spans,
 * leaving every element (and its props) untouched.
 */
function splitWords(
  node: ReactNode,
  counter: Counter,
  hidden: boolean,
  delay: number,
  staggerMs: number
): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") return null;

  if (typeof node === "number") {
    return wrapWord(String(node), counter, hidden, delay, staggerMs);
  }

  if (typeof node === "string") {
    const pieces: ReactNode[] = [];
    // Explicit newlines in translation strings become real line breaks.
    node.split("\n").forEach((line, lineIndex) => {
      if (lineIndex > 0) pieces.push(<br key={`br-${lineIndex}-${counter.index}`} />);
      const words = line.split(/\s+/).filter(Boolean);
      words.forEach((word, wordIndex) => {
        // A plain space between the inline-blocks, so the browser still wraps
        // and justifies the line exactly as it would with unsplit text.
        if (wordIndex > 0) pieces.push(" ");
        pieces.push(wrapWord(word, counter, hidden, delay, staggerMs));
      });
    });
    return pieces;
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <React.Fragment key={index}>
        {splitWords(child, counter, hidden, delay, staggerMs)}
      </React.Fragment>
    ));
  }

  if (React.isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    // <br> carries responsive classes in a few headings — pass it through whole.
    if (element.type === "br") return element;

    const children = element.props.children;
    if (children == null) return element;

    return React.cloneElement(element, {}, splitWords(children, counter, hidden, delay, staggerMs));
  }

  return node;
}

function wrapWord(
  word: string,
  counter: Counter,
  hidden: boolean,
  delay: number,
  staggerMs: number
): ReactNode {
  const index = counter.index++;

  return (
    <span
      key={`word-${index}`}
      // The mask. `clip` rather than `hidden` so the span can never become a
      // scroll container, and the vertical padding/negative margin pair gives
      // descenders (g, y, p) room without moving the baseline.
      className="inline-flex overflow-clip py-[0.14em] my-[-0.14em] align-bottom"
    >
      <span
        // `will-change` only while the word still has somewhere to go. A
        // permanent compositor layer per word — a hundred-plus on a long page —
        // costs more than it saves once the heading has settled.
        className={cn("inline-block", hidden && "will-change-transform")}
        style={{
          transform: hidden ? "translateY(var(--mask-travel))" : "translateY(0)",
          transition: hidden
            ? "none"
            : `transform var(--dur-mask) var(--ease-mask) ${delay + index * staggerMs}ms`,
        }}
      >
        {word}
      </span>
    </span>
  );
}
