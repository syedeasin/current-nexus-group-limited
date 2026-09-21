"use client";

import { useEffect, useRef, useState } from "react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { EnergyGainSection } from "@/lib/data/products/types";

const GROW_DURATION_MS = 500;
const BAR_STEP_MS = 80;
const PLOT_HEIGHT_PX = 480;

export default function EnergyGainChart({ data }: { data: EnergyGainSection }) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const grown = reducedMotion || visible;
  const yAxisMax = Math.max(...data.yAxisLabels, 1);

  useEffect(() => {
    const node = chartRef.current;
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

  return (
    <section className="w-full bg-white py-80">
      <Container className="flex flex-col gap-48">
        <div className="mx-auto flex max-w-824 flex-col items-center gap-8 text-center">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={data.eyebrow} />
          </Reveal>
          <TextReveal delay={80}>
            <Heading level={2} size="h2" className="text-balance">
              {data.heading}
            </Heading>
          </TextReveal>
        </div>

        <Reveal as="div" variant="scale" delay={160}>
          <div ref={chartRef} className="w-full rounded-16 bg-surface-2 p-24 md:p-40">
            {/* Desktop / tablet: vertical bars, Y-axis gridlines on the left */}
            <div className="hidden md:flex md:gap-24" style={{ overflow: "visible" }}>
              <div className="flex shrink-0 flex-col justify-between text-right text-p4 text-neutral-1" style={{ height: PLOT_HEIGHT_PX }}>
                {data.yAxisLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>

              <div
                className="relative flex flex-1 items-end gap-40"
                style={{
                  height: PLOT_HEIGHT_PX,
                  overflow: "visible",
                  backgroundImage:
                    "repeating-linear-gradient(to top, rgba(231,231,232,1) 0, rgba(231,231,232,1) 1.5px, transparent 1.5px, transparent 20%)",
                }}
              >
                {data.bars.map((bar, index) => {
                  const heightPx = (Math.abs(bar.value) / yAxisMax) * PLOT_HEIGHT_PX;
                  const isBaseline = index === 0;
                  return (
                    <div key={bar.caption} className="flex h-full flex-1 flex-col items-center justify-end" style={{ overflow: "visible" }}>
                      {!isBaseline ? (
                        <span
                          className={cn(
                            // Figma value text (node 2254:9518 etc.) is Paragraph/Medium P2 (20/32).
                            "mb-8 text-p2 font-medium text-neutral-1 transition-opacity duration-300",
                            grown ? "opacity-100" : "opacity-0"
                          )}
                          style={{ transitionDelay: `${GROW_DURATION_MS + index * BAR_STEP_MS}ms` }}
                        >
                          {bar.displayValue}
                        </span>
                      ) : null}
                      <div
                        className={cn(
                          "flex w-full flex-col items-center justify-start pt-8 transition-[height] ease-out motion-reduce:transition-none",
                          isBaseline ? "rounded-8 bg-chart-perc" : "rounded-4 bg-chart-hjt"
                        )}
                        style={{
                          height: grown ? `${Math.max(heightPx, 4)}px` : "0px",
                          transitionDuration: `${GROW_DURATION_MS}ms`,
                          transitionDelay: `${index * BAR_STEP_MS}ms`,
                        }}
                      >
                        {isBaseline ? (
                          <span className="text-p2 font-medium text-white">{bar.displayValue}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hidden md:mt-16 md:flex md:gap-24 md:pl-56">
              {data.bars.map((bar) => (
                <span key={bar.caption} className="flex-1 text-center text-p4 text-neutral-1">
                  {bar.caption}
                </span>
              ))}
            </div>

            {/* Mobile: horizontal bars, label to the right — four thin vertical bars are unreadable at 360px */}
            <div className="flex flex-col gap-20 md:hidden">
              {data.bars.map((bar, index) => {
                const widthPercent = (Math.abs(bar.value) / yAxisMax) * 100;
                const isBaseline = index === 0;
                return (
                  <div key={bar.caption} className="flex flex-col gap-6">
                    <div className="flex h-40 w-full items-center rounded-8 bg-neutral-11">
                      <div
                        className={cn(
                          "flex h-full items-center justify-end rounded-8 pr-8 transition-[width] ease-out motion-reduce:transition-none",
                          isBaseline ? "bg-chart-perc" : "bg-chart-hjt"
                        )}
                        style={{
                          width: grown ? `${Math.max(widthPercent, 8)}%` : "0%",
                          transitionDuration: `${GROW_DURATION_MS}ms`,
                          transitionDelay: `${index * BAR_STEP_MS}ms`,
                        }}
                      >
                        <span className="text-p4 font-medium text-white">{bar.displayValue}</span>
                      </div>
                    </div>
                    <span className="text-p4 text-neutral-1">{bar.caption}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
