import Image from "next/image";
import { Download } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Button from "@/components/ui/Button";
import type { ProductVariantsSection } from "@/lib/data/products/types";

const CARD_STEP_MS = 160;

export default function ProductVariants({ data }: { data: ProductVariantsSection }) {
  return (
    <section className="w-full bg-white pt-80 pb-100">
      <Container className="flex flex-col gap-48">
        <div className="mx-auto flex max-w-590 flex-col items-center gap-12 text-center">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={data.eyebrow} />
          </Reveal>
          <TextReveal delay={80}>
            <Heading level={2} size="h2" className="text-balance">
              {data.heading}
            </Heading>
          </TextReveal>
        </div>

        <div className="flex flex-col gap-60">
          {data.variants.map((variant, index) => (
            <div key={variant.name} className={index > 0 ? "flex flex-col gap-60 border-t border-neutral-10 pt-60" : ""}>
              <Reveal
                as="div"
                delay={160 + index * CARD_STEP_MS}
                className="flex flex-col overflow-hidden rounded-16 border border-neutral-10 bg-surface-2 lg:flex-row lg:items-center lg:justify-between lg:pr-60"
              >
                <Reveal variant="scale" as="div" className="relative h-320 w-full shrink-0 md:h-420 lg:h-656 lg:w-576">
                  <Image
                    src={variant.image}
                    alt={variant.imageAlt ?? ""}
                    aria-hidden={variant.imageAlt ? undefined : "true"}
                    fill
                    sizes="(min-width: 1024px) 576px, 100vw"
                    className="object-cover lg:rounded-l-16"
                  />
                </Reveal>

                <div className="flex w-full flex-col gap-32 p-24 md:p-32 lg:w-624 lg:gap-48 lg:p-0">
                  <div className="flex flex-col gap-16">
                    {/* Figma: Paragraph/Regular P4 (16/24), not P3. */}
                    <div className="flex items-center gap-8 text-p4 text-neutral-3">
                      <span>{variant.eyebrowPair[0]}</span>
                      <span className="h-[1.5px] w-8 bg-neutral-9" aria-hidden="true" />
                      <span>{variant.eyebrowPair[1]}</span>
                    </div>
                    {/* Figma H4 spec (node 2254:9556 etc.) tracks -1px, not the shared
                        --text-h4 token's -0.32px. */}
                    <Heading level={3} size="h4" className="tracking-[-1px]!">
                      {variant.name}
                    </Heading>
                    {/* Figma: Paragraph/Regular P2 (20/32), not P1. */}
                    <Text size="p2" className="text-neutral-4">
                      {variant.body}
                    </Text>
                  </div>

                  <div className="flex flex-col gap-16">
                    {variant.specs.map((spec, specIndex) => (
                      <div
                        key={spec.label}
                        className={
                          specIndex < 2
                            ? "flex flex-col gap-4 border-b border-neutral-10 pb-16 sm:flex-row sm:gap-32"
                            : "flex flex-col gap-4 sm:flex-row sm:gap-32"
                        }
                      >
                        {/* Figma spec rows (node 2254:9560/9561 etc.): Paragraph P3 (18/28) for
                            both label and value, not P2. */}
                        <span className="text-p3 text-neutral-3 sm:w-143 sm:shrink-0">{spec.label}</span>
                        <span className="text-p3 font-medium text-neutral-1">{spec.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Figma button text tracks -1px, not the shared --text-btn-lg token's -0.2px.
                      self-start: the parent is flex-col (default align-items: stretch), which
                      was stretching the button to full width despite its own inline-flex
                      sizing — this overrides just this child to hug its content, left-aligned. */}
                  <Button href={variant.buttonHref} size="xl" className="self-start tracking-[-1px]!">
                    <Download size={20} />
                    {variant.buttonLabel}
                  </Button>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
