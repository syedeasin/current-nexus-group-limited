import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import SceneCarousel from "@/components/sections/home/application-scenes/SceneCarousel";
import { cascade } from "@/lib/motion/timing";
import type { SolutionApplicationsSection } from "@/lib/solutions-projects/types";

/**
 * Data-driven port of ResidentialApplications (Figma node 4028:10542). Reuses
 * SceneCarousel — geometrically identical to the homepage scenes. Cards are a
 * repeater and render as presentational blocks (no href).
 */
export default function SolutionsApplications({
  eyebrow,
  heading,
  previousLabel,
  nextLabel,
  cards,
}: SolutionApplicationsSection) {
  const carouselCards = cards.map((card, index) => ({
    key: `${card.title}-${index}`,
    title: card.title,
    description: card.description,
    image: card.image,
  }));

  return (
    <section aria-label={heading} className="w-full bg-white py-48 md:py-64 xl:py-100">
      <Container>
        <div className="mx-auto flex max-w-536 flex-col items-center gap-12">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={eyebrow} />
          </Reveal>
          <TextReveal delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-balance text-center tracking-[-1.2px]!">
              {heading}
            </Heading>
          </TextReveal>
        </div>
      </Container>

      <Container className="mt-48">
        <SceneCarousel
          cards={carouselCards}
          ariaLabel={heading}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
        />
      </Container>
    </section>
  );
}
