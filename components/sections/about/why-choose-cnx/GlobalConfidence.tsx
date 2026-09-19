import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { cascade, stagger } from "@/lib/motion/timing";

const STAT_KEYS = [
  "smartManufacturing",
  "annualProduction",
  "countriesServed",
  "productionTraceability",
  "performanceWarranty",
  "internationalCertifications",
] as const;

export default async function GlobalConfidence() {
  const t = await getTranslations("about.whyChooseCnx.globalConfidence");

  return (
    <section aria-label={t("heading")} className="w-full bg-white">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <div className="flex max-w-656 flex-col gap-8">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={t("eyebrow")} />
          </Reveal>
          <Reveal as="div" delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-balance">
              {t("heading")}
            </Heading>
          </Reveal>
        </div>

        <div className="flex flex-col gap-40 lg:flex-row lg:items-center lg:gap-80">
          {/* Left: dotted globe with the certification card overlapping its base,
              matching the Figma composition (node 2080-18094). Real photo asset,
              not the hand-drawn canvas sphere this used to render — Figma's globe
              is a flat dotted world map graphic, not an abstract rotating sphere. */}
          <Reveal variant="fade" delay={cascade(2)} className="relative w-full lg:flex-1">
            <div className="relative mx-auto aspect-[1056/864] w-full max-w-[700px]">
              <Image
                src="/images/about/whyChooseCNX/globe.webp"
                alt="Dotted world map representing CNX's global manufacturing and distribution reach"
                fill
                sizes="(min-width: 1024px) 700px, 100vw"
                className="object-contain"
              />
            </div>
            <div className="relative z-10 mx-auto -mt-[220px] w-full max-w-[480px] rounded-16 border border-neutral-10 bg-white/90 p-24 shadow-[0_16px_40px_rgba(10,13,27,0.10)] backdrop-blur-sm">
              <div className="flex flex-col gap-8 text-center">
                <Heading level={3} size="h6">
                  {t("certifiedTitle")}
                </Heading>
                <Text size="p3" className="text-neutral-4">
                  {t("certifiedBody")}
                </Text>
              </div>
            </div>
          </Reveal>

          <div className="flex w-full flex-col lg:flex-1">
            {STAT_KEYS.map((key, index) => (
              <Reveal
                key={key}
                as="div"
                delay={stagger(index, cascade(2))}
                className="flex items-baseline justify-between gap-16 border-b border-neutral-10 py-20 first:pt-0 last:border-b-0 last:pb-0"
              >
                <span className="text-h4 font-semibold text-secondary">
                  {t(`stats.${key}.value`)}
                </span>
                <span className="text-p3 text-neutral-4">{t(`stats.${key}.label`)}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
