import Image from "next/image";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Carousel from "@/components/ui/Carousel";
import type { ManufacturingWorkflow as ManufacturingWorkflowData } from "@/lib/data/products/types";

const STEP_BASE_DELAY_MS = 160;
const STEP_STEP_MS = 80;
const STEP_STAGGER_CAP_MS = 400;

export default function ManufacturingWorkflow({ data }: { data: ManufacturingWorkflowData }) {
  return (
    <section className="w-full bg-surface-2 py-100">
      <Container className="flex flex-col gap-48">
        <div className="flex flex-col gap-24 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-482 flex-col gap-12">
            <Reveal as="div" delay={0}>
              <SectionEyebrow label={data.eyebrow} />
            </Reveal>
            <Reveal as="div" delay={80}>
              <Heading level={2} size="h2" className="text-balance">
                {data.heading}
              </Heading>
            </Reveal>
          </div>
          <Reveal as="div" delay={160} className="max-w-479">
            {/* Figma: Paragraph/Regular P2 (20/32), not P1. */}
            <Text size="p2" className="text-neutral-3">
              {data.intro}
            </Text>
          </Reveal>
        </div>

        <div className="relative overflow-hidden rounded-20 border border-neutral-10 bg-white p-24 md:p-32 lg:p-60">
          {/* Figma has no arrow buttons or progress bar for this section — only the
              scrollable track and the right-edge fade. */}
          <Carousel ariaLabel={data.heading} progressVariant="none" rowClassName="gap-24">
            {data.steps.map((step, index) => {
              const delay = STEP_BASE_DELAY_MS + Math.min(index * STEP_STEP_MS, STEP_STAGGER_CAP_MS);
              return (
                <Reveal
                  key={step.label}
                  as="div"
                  delay={delay}
                  className="flex w-[80vw] shrink-0 snap-start flex-col gap-64 sm:w-408 md:gap-100"
                >
                  <div className="flex items-center gap-24">
                    {/* Figma: Paragraph/Regular P4 (16/24), not P3. */}
                    <span className="w-56 shrink-0 text-p4 text-neutral-3">{step.label}</span>
                    <span className="flex flex-1 items-center gap-0" aria-hidden="true">
                      <span className="size-4 shrink-0 rounded-full bg-secondary" />
                      <span className="h-[1.5px] flex-1 bg-secondary" />
                      <span className="size-4 shrink-0 rounded-full bg-secondary" />
                    </span>
                  </div>
                  {/* Figma node 2254:9072: the icon sits above the heading/body, gap-32 —
                      it isn't inline with the step-number row above. */}
                  <div className="flex flex-col gap-32">
                    <Image
                      src="/images/manufacturing/bc-solar/manufacturing-step-icon.svg"
                      alt=""
                      aria-hidden="true"
                      width={40}
                      height={40}
                    />
                    <div className="flex flex-col gap-12 pr-0 md:pr-48">
                      {/* Figma H5 spec is 24/32/-0.5px; the shared --text-h5 token tracks
                          -0.24px elsewhere, so it's overridden here to match exactly. */}
                      <Heading level={3} size="h5" className="tracking-[-0.5px] text-neutral-3">
                        {step.title}
                      </Heading>
                      {/* Figma: Paragraph/Regular P2 (20/32), not P1. */}
                      <Text size="p2" className="text-neutral-3">
                        {step.body}
                      </Text>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </Carousel>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-126 md:block"
            style={{ background: "linear-gradient(to right, rgba(255,255,255,0) 0%, #FFFFFF 100%)" }}
          />
        </div>
      </Container>
    </section>
  );
}
