"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import Image from "@/components/ui/Picture";
import Reveal from "@/components/ui/Reveal";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { cascade, stagger } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

export interface BuyerOption {
  id: string;
  label: string;
  title: string;
  description: string;
  image: string;
  linkLabel: string;
  linkHref: string;
}

function BuyerCopy({ buyer }: { buyer: BuyerOption }) {
  return (
    <>
      <div className="flex flex-col gap-12">
        <h3 className="text-h5 font-semibold text-neutral-1">{buyer.title}</h3>
        <p className="text-p3 text-neutral-4">{buyer.description}</p>
      </div>
      {buyer.linkLabel && buyer.linkHref ? (
        <Button href={buyer.linkHref} size="lg" className="w-full whitespace-nowrap min-[481px]:w-fit">
          {buyer.linkLabel}
          <ArrowRight size={BUTTON_ICON_SIZE} />
        </Button>
      ) : null}
    </>
  );
}

function BuyerPhoto({ image, className }: { image: string; className?: string }) {
  if (!image) return null;
  return (
    <div className={cn("relative w-full overflow-hidden rounded-16 bg-neutral-10", className)}>
      <Image src={image} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
    </div>
  );
}

/**
 * Buyer types (Revamping §5) shown one at a time: the audiences as a vertical
 * tab list on the left, the chosen one's photo, copy and button on the right,
 * so the section never shows three long paragraphs at once. Phones list all
 * three as cards (no tabs to hunt for on a small screen).
 */
export default function BuyerTabs({ buyers }: { buyers: BuyerOption[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  if (buyers.length === 0) return null;
  const current = buyers[Math.min(active, buyers.length - 1)];

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = buyers.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? index === last ? 0 : index + 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? index === 0 ? last : index - 1
          : event.key === "Home" ? 0 : event.key === "End" ? last : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <>
      <div className="hidden gap-24 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-40">
        <div role="tablist" aria-orientation="vertical" className="flex flex-col gap-12">
          {buyers.map((buyer, index) => {
            const selected = index === active;
            return (
              <Reveal key={buyer.id} as="div" delay={stagger(index, cascade(2))} className="flex flex-1">
                <button
                  ref={(node) => {
                    tabs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${index}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className={cn(
                    "group relative flex w-full cursor-pointer flex-col justify-center gap-6 overflow-hidden rounded-16 border px-24 py-20 text-left transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none",
                    selected ? "border-secondary bg-white" : "border-neutral-10 bg-transparent hover:border-neutral-8 hover:bg-white/70"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-0 left-0 w-[3px] origin-top bg-secondary transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] motion-reduce:transition-none",
                      selected ? "scale-y-100" : "scale-y-0"
                    )}
                  />
                  <span className="text-p4 font-semibold uppercase tracking-[1px] text-primary">{buyer.label}</span>
                  <span className="text-h6 font-semibold text-neutral-1">{buyer.title}</span>
                </button>
              </Reveal>
            );
          })}
        </div>
        <Reveal as="div" delay={cascade(3)} className="h-full">
          <div
            key={current.id}
            role="tabpanel"
            id={`${baseId}-panel`}
            aria-labelledby={`${baseId}-tab-${active}`}
            className="grid h-full motion-safe:animate-[fade-up_var(--dur-slow)_var(--ease-out)] grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-28 rounded-24 border border-neutral-10 bg-white p-16"
          >
            <BuyerPhoto image={current.image} className="min-h-[320px]" />
            <div className="flex flex-col justify-center gap-24 py-16 pr-16">
              <BuyerCopy buyer={current} />
            </div>
          </div>
        </Reveal>
      </div>

      <ul className="flex flex-col gap-16 lg:hidden">
        {buyers.map((buyer, index) => (
          <Reveal key={buyer.id} as="li" delay={stagger(index, cascade(2))} className="flex flex-col gap-20 rounded-16 border border-neutral-10 bg-white p-20 sm:p-24">
            <span className="text-p4 font-semibold uppercase tracking-[1px] text-primary">{buyer.label}</span>
            <BuyerPhoto image={buyer.image} className="aspect-[16/9]" />
            <BuyerCopy buyer={buyer} />
          </Reveal>
        ))}
      </ul>
    </>
  );
}
