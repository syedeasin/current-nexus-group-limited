import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "@/components/icons/ArrowRight";
import WhyChooseShowcaseExplorer from "@/components/sections/home/why-choose-cnx/WhyChooseShowcaseExplorer";
import { cascade } from "@/lib/motion/timing";
import { entries, str } from "@/lib/page-content/read";

/**
 * Homepage → Why choose us (owner request 31 Oct).
 *
 * Row 1: eyebrow + heading on the left, intro + "Learn more" on the right.
 * Row 2: a full-height photo on the left that follows the reason hovered on
 * the right (desktop); an accordion with each reason's photo inside on phones.
 * Same content as before: Pages → Homepage → Why choose us.
 */
export default async function WhyChooseShowcase() {
  const t = await getTranslations("home.whyChoose");

  const reasons = entries(t.raw("items" as never)).map(([id, item]) => ({
    key: id,
    icon: str(item, "iconImage"),
    title: str(item, "title"),
    body: str(item, "body"),
    image: str(item, "image"),
  }));

  return (
    <section aria-label={t("heading")} className="w-full bg-neutral-1">
      <Container className="flex flex-col gap-48 py-64 md:py-80 xl:py-120">
        {/* Row 1 */}
        <div className="grid gap-20 lg:grid-cols-2 lg:items-end lg:gap-80 xl:gap-120">
          <div className="flex flex-col gap-12">
            <Reveal as="div" delay={cascade(0)}>
              <SectionEyebrow label={t("eyebrow")} tone="dark" />
            </Reveal>
            <TextReveal delay={cascade(1)}>
              <Heading level={2} size="h2" className="text-white">
                {t("heading")}
              </Heading>
            </TextReveal>
          </div>
          <Reveal as="div" delay={cascade(2)} className="flex flex-col items-start gap-24">
            <Text size="p3" className="max-w-[520px] text-neutral-9">
              {t("paragraph")}
            </Text>
            {t("cta") && (
              <Link
                href={t("ctaHref")}
                className="group inline-flex items-center gap-8 text-p3 font-semibold text-white underline decoration-secondary decoration-2 underline-offset-8 transition-colors duration-150 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
              >
                {t("cta")}
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-2 motion-reduce:transition-none" />
              </Link>
            )}
          </Reveal>
        </div>

        {/* Row 2 */}
        <Reveal as="div" delay={cascade(3)}>
          <WhyChooseShowcaseExplorer reasons={reasons} fallbackImage={t("image")} imageAlt={t("imageAlt")} />
        </Reveal>
      </Container>
    </section>
  );
}
