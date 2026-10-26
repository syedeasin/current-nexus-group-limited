"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** How many more words the first line should carry than the last. */
const WORD_LEAD = { min: 2, max: 3 };
/** Width-ratio tie-breaker (last line ÷ first line), e.g. 285px / 230px. */
const TARGET_RATIO = 0.8;
const STEP_PX = 2;

interface Layout {
  width: number;
  words: number[];
  ratio: number;
}

/** Words per rendered line and the first/last line widths, for a single text node. */
function measure(el: HTMLElement): { words: number[]; ratio: number } {
  const node = el.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return { words: [], ratio: 1 };
  const text = node.textContent ?? "";
  const range = document.createRange();
  const rows = new Map<number, { count: number; left: number; right: number }>();
  const pattern = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    range.setStart(node, match.index);
    range.setEnd(node, match.index + match[0].length);
    const rect = range.getBoundingClientRect();
    const top = Math.round(rect.top);
    const row = rows.get(top);
    if (row) {
      row.count += 1;
      row.right = Math.max(row.right, rect.right);
    } else rows.set(top, { count: 1, left: rect.left, right: rect.right });
  }
  const ordered = [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, row]) => row);
  if (ordered.length === 0) return { words: [], ratio: 1 };
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  return { words: ordered.map((row) => row.count), ratio: (last.right - last.left) / (first.right - first.left) };
}

/**
 * A paragraph whose lines break "top heavy" (the house wrapping rule): the
 * first line always carries 2–3 more words than the last — never equal lines
 * (text-balance) and never a lone word underneath (greedy wrapping).
 *
 * It tries narrower max-widths (the natural line count, or one more line if
 * nothing fits) and keeps the widest one whose first line leads the last by 2–3 words (falling back to
 * the closest lead, then to a last/first width ratio near TARGET_RATIO).
 * Re-runs when the space around it changes size.
 */
export default function TopHeavyText({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const fit = () => {
      el.style.maxWidth = "";
      const full = el.getBoundingClientRect().width;
      const lineCount = measure(el).words.length;
      if (lineCount < 2) return;

      const layouts: Layout[] = [];
      for (let width = full; width >= full * 0.5; width -= STEP_PX) {
        el.style.maxWidth = `${width}px`;
        const { words, ratio } = measure(el);
        // One extra line is allowed when no layout at the natural count fits the rule.
        if (words.length > lineCount + 1) break;
        const key = words.join();
        if (!layouts.some((layout) => layout.words.join() === key)) layouts.push({ width, words, ratio });
      }

      const leadMiss = (layout: Layout) => {
        const lead = layout.words[0] - layout.words[layout.words.length - 1];
        return lead < WORD_LEAD.min ? WORD_LEAD.min - lead : lead > WORD_LEAD.max ? lead - WORD_LEAD.max : 0;
      };
      const best = [...layouts].sort(
        (a, b) =>
          leadMiss(a) - leadMiss(b) ||
          a.words.length - b.words.length ||
          Math.abs(a.ratio - TARGET_RATIO) - Math.abs(b.ratio - TARGET_RATIO)
      )[0];
      el.style.maxWidth = best && best.width < full ? `${Math.ceil(best.width)}px` : "";
    };

    fit();
    let width = parent.clientWidth;
    const observer = new ResizeObserver(() => {
      if (parent.clientWidth === width) return;
      width = parent.clientWidth;
      fit();
    });
    observer.observe(parent);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => observer.disconnect();
  }, [children]);

  return (
    <p ref={ref} className={cn("text-wrap", className)}>
      {children}
    </p>
  );
}
