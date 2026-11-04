import { CircleCheck, CircleX } from "lucide-react";
import Image from "@/components/ui/Picture";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { BlockSection, SECTION_Y, type BlockProps } from "@/components/sections/blocks/ContentBlocks";
import RouteSelector from "@/components/sections/blocks/RouteSelector";
import BuyerTabs from "@/components/sections/blocks/BuyerTabs";
import { entries, str } from "@/lib/page-content/read";
import { cascade, stagger } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

/** Replacement routes: cards that pre-select the goal in the page's form. */
export function Routes({ data, tone }: BlockProps) {
  const routes = entries(data.cards).map(([id, card]) => ({
    id,
    icon: str(card, "icon"),
    title: str(card, "title"),
    description: str(card, "description"),
    ctaLabel: str(card, "ctaLabel"),
    goal: str(card, "goal"),
  }));
  return (
    <BlockSection data={data} tone={tone}>
      <RouteSelector routes={routes} targetId={str(data, "targetId") || "inquiry"} />
    </BlockSection>
  );
}

/**
 * Two-column comparison: the common approach (muted, cross) against the CNX
 * approach (gold edge, tick). A table on desktop, one card per point on phones.
 */
export function Comparison({ data, tone }: BlockProps) {
  const rows = entries(data.rows);
  const commonLabel = str(data, "commonLabel") || "Common Approach";
  const cnxLabel = str(data, "cnxLabel") || "CNX Approach";

  return (
    <BlockSection data={data} tone={tone}>
      {/* Desktop table */}
      <Reveal as="div" delay={cascade(2)} className="hidden overflow-hidden rounded-20 border border-neutral-10 bg-white md:block">
        <div aria-hidden="true" className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] bg-surface-2">
          <div className="px-28 py-20 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">{commonLabel}</div>
          <div className="border-l-2 border-secondary px-28 py-20 text-p4 font-semibold uppercase tracking-[1px] text-neutral-1">{cnxLabel}</div>
        </div>
        {rows.map(([id, row]) => (
          <div key={id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] border-t border-neutral-10">
            <div className="flex items-start gap-12 px-28 py-24 text-p3 text-neutral-4">
              <CircleX size={20} aria-hidden="true" className="mt-2 shrink-0 text-neutral-7" />
              <span>
                <span className="sr-only">{commonLabel}: </span>
                {str(row, "common")}
              </span>
            </div>
            <div className="flex items-start gap-12 border-l-2 border-secondary bg-secondary/[0.04] px-28 py-24 text-p3 text-neutral-1">
              <CircleCheck size={20} aria-hidden="true" className="mt-2 shrink-0 text-secondary" />
              <span>
                <span className="sr-only">{cnxLabel}: </span>
                {str(row, "cnx")}
              </span>
            </div>
          </div>
        ))}
      </Reveal>

      {/* Phone cards: one legend, then the points (cross = common, tick = CNX). */}
      <div className="flex flex-col gap-12 md:hidden">
        <p className="flex flex-wrap gap-x-20 gap-y-6 text-p4 font-semibold text-neutral-4">
          <span className="inline-flex items-center gap-6">
            <CircleX size={16} aria-hidden="true" className="text-neutral-7" />
            {commonLabel}
          </span>
          <span className="inline-flex items-center gap-6 text-neutral-1">
            <CircleCheck size={16} aria-hidden="true" className="text-secondary" />
            {cnxLabel}
          </span>
        </p>
        <ul className="flex flex-col gap-12">
          {rows.map(([id, row], index) => (
            <Reveal key={id} as="li" delay={stagger(index, cascade(2))} className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
              <p className="flex items-start gap-10 px-20 py-14 text-p3 text-neutral-4">
                <CircleX size={18} aria-hidden="true" className="mt-2 shrink-0 text-neutral-7" />
                <span>
                  <span className="sr-only">{commonLabel}: </span>
                  {str(row, "common")}
                </span>
              </p>
              <p className="flex items-start gap-10 border-t-2 border-secondary bg-secondary/[0.05] px-20 py-14 text-p3 text-neutral-1">
                <CircleCheck size={18} aria-hidden="true" className="mt-2 shrink-0 text-secondary" />
                <span>
                  <span className="sr-only">{cnxLabel}: </span>
                  {str(row, "cnx")}
                </span>
              </p>
            </Reveal>
          ))}
        </ul>
      </div>

      {str(data, "benefit") ? (
        <div className="flex flex-col gap-16 rounded-16 bg-neutral-1 p-24 text-white md:flex-row md:items-center md:justify-between md:p-32">
          <p className="max-w-[720px] text-p2 font-medium">{str(data, "benefit")}</p>
          {str(data, "ctaLabel") && str(data, "ctaHref") ? (
            <Button href={str(data, "ctaHref")} size="lg" className="w-full shrink-0 min-[481px]:w-fit">
              {str(data, "ctaLabel")}
              <ArrowRight size={BUTTON_ICON_SIZE} />
            </Button>
          ) : null}
        </div>
      ) : null}
    </BlockSection>
  );
}

/** Who it is for: the audiences one at a time (tabs on desktop, cards on phones). */
export function Buyers({ data, tone }: BlockProps) {
  const buyers = entries(data.cards).map(([id, card]) => ({
    id,
    label: str(card, "label"),
    title: str(card, "title"),
    description: str(card, "description"),
    image: str(card, "image"),
    linkLabel: str(card, "linkLabel"),
    linkHref: str(card, "linkHref"),
  }));
  return (
    <BlockSection data={data} tone={tone}>
      <BuyerTabs buyers={buyers} />
    </BlockSection>
  );
}

/**
 * Project example: wide photo, a facts row, then Before / After / Result. The
 * note says when the example is an illustrative case rather than a CNX project.
 */
export function CaseExample({ data, tone }: BlockProps) {
  const facts = entries(data.facts);
  const stages = entries(data.stages);
  return (
    <BlockSection data={data} tone={tone}>
      <Reveal as="div" delay={cascade(2)} className="overflow-hidden rounded-24 border border-neutral-10 bg-white">
        {str(data, "image") ? (
          <div className="relative aspect-[21/9] w-full bg-neutral-2">
            <Image src={str(data, "image")} alt={str(data, "imageAlt")} fill sizes="(min-width: 1280px) 1320px, 100vw" className="object-cover" />
            {str(data, "badge") ? (
              <span className="absolute top-16 left-16 rounded-full bg-neutral-1/80 px-12 py-6 text-p4 font-medium text-white backdrop-blur-sm">{str(data, "badge")}</span>
            ) : null}
          </div>
        ) : null}
        {facts.length > 0 ? (
          <dl className="grid grid-cols-2 gap-x-24 gap-y-20 border-b border-neutral-10 p-24 md:grid-cols-4 md:p-32">
            {facts.map(([id, fact]) => (
              <div key={id} className="flex flex-col gap-4">
                <dt className="text-p4 text-neutral-5">{str(fact, "label")}</dt>
                <dd className="text-p2 font-semibold text-neutral-1 sm:text-h6">{str(fact, "value")}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div className="grid gap-px bg-neutral-10 md:grid-cols-3">
          {stages.map(([id, stage]) => (
            <div key={id} className="flex flex-col gap-8 bg-white p-24 md:p-32">
              <span className="text-p4 font-semibold uppercase tracking-[1px] text-primary">{str(stage, "label")}</span>
              <p className="text-p3 text-neutral-2">{str(stage, "text")}</p>
            </div>
          ))}
        </div>
      </Reveal>
      {str(data, "note") ? <p className="max-w-[760px] text-p4 text-neutral-5">{str(data, "note")}</p> : null}
    </BlockSection>
  );
}

/** Trust strip: short statement beside four key numbers. */
export function TrustStrip({ data, tone }: BlockProps) {
  const stats = entries(data.stats);
  return (
    <section aria-label={str(data, "heading")} className={cn("w-full", tone === "muted" ? "bg-surface-2" : "bg-white")}>
      <Container className={cn("grid gap-40 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-80", SECTION_Y)}>
        <div className="flex flex-col gap-16">
          <h2 className="text-h4 font-semibold text-neutral-1 md:text-h3">{str(data, "heading")}</h2>
          <p className="text-p3 text-neutral-3">{str(data, "intro")}</p>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-20 border border-neutral-10 bg-neutral-10">
          {stats.map(([id, stat]) => (
            <div key={id} className="flex flex-col gap-4 bg-white p-24 md:p-32">
              <dd className="order-1 text-[40px] font-semibold leading-none tracking-[-1px] text-neutral-1 md:text-[48px]">{str(stat, "value")}</dd>
              <dt className="order-2 text-p3 text-neutral-4">{str(stat, "label")}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
