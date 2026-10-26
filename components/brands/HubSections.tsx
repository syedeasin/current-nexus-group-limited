import Image from "next/image";
import type { BrandCategory } from "@prisma/client";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import TextReveal from "@/components/motion/TextReveal";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { SectionHeader } from "@/components/brands/BrandSections";
import PortfolioTabs from "@/components/brands/PortfolioTabs";
import { Link } from "@/i18n/navigation";
import { cascade, stagger } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

/**
 * Sections of the Tier 1 brands collection page (/tier-1-brands). Cards follow
 * the Manufacturing category cards: surface-2, 16px radius, centred title and
 * a small pill button. Copy: Dashboard → Pages → Tier 1 Brands; brands and
 * products: the published brand pages.
 */

const PILL =
  "inline-flex h-36 items-center gap-6 whitespace-nowrap rounded-full border-[1.5px] border-neutral-10 bg-white px-14 text-p4 font-semibold sm:h-40 sm:px-18 text-neutral-1 transition-colors duration-200 group-hover:bg-neutral-11";

export interface PortfolioCard {
  key: string;
  name: string;
  logo: string;
  summary: string;
  href: string;
  /** Category chip, shown on the "All brands" tab. */
  category?: string;
}

export interface PortfolioGroup {
  category: BrandCategory;
  label: string;
  cards: PortfolioCard[];
}

/**
 * Brand wall: categories as one row of tabs, "All brands" first (client
 * revision 1022). Logos grey until hovered, then full colour.
 */
export function BrandPortfolio({
  eyebrow,
  heading,
  viewLabel,
  emptyLabel,
  allLabel,
  groups,
}: {
  eyebrow: string;
  heading: string;
  viewLabel: string;
  emptyLabel: string;
  allLabel: string;
  groups: PortfolioGroup[];
}) {
  // "All" lists each brand once (a brand like CNX can lead two categories).
  const seen = new Set<string>();
  const all = groups.flatMap((group) =>
    group.cards
      .filter((card) => (seen.has(card.name) ? false : (seen.add(card.name), true)))
      .map((card) => ({ ...card, category: group.label }))
  );
  const tabs = groups.length > 1
    ? [{ id: "all", label: allLabel, cards: all }, ...groups.map((group) => ({ id: group.category, label: group.label, cards: group.cards }))]
    : groups.map((group) => ({ id: group.category, label: group.label, cards: group.cards }));

  return (
    <section id="brands" aria-label={heading} className="w-full scroll-mt-96 bg-white">
      <Container className="flex flex-col gap-40 py-48 md:gap-48 md:py-64 xl:py-100">
        <SectionHeader eyebrow={eyebrow} heading={heading} />
        {tabs.length === 0 ? (
          <Text size="p3" className="text-center text-neutral-4">{emptyLabel}</Text>
        ) : (
          <PortfolioTabs tabs={tabs} viewLabel={viewLabel} />
        )}
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

/** Main product display: one product from each of the first brands, linking to the brand page. */
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
    <section aria-label={heading} className="w-full bg-white">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <SectionHeader eyebrow={eyebrow} heading={heading} />
        <ul className="grid grid-cols-2 gap-12 sm:gap-16 lg:grid-cols-4 lg:gap-24">
          {items.map((item, index) => (
            <Reveal key={item.key} as="li" delay={stagger(index, cascade(2))} className="flex">
              <Link
                href={item.href}
                className="group flex w-full flex-col overflow-hidden rounded-16 border border-neutral-10 bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                <span className="relative flex aspect-[318/260] items-center justify-center overflow-hidden bg-white">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(min-width: 1024px) 318px, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : item.logo ? (
                    <Image src={item.logo} alt="" aria-hidden="true" width={160} height={40} className="h-20 w-auto max-w-[80%] object-contain opacity-50 grayscale sm:h-32" />
                  ) : null}
                </span>
                <span className="flex flex-1 flex-col items-center gap-12 px-12 pt-16 pb-16 text-center sm:gap-16 sm:px-20 sm:pt-20 sm:pb-24">
                  <span className="flex flex-col gap-4">
                    <span className="text-p4 text-tertiary">{item.brand}</span>
                    <span className="text-p3 font-semibold text-balance text-neutral-1 sm:text-h6">{item.series}</span>
                  </span>
                  <span className={cn(PILL, "mt-auto")}>
                    {viewLabel}
                    <ChevronRight size={12} />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** Global partnership: dotted world map beside the reach figures, as a light band. */
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
      <Container className="grid items-center gap-40 py-48 md:py-64 lg:grid-cols-2 lg:gap-80 xl:py-80">
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
              <Text size="p3" className="text-neutral-3">
                {body}
              </Text>
            </Reveal>
          </div>
          <dl className="grid grid-cols-3 gap-16">
            {stats.map((stat, index) => (
              <Reveal key={stat.key} as="div" delay={stagger(index, cascade(3))} className="flex flex-col gap-4 rounded-16 bg-surface-2 p-20">
                <dt className="order-2 text-p4 text-neutral-4">{stat.label}</dt>
                <dd className="order-1 text-h3 font-semibold tracking-[-0.5px] text-primary">{stat.value}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
        <Reveal variant="fade" delay={cascade(1)} className="relative mx-auto aspect-[1056/864] w-full max-w-[520px]">
          {image ? <Image src={image} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 520px, 100vw" className="object-contain" /> : null}
        </Reveal>
      </Container>
    </section>
  );
}
