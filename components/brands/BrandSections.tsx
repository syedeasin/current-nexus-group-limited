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
import type { BrandContent, BrandTextItem } from "@/lib/brands/content";

/**
 * The brand page sections that have no equivalent elsewhere on the site
 * (brief §5, §6, §8, §9). Built from the same pieces as the existing
 * sections — eyebrow, H2, 16px cards on 1.5px neutral-10 borders, gold
 * primary buttons — so they read as one design system.
 */

function SectionHeader({ eyebrow, heading, align = "center" }: { eyebrow: string; heading: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "mx-auto flex max-w-720 flex-col items-center gap-12 text-center" : "flex max-w-640 flex-col gap-12"}>
      <Reveal as="div" delay={cascade(0)}>
        <SectionEyebrow label={eyebrow} />
      </Reveal>
      <TextReveal delay={cascade(1)}>
        <Heading level={2} size="h2" className="text-balance tracking-[-1.2px]!">
          {heading}
        </Heading>
      </TextReveal>
    </div>
  );
}

/** "For the buyers" — six numbered checkpoints (01–06). */
export function BrandNumberedGrid({ eyebrow, heading, items }: { eyebrow: string; heading: string; items: BrandTextItem[] }) {
  return (
    <section aria-label={heading} className="w-full bg-surface-2">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <SectionHeader eyebrow={eyebrow} heading={heading} />
        <ol className="grid gap-24 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal
              key={item.id}
              as="li"
              delay={stagger(index, cascade(2))}
              className="flex flex-col gap-20 rounded-16 border-[1.5px] border-neutral-10 bg-white p-32"
            >
              <span aria-hidden="true" className="text-h3 font-semibold text-secondary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-12">
                <Heading level={3} size="h6">
                  {item.title}
                </Heading>
                <Text size="p3" className="text-neutral-3">
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

/** Technical Documents & Certifications: copy and CTA left, document types right. */
export function BrandDocuments({ data }: { data: BrandContent["documents"] }) {
  return (
    <section id="documents" aria-label={data.heading} className="w-full scroll-mt-96 bg-white">
      <Container className="grid gap-40 py-48 md:py-64 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-80 xl:py-100">
        <div className="flex flex-col gap-24">
          <SectionHeader eyebrow={data.eyebrow} heading={data.heading} align="left" />
          <div className="flex flex-col gap-16">
            {data.paragraphs.map((paragraph, index) => (
              <Reveal key={index} as="div" delay={cascade(2 + index)}>
                <Text size="p2" className="text-neutral-3">
                  {paragraph}
                </Text>
              </Reveal>
            ))}
          </div>
          {data.ctaLabel && data.ctaHref ? (
            <Reveal as="div" delay={cascade(3)}>
              <Button href={data.ctaHref} size="xl" className="w-full min-[481px]:w-auto">
                {data.ctaLabel}
                <ChevronRight size={BUTTON_ICON_SIZE} />
              </Button>
            </Reveal>
          ) : null}
        </div>
        <ul className="flex flex-col divide-y divide-neutral-10 self-start rounded-16 border-[1.5px] border-neutral-10">
          {data.items.map((item, index) => {
            const Icon = pageIcon(item.icon);
            return (
              <Reveal key={item.id} as="li" delay={stagger(index, cascade(2))} className="flex items-start gap-20 p-24">
                <span className="flex size-48 shrink-0 items-center justify-center rounded-12 bg-surface-1 text-primary">
                  <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-4">
                  <Heading level={3} size="h6">
                    {item.title}
                  </Heading>
                  {item.body ? (
                    <Text size="p4" className="text-neutral-4">
                      {item.body}
                    </Text>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </ul>
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
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <SectionHeader eyebrow={data.eyebrow} heading={data.heading} />
        <ul className="grid gap-24 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item, index) => (
            <Reveal
              key={item.id}
              as="li"
              delay={stagger(index, cascade(2))}
              className="flex flex-col overflow-hidden rounded-16 border-[1.5px] border-neutral-10 bg-white"
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
                <Heading level={3} size="h5">
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
                  <Link
                    href={item.caseHref}
                    className="group mt-auto inline-flex w-fit items-center gap-8 pt-8 text-p3 font-semibold text-primary hover:underline"
                  >
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

/** Procurement & Delivery Support: dark band, copy + CTA left, four numbered steps right. */
export function BrandProcurement({ data }: { data: BrandContent["procurement"] }) {
  return (
    <section aria-label={data.heading} className="w-full bg-neutral-1">
      <Container className="grid gap-48 py-48 md:py-64 lg:grid-cols-2 lg:gap-80 xl:py-100">
        <div className="flex flex-col gap-24">
          <div className="flex flex-col gap-12">
            <Reveal as="div" delay={cascade(0)}>
              <SectionEyebrow label={data.eyebrow} tone="dark" />
            </Reveal>
            <TextReveal delay={cascade(1)}>
              <Heading level={2} size="h2" className="text-balance text-white tracking-[-1.2px]!">
                {data.heading}
              </Heading>
            </TextReveal>
          </div>
          <div className="flex flex-col gap-16">
            {data.paragraphs.map((paragraph, index) => (
              <Reveal key={index} as="div" delay={cascade(2 + index)}>
                <Text size="p3" className="text-neutral-8">
                  {paragraph}
                </Text>
              </Reveal>
            ))}
          </div>
          {data.ctaLabel && data.ctaHref ? (
            <Reveal as="div" delay={cascade(4)}>
              <Button href={data.ctaHref} size="xl" className="w-full min-[481px]:w-auto">
                {data.ctaLabel}
                <ChevronRight size={BUTTON_ICON_SIZE} />
              </Button>
            </Reveal>
          ) : null}
        </div>
        <ol className="grid gap-16 self-start sm:grid-cols-2">
          {data.steps.map((step, index) => (
            <Reveal
              key={step.id}
              as="li"
              delay={stagger(index, cascade(2))}
              className="flex flex-col gap-16 rounded-16 border border-white/10 bg-white/5 p-24"
            >
              <span aria-hidden="true" className="flex items-center gap-12 text-p4 font-semibold text-secondary">
                {String(index + 1).padStart(2, "0")}
                <span className="h-[1.5px] flex-1 bg-secondary/40" />
              </span>
              <Heading level={3} size="h6" className="text-white">
                {step.title}
              </Heading>
              <Text size="p4" className="text-neutral-8">
                {step.body}
              </Text>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** Product Advantages: the category's key parameters as icon cards. */
export function BrandAdvantages({ data }: { data: BrandContent["advantages"] }) {
  return (
    <section aria-label={data.heading} className="w-full bg-white">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <SectionHeader eyebrow={data.eyebrow} heading={data.heading} />
        <ul className="grid gap-24 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((item, index) => {
            const Icon = pageIcon(item.icon);
            return (
              <Reveal
                key={item.id}
                as="li"
                delay={stagger(index, cascade(2))}
                className="flex flex-col gap-20 rounded-16 border-[1.5px] border-neutral-10 bg-white p-28"
              >
                <Icon size={36} strokeWidth={1.25} className="text-primary" aria-hidden="true" />
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

/** Application Scenarios: intro + the homepage's scene carousel (image + text cards). */
export function BrandApplications({ data }: { data: BrandContent["applications"] }) {
  return (
    <section aria-label={data.heading} className="w-full bg-white py-48 md:py-64 xl:py-100">
      <Container>
        <div className="mx-auto flex max-w-760 flex-col items-center gap-12 text-center">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={data.eyebrow} />
          </Reveal>
          <TextReveal delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-balance tracking-[-1.2px]!">
              {data.heading}
            </Heading>
          </TextReveal>
          {data.intro ? (
            <Reveal as="div" delay={cascade(2)}>
              <Text size="p3" className="text-neutral-4">
                {data.intro}
              </Text>
            </Reveal>
          ) : null}
        </div>
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
