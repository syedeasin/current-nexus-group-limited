import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import WorkflowScroller from "@/components/sections/product/WorkflowScroller";
import type { ManufacturingWorkflow as ManufacturingWorkflowData } from "@/lib/data/products/types";

/**
 * Product page → Manufacturing workflow. The header and steps share one
 * pinned stage on desktop: scrolling down slides the steps sideways and
 * draws the gold line from step to step (see WorkflowScroller).
 */
export default function ManufacturingWorkflow({ data }: { data: ManufacturingWorkflowData }) {
  const header = (
    <div className="flex flex-col gap-24 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex max-w-482 flex-col gap-12">
        <Reveal as="div" delay={0}>
          <SectionEyebrow label={data.eyebrow} />
        </Reveal>
        <TextReveal delay={80}>
          <Heading level={2} size="h2" className="text-balance">
            {data.heading}
          </Heading>
        </TextReveal>
      </div>
      <Reveal as="div" delay={160} className="max-w-479">
        <Text size="p3" className="text-neutral-3">
          {data.intro}
        </Text>
      </Reveal>
    </div>
  );

  return (
    <section className="w-full bg-surface-2 py-64 md:py-80 xl:py-100">
      <Container>
        <WorkflowScroller header={header} steps={data.steps} ariaLabel={data.heading} />
      </Container>
    </section>
  );
}
