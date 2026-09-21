import Image from "next/image";
import { Download } from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { CARD_IMAGE_ZOOM, CARD_LIFT } from "@/lib/motion/interactions";
import { CONTENT_BASE_DELAY_MS, cascade, stagger } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";
import type { SolutionProductModelsSection } from "@/lib/solutions-projects/types";

/**
 * Data-driven port of ResidentialProductModels (Figma node 4028:10516). Product
 * cards are a repeater. Button variants match the master design: the first card
 * a filled/transparent-bordered button, others a neutral hairline outline.
 */
export default function SolutionsProductModels({
  eyebrow,
  heading,
  datasheetLabel,
  products,
}: SolutionProductModelsSection) {
  return (
    <section aria-label={heading} className="w-full bg-white py-48 md:py-64 xl:py-100">
      <Container>
        <div className="flex w-full flex-col items-center gap-48">
          <div className="flex w-full max-w-560 flex-col items-center gap-12 md:max-w-680 xl:max-w-790">
            <Reveal as="div" delay={cascade(0)}>
              <SectionEyebrow label={eyebrow} />
            </Reveal>
            <TextReveal delay={cascade(1)}>
              <Heading level={2} size="h2" className="text-balance text-center tracking-[-1.2px]!">
                {heading}
              </Heading>
            </TextReveal>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-24 sm:flex-row sm:items-stretch">
            {products.map((product, index) => {
              const isPrimary = (product.buttonVariant ?? "primary") === "primary";
              return (
                <Reveal
                  key={`${product.name}-${index}`}
                  as="div"
                  delay={stagger(index, CONTENT_BASE_DELAY_MS)}
                  className="w-full max-w-424 sm:min-w-0 sm:flex-1"
                >
                  <div
                    className={cn(
                      "group flex h-full flex-col overflow-hidden rounded-16 border border-neutral-10 bg-surface-2",
                      CARD_LIFT
                    )}
                  >
                    <div className="relative aspect-[424/340] w-full overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.imageAlt || product.name}
                        fill
                        sizes="(min-width: 1024px) 424px, (min-width: 640px) 45vw, 90vw"
                        className={cn("object-contain p-32", CARD_IMAGE_ZOOM)}
                      />
                    </div>

                    <div className="flex flex-1 flex-col items-center gap-20 px-24 pb-24">
                      <Heading level={3} size="h6" className="text-center text-balance">
                        {product.name}
                      </Heading>
                      <Button
                        href={product.datasheetHref}
                        size="lg"
                        variant={isPrimary ? "primary" : "ghost"}
                        aria-label={`${datasheetLabel} — ${product.name}`}
                        className={cn(
                          "mt-auto h-auto min-h-48 max-w-full shrink whitespace-normal px-16 py-12 text-center min-[481px]:px-24",
                          isPrimary
                            ? "border-[1.5px] border-transparent"
                            : "border-[1.5px] border-neutral-10 hover:bg-neutral-11 hover:text-neutral-1"
                        )}
                      >
                        <Download size={18} aria-hidden="true" className="shrink-0" />
                        {datasheetLabel}
                      </Button>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
