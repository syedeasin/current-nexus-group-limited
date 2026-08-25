import Image from "next/image";
import { Download } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
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
          <Reveal as="div" delay={80}>
            <Heading level={2} size="h2" className="text-balance">
              {data.heading}
            </Heading>
          </Reveal>
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
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(min-width: 1024px) 576px, 100vw"
                    className="object-cover lg:rounded-l-16"
                  />
                </Reveal>

                <div className="flex w-full flex-col gap-32 p-24 md:p-32 lg:w-624 lg:gap-48 lg:p-0">
                  <div className="flex flex-col gap-16">
                    <div className="flex items-center gap-8 text-p3 text-neutral-3">
                      <span>{variant.eyebrowPair[0]}</span>
                      <span className="h-[1.5px] w-8 bg-neutral-9" aria-hidden="true" />
                      <span>{variant.eyebrowPair[1]}</span>
                    </div>
                    <Heading level={3} size="h4">
                      {variant.name}
                    </Heading>
                    <Text size="p1" className="text-neutral-4">
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
                        <span className="text-p2 text-neutral-3 sm:w-143 sm:shrink-0">{spec.label}</span>
                        <span className="text-p2 font-medium text-neutral-1">{spec.value}</span>
                      </div>
                    ))}
                  </div>

                  <Button href={variant.buttonHref} size="xl" className="w-full sm:w-auto">
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
