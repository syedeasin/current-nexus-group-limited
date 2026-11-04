"use client";

import { createElement, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { pageIcon } from "@/lib/page-content/icons";
import { getLenis } from "@/lib/motion/lenis-instance";
import { cascade, stagger } from "@/lib/motion/timing";
import { CARD_TITLE_TINT } from "@/lib/motion/interactions";
import { cn } from "@/lib/utils";

/** Fired with the chosen goal; the page's inquiry form pre-selects it. */
export const INQUIRY_PREFILL_EVENT = "cnx:inquiry-prefill";

export interface RouteOption {
  id: string;
  icon: string;
  title: string;
  description: string;
  ctaLabel: string;
  /** Project goal option the form pre-selects. */
  goal: string;
}

/** Pre-select the goal, then glide to the form (through Lenis when it runs, so the two scrollers don't fight). */
function goToForm(goal: string, targetId: string) {
  if (goal) window.dispatchEvent(new CustomEvent<string>(INQUIRY_PREFILL_EVENT, { detail: goal }));
  const target = document.getElementById(targetId);
  if (!target) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(target, { offset: -96 });
  else target.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * "What do you need to solve?" (Revamping §2): four route cards in the brand
 * pages' card style. Each whole card is the link — it pre-selects the matching
 * Project goal in the assessment form and glides there. The last route chosen
 * keeps a gold edge so the visitor sees which one the form now carries.
 */
export default function RouteSelector({ routes, targetId }: { routes: RouteOption[]; targetId: string }) {
  const [chosen, setChosen] = useState<string | null>(null);
  if (routes.length === 0) return null;

  return (
    <ul className="grid gap-16 sm:grid-cols-2 lg:gap-24 xl:grid-cols-4">
      {routes.map((route, index) => {
        const active = chosen === route.id;
        return (
          <Reveal key={route.id} as="li" delay={stagger(index, cascade(2))} className="flex">
            <a
              href={`#${targetId}`}
              onClick={(event) => {
                event.preventDefault();
                setChosen(route.id);
                goToForm(route.goal, targetId);
              }}
              className={cn(
                // The site's 4px card lift (CARD_LIFT), with the border colour eased alongside.
                "group relative flex w-full flex-col gap-20 overflow-hidden rounded-16 border bg-white p-24 transition-[border-color,transform] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-4 focus-visible:-translate-y-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-28",
                active ? "border-secondary" : "border-neutral-10 hover:border-secondary/60"
              )}
            >
              {/* Gold rule that grows along the top edge on hover. */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 top-0 h-[3px] origin-left bg-secondary transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] motion-reduce:transition-none",
                  active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                )}
              />
              <span aria-hidden="true" className="flex size-48 items-center justify-center rounded-12 bg-surface-1 text-primary">
                {createElement(pageIcon(route.icon), { size: 24, strokeWidth: 1.5 })}
              </span>
              <span className="flex flex-col gap-8">
                <span className={cn("text-h6 font-semibold text-neutral-1", CARD_TITLE_TINT)}>{route.title}</span>
                <span className="text-p3 text-neutral-4">{route.description}</span>
              </span>
              <span className="mt-auto inline-flex items-center gap-8 pt-4 text-p3 font-semibold text-primary">
                {route.ctaLabel}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:translate-x-4 motion-reduce:transition-none"
                />
              </span>
            </a>
          </Reveal>
        );
      })}
    </ul>
  );
}
