import Image from "next/image";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import type { ProductIntroduction as ProductIntroductionData } from "@/lib/data/products/types";

export default function ProductIntroduction({ data }: { data: ProductIntroductionData }) {
  return (
    <section className="w-full bg-surface-2 py-100">
      <Container>
        <div className="flex w-full flex-col overflow-hidden rounded-16 bg-white lg:flex-row lg:items-stretch">
          <Reveal
            variant="scale"
            as="div"
            className="relative h-320 w-full shrink-0 md:h-420 lg:h-auto lg:w-568"
          >
            <Image
              src={data.image}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1024px) 568px, 100vw"
              className="object-cover"
            />
          </Reveal>

          <div className="flex w-full flex-col gap-24 p-24 md:p-32 lg:w-752 lg:p-64">
            <Reveal as="div" delay={0}>
              <SectionEyebrow label={data.eyebrow} />
            </Reveal>
            <Reveal as="div" delay={80}>
              <Heading level={2} size="h2" className="text-balance">
                {data.heading}
              </Heading>
            </Reveal>
            <div className="flex flex-col gap-16">
              {data.paragraphs.map((paragraph, index) => (
                <Reveal key={paragraph} as="div" delay={160 + index * 80}>
                  <Text size="p1" className="text-neutral-3">
                    {paragraph}
                  </Text>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
