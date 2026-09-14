import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import SceneCarousel from "@/components/sections/home/application-scenes/SceneCarousel";
import { residentialApplications } from "@/lib/data/solutions/residential";
import { cascade } from "@/lib/motion/timing";

/**
 * Figma node 4028:10542. Geometrically identical to the homepage's Application
 * Scenes — 424×300 cards on a 1320px column with a 24px gutter, a progress rule
 * and a prev/next pair underneath — so it reuses `SceneCarousel` rather than
 * restating the scroll mechanics. The cards here have no destination page yet,
 * so no `href` is passed and they render as plain blocks.
 */
export default async function ResidentialApplications() {
  const t = await getTranslations("solutions.residential.applications");

  const cards = residentialApplications.map((scene, index) => ({
    // The design repeats one photo across the last two cards, so the image
    // alone is not a unique key.
    key: `${scene.key}-${index}`,
    title: t(`cards.${scene.key}.title` as never),
    description: t(`cards.${scene.key}.description` as never),
    image: scene.image,
  }));

  return (
    <section
      aria-label={t("heading")}
      className="w-full bg-white py-48 md:py-64 xl:py-100"
    >
      <Container>
        <div className="mx-auto flex max-w-536 flex-col items-center gap-12">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={t("eyebrow")} />
          </Reveal>
          <Reveal as="div" delay={cascade(1)}>
            {/* Figma tracks this H2 at -1.2px, not the shared --text-h2 token's -0.72px. */}
            <Heading
              level={2}
              size="h2"
              className="text-balance text-center tracking-[-1.2px]!"
            >
              {t("heading")}
            </Heading>
          </Reveal>
        </div>
      </Container>

      <Container className="mt-48">
        <SceneCarousel
          cards={cards}
          ariaLabel={t("heading")}
          previousLabel={t("previous")}
          nextLabel={t("next")}
        />
      </Container>
    </section>
  );
}
