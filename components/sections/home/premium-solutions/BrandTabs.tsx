"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
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

const SWITCH_DURATION_MS = 250;
const CARD_STAGGER_STEP_MS = 60;
/** Matches the lg breakpoint: the rail stays a vertical column through 1024, per spec, and only collapses to a horizontal pill row below it. */
const DESKTOP_QUERY = "(min-width: 1024px)";

type PanelState = "visible" | "leaving" | "entering";

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
  const [displayIndex, setDisplayIndex] = useState(0);
  const [panelState, setPanelState] = useState<PanelState>("visible");
  const [isDesktop, setIsDesktop] = useState(true);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const switchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const baseId = useId();

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    setIsDesktop(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => () => window.clearTimeout(switchTimeoutRef.current), []);

  useEffect(() => {
    if (isDesktop) return;
    const node = tabRefs.current[activeIndex];
    node?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex, isDesktop]);

  const selectTab = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);

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

  const displayBrand = brands[displayIndex];

  return (
    <div className="flex w-full flex-col items-start gap-24 lg:flex-row lg:items-start">
      <Reveal
        as="div"
        delay={160}
        className="w-full shrink-0 lg:w-272"
      >
        <div
          role="tablist"
          aria-label={railAriaLabel}
          aria-orientation={isDesktop ? "vertical" : "horizontal"}
          className="brand-rail-scroll flex snap-x snap-mandatory gap-8 overflow-x-auto lg:w-272 lg:flex-col lg:overflow-visible lg:snap-none"
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
                onKeyDown={handleKeyDown}
                className={cn(
                  "relative flex w-fit shrink-0 snap-start items-center justify-center rounded-8 px-20 py-14 text-p2 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary lg:w-full",
                  active
                    ? "bg-secondary font-medium text-neutral-1"
                    : "bg-white/5 font-normal text-neutral-9 hover:bg-white/10 hover:text-white"
                )}
              >
                {brand.label}
                <ArrowRight
                  size={20}
                  className={cn(
                    "absolute right-20 top-1/2 -translate-y-1/2 transition-all duration-200 ease-out",
                    active ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0"
                  )}
                />
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal as="div" delay={160} className="w-full min-w-0 flex-1">
        <div className="flex w-full flex-col gap-24 rounded-16 bg-white/5 p-24 min-[480px]:p-32 lg:p-40">
          <div className="flex flex-col items-start justify-between gap-8 min-[400px]:flex-row min-[400px]:items-end">
            <Heading level={3} size="h4" className="text-white">
              {displayBrand.title}
            </Heading>
            <Link
              href={viewAllHref}
              className="group flex shrink-0 items-center gap-4 text-p3 font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <span className="underline underline-offset-2">{viewAllLabel}</span>
              <ChevronRight
                size={14}
                className="transition-transform duration-200 ease-out group-hover:translate-x-4 group-focus-visible:translate-x-4"
              />
            </Link>
          </div>

          <div
            role="tabpanel"
            id={`${baseId}-panel-${displayBrand.id}`}
            aria-labelledby={`${baseId}-tab-${displayBrand.id}`}
            tabIndex={0}
            className="w-full"
          >
            <div
              className={cn(
                "grid grid-cols-1 gap-16 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none min-[480px]:grid-cols-2 lg:grid-cols-3",
                panelState === "leaving" && "opacity-0",
                panelState === "entering" && "translate-y-8 opacity-0",
                panelState === "visible" && "translate-y-0 opacity-100"
              )}
            >
              {displayBrand.products.map((product, index) => (
                <div
                  key={product.key}
                  className="transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none motion-reduce:delay-0"
                  style={{
                    transitionDelay:
                      panelState === "entering" ? `${index * CARD_STAGGER_STEP_MS}ms` : "0ms",
                  }}
                >
                  <ProductCard
                    href={product.href}
                    image={product.image}
                    title={product.title}
                    imageAspectClassName="aspect-[280/332]"
                    imageBgClassName="bg-neutral-2"
                    imageBorderClassName="border-[1.5px] border-neutral-3"
                    imageSizes="(min-width: 1024px) 30vw, (min-width: 480px) 45vw, 100vw"
                    reserveTwoLineTitle
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
