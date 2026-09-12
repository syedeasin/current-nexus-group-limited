import { Fragment } from "react";
import Image from "next/image";
import { FileText } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Button from "@/components/ui/Button";
import { PhoneCall } from "@/components/icons/PhoneCall";
import { cn } from "@/lib/utils";
import { HERO_HEADER_OFFSET } from "@/src/layout/headerOffset";
import type { ProductHero } from "@/lib/data/products/types";

const STAT_BASE_DELAY_MS = 240;
const STAT_STEP_MS = 80;
const STAT_STAGGER_CAP_MS = 400;

export default function Hero({ hero }: { hero: ProductHero }) {
  return (
    <section
      data-hero-sentinel
      className={cn("relative w-full overflow-hidden bg-neutral-1", HERO_HEADER_OFFSET)}
    >
      <Image
        src={hero.backgroundImage}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Figma (node 4272:3289) specs a 21.767px backdrop-blur here, but the
          background photo must stay sharp/visible per explicit instruction —
          tint only, no blur. */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: "rgba(10,13,27,0.9)" }} />

      <Reveal
        variant="scale"
        as="div"
        className="absolute top-1/2 right-[4%] hidden h-560 w-486 -translate-y-1/2 opacity-90 lg:block"
      >
        <Image
          src={hero.productImage}
          alt=""
          aria-hidden="true"
          fill
          sizes="486px"
          className="object-contain"
        />
      </Reveal>

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180.53deg, rgba(10,13,27,0) 0.91%, rgba(10,13,27,0.9) 75.27%, #0A0D1B 94.69%)",
        }}
      />

      {/* pt/pb spelled out separately at every breakpoint (not py-*+pt-*) — Tailwind
          resolves a py/pt clash on the same element by generated-CSS order rather than
          JSX order, which silently let py-100 win over xl:pt-228 here.
          xl:pt-228 = the floating navbar's own height (88px, confirmed against its
          rendered box) + Figma's 140px gap below it (node 4272:3299 "Product Info").
          Figma's Header sits in normal flow above that padding, but this navbar is an
          absolute overlay, so pt has to include its height to land the same 140px
          visible gap instead of Figma's raw pt-140 value, which would only leave 52px. */}
      <Container className="relative flex flex-col gap-64 pt-80 pb-64 md:pt-96 md:pb-80 xl:gap-160 xl:pt-228 xl:pb-100">
        {/* Figma node 4272:3307/3308/3315: eyebrow→heading is a 12px gap, heading→body
            is a nested 16px gap, and that whole block sits 40px above the button row —
            three distinct gaps, not one flat 40px stack. */}
        <div className="flex max-w-680 flex-col gap-40">
          <div className="flex flex-col gap-12">
            <Reveal as="div" delay={0}>
              <SectionEyebrow label={hero.eyebrow} />
            </Reveal>
            <div className="flex flex-col gap-16">
              <Reveal as="div" delay={80}>
                <Heading level={1} size="h2" className="text-balance text-white">
                  {hero.heading}
                </Heading>
              </Reveal>
              <Reveal as="div" delay={160}>
                {/* Figma: Paragraph/Regular P2 (20/32/-0.1px desktop), not P1. */}
                <Text size="p2" className="max-w-638 text-[#CECFD1]">
                  {hero.body}
                </Text>
              </Reveal>
            </div>
          </div>
          <Reveal as="div" delay={240} className="flex w-full flex-col gap-12 min-[560px]:w-auto min-[560px]:flex-row">
            <Button href={hero.primaryCta.href} size="xl" className="w-full min-[560px]:w-auto">
              <FileText size={20} />
              {hero.primaryCta.label}
            </Button>
            <Button
              href={hero.secondaryCta.href}
              size="xl"
              variant="ghost"
              className="w-full border-[1.5px] border-neutral-6 text-white hover:bg-white hover:text-[#0A0D1B] min-[560px]:w-auto"
            >
              <PhoneCall size={20} />
              {hero.secondaryCta.label}
            </Button>
          </Reveal>
        </div>

        {/* Figma node 4272:3321: a `justify-between` row of self-stretch stat boxes with
            standalone zero-width divider elements between them — the divider is a
            separate flex item, not a border on the stat box, so `justify-between`
            naturally centers it in the gap regardless of the stat boxes' own widths. */}
        <div className="grid grid-cols-2 gap-24 sm:grid-cols-3 lg:flex lg:items-stretch lg:justify-between lg:gap-0">
          {hero.stats.map((stat, index) => {
            const delay = STAT_BASE_DELAY_MS + Math.min(index * STAT_STEP_MS, STAT_STAGGER_CAP_MS);
            return (
              <Fragment key={stat.label}>
                {index > 0 ? (
                  <div aria-hidden="true" className="hidden w-[1.5px] shrink-0 self-stretch bg-white/15 lg:block" />
                ) : null}
                <Reveal
                  as="div"
                  delay={delay}
                  className="flex flex-col gap-8 border-t border-white/15 pt-16 first:border-t-0 sm:border-t-0 lg:border-t-0 lg:pt-0"
                >
                  <span className="text-h4 font-semibold text-white">{stat.value}</span>
                  {/* Figma: Paragraph/Regular P3 (18/28/-0.09px desktop), not P2. */}
                  <Text size="p3" className="text-[#CECFD1]">
                    {stat.label}
                  </Text>
                </Reveal>
              </Fragment>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
