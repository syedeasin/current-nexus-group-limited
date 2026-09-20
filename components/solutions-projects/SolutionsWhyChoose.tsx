import Image from "next/image";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { cascade, stagger } from "@/lib/motion/timing";
import type { SolutionWhyChooseSection } from "@/lib/solutions-projects/types";

/**
 * Data-driven port of WhyChooseResidential (Figma node 4028:10466). Feature
 * cards are a repeater; the overlapping card row, image aspect and typography
 * are the master design verbatim.
 */
export default function SolutionsWhyChoose({
  eyebrow,
  heading,
  description,
  image,
  features,
}: SolutionWhyChooseSection) {
  return (
    <section aria-label={heading} className="w-full bg-surface-2">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <div className="flex flex-col gap-24 lg:flex-row lg:items-end lg:justify-between lg:gap-48">
          <div className="flex flex-col gap-12 xl:max-w-482">
            <Reveal as="div" delay={cascade(0)}>
              <SectionEyebrow label={eyebrow} />
            </Reveal>
            <Reveal as="div" delay={cascade(1)}>
              <Heading level={2} size="h2" className="tracking-[-1.2px]!">
                {heading}
              </Heading>
            </Reveal>
          </div>
          <Reveal as="div" delay={cascade(2)} className="max-w-600 lg:max-w-458">
            <Text size="p2" className="text-neutral-3">
              {description}
            </Text>
          </Reveal>
        </div>

        <div className="flex flex-col">
          <Reveal
            variant="scale"
            delay={cascade(2)}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-16 sm:aspect-[1320/480]"
          >
            <Image
              src={image}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1600px) 1320px, 100vw"
              className="object-cover"
            />
          </Reveal>

          <div className="mt-24 grid grid-cols-1 gap-20 sm:mt-32 sm:grid-cols-2 lg:-mt-102 lg:grid-cols-3 lg:px-32">
            {features.map((feature, index) => (
              <Reveal
                key={`${feature.title}-${index}`}
                as="div"
                delay={stagger(index, cascade(3))}
                className="flex flex-col gap-24 rounded-16 border border-neutral-10 bg-white p-24"
              >
                <Image src={feature.icon} alt="" aria-hidden="true" width={40} height={40} />
                <div className="flex flex-col gap-8">
                  <Heading level={3} size="h6">
                    {feature.title}
                  </Heading>
                  <Text size="p3" className="text-neutral-3">
                    {feature.description}
                  </Text>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
