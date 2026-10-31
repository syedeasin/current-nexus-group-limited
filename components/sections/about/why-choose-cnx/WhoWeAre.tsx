import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { cascade, stagger } from "@/lib/motion/timing";
import { entries, str } from "@/lib/page-content/read";

/**
 * About Us → "Who we are" + "Our Business at a Glance" (client brief, revision
 * 1022). Heading on the left, copy on the right (one larger lead paragraph,
 * the rest quieter), then the four figures as one divided row — no cards.
 */
export default async function WhoWeAre() {
  const t = await getTranslations("about.whyChooseCnx.whoWeAre");
  const paragraphs = t("body")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const stats = entries(t.raw("stats" as never)).map(([id, stat]) => ({
    id,
    value: str(stat, "value"),
    suffix: str(stat, "suffix"),
    label: str(stat, "label"),
  }));

  return (
    <section aria-label={t("heading")} className="w-full bg-white">
      <Container className="flex flex-col gap-48 py-64 md:py-80 xl:py-120">
        <div className="grid gap-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-80">
          <div className="flex flex-col gap-12">
            <Reveal as="div" delay={cascade(0)}>
              <SectionEyebrow label={t("eyebrow")} />
            </Reveal>
            <TextReveal delay={cascade(1)}>
              <Heading level={2} size="h2" className="text-balance">
                {t("heading")}
              </Heading>
            </TextReveal>
          </div>

          <Reveal as="div" delay={cascade(2)} className="flex flex-col gap-20 lg:pt-36">
            <Text size="p1" className="font-medium text-neutral-1">
              {t("lead")}
            </Text>
            {paragraphs.map((paragraph, index) => (
              <Text key={index} size="p3" className="text-neutral-4">
                {paragraph}
              </Text>
            ))}
            {t("cta") && (
              <Link
                href={t("ctaHref")}
                className="group mt-4 inline-block w-fit text-btn-sm font-semibold text-neutral-1 underline decoration-secondary decoration-2 underline-offset-8 transition-colors duration-150 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
              >
                {t("cta")}
                <ArrowRight size={16} className="ml-8 inline-block align-[-3px] transition-transform duration-200 group-hover:translate-x-2 motion-reduce:transition-none" />
              </Link>
            )}
          </Reveal>
        </div>

        <div className="flex flex-col gap-24">
          <Reveal as="div" delay={cascade(2)}>
            <Heading level={3} size="h6" className="text-neutral-4">
              {t("glanceTitle")}
            </Heading>
          </Reveal>
          <dl className="grid grid-cols-2 gap-y-32 border-t border-neutral-10 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Reveal
                key={stat.id}
                as="div"
                delay={stagger(index, cascade(3))}
                className="flex flex-col gap-8 border-neutral-10 pt-24 pr-16 even:border-l even:pl-16 lg:border-l lg:pl-32 lg:first:border-l-0 lg:first:pl-0"
              >
                <dt className="order-2 text-p3 text-neutral-4">
                  <span className="block font-semibold text-neutral-1">{stat.suffix}</span>
                  {stat.label}
                </dt>
                <dd className="order-1 text-[44px] font-semibold leading-[1] tracking-[-1px] text-neutral-1 md:text-[56px]">
                  {stat.value}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
