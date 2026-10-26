"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { cn } from "@/lib/utils";
import type { PortfolioCard } from "@/components/brands/HubSections";

export interface PortfolioTab {
  id: string;
  label: string;
  cards: PortfolioCard[];
}

const PILL =
  "inline-flex h-36 items-center gap-6 whitespace-nowrap rounded-full border-[1.5px] border-neutral-10 bg-white px-14 text-p4 font-semibold sm:h-40 sm:px-18 text-neutral-1 transition-colors duration-200 group-hover:border-secondary group-hover:bg-secondary";

/**
 * Brand wall with the categories in one row (client revision 1022): All
 * brands · Solar modules · Solar inverters · Battery storage. The row scrolls
 * sideways on small screens, so every category is one swipe away.
 */
export default function PortfolioTabs({ tabs, viewLabel }: { tabs: PortfolioTab[]; viewLabel: string }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    setActive(index);
    tabRefs.current[index]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next = active;
    if (event.key === "ArrowRight") next = (active + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (active - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  const current = tabs[active];

  return (
    <div className="flex flex-col gap-32">
      <div className="-mx-20 overflow-x-auto px-20 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label="Brand categories"
          className="mx-auto flex w-max gap-6 rounded-full border border-neutral-10 bg-surface-2 p-6"
        >
          {tabs.map((tab, index) => {
            const selected = index === active;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={onKeyDown}
                className={cn(
                  "flex h-44 min-w-[176px] shrink-0 items-center justify-between gap-16 whitespace-nowrap rounded-full pr-10 pl-18 sm:min-w-[200px] sm:pl-24 text-p4 font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none",
                  selected ? "bg-neutral-1 text-white" : "text-neutral-3 hover:bg-white hover:text-neutral-1"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "flex size-24 shrink-0 items-center justify-center rounded-full text-[12px] leading-none tabular-nums",
                    selected ? "bg-secondary text-neutral-1" : "bg-neutral-10 text-neutral-4"
                  )}
                >
                  {tab.cards.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ul
        key={current.id}
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${current.id}`}
        className="grid animate-[fade-up_300ms_ease-out] grid-cols-2 gap-12 motion-reduce:animate-none sm:gap-16 lg:grid-cols-4 lg:gap-24"
      >
        {current.cards.map((card) => (
          <li key={card.key} className="flex">
            <Link
              href={card.href}
              className="group relative flex w-full flex-col items-center gap-16 rounded-16 border-[1.5px] border-transparent bg-surface-2 px-12 pt-28 pb-16 text-center transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-4 hover:border-secondary hover:bg-white hover:shadow-[0_16px_40px_rgba(10,13,27,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-24 sm:pt-40 sm:pb-24"
            >
              <span className="mb-8 flex h-40 w-full items-center justify-center sm:mb-16 sm:h-48">
                {card.logo ? (
                  <Image
                    src={card.logo}
                    alt={card.name}
                    width={180}
                    height={40}
                    className="h-20 w-auto max-w-[80%] object-contain opacity-70 grayscale transition-[filter,opacity] duration-200 group-hover:opacity-100 group-hover:grayscale-0 sm:h-28 sm:max-w-[64%]"
                  />
                ) : (
                  <span className="text-h4 font-semibold text-neutral-1">{card.name}</span>
                )}
              </span>
              <span className="flex flex-col gap-4">
                <span className="text-p3 font-semibold text-neutral-1 sm:text-h6">{card.name}</span>
                {card.summary ? (
                  <span className="text-p4 text-neutral-4">{card.summary}</span>
                ) : null}
              </span>
              <span className={cn(PILL, "mt-auto")}>
                {viewLabel}
                <ChevronRight size={12} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
