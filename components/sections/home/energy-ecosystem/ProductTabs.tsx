"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import ProductCard from "@/components/ui/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cascade, stagger } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

interface ProductTabProduct {
  key: string;
  title: string;
  image: string;
  href: string;
}

interface ProductTabItem {
  id: string;
  label: string;
  products: ProductTabProduct[];
}

interface ProductTabsProps {
  tabs: ProductTabItem[];
  learnMoreLabel: string;
  ariaLabel: string;
}

/** Header cascade is eyebrow(0), heading(1), toggle(2) — cards pick up from (3). */
const CARD_REVEAL_BASE_DELAY_MS = cascade(3);

export default function ProductTabs({ tabs, learnMoreLabel, ariaLabel }: ProductTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tablistRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const reducedMotion = usePrefersReducedMotion();

  const measureIndicator = (index: number) => {
    const node = tabRefs.current[index];
    if (node) setIndicator({ left: node.offsetLeft, width: node.offsetWidth });
  };

  useLayoutEffect(() => {
    measureIndicator(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    const onResize = () => measureIndicator(activeIndex);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex]);

  // Switzer loads after the first measure, shifting label widths — re-measure
  // once web fonts are actually ready so the indicator doesn't sit under stale
  // (pre-font) tab metrics.
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    document.fonts.ready.then(() => measureIndicator(activeIndex));
  }, [activeIndex]);

  // Any tablist size change (orientation, container reflow, zoom) can shift
  // tab metrics without firing a window resize — keep the indicator in sync.
  useEffect(() => {
    const node = tablistRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measureIndicator(activeIndex));
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeIndex]);

  // Every panel stays mounted (see the stacked grid below), so switching is a
  // pure crossfade — no unmount, no image reload, no blank gap.
  const selectTab = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setHasInteracted(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = (activeIndex + direction + tabs.length) % tabs.length;
    selectTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="flex w-full flex-col items-center gap-24">
      <Reveal as="div" delay={cascade(2)}>
        <div
          ref={tablistRef}
          role="tablist"
          aria-label={ariaLabel}
          className="relative flex h-52 max-w-full shrink-0 flex-nowrap items-center rounded-full border border-neutral-10 bg-white p-4"
        >
          {indicator ? (
            <span
              aria-hidden="true"
              className="absolute top-4 bottom-4 left-0 rounded-full bg-neutral-1 transition-transform duration-[250ms] ease-out motion-reduce:transition-none"
              style={{
                width: indicator.width,
                transform: `translateX(${indicator.left}px)`,
              }}
            />
          ) : null}
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={index === activeIndex}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => selectTab(index)}
              onKeyDown={handleKeyDown}
              className={cn(
                "relative z-10 flex h-44 items-center justify-center whitespace-nowrap rounded-full px-16 text-p3 font-medium uppercase transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary min-[400px]:px-24",
                index === activeIndex ? "text-white" : "text-neutral-4"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Stacked panels: all tabs share one grid cell (col/row start 1), so the
          wrapper always sizes to the tallest panel and the height never jumps.
          Only opacity + transform animate — never height or border. */}
      <div className="grid w-full">
        {tabs.map((tab, tabIndex) => {
          const isActive = tabIndex === activeIndex;

          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`${baseId}-panel-${tab.id}`}
              aria-labelledby={`${baseId}-tab-${tab.id}`}
              aria-hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              inert={!isActive}
              className={cn(
                "col-start-1 row-start-1 w-full transition-[opacity,transform] ease-out motion-reduce:transition-none",
                isActive
                  ? "z-10 opacity-100 duration-[250ms]"
                  : "z-0 pointer-events-none opacity-0 duration-[200ms]",
                !reducedMotion && !isActive && "translate-y-[6px]"
              )}
            >
              <div className="grid grid-cols-1 gap-32 min-[480px]:grid-cols-2 min-[480px]:gap-16 lg:grid-cols-3 xl:grid-cols-4">
                {tab.products.map((product, index) => {
                  const card = (
                    <ProductCard
                      href={product.href}
                      image={product.image}
                      title={product.title}
                      learnMoreLabel={learnMoreLabel}
                    />
                  );

                  // First load only: stagger-reveal the active panel's cards.
                  if (!hasInteracted && isActive) {
                    return (
                      <Reveal
                        key={product.key}
                        as="div"
                        delay={stagger(index, CARD_REVEAL_BASE_DELAY_MS)}
                      >
                        {card}
                      </Reveal>
                    );
                  }

                  return <div key={product.key}>{card}</div>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
