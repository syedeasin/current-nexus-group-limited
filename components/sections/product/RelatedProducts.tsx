import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Carousel from "@/components/ui/Carousel";
import ManufacturingProductCard from "@/components/sections/manufacturing/ProductCard";
import type { RelatedProductsSection } from "@/lib/data/products/types";

const CARD_STEP_MS = 80;
const CARD_STAGGER_CAP_MS = 400;

export default function RelatedProducts({
  data,
  learnMoreLabel,
  previousLabel,
  nextLabel,
}: {
  data: RelatedProductsSection;
  learnMoreLabel: string;
  previousLabel: string;
  nextLabel: string;
}) {
  return (
    <section className="w-full bg-white pt-100 pb-80">
      <Container className="flex flex-col gap-48">
        <Reveal as="div" className="flex flex-col gap-12">
          <SectionEyebrow label={data.eyebrow} />
          <Heading level={2} size="h2" className="text-balance">
            {data.heading}
          </Heading>
        </Reveal>

        <Carousel ariaLabel={data.heading} controls={{ previousLabel, nextLabel }}>
          {data.items.map((item, index) => {
            const delay = Math.min(index * CARD_STEP_MS, CARD_STAGGER_CAP_MS);
            return (
              <Reveal
                key={item.title}
                as="div"
                delay={delay}
                className="w-[85vw] shrink-0 snap-start sm:w-400 lg:w-648"
              >
                <ManufacturingProductCard
                  href={item.href}
                  image={item.image}
                  title={item.title}
                  description={item.body}
                  learnMoreLabel={learnMoreLabel}
                  featured={item.featured}
                />
              </Reveal>
            );
          })}
        </Carousel>
      </Container>
    </section>
  );
}
