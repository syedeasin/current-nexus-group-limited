import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { BrandCategory } from "@prisma/client";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { Link } from "@/i18n/navigation";
import { cascade, stagger } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

/**
 * Sections of the Tier 1 brands collection page (/tier-1-brands) that the
 * brand pages don't already provide. Copy comes from Dashboard → Pages →
 * Tier 1 Brands; the brand cards from the published brand pages.
 */

export interface PortfolioCard {
  key: string;
  name: string;
  logo: string;
  summary: string;
  href: string;
  tag: string;
  own?: boolean;
}

export interface PortfolioGroup {
  category: BrandCategory;
  label: string;
  cards: PortfolioCard[];
}

/** Brand wall by category: logos grey until hovered, then full colour with a gold border. */
export function BrandPortfolio({
  eyebrow,
  heading,
  intro,
  viewLabel,
  emptyLabel,
  groups,
}: {
  eyebrow: string;
  heading: string;
  intro: string;
  viewLabel: string;
  emptyLabel: string;
  groups: PortfolioGroup[];
}) {
  return (
    <section id="brands" aria-label={heading} className="w-full scroll-mt-96 bg-surface-2">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <div className="flex max-w-720 flex-col gap-12">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={eyebrow} />
          </Reveal>
          <TextReveal delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-balance tracking-[-1.2px]!">
              {heading}
            </Heading>
          </TextReveal>
          {intro ? (
            <Reveal as="div" delay={cascade(2)}>
              <Text size="p3" className="text-neutral-4">
                {intro}
              </Text>
            </Reveal>
          ) : null}
        </div>

        {groups.length === 0 ? <Text size="p3" className="text-neutral-4">{emptyLabel}</Text> : null}

        {groups.map((group) => (
          <div key={group.category} className="flex flex-col gap-20">
            <Heading level={3} size="h5" className="text-neutral-3">
              {group.label}
            </Heading>
            <ul className="grid gap-16 sm:grid-cols-2 lg:grid-cols-4">
              {group.cards.map((card, index) => (
                <Reveal key={card.key} as="li" delay={stagger(index, cascade(2))} className="flex">
                  <Link
                    href={card.href}
                    className="group flex w-full flex-col gap-20 rounded-16 border-[1.5px] border-neutral-10 bg-white p-24 transition-[border-color,box-shadow] duration-200 hover:border-secondary hover:shadow-[0_12px_32px_-16px_rgba(10,13,27,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                  >
                    <div className="flex h-56 items-center justify-between gap-12">
                      {card.logo ? (
                        <Image
                          src={card.logo}
                          alt={card.name}
                          width={160}
                          height={40}
                          className="h-36 w-auto max-w-[70%] object-contain opacity-60 grayscale transition-[filter,opacity] duration-200 group-hover:opacity-100 group-hover:grayscale-0"
                        />
                      ) : (
                        <span className="text-h4 font-semibold text-neutral-1">{card.name}</span>
                      )}
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-10 py-4 text-[12px] font-semibold uppercase tracking-[1px]",
                          card.own ? "bg-primary text-white" : "bg-surface-1 text-primary"
                        )}
                      >
                        {card.tag}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-6">
                      {card.logo ? <span className="text-h6 font-semibold text-neutral-1">{card.name}</span> : null}
                      {card.summary ? <span className="text-p4 text-neutral-4">{card.summary}</span> : null}
                    </div>
                    <span className="inline-flex items-center gap-6 text-p4 font-semibold text-primary">
                      {viewLabel}
                      <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-2" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </Container>
    </section>
  );
}

export interface ComparisonRow {
  key: string;
  brand: string;
  category: string;
  products: string;
  bestFor: string;
}

/** "Which brand for which project?" — a plain, accessible table that scrolls on narrow screens. */
export function BrandComparison({
  eyebrow,
  heading,
  labels,
  rows,
}: {
  eyebrow: string;
  heading: string;
  labels: { brand: string; category: string; products: string; bestFor: string };
  rows: ComparisonRow[];
}) {
  return (
    <section aria-label={heading} className="w-full bg-white">
      <Container className="flex flex-col gap-40 py-48 md:py-64 xl:py-100">
        <div className="flex flex-col gap-12">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={eyebrow} />
          </Reveal>
          <TextReveal delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-balance tracking-[-1.2px]!">
              {heading}
            </Heading>
          </TextReveal>
        </div>
        <Reveal as="div" delay={cascade(2)} className="overflow-x-auto rounded-16 border-[1.5px] border-neutral-10">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-surface-2">
              <tr>
                {[labels.brand, labels.category, labels.products, labels.bestFor].map((label) => (
                  <th key={label} scope="col" className="px-24 py-16 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-10">
              {rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className="px-24 py-20 text-p3 font-semibold text-neutral-1">
                    {row.brand}
                  </th>
                  <td className="px-24 py-20 text-p3 text-neutral-3">{row.category}</td>
                  <td className="px-24 py-20 text-p3 text-neutral-3">{row.products}</td>
                  <td className="px-24 py-20 text-p3 text-neutral-3">{row.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </Container>
    </section>
  );
}

/** Global partnership: dotted world map with the reach figures beside it. */
export function BrandPartnership({
  eyebrow,
  heading,
  body,
  image,
  stats,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  image: string;
  stats: { key: string; value: string; label: string }[];
}) {
  return (
    <section aria-label={heading} className="w-full bg-white">
      <Container className="grid items-center gap-40 py-48 md:py-64 lg:grid-cols-2 lg:gap-80 xl:py-100">
        <Reveal variant="fade" delay={cascade(0)} className="relative mx-auto aspect-[1056/864] w-full max-w-[640px]">
          {image ? <Image src={image} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 640px, 100vw" className="object-contain" /> : null}
        </Reveal>
        <div className="flex flex-col gap-32">
          <div className="flex flex-col gap-12">
            <Reveal as="div" delay={cascade(0)}>
              <SectionEyebrow label={eyebrow} />
            </Reveal>
            <TextReveal delay={cascade(1)}>
              <Heading level={2} size="h2" className="text-balance tracking-[-1.2px]!">
                {heading}
              </Heading>
            </TextReveal>
            <Reveal as="div" delay={cascade(2)}>
              <Text size="p2" className="text-neutral-3">
                {body}
              </Text>
            </Reveal>
          </div>
          <dl className="grid grid-cols-1 divide-y divide-neutral-10 border-y border-neutral-10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((stat, index) => (
              <Reveal key={stat.key} as="div" delay={stagger(index, cascade(3))} className="flex flex-col gap-4 py-20 sm:px-20 sm:first:pl-0">
                <dt className="order-2 text-p4 text-neutral-4">{stat.label}</dt>
                <dd className="order-1 text-h3 font-semibold text-primary">{stat.value}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

/** "Need private label? We manufacture too." — image card linking to Manufacturing. */
export function ManufacturingCallout({
  eyebrow,
  heading,
  body,
  ctaLabel,
  ctaHref,
  image,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
}) {
  return (
    <section aria-label={heading} className="w-full bg-surface-2">
      <Container className="py-48 md:py-64 xl:py-100">
        <div className="grid overflow-hidden rounded-20 bg-neutral-1 lg:grid-cols-2">
          <div className="relative min-h-[260px] lg:min-h-[420px]">
            {image ? <Image src={image} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /> : null}
          </div>
          <div className="flex flex-col justify-center gap-20 p-32 md:p-48 xl:p-64">
            <Reveal as="div" delay={cascade(0)}>
              <SectionEyebrow label={eyebrow} tone="dark" />
            </Reveal>
            <TextReveal delay={cascade(1)}>
              <Heading level={2} size="h3" className="text-balance text-white">
                {heading}
              </Heading>
            </TextReveal>
            <Reveal as="div" delay={cascade(2)}>
              <Text size="p2" className="text-neutral-8">
                {body}
              </Text>
            </Reveal>
            <Reveal as="div" delay={cascade(3)}>
              <Button href={ctaHref} size="xl" className="w-full min-[481px]:w-auto">
                {ctaLabel}
                <ChevronRight size={BUTTON_ICON_SIZE} />
              </Button>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

export interface FeaturedProduct {
  key: string;
  brand: string;
  logo: string;
  series: string;
  category: string;
  image: string;
  href: string;
}

/** Main product display: the first products of each published brand page, linking to that page. */
export function FeaturedProducts({
  eyebrow,
  heading,
  viewLabel,
  items,
}: {
  eyebrow: string;
  heading: string;
  viewLabel: string;
  items: FeaturedProduct[];
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={heading} className="w-full bg-neutral-1">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <div className="mx-auto flex max-w-720 flex-col items-center gap-12 text-center">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={eyebrow} tone="dark" />
          </Reveal>
          <TextReveal delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-balance text-white tracking-[-1.2px]!">
              {heading}
            </Heading>
          </TextReveal>
        </div>
        <ul className="grid gap-16 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <Reveal key={item.key} as="li" delay={stagger(index, cascade(2))} className="flex">
              <Link
                href={item.href}
                className="group flex w-full flex-col overflow-hidden rounded-16 bg-white transition-shadow duration-200 hover:shadow-[0_16px_40px_-16px_rgba(213,172,93,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center bg-surface-2">
                  {item.image ? (
                    <Image src={item.image} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 320px, 50vw" className="object-contain p-20" />
                  ) : item.logo ? (
                    <Image src={item.logo} alt="" aria-hidden="true" width={160} height={40} className="h-36 w-auto opacity-60 grayscale" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-6 p-20">
                  <span className="text-p4 font-medium uppercase tracking-[1px] text-tertiary">{item.brand}</span>
                  <span className="text-h6 font-semibold text-neutral-1">{item.series}</span>
                  {item.category ? <span className="text-p4 text-neutral-4">{item.category}</span> : null}
                  <span className="mt-auto inline-flex items-center gap-6 pt-8 text-p4 font-semibold text-primary">
                    {viewLabel}
                    <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-2" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
