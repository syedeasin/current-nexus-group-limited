import Image from "next/image";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import type { ManufacturingReliability as ManufacturingReliabilityData } from "@/lib/data/products/types";

const ITEM_BASE_DELAY_MS = 240;
const ITEM_STEP_MS = 80;
const ITEM_STAGGER_CAP_MS = 400;

export default function ManufacturingReliability({ data }: { data: ManufacturingReliabilityData }) {
  return (
    <section className="w-full bg-white py-80 md:py-100 xl:py-120">
      <Container className="flex flex-col gap-48">
        {/* Figma node 2254:9003: this header is centered (unlike Product Introduction's
            left-aligned one above it) — badge row justify-center, heading text-center. */}
        <div className="mx-auto flex max-w-810 flex-col items-center gap-12">
          <Reveal as="div" delay={0} className="w-full">
            <SectionEyebrow label={data.eyebrow} className="justify-center" />
          </Reveal>
          <TextReveal delay={80}>
            <Heading level={2} size="h2" className="text-balance text-center">
              {data.heading}
            </Heading>
          </TextReveal>
        </div>

        <div className="flex flex-col gap-48 lg:flex-row lg:justify-between">
          <div className="flex w-full flex-col gap-48 lg:w-620">
            <Reveal as="div" delay={160}>
              {/* Figma: Paragraph/Regular P2 (20/32), not P1. */}
              <Text size="p2" className="text-neutral-3">
                {data.intro}
              </Text>
            </Reveal>

            {/* Figma node 2254:9015: a divider before every item AND one closing the
                list after the last item — not just between items. */}
            <div className="flex flex-col gap-16 border-t border-neutral-10 pt-16">
              {data.items.map((item, index) => {
                const delay = ITEM_BASE_DELAY_MS + Math.min(index * ITEM_STEP_MS, ITEM_STAGGER_CAP_MS);
                return (
                  <Reveal
                    key={item}
                    as="div"
                    delay={delay}
                    className="flex items-center gap-12 border-b border-neutral-10 pb-16"
                  >
                    <span className="size-8 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                    {/* Figma: Paragraph/Medium P2 (20/32), not P1. */}
                    <Text size="p2" weight="medium" className="text-neutral-3">
                      {item}
                    </Text>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <Reveal
            variant="scale"
            as="div"
            className="relative h-280 w-full shrink-0 md:h-360 lg:h-560 lg:w-620"
          >
            <Image
              src={data.image}
              alt={data.imageAlt ?? ""}
              aria-hidden={data.imageAlt ? undefined : "true"}
              fill
              sizes="(min-width: 1024px) 620px, 100vw"
              className="rounded-16 object-cover"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
