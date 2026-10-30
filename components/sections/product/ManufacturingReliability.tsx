import Image from "@/components/ui/Picture";
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

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Product page → Manufacturing excellence. Same layout as the About page's
 * "Six reasons" section: left column spaced between (heading and intro level
 * with the photo's top, numbered list level with its bottom), photo right.
 */
export default function ManufacturingReliability({ data }: { data: ManufacturingReliabilityData }) {
  return (
    <section className="w-full bg-white py-64 md:py-80 xl:py-120">
      <Container className="grid gap-48 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch lg:gap-64 xl:gap-96">
        <div className="flex flex-col justify-between gap-40">
          <div className="flex flex-col gap-20">
            <div className="flex flex-col gap-12">
              <Reveal as="div" delay={0}>
                <SectionEyebrow label={data.eyebrow} />
              </Reveal>
              <TextReveal delay={80}>
                <Heading level={2} size="h2" className="text-balance">
                  {data.heading}
                </Heading>
              </TextReveal>
            </div>
            <Reveal as="div" delay={160}>
              <Text size="p3" className="max-w-[560px] text-neutral-3">
                {data.intro}
              </Text>
            </Reveal>
          </div>

          <ol className="flex flex-col border-t border-neutral-10">
            {data.items.map((item, index) => {
              const delay = ITEM_BASE_DELAY_MS + Math.min(index * ITEM_STEP_MS, ITEM_STAGGER_CAP_MS);
              return (
                <Reveal
                  key={item}
                  as="li"
                  delay={delay}
                  className="flex items-baseline gap-16 border-b border-neutral-10 py-18"
                >
                  <span className="w-24 shrink-0 text-p3 font-semibold tabular-nums text-secondary">{pad(index + 1)}</span>
                  <span className="text-h6 font-semibold text-neutral-1">{item}</span>
                </Reveal>
              );
            })}
          </ol>
        </div>

        {/* Stretches to the left column's height on desktop, so its top and
            bottom line up with the heading and the list's last rule. */}
        <Reveal variant="scale" as="div" className="relative h-280 w-full overflow-hidden rounded-16 md:h-400 lg:h-auto lg:min-h-[560px]">
          <Image
            src={data.image}
            alt={data.imageAlt ?? ""}
            aria-hidden={data.imageAlt ? undefined : "true"}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </Reveal>
      </Container>
    </section>
  );
}
