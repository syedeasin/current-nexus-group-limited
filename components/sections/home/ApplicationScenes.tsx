import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import ApplicationScenesCarousel from "@/components/sections/home/application-scenes/ApplicationScenesCarousel";
import { cascade } from "@/lib/motion/timing";
import { entries, str } from "@/lib/page-content/read";

export default async function ApplicationScenes() {
  const t = await getTranslations("home.applicationScenes");

  const cards = entries(t.raw("cards" as never)).map(([id, card]) => ({
    key: id,
    title: str(card, "title"),
    description: str(card, "description"),
    image: str(card, "image"),
    href: str(card, "href") || "#",
  }));

  return (
    <section
      aria-label={t("heading")}
      className="w-full bg-surface-2 pt-48 pb-40 md:pt-64 md:pb-56 xl:pt-100 xl:pb-80"
    >
      <Container>
        <div className="flex w-full flex-col items-center gap-12">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={t("eyebrow")} />
          </Reveal>
          <TextReveal delay={cascade(1)}>
            <Heading level={2} size="h2" className="max-w-650 text-balance text-center">
              {t("heading")}
            </Heading>
          </TextReveal>
        </div>
      </Container>

      <Container className="mt-48">
        <ApplicationScenesCarousel
          cards={cards}
          ariaLabel={t("heading")}
          previousLabel={t("previous")}
          nextLabel={t("next")}
        />
      </Container>
    </section>
  );
}
