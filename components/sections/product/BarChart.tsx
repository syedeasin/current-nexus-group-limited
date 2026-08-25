"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export interface BarChartBar {
  label: string;
  value: number;
  colorClassName: string;
}

interface BarChartProps {
  bars: BarChartBar[];
  /** "percent" appends a % sign to each value label; "raw" (default) shows the number as-is. A function prop can't cross the server/client boundary from a server-rendered caller. */
  valueFormat?: "raw" | "percent";
  plotHeightPx?: number;
  className?: string;
}

const GROW_DURATION_MS = 500;
const BAR_STEP_MS = 80;

/**
 * Static CSS bar chart — no chart library. Heights are computed proportionally
 * from the values (capped at the plot height) so the chart is honest even
 * when the source values are illustrative. Grows from 0 on first scroll into
 * view, mirroring Reveal's IntersectionObserver pattern; skips the animation
 * under prefers-reduced-motion.
 */
export default function BarChart({ bars, valueFormat = "raw", plotHeightPx = 240, className }: BarChartProps) {
  const formatValue = (value: number) => (valueFormat === "percent" ? `${value}%` : `${value}`);
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const grown = reducedMotion || visible;

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const maxAbs = Math.max(...bars.map((bar) => Math.abs(bar.value)), 1);

  return (
    <div ref={ref} className={cn("flex w-full flex-col", className)}>
      <div
        className="relative flex w-full items-end gap-12"
        style={{
          height: plotHeightPx,
          backgroundImage:
            "repeating-linear-gradient(to top, rgba(59,61,73,0.12) 0, rgba(59,61,73,0.12) 1px, transparent 1px, transparent 25%)",
        }}
      >
        {bars.map((bar, index) => {
          const heightPx = (Math.abs(bar.value) / maxAbs) * plotHeightPx;
          return (
            <div key={bar.label} className="flex h-full flex-1 flex-col justify-end">
              <div
                className={cn(
                  "flex w-full flex-col items-center justify-start rounded-8 p-8 transition-[height] ease-out motion-reduce:transition-none",
                  bar.colorClassName
                )}
                style={{
                  height: grown ? `${Math.max(heightPx, 28)}px` : "0px",
                  transitionDuration: `${GROW_DURATION_MS}ms`,
                  transitionDelay: `${index * BAR_STEP_MS}ms`,
                }}
              >
                <span className="text-p3 font-medium text-white">{formatValue(bar.value)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-12 flex w-full gap-12">
        {bars.map((bar) => (
          <span key={bar.label} className="flex-1 text-center text-p4 text-neutral-1">
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
}
