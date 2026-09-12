import type { ReactNode } from "react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";

export interface FeatureGridItem {
  icon: ReactNode;
  title: string;
  body: string;
}

interface FeatureGridProps {
  eyebrowLabel: string;
  heading: string;
  items: FeatureGridItem[];
  className?: string;
}

const HEADING_DELAY_MS = 80;
const CARD_BASE_DELAY_MS = 160;
const CARD_STEP_MS = 80;
const CARD_STAGGER_CAP_MS = 400;

/**
 * Generic "N reasons why" 3x2 icon-card grid — extracted from the Why Choose
 * CNX page's CompetitiveAdvantage section so the product detail template can
 * reuse the identical layout with its own copy and icon set.
 */
export default function FeatureGrid({ eyebrowLabel, heading, items, className }: FeatureGridProps) {
  return (
    <section aria-label={heading} className={className}>
      <Container className="flex flex-col items-center gap-48 py-48 md:py-64 xl:py-100">
        <div className="flex max-w-616 flex-col items-center gap-8 text-center">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={eyebrowLabel} />
          </Reveal>
          <Reveal as="div" delay={HEADING_DELAY_MS}>
            <Heading level={2} size="h2" className="text-balance">
              {heading}
            </Heading>
          </Reveal>
        </div>

        <div className="grid w-full grid-cols-1 gap-24 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const delay = CARD_BASE_DELAY_MS + Math.min(index * CARD_STEP_MS, CARD_STAGGER_CAP_MS);
            return (
              <Reveal
                key={item.title}
                as="div"
                delay={delay}
                className="flex flex-col gap-24 rounded-16 border-[1.5px] border-neutral-10 bg-white p-32"
              >
                {item.icon}
                <div className="flex flex-col gap-12">
                  <Heading level={3} size="h6">
                    {item.title}
                  </Heading>
                  {/* Figma node 2254:8908 etc: Paragraph/Regular P3 (18/28 desktop), not P2. */}
                  <Text size="p3" className="text-neutral-3">
                    {item.body}
                  </Text>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
