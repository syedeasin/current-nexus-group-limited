"use client";

import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { cn } from "@/lib/utils";
import type { EngineeringDetails as EngineeringDetailsData } from "@/lib/data/products/types";

export default function EngineeringDetails({ data }: { data: EngineeringDetailsData }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const activeTab = data.tabs[activeIndex];

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let next = activeIndex;
    if (event.key === "ArrowRight") next = (activeIndex + 1) % data.tabs.length;
    else if (event.key === "ArrowLeft") next = (activeIndex - 1 + data.tabs.length) % data.tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = data.tabs.length - 1;
    else return;

    event.preventDefault();
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="w-full bg-neutral-1 py-100">
      <Container className="flex flex-col gap-48">
        <div className="mx-auto flex max-w-636 flex-col items-center gap-12 text-center">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={data.eyebrow} />
          </Reveal>
          <Reveal as="div" delay={80}>
            <Heading level={2} size="h2" className="text-balance text-white">
              {data.heading}
            </Heading>
          </Reveal>
        </div>

        <div className="flex flex-col gap-60 lg:flex-row">
          <Reveal
            variant="scale"
            as="div"
            className="relative h-320 w-full shrink-0 md:h-420 lg:h-588 lg:w-500"
          >
            <Image
              src={data.image}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1024px) 500px, 100vw"
              className="rounded-16 object-cover"
            />
          </Reveal>

          <div className="flex w-full flex-col gap-24 lg:w-760">
            <div
              role="tablist"
              aria-label={data.heading}
              className="flex w-fit max-w-full gap-4 overflow-x-auto rounded-full border border-neutral-2 bg-white/5 p-4"
            >
              {data.tabs.map((tab, index) => {
                const active = index === activeIndex;
                return (
                  <button
                    key={tab.id}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${tab.id}`}
                    aria-selected={active}
                    aria-controls={`${baseId}-panel-${tab.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setActiveIndex(index)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      "shrink-0 rounded-full px-24 py-8 text-p2 outline-none transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-secondary",
                      active ? "bg-white font-medium text-neutral-1" : "bg-transparent font-normal text-neutral-8"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <Reveal as="div" className="w-full overflow-x-auto">
              <div
                key={activeTab.id}
                role="tabpanel"
                id={`${baseId}-panel-${activeTab.id}`}
                aria-labelledby={`${baseId}-tab-${activeTab.id}`}
                tabIndex={0}
                className="min-w-320 rounded-12 border border-neutral-2 bg-white/5 transition-opacity duration-150 ease-out motion-reduce:transition-none"
              >
                {activeTab.pending ? (
                  <div className="p-20 text-p2 text-neutral-8">
                    Content for this panel is not yet available. Flagged for Easin — the Figma file
                    has no {activeTab.label.toLowerCase()} values for this product.
                  </div>
                ) : (
                  activeTab.rows.map((row, index) => (
                    <div
                      key={row.label}
                      className={cn(
                        "flex flex-col gap-8 px-20 py-18 sm:flex-row sm:gap-48",
                        index < activeTab.rows.length - 1 && "border-b border-neutral-2"
                      )}
                    >
                      <span className="text-p2 text-neutral-9 sm:w-164 sm:shrink-0">{row.label}</span>
                      <span className="text-p2 font-medium text-white">{row.value}</span>
                    </div>
                  ))
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
