import { Fragment } from "react";
import Image from "next/image";
import { FileText } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { PhoneCall } from "@/components/icons/PhoneCall";
import { cn } from "@/lib/utils";
import { HERO_HEADER_OFFSET } from "@/src/layout/headerOffset";
import type { ProductHero } from "@/lib/data/products/types";

const STAT_BASE_DELAY_MS = 240;
const STAT_STEP_MS = 80;
const STAT_STAGGER_CAP_MS = 400;

/**
 * Both hero frames place the product shot under the banner gradient, so it is dimmed
 * from ~56% at its top edge to ~96% at its bottom. On desktop the section gradient does
 * that for free; the mobile shot sits in the content flow (above that gradient), so it
 * carries the same falloff as a mask — a dark overlay box would instead show as a
 * rectangle over the shot's transparent margins.
 */
const MOBILE_PRODUCT_MASK = "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 100%)";

/**
 * Shared by both product shots (only one is ever visible) so they resolve to the same
 * srcset candidate — the browser then downloads and preloads the file once, even though
 * the mobile box measures 314px and the desktop one 486px.
 */
const PRODUCT_IMAGE_SIZES = "(min-width: 1024px) 37vw, 90vw";

export default function Hero({ hero }: { hero: ProductHero }) {
  return (
    <section
      data-hero-sentinel
      className={cn("relative w-full overflow-hidden bg-neutral-1", HERO_HEADER_OFFSET)}
    >
      {/* Figma art-directs the banner photo: a portrait crop on the mobile frame (node
          4284:3183), a landscape one on desktop (4272:3285). Both exports already carry
          the design's 90% #0A0D1B scrim and blur, so the only overlay left is the
          gradient below. Painted as CSS backgrounds rather than <Image> because the two
          crops are separate sources: a display:none element never fetches its background,
          so each viewport downloads only the crop it shows. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center lg:hidden"
        style={{ backgroundImage: `url(${hero.backgroundImageMobile})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-cover bg-center lg:block"
        style={{ backgroundImage: `url(${hero.backgroundImage})` }}
      />

      {/* Figma node 4272:3290: the shot's right edge lands on the content gutter, not the
          viewport edge, so it is placed through a Container rather than a viewport offset
          (those diverge above 1600px, where the container stops growing). Rendered before
          the gradient so the gradient fades it into the section floor, as in the design.
          Width/height stay proportional to the content column (486 and 680 of Figma's
          1320) so the shot never grows into the copy on a laptop. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <Container className="relative flex h-full items-center">
          <Reveal
            variant="scale"
            as="div"
            className="relative ml-auto aspect-[486/560] w-[36.8%] translate-y-42"
          >
            <Image
              src={hero.productImage}
              alt=""
              fill
              priority
              sizes={PRODUCT_IMAGE_SIZES}
              className="object-contain"
            />
          </Reveal>
        </Container>
      </div>

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
          Both pt values fold in the floating navbar's own height (56px, 88px at xl),
          because HERO_HEADER_OFFSET pulls the section up under it: Figma's header sits in
          normal flow above its 48px (mobile) / 140px (desktop) top padding, so that
          height has to be added back to land the same visible gap. */}
      <Container className="relative flex flex-col gap-48 pt-104 pb-48 md:gap-64 md:pt-136 md:pb-80 xl:gap-160 xl:pt-228 xl:pb-100">
        {/* Figma node 4272:3307/3308/3315: eyebrow→heading is a 12px gap, heading→body
            is a nested 16px gap, and that whole block sits 40px above the button row —
            three distinct gaps, not one flat 40px stack. */}
        <div className="flex max-w-680 flex-col gap-32 lg:max-w-[51.5%] lg:gap-40">
          <div className="flex flex-col gap-12">
            <Reveal as="div" delay={0}>
              <SectionEyebrow label={hero.eyebrow} />
            </Reveal>
            <div className="flex flex-col gap-16">
              <Reveal as="div" delay={80}>
                {/* Figma's mobile frame tracks this heading at -1px against the shared
                    --text-h2 token's -0.48px; tablet and desktop match their tokens. */}
                <Heading level={1} size="h2" className="text-balance text-white max-md:tracking-[-1px]!">
                  {hero.heading}
                </Heading>
              </Reveal>
              <Reveal as="div" delay={160}>
                {/* Figma node 4284:3260 sets the mobile body in the H6 heading style
                    (18/26 semibold, 0 tracking); desktop node 4272:3317 keeps it regular
                    Paragraph P2 (20/32/-0.1px). */}
                <Text
                  size="p2"
                  className="max-w-638 text-h6 font-semibold text-neutral-9 max-md:tracking-[0px]! md:text-p2 md:font-normal"
                >
                  {hero.body}
                </Text>
              </Reveal>
            </div>
          </div>

          {/* Figma node 4282:3356: on mobile the shot moves into the flow, between the
              copy and the buttons, at 90% of the content column. */}
          <Reveal
            variant="scale"
            as="div"
            className="relative mx-auto aspect-[486/560] w-[90%] max-w-314 lg:hidden"
          >
            <Image
              src={hero.productImage}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes={PRODUCT_IMAGE_SIZES}
              className="object-contain"
              style={{ maskImage: MOBILE_PRODUCT_MASK, WebkitMaskImage: MOBILE_PRODUCT_MASK }}
            />
          </Reveal>

          {/* Figma node 4284:3314 stacks the buttons full-width at the 48px/24px size on
              mobile and node 4272:3318 rows them at the 60px/32px size on desktop. */}
          <Reveal as="div" delay={240} className="flex w-full flex-col gap-12 min-[560px]:w-auto min-[560px]:flex-row">
            <Button
              href={hero.primaryCta.href}
              size="lg"
              className="w-full text-[14px] min-[560px]:h-60 min-[560px]:w-auto min-[560px]:px-32 min-[560px]:text-btn-lg"
            >
              <FileText size={BUTTON_ICON_SIZE} />
              {hero.primaryCta.label}
            </Button>
            <Button
              href={hero.secondaryCta.href}
              size="lg"
              variant="ghost"
              className="w-full border-[1.5px] border-neutral-6 text-[14px] text-white hover:bg-white hover:text-neutral-1 min-[560px]:h-60 min-[560px]:w-auto min-[560px]:px-32 min-[560px]:text-btn-lg"
            >
              <PhoneCall size={BUTTON_ICON_SIZE} />
              {hero.secondaryCta.label}
            </Button>
          </Reveal>
        </div>

        {/* Figma nodes 4272:3321 / 4282:3383: the same stat list turns from a stacked
            column split by full-width rules (#232532) into a `justify-between` row split
            by full-height ones (#3B3D49). The rule is a standalone flex item in both, so
            it centres itself in the gap whatever the stat boxes measure. */}
        <div className="flex flex-col gap-16 lg:flex-row lg:items-stretch lg:justify-between lg:gap-0">
          {hero.stats.map((stat, index) => {
            const delay = STAT_BASE_DELAY_MS + Math.min(index * STAT_STEP_MS, STAT_STAGGER_CAP_MS);
            return (
              <Fragment key={stat.label}>
                {index > 0 ? (
                  <div
                    aria-hidden="true"
                    className="h-[1.5px] w-full shrink-0 bg-neutral-2 lg:h-auto lg:w-[1.5px] lg:self-stretch lg:bg-neutral-3"
                  />
                ) : null}
                <Reveal as="div" delay={delay} className="flex flex-col gap-8">
                  {/* Figma's mobile frame tracks the value at -0.5px against the shared
                      --text-h4 token's -0.24px, and drops the label to 14/24. */}
                  <span className="text-h4 font-semibold text-white max-md:tracking-[-0.5px]!">
                    {stat.value}
                  </span>
                  <Text size="p3" className="text-neutral-9 max-md:text-p4 max-md:leading-[24px]!">
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
