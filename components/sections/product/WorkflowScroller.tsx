"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "@/components/ui/Picture";
import Heading from "@/components/ui/Heading";
import TopHeavyText from "@/components/ui/TopHeavyText";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { WorkflowStep } from "@/lib/data/products/types";

/** Vertical scroll (px) spent per px of sideways travel: >1 slows the steps down. */
const SCROLL_PER_PX = 1.6;
/** Header height the pinned stage must clear (matches the site header). */
const HEADER_OFFSET = { base: 88, xl: 120 };
/** Breathing room between the header and the pinned stage (shrinks to the minimum on short screens). */
const PIN_GAP = 40;
const MIN_PIN_GAP = 16;
/** Space kept free at the bottom of the screen for the product page's floating action bar. */
const BAR_CLEARANCE = 120;

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * Manufacturing workflow steps.
 *
 * Desktop: the section pins while the visitor scrolls down; the steps slide
 * from right to left and each step's grey connector fills gold left → right,
 * so the line runs from step 01 to the last step as the page scrolls.
 * The stage only pins when it fits between the header and the floating
 * action bar; on a shorter desktop screen the steps show as a grid instead,
 * so no text is ever hidden. Phones, tablets and reduced motion: a normal
 * sideways swipe. Outside the pinned mode the lines are already gold.
 */
export default function WorkflowScroller({ header, steps, ariaLabel }: { header: ReactNode; steps: WorkflowStep[]; ariaLabel: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const leftFadeRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const reducedMotion = usePrefersReducedMotion();
  const [fits, setFits] = useState(true);
  const pinnedHeightRef = useRef(0);
  const pinned = isDesktop && !reducedMotion && fits;
  const gridded = isDesktop && !pinned;
  const count = steps.length;

  // Does the pinned stage fit between the header and the floating bar? The
  // height is measured while pinned and remembered, because the grid fallback
  // is taller and would otherwise never switch back.
  useEffect(() => {
    const sticky = stickyRef.current;
    if (!isDesktop || reducedMotion || !sticky) return;
    const check = () => {
      if (!sticky.classList.contains("sticky") && pinnedHeightRef.current === 0) return;
      if (sticky.classList.contains("sticky")) pinnedHeightRef.current = sticky.offsetHeight;
      const header = window.innerWidth >= 1280 ? HEADER_OFFSET.xl : HEADER_OFFSET.base;
      setFits(pinnedHeightRef.current + header + MIN_PIN_GAP + BAR_CLEARANCE <= window.innerHeight);
    };
    const observer = new ResizeObserver(check);
    observer.observe(sticky);
    window.addEventListener("resize", check);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [isDesktop, reducedMotion]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky = stickyRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!wrapper || !sticky || !viewport || !track) return;

    const fills = Array.from(track.querySelectorAll<HTMLElement>("[data-line-fill]"));
    const dots = Array.from(track.querySelectorAll<HTMLElement>("[data-line-dot]"));
    const heads = Array.from(track.querySelectorAll<HTMLElement>("[data-line-head]"));

    if (!pinned) {
      wrapper.style.height = "";
      sticky.style.top = "";
      track.style.transform = "";
      fills.forEach((fill) => (fill.style.transform = "scaleX(1)"));
      dots.forEach((dot) => (dot.dataset.on = "true"));
      heads.forEach((head) => (head.style.opacity = "0"));
      if (fadeRef.current) fadeRef.current.style.opacity = "";
      if (leftFadeRef.current) leftFadeRef.current.style.opacity = "0";
      return;
    }

    let shift = 0;
    let frame = 0;

    // Size the scroll runway: the stage's own height plus the sideways
    // travel, stretched by SCROLL_PER_PX so the steps move slowly.
    const measure = () => {
      // The viewport bleeds to the card edges (negative margin + padding), so
      // only its content box counts as visible width.
      const styles = getComputedStyle(viewport);
      const inner = viewport.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
      shift = Math.max(track.scrollWidth - inner, 0);
      const header = window.innerWidth >= 1280 ? HEADER_OFFSET.xl : HEADER_OFFSET.base;
      // Pin just under the header, leaving the bottom of the screen free for
      // the floating action bar.
      const slack = window.innerHeight - BAR_CLEARANCE - header - sticky.offsetHeight;
      sticky.style.top = `${header + Math.min(PIN_GAP, Math.max(MIN_PIN_GAP, slack))}px`;
      wrapper.style.height = `${sticky.offsetHeight + shift * SCROLL_PER_PX}px`;
    };

    const update = () => {
      frame = 0;
      const pinTop = parseFloat(sticky.style.top) || 0;
      const travel = wrapper.offsetHeight - sticky.offsetHeight;
      const progress = travel > 0 ? clamp01((pinTop - wrapper.getBoundingClientRect().top) / travel) : 0;
      track.style.transform = `translate3d(${-progress * shift}px,0,0)`;
      // Line i fills over its own slice of the progress: 01's line first,
      // then 02's, … so the gold reads as one continuous run.
      fills.forEach((fill, i) => {
        const amount = clamp01(progress * count - i);
        fill.style.transform = `scaleX(${amount})`;
        dots[i * 2].dataset.on = String(amount > 0);
        dots[i * 2 + 1].dataset.on = String(amount >= 1);
        // The glowing head rides the end of the gold, only while it's moving.
        heads[i].style.left = `${amount * 100}%`;
        heads[i].style.opacity = amount > 0 && amount < 1 ? "1" : "0";
      });
      if (fadeRef.current) fadeRef.current.style.opacity = String(1 - progress);
      if (leftFadeRef.current) leftFadeRef.current.style.opacity = String(Math.min(progress * 8, 1));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    const observer = new ResizeObserver(onResize);
    observer.observe(viewport);
    observer.observe(track);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pinned, count]);

  return (
    <div ref={wrapperRef} className="relative">
      <div ref={stickyRef} className={cn("flex flex-col gap-40", pinned && "sticky")}>
        {header}

        <div className="relative overflow-hidden rounded-20 border border-neutral-10 bg-white p-24 md:p-32 lg:px-60 lg:py-48">
          <div
            ref={viewportRef}
            role="region"
            aria-label={ariaLabel}
            tabIndex={pinned ? undefined : 0}
            className={cn(
              pinned
                ? "-mx-60 overflow-hidden px-60"
                : gridded
                  ? ""
                  : "snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            )}
          >
            <ol ref={trackRef} className={cn(gridded ? "grid grid-cols-2 gap-x-32 gap-y-48 xl:grid-cols-3" : "flex w-max gap-24 will-change-transform")}>
              {steps.map((step) => (
                <li key={step.label} className={cn("flex shrink-0 snap-start flex-col gap-40 md:gap-48", !gridded && "w-[80vw] sm:w-408")}>
                  <div className="flex items-center gap-24">
                    <span className="shrink-0 text-p4 font-semibold uppercase tracking-[1px] text-neutral-1">{step.label}</span>
                    {/* Grey rail, gold fill drawn over it left → right while scrolling. */}
                    <span className="flex flex-1 items-center" aria-hidden="true">
                      <span data-line-dot className="size-4 shrink-0 rounded-full bg-neutral-10 transition-colors duration-200 data-[on=true]:bg-secondary" />
                      <span className="relative flex h-12 flex-1 items-center">
                        <span className="relative h-[1.5px] w-full overflow-hidden bg-neutral-10">
                          <span data-line-fill className="absolute inset-0 origin-left bg-secondary" style={{ transform: "scaleX(0)" }} />
                        </span>
                        <span
                          data-line-head
                          className="absolute top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary shadow-[0_0_0_4px_rgba(213,172,93,0.25),0_0_12px_rgba(213,172,93,0.6)] transition-opacity duration-200"
                          style={{ left: "0%", opacity: 0 }}
                        />
                      </span>
                      <span data-line-dot className="size-4 shrink-0 rounded-full bg-neutral-10 transition-colors duration-200 data-[on=true]:bg-secondary" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-24">
                    <Image src="/images/manufacturing/bc-solar/manufacturing-step-icon.svg" alt="" aria-hidden="true" width={40} height={40} />
                    <div className="flex flex-col gap-12 pr-0 md:pr-48">
                      <Heading level={3} size="h5" className="tracking-[-0.5px] text-neutral-3">
                        {step.title}
                      </Heading>
                      <TopHeavyText className="text-p3 text-neutral-3">{step.body}</TopHeavyText>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div
            ref={leftFadeRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-60 lg:block"
            style={{ background: "linear-gradient(to left, rgba(255,255,255,0) 0%, #FFFFFF 100%)", opacity: 0 }}
          />
          <div
            ref={fadeRef}
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-y-0 right-0 hidden w-126", !gridded && "md:block")}
            style={{ background: "linear-gradient(to right, rgba(255,255,255,0) 0%, #FFFFFF 100%)" }}
          />
        </div>
      </div>
    </div>
  );
}
