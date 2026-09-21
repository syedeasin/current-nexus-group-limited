import Image from "next/image";
import { ChevronDown } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Button from "@/components/ui/Button";
import { ChevronRight } from "@/components/icons/ChevronRight";
import type { OdmSection as OdmSectionData } from "@/lib/data/products/types";

// Figma node 114:99207 etc. ships these as bespoke line-art SVGs (stroke #0A0D1B), not
// stock icon-set glyphs — the exported assets are rendered directly instead of the
// earlier Lucide approximations.
const ICON_SRC: Record<string, string> = {
  "paint-board": "/images/manufacturing/bc-solar/branding.svg",
  "settings-02": "/images/manufacturing/bc-solar/configurations.svg",
  "new-releases": "/images/manufacturing/bc-solar/certification.svg",
  "file-01": "/images/manufacturing/bc-solar/documentation.svg",
  "agreement-02": "/images/manufacturing/bc-solar/commercial-terms.svg",
};

const FEATURE_BASE_DELAY_MS = 240;
const FEATURE_STEP_MS = 80;
const FEATURE_STAGGER_CAP_MS = 400;
const FLOW_BASE_DELAY_MS = 240;
const FLOW_STEP_MS = 60;

export default function OdmSection({ data }: { data: OdmSectionData }) {
  return (
    <section className="w-full bg-surface-2 pt-100 pb-80">
      <Container className="flex flex-col gap-48">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          {/* Figma node 114:99195: eyebrow→heading is 8px, not 12px. */}
          <div className="flex max-w-660 flex-col gap-8">
            <Reveal as="div" delay={0}>
              <SectionEyebrow label={data.eyebrow} />
            </Reveal>
            <TextReveal delay={80}>
              <Heading level={2} size="h2" className="text-balance">
                {data.heading}
              </Heading>
            </TextReveal>
          </div>
          <Reveal as="div" delay={160} className="max-w-476">
            {/* Figma: Paragraph/Regular P2 (20/32), not P1. */}
            <Text size="p2" className="text-neutral-3">
              {data.intro}
            </Text>
          </Reveal>
        </div>

        <Reveal as="div" delay={160} className="rounded-20 bg-white p-24 md:p-32 lg:p-48">
          <div className="flex flex-col gap-48 lg:flex-row lg:gap-60">
            {/* Figma node 114:99206: a uniform 20px gap between every feature row AND every
                2px divider — not the previous pt/pb dance, which put a border 20px after one
                item but only 4px before the next (asymmetric, ~46px total instead of 42px). */}
            <div className="flex w-full flex-col gap-20 lg:w-630">
              {data.features.map((feature, index) => {
                const iconSrc = ICON_SRC[feature.icon];
                const delay = FEATURE_BASE_DELAY_MS + Math.min(index * FEATURE_STEP_MS, FEATURE_STAGGER_CAP_MS);
                return (
                  <Reveal
                    key={feature.title}
                    as="div"
                    delay={delay}
                    className={
                      index < data.features.length - 1
                        ? "flex flex-col gap-20 border-b-2 border-neutral-11 pb-20"
                        : "flex flex-col gap-12"
                    }
                  >
                    <div className="flex items-start gap-12">
                      <span className="flex size-52 shrink-0 items-center justify-center rounded-8 border border-neutral-11 bg-surface-2 p-14">
                        {iconSrc ? (
                          <Image src={iconSrc} alt="" aria-hidden="true" width={24} height={24} />
                        ) : null}
                      </span>
                      <div className="flex flex-col gap-4 pt-4">
                        {/* Figma H6 spec here tracks -0.2px, not the shared --text-h6
                            token's -0.1px. */}
                        <Heading level={3} size="h6" className="tracking-[-0.2px]!">
                          {feature.title}
                        </Heading>
                        {/* Figma: Paragraph/Regular P3 (18/28), not P2. */}
                        <Text size="p3" className="text-neutral-4">
                          {feature.body}
                        </Text>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal variant="scale" as="div" className="relative h-280 w-full shrink-0 md:h-360 lg:h-534 lg:w-534">
              <Image
                src={data.image}
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 1024px) 534px, 100vw"
                className="rounded-16 object-cover"
              />
            </Reveal>
          </div>
        </Reveal>

        {/* Figma node 114:99260: the service-flow block and the button are grouped
            together at gap-32 — the button isn't a separate section-level (gap-48) sibling. */}
        <div className="flex flex-col gap-32">
          <div className="flex flex-col gap-12">
            <Reveal as="div">
              {/* Figma H6 spec here tracks -0.2px, not the shared --text-h6 token's -0.1px. */}
              <Heading level={3} size="h6" className="tracking-[-0.2px]!">
                {data.serviceFlowHeading}
              </Heading>
            </Reveal>
            <div className="flex flex-col gap-16 min-[900px]:flex-row min-[900px]:flex-wrap min-[900px]:items-center min-[900px]:gap-12">
              {data.serviceFlowSteps.map((step, index) => {
                const delay = FLOW_BASE_DELAY_MS + Math.min(index * FLOW_STEP_MS, FEATURE_STAGGER_CAP_MS);
                return (
                  <Reveal key={step} as="div" delay={delay} className="flex items-center gap-16 min-[900px]:gap-12">
                    {index > 0 ? (
                      <ChevronDown
                        size={20}
                        className="shrink-0 text-neutral-6 min-[900px]:hidden"
                        aria-hidden="true"
                      />
                    ) : null}
                    {/* Figma: Paragraph/Regular P3 (18/28), not P2. */}
                    <Text size="p3" className="text-neutral-3">
                      {step}
                    </Text>
                    {/* Figma node 114:99265 etc. ("Frame" icon, 20x20) — the real exported
                        asset, replacing the earlier ChevronRight approximation. */}
                    {index > 0 ? (
                      <Image
                        src="/images/manufacturing/bc-solar/arrow-right.svg"
                        alt=""
                        aria-hidden="true"
                        width={20}
                        height={20}
                        className="hidden shrink-0 min-[900px]:block"
                      />
                    ) : null}
                  </Reveal>
                );
              })}
            </div>
          </div>

          <Reveal as="div">
            {/* Figma Button/Small spec here tracks 0px, not the shared --text-btn-sm
                token's -0.09px, and its icon is 18px, not 20px. */}
            <Button href={data.ctaHref} size="sm" className="h-auto px-24 py-12 tracking-[0px]!">
              {data.ctaLabel}
              <ChevronRight size={18} />
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
