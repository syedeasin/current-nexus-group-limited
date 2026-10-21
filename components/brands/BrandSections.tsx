import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { ChevronRight } from "@/components/icons/ChevronRight";
import SceneCarousel from "@/components/sections/home/application-scenes/SceneCarousel";
import { Link } from "@/i18n/navigation";
import { pageIcon } from "@/lib/page-content/icons";
import { cascade, stagger } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";
import type { BrandContent, BrandTextItem } from "@/lib/brands/content";

/**
 * Brand page sections with no equivalent elsewhere on the site, built from the
 * main design's pieces: centred eyebrow + H2 headers, surface-2 / white
 * alternating bands, 16px cards on neutral-10 hairlines and pill buttons.
 */

const SECTION_Y = "py-48 md:py-64 xl:py-100";

export function SectionHeader({
  eyebrow,
  heading,
  align = "center",
  tone = "light",
}: {
  eyebrow: string;
  heading: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto flex max-w-720 flex-col items-center gap-12 text-center" : "flex max-w-560 flex-col gap-12"
      }
    >
      <Reveal as="div" delay={cascade(0)}>
        <SectionEyebrow label={eyebrow} tone={tone} />
      </Reveal>
      <TextReveal delay={cascade(1)}>
        <Heading level={2} size="h2" className={cn("text-balance tracking-[-1.2px]!", tone === "dark" && "text-white")}>
          {heading}
        </Heading>
      </TextReveal>
    </div>
  );
}

/**
 * Brand overview: the Solutions "Why choose" header (node 4028:10458) — eyebrow
 * and H2 on the left, the brief's two short paragraphs on the right.
 */
export function BrandOverview({ data }: { data: BrandContent["overview"] }) {
  return (
    <section aria-label={data.heading} className="w-full bg-white">
      {/* No bottom padding: the product display follows on the same white, as one block. */}
      <Container className="flex flex-col gap-24 pt-48 md:pt-64 lg:flex-row lg:items-start lg:justify-between lg:gap-80 xl:pt-100">
        <div className="flex flex-col gap-12 lg:max-w-520">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={data.eyebrow} />
          </Reveal>
          <TextReveal delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-balance tracking-[-1.2px]!">
              {data.heading}
            </Heading>
          </TextReveal>
        </div>
        <div className="flex max-w-600 flex-col gap-16 lg:pt-36">
          {data.paragraphs.map((paragraph, index) => (
            <Reveal key={index} as="div" delay={cascade(2 + index)}>
              <Text size={index === 0 ? "p2" : "p3"} className={index === 0 ? "text-neutral-2" : "text-neutral-4"}>
                {paragraph}
              </Text>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/** Product Advantages: the category's key parameters, four light cards in a row. */
export function BrandAdvantages({ data, className = "bg-surface-2" }: { data: BrandContent["advantages"]; className?: string }) {
  return (
    <section aria-label={data.heading} className={cn("w-full", className)}>
      <Container className={cn("flex flex-col gap-48", SECTION_Y)}>
        <SectionHeader eyebrow={data.eyebrow} heading={data.heading} />
        <ul className="grid gap-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-24">
          {data.items.map((item, index) => {
            const Icon = pageIcon(item.icon);
            return (
              <Reveal
                key={item.id}
                as="li"
                delay={stagger(index, cascade(2))}
                className="flex gap-16 rounded-16 border border-neutral-10 bg-white p-20 sm:flex-col sm:p-24"
              >
                <span className="flex size-44 shrink-0 items-center justify-center rounded-12 bg-surface-1 text-primary">
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-8">
                  <Heading level={3} size="h6">
                    {item.title}
                  </Heading>
                  <Text size="p4" className="text-neutral-4">
                    {item.body}
                  </Text>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/** "For the buyers" — six checkpoints, numbered, on hairlines rather than heavy cards. */
export function BrandNumberedGrid({ eyebrow, heading, items }: { eyebrow: string; heading: string; items: BrandTextItem[] }) {
  return (
    <section aria-label={heading} className="w-full bg-white">
      <Container className={cn("flex flex-col gap-48", SECTION_Y)}>
        <SectionHeader eyebrow={eyebrow} heading={heading} />
        <ol className="grid gap-x-48 gap-y-32 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.id} as="li" delay={stagger(index, cascade(2))} className="flex gap-16 border-t border-neutral-10 pt-24">
              <span aria-hidden="true" className="w-28 shrink-0 text-p3 font-semibold text-secondary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-8">
                <Heading level={3} size="h6">
                  {item.title}
                </Heading>
                <Text size="p4" className="text-neutral-4">
                  {item.body}
                </Text>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** Technical Documents & Certifications: copy and CTA left, the document types right. */
export function BrandDocuments({ data }: { data: BrandContent["documents"] }) {
  return (
    <section id="documents" aria-label={data.heading} className="w-full scroll-mt-96 bg-surface-2">
      <Container className={cn("grid items-center gap-40 lg:grid-cols-2 lg:gap-80", SECTION_Y)}>
        <div className="flex flex-col gap-24">
          <SectionHeader eyebrow={data.eyebrow} heading={data.heading} align="left" />
          {data.paragraphs[0] ? (
            <Reveal as="div" delay={cascade(2)}>
              <Text size="p3" className="text-neutral-3">
                {data.paragraphs[0]}
              </Text>
            </Reveal>
          ) : null}
          {data.ctaLabel && data.ctaHref ? (
            <Reveal as="div" delay={cascade(3)}>
              <Button href={data.ctaHref} size="lg" className="whitespace-nowrap">
                {data.ctaLabel}
                <ChevronRight size={BUTTON_ICON_SIZE} />
              </Button>
            </Reveal>
          ) : null}
        </div>
        <ul className="flex flex-col divide-y divide-neutral-10 rounded-16 border border-neutral-10 bg-white px-24">
          {data.items.map((item, index) => {
            const Icon = pageIcon(item.icon);
            return (
              <Reveal key={item.id} as="li" delay={stagger(index, cascade(2))} className="flex items-center gap-16 py-18">
                <Icon size={22} strokeWidth={1.5} className="shrink-0 text-primary" aria-hidden="true" />
                <div className="flex min-w-0 flex-col">
                  <span className="text-p3 font-semibold text-neutral-1">{item.title}</span>
                  {item.body ? <span className="text-p4 text-neutral-5">{item.body}</span> : null}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/** Application Scenarios: the homepage scene carousel. */
export function BrandApplications({ data }: { data: BrandContent["applications"] }) {
  return (
    <section aria-label={data.heading} className={cn("w-full bg-white", SECTION_Y)}>
      <Container>
        <SectionHeader eyebrow={data.eyebrow} heading={data.heading} />
      </Container>
      <Container className="mt-48">
        <SceneCarousel
          cards={data.items.map((item) => ({ key: item.id, title: item.title, description: item.description, image: item.image }))}
          ariaLabel={data.heading}
          previousLabel={data.previousLabel}
          nextLabel={data.nextLabel}
        />
      </Container>
    </section>
  );
}

/** Case studies as cards: location, application, products, CNX's role, verified results. */
export function BrandCaseStudies({ data }: { data: BrandContent["cases"] }) {
  const rows = (item: BrandContent["cases"]["items"][number]) =>
    [
      [data.applicationLabel, item.application],
      [data.productsLabel, item.products],
      [data.roleLabel, item.role],
      [data.resultsLabel, item.results],
    ].filter(([, value]) => value);

  return (
    <section aria-label={data.heading} className="w-full bg-surface-2">
      <Container className={cn("flex flex-col gap-48", SECTION_Y)}>
        <SectionHeader eyebrow={data.eyebrow} heading={data.heading} />
        <ul className="grid gap-24 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item, index) => (
            <Reveal
              key={item.id}
              as="li"
              delay={stagger(index, cascade(2))}
              className="flex flex-col overflow-hidden rounded-16 border border-neutral-10 bg-white"
            >
              {item.image ? (
                <div className="relative aspect-[16/10]">
                  <Image src={item.image} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col gap-16 p-24">
                {item.location ? (
                  <span className="inline-flex items-center gap-6 text-p4 font-medium text-tertiary">
                    <MapPin size={16} aria-hidden="true" />
                    <span className="sr-only">{data.locationLabel}: </span>
                    {item.location}
                  </span>
                ) : null}
                <Heading level={3} size="h6">
                  {item.title}
                </Heading>
                <dl className="flex flex-col gap-10">
                  {rows(item).map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-2">
                      <dt className="text-p4 text-neutral-5">{label}</dt>
                      <dd className="text-p4 font-medium text-neutral-1">{value}</dd>
                    </div>
                  ))}
                </dl>
                {item.caseHref ? (
                  <Link href={item.caseHref} className="group mt-auto inline-flex w-fit items-center gap-8 pt-8 text-p4 font-semibold text-primary hover:underline">
                    {data.readLabel}
                    <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-2" />
                  </Link>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** Procurement & Delivery Support: dark band, header with CTA, then the four steps in one row. */
export function BrandProcurement({ data }: { data: BrandContent["procurement"] }) {
  return (
    <section aria-label={data.heading} className="w-full bg-neutral-1">
      <Container className={cn("flex flex-col gap-48", SECTION_Y)}>
        <div className="flex flex-col gap-24 lg:flex-row lg:items-end lg:justify-between lg:gap-80">
          <SectionHeader eyebrow={data.eyebrow} heading={data.heading} align="left" tone="dark" />
          <div className="flex max-w-480 flex-col items-start gap-24">
            {data.paragraphs[0] ? (
              <Reveal as="div" delay={cascade(2)}>
                <Text size="p3" className="text-neutral-8">
                  {data.paragraphs[0]}
                </Text>
              </Reveal>
            ) : null}
            {data.ctaLabel && data.ctaHref ? (
              <Reveal as="div" delay={cascade(3)}>
                <Button href={data.ctaHref} size="lg" className="whitespace-nowrap">
                  {data.ctaLabel}
                  <ChevronRight size={BUTTON_ICON_SIZE} />
                </Button>
              </Reveal>
            ) : null}
          </div>
        </div>
        <ol className="grid gap-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-24">
          {data.steps.map((step, index) => (
            <Reveal
              key={step.id}
              as="li"
              delay={stagger(index, cascade(2))}
              className="flex gap-16 rounded-16 border border-white/10 bg-white/5 p-20 sm:flex-col sm:p-24"
            >
              <span
                aria-hidden="true"
                className="flex size-40 shrink-0 items-center justify-center rounded-full border border-secondary/60 text-p4 font-semibold text-secondary"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-8">
                <Heading level={3} size="h6" className="text-white">
                  {step.title}
                </Heading>
                <Text size="p4" className="text-neutral-8">
                  {step.body}
                </Text>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
