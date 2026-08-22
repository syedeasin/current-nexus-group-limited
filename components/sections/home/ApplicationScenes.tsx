import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import SceneCarousel from "@/components/sections/home/application-scenes/SceneCarousel";
import { applicationScenes } from "@/lib/data/applicationScenes";

export default async function ApplicationScenes() {
  const t = await getTranslations("home.applicationScenes");

  const cards = applicationScenes.map((scene) => ({
    key: scene.key,
    title: t(`cards.${scene.key}.title`),
    description: t(`cards.${scene.key}.description`),
    image: scene.image,
    href: scene.href,
  }));

  return (
    <section
      aria-label={t("heading")}
      className="w-full bg-surface-2 pt-48 pb-40 md:pt-64 md:pb-56 xl:pt-100 xl:pb-80"
    >
      <Container>
        <div className="flex w-full flex-col items-center gap-12">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={t("eyebrow")} />
          </Reveal>
          <Reveal as="div" delay={80}>
            <Heading level={2} size="h2" className="max-w-682 text-balance text-center">
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
