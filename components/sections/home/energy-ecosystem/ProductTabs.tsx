"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import ProductCard from "@/components/ui/ProductCard";
import Reveal from "@/components/ui/Reveal";
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

const SWITCH_DURATION_MS = 250;
/** Header cascade is eyebrow(0), heading(80), toggle(160) — cards pick up 80ms after that, on first entry only. */
const CARD_REVEAL_BASE_DELAY_MS = 240;
const CARD_REVEAL_STEP_MS = 80;

type PanelState = "visible" | "leaving" | "entering";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function ProductTabs({ tabs, learnMoreLabel, ariaLabel }: ProductTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [panelState, setPanelState] = useState<PanelState>("visible");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const switchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const baseId = useId();

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

  useEffect(() => () => window.clearTimeout(switchTimeoutRef.current), []);

  const selectTab = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setHasInteracted(true);

    if (prefersReducedMotion()) {
      setDisplayIndex(index);
      setPanelState("visible");
      return;
    }

    window.clearTimeout(switchTimeoutRef.current);
    setPanelState("leaving");
    switchTimeoutRef.current = setTimeout(() => {
      setDisplayIndex(index);
      setPanelState("entering");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelState("visible"));
      });
    }, SWITCH_DURATION_MS / 2);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = (activeIndex + direction + tabs.length) % tabs.length;
    selectTab(next);
    tabRefs.current[next]?.focus();
  };

  const displayTab = tabs[displayIndex];

  return (
    <div className="flex w-full flex-col items-center gap-24">
      <Reveal as="div" delay={160}>
        <div
          role="tablist"
          aria-label={ariaLabel}
          className="relative flex h-52 items-center rounded-full border border-neutral-10 bg-white p-4"
        >
          {indicator ? (
            <span
              aria-hidden="true"
              className="absolute top-4 bottom-4 left-0 rounded-full bg-neutral-1 transition-transform duration-300 ease-out motion-reduce:transition-none"
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

      <div
        role="tabpanel"
        id={`${baseId}-panel-${displayTab.id}`}
        aria-labelledby={`${baseId}-tab-${displayTab.id}`}
        tabIndex={0}
        className="w-full"
      >
        <div
          className={cn(
            "grid grid-cols-1 gap-16 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            panelState === "leaving" && "opacity-0",
            panelState === "entering" && "translate-y-8 opacity-0",
            panelState === "visible" && "translate-y-0 opacity-100"
          )}
        >
          {displayTab.products.map((product, index) => {
            const card = (
              <ProductCard
                href={product.href}
                image={product.image}
                title={product.title}
                learnMoreLabel={learnMoreLabel}
              />
            );

            if (hasInteracted) {
              return <div key={product.key}>{card}</div>;
            }

            return (
              <Reveal
                key={product.key}
                as="div"
                delay={CARD_REVEAL_BASE_DELAY_MS + index * CARD_REVEAL_STEP_MS}
              >
                {card}
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
