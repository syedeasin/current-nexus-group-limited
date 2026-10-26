import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "@/components/icons/ArrowRight";
import WhyChooseExplorer from "@/components/sections/home/why-choose-cnx/WhyChooseExplorer";
import { cascade } from "@/lib/motion/timing";
import { entries, str } from "@/lib/page-content/read";

/**
 * Homepage → Why choose us. Header and a quiet text link on the left with a
 * photo per reason; the six reasons on the right step through as the visitor
 * scrolls (see WhyChooseExplorer). Each reason's photo is set in Pages →
 * Homepage → Why choose us.
 */
export default async function WhyChooseCnx() {
  const t = await getTranslations("home.whyChoose");

  const reasons = entries(t.raw("items" as never)).map(([id, item]) => ({
    key: id,
    icon: str(item, "iconImage"),
    title: str(item, "title"),
    body: str(item, "body"),
    image: str(item, "image"),
  }));

  const header = (
    <div className="flex flex-col gap-12">
      <Reveal as="div" delay={cascade(0)}>
        <SectionEyebrow label={t("eyebrow")} tone="dark" />
      </Reveal>
      <div className="flex flex-col gap-16">
        <TextReveal delay={cascade(1)}>
          <Heading level={2} size="h2" className="text-white">
            {t("heading")}
          </Heading>
        </TextReveal>
        <Reveal as="div" delay={cascade(2)}>
          <Text size="p3" className="max-w-[520px] text-neutral-9">
            {t("paragraph")}
          </Text>
        </Reveal>
      </div>
      {t("cta") && (
        <Reveal as="div" delay={cascade(3)} className="mt-12">
          {/* Text link, not a filled button: the section's focus is the reasons. */}
          <Link
            href={t("ctaHref")}
            className="group inline-flex items-center gap-8 text-p3 font-semibold text-white underline decoration-secondary decoration-2 underline-offset-8 transition-colors duration-150 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          >
            {t("cta")}
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-2 motion-reduce:transition-none" />
          </Link>
        </Reveal>
      )}
    </div>
  );

  return (
    <section aria-label={t("heading")} className="w-full bg-neutral-1">
      <Container className="py-64 md:py-80 xl:py-120">
        <WhyChooseExplorer header={header} reasons={reasons} fallbackImage={t("image")} imageAlt={t("imageAlt")} />
      </Container>
    </section>
  );
}
