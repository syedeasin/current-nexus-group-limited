import Image from "next/image";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { cascade, stagger } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

export interface AwardsCard {
  image: string;
  alt: string;
  caption: string;
}

interface AwardsSectionProps {
  eyebrowLabel: string;
  heading: string;
  backgroundImage: string;
  /** CSS background value for an optional veil over the photo (product pages). Omit for the plain photo (homepage). */
  veilGradient?: string;
  cards: AwardsCard[];
  /** Container top/bottom padding — defaults to the homepage's asymmetric scale. */
  containerClassName?: string;
  /** Eyebrow+heading wrapper classes — defaults to the homepage's spacing/width. */
  headerClassName?: string;
  /** Extra classes for the heading itself, appended after the base H2 style. */
  headingClassName?: string;
  /** Row container classes — defaults to the homepage's variable-count flex-wrap. */
  rowClassName?: string;
  cardClassName?: string;
  logoSizeClassName?: string;
  captionClassName?: string;
}

const HEADING_DELAY_MS = cascade(1);
const CARD_BASE_DELAY_MS = cascade(2);

/**
 * Generic "industry recognition" section — extracted from the homepage
 * Awards component so the product detail template can reuse it with its own
 * copy, background veil, and card sizing.
 */
export default function AwardsSection({
  eyebrowLabel,
  heading,
  backgroundImage,
  veilGradient,
  cards,
  containerClassName = "relative pt-48 pb-56 md:pt-64 md:pb-72 xl:pt-80 xl:pb-100",
  headerClassName = "flex max-w-690 flex-col items-center gap-12 text-center",
  headingClassName,
  rowClassName = "flex w-full flex-wrap justify-center gap-16",
  cardClassName = "flex flex-none basis-[calc((100%-16px)/2-1px)] flex-col items-center gap-12 rounded-16 bg-white p-12 min-[480px]:gap-16 min-[480px]:p-16 md:basis-[calc((100%-32px)/3-1px)] md:gap-24 md:p-20 lg:basis-[calc((100%-48px)/4-1px)] xl:basis-[calc((100%-64px)/5-1px)] xl:gap-32 xl:p-24",
  logoSizeClassName = "relative size-72 shrink-0 min-[480px]:size-88 md:size-120 xl:size-140",
  captionClassName = "line-clamp-2 min-h-40 w-full text-center text-p4 font-medium text-neutral-1 md:min-h-48",
}: AwardsSectionProps) {
  return (
    <section aria-label={heading} className="relative w-full overflow-hidden bg-white">
      <div className="absolute inset-0" aria-hidden="true">
        <Image src={backgroundImage} alt="" fill sizes="100vw" className="object-cover object-top" />
        {veilGradient ? <div className="absolute inset-0" style={{ background: veilGradient }} /> : null}
      </div>
      <Container className={containerClassName}>
        <div className="flex flex-col items-center gap-32 md:gap-40 xl:gap-48">
          <div className={headerClassName}>
            <Reveal as="div">
              <SectionEyebrow label={eyebrowLabel} />
            </Reveal>
            <Reveal as="div" delay={HEADING_DELAY_MS}>
              <Heading level={2} size="h2" className={cn("text-balance", headingClassName)}>
                {heading}
              </Heading>
            </Reveal>
          </div>

          <div className={rowClassName}>
            {cards.map((card, index) => {
              const delay = stagger(index, CARD_BASE_DELAY_MS);
              return (
                <Reveal key={card.caption + index} as="div" delay={delay} className={cardClassName}>
                  <div className={logoSizeClassName}>
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(min-width: 1280px) 140px, (min-width: 768px) 120px, (min-width: 480px) 88px, 72px"
                      className="object-contain"
                    />
                  </div>
                  <p className={cn(captionClassName)}>{card.caption}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
