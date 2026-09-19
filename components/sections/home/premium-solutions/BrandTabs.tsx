"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Heading from "@/components/ui/Heading";
import ProductCard from "@/components/ui/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cascade } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

interface BrandTabProduct {
  key: string;
  title: string;
  image: string;
  href: string;
}

interface BrandTabItem {
  id: string;
  label: string;
  title: string;
  products: BrandTabProduct[];
}

interface BrandTabsProps {
  brands: BrandTabItem[];
  railAriaLabel: string;
  viewAllLabel: string;
  viewAllHref: string;
}

/** Matches the lg breakpoint: the rail stays a vertical column through 1024, per spec, and only collapses to a horizontal pill row below it. */
const DESKTOP_QUERY = "(min-width: 1024px)";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function BrandTabs({
  brands,
  railAriaLabel,
  viewAllLabel,
  viewAllHref,
}: BrandTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDesktop = useMediaQuery(DESKTOP_QUERY, true);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  useEffect(() => {
    if (isDesktop) return;
    const node = tabRefs.current[activeIndex];
    node?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex, isDesktop]);

  // Every brand panel stays mounted (see the stacked grid below), so switching
  // is a pure crossfade — no unmount, no image reload, no blank gap.
  const selectTab = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const nextKey = isDesktop ? "ArrowDown" : "ArrowRight";
    const prevKey = isDesktop ? "ArrowUp" : "ArrowLeft";

    let next = activeIndex;
    if (event.key === nextKey) next = activeIndex + 1;
    else if (event.key === prevKey) next = activeIndex - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = brands.length - 1;
    else return;

    event.preventDefault();
    next = (next + brands.length) % brands.length;
    selectTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="flex w-full flex-col items-start gap-24 lg:flex-row lg:items-start lg:gap-80">
      <Reveal
        as="div"
        delay={cascade(2)}
        className="w-full shrink-0 lg:w-272"
      >
        <div
          role="tablist"
          aria-label={railAriaLabel}
          aria-orientation={isDesktop ? "vertical" : "horizontal"}
          className="brand-rail-scroll flex snap-x snap-mandatory gap-8 overflow-x-auto pr-20 lg:w-272 lg:flex-col lg:overflow-visible lg:snap-none lg:pr-0"
        >
          {brands.map((brand, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={brand.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${brand.id}`}
                aria-selected={active}
                aria-controls={`${baseId}-panel-${brand.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => selectTab(index)}
                onMouseEnter={() => selectTab(index)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "relative flex w-fit min-h-44 shrink-0 snap-start items-center justify-center rounded-8 border-[1.5px] px-20 py-14 text-p2 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none lg:w-full",
                  active
                    ? "border-secondary bg-secondary font-medium text-neutral-1"
                    : "border-transparent bg-white/5 font-normal text-neutral-9 hover:bg-white/10 hover:text-white"
                )}
              >
                {brand.label}
                <ArrowRight
                  size={20}
                  className={cn(
                    "absolute right-20 top-1/2 hidden -translate-y-1/2 transition-all duration-200 ease-out lg:block",
                    active ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0"
                  )}
                />
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal as="div" delay={cascade(2)} className="w-full min-w-0 flex-1">
        <div className="flex w-full flex-col rounded-16 bg-white/5 p-24 min-[480px]:p-32 lg:p-40">
          {/* Stacked panels: every brand shares one grid cell (col/row start 1), so
              the container always sizes to the tallest panel and the height never
              jumps. Only opacity + transform animate — never height or border. */}
          <div className="grid w-full">
            {brands.map((brand, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  key={brand.id}
                  role="tabpanel"
                  id={`${baseId}-panel-${brand.id}`}
                  aria-labelledby={`${baseId}-tab-${brand.id}`}
                  aria-hidden={!isActive}
                  tabIndex={isActive ? 0 : -1}
                  inert={!isActive}
                  className={cn(
                    "col-start-1 row-start-1 flex w-full flex-col gap-24 transition-[opacity,transform] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none",
                    isActive
                      ? "z-10 translate-y-0 opacity-100 duration-[250ms]"
                      : "z-0 translate-y-[6px] opacity-0 duration-[200ms] pointer-events-none"
                  )}
                >
                  <div className="flex flex-col items-start justify-between gap-8 min-[400px]:flex-row min-[400px]:items-end">
                    <Heading level={3} size="h4" className="text-white">
                      {brand.title}
                    </Heading>
                    <Link
                      href={viewAllHref}
                      className="group inline-flex shrink-0 items-center gap-4 text-btn-sm font-semibold tracking-[-0.5px] text-neutral-8 outline-none transition-colors duration-200 ease-out hover:text-secondary focus-visible:text-secondary focus-visible:ring-2 focus-visible:ring-secondary"
                    >
                      <span>{viewAllLabel}</span>
                      <ChevronRight
                        size={14}
                        className="shrink-0 -translate-x-[4px] opacity-0 transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-none"
                      />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-32 min-[480px]:grid-cols-2 min-[480px]:gap-24 lg:grid-cols-3 lg:gap-24">
                    {brand.products.map((product) => (
                      <ProductCard
                        key={product.key}
                        href={product.href}
                        image={product.image}
                        title={product.title}
                        imageAspectClassName="aspect-[280/332]"
                        imageBgClassName="bg-neutral-2"
                        imageBorderClassName="border-[1.5px] border-neutral-3"
                        imageSizes="(min-width: 1024px) 280px, (min-width: 580px) 45vw, 100vw"
                        reserveTwoLineTitle
                        compactInfo
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
