import Image from "next/image";
import { PaintBucket, Settings2, ShieldCheck, FileText, FileSignature, ChevronDown } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Button from "@/components/ui/Button";
import { ChevronRight } from "@/components/icons/ChevronRight";
import type { OdmSection as OdmSectionData } from "@/lib/data/products/types";

const ICONS: Record<string, typeof PaintBucket> = {
  "paint-board": PaintBucket,
  "settings-02": Settings2,
  "new-releases": ShieldCheck,
  "file-01": FileText,
  "agreement-02": FileSignature,
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
          <div className="flex max-w-660 flex-col gap-12">
            <Reveal as="div" delay={0}>
              <SectionEyebrow label={data.eyebrow} />
            </Reveal>
            <Reveal as="div" delay={80}>
              <Heading level={2} size="h2" className="text-balance">
                {data.heading}
              </Heading>
            </Reveal>
          </div>
          <Reveal as="div" delay={160} className="max-w-476">
            <Text size="p1" className="text-neutral-3">
              {data.intro}
            </Text>
          </Reveal>
        </div>

        <Reveal as="div" delay={160} className="rounded-20 bg-white p-24 md:p-32 lg:p-48">
          <div className="flex flex-col gap-48 lg:flex-row lg:gap-60">
            <div className="flex w-full flex-col gap-4 lg:w-630">
              {data.features.map((feature, index) => {
                const Icon = ICONS[feature.icon] ?? FileText;
                const delay = FEATURE_BASE_DELAY_MS + Math.min(index * FEATURE_STEP_MS, FEATURE_STAGGER_CAP_MS);
                return (
                  <Reveal
                    key={feature.title}
                    as="div"
                    delay={delay}
                    className={
                      index < data.features.length - 1
                        ? "flex flex-col gap-12 border-b-2 border-neutral-11 pb-20 pt-20 first:pt-0"
                        : "flex flex-col gap-12 pt-20"
                    }
                  >
                    <div className="flex items-start gap-12">
                      <span className="flex size-52 shrink-0 items-center justify-center rounded-8 border border-neutral-11 bg-surface-2 p-14">
                        <Icon size={24} className="text-secondary" aria-hidden="true" />
                      </span>
                      <div className="flex flex-col gap-4 pt-4">
                        <Heading level={3} size="h6">
                          {feature.title}
                        </Heading>
                        <Text size="p2" className="text-neutral-4">
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

        <div className="flex flex-col gap-32">
          <Reveal as="div">
            <Heading level={3} size="h6">
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
                  <Text size="p2" className="text-neutral-3">
                    {step}
                  </Text>
                  {index > 0 ? (
                    <ChevronRight size={20} className="hidden shrink-0 text-neutral-6 min-[900px]:block" />
                  ) : null}
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal as="div">
          <Button href={data.ctaHref} size="sm" className="h-auto px-24 py-12">
            {data.ctaLabel}
            <ChevronRight size={20} />
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
