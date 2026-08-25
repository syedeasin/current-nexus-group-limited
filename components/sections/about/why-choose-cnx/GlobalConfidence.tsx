import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";

const STAT_KEYS = [
  "smartManufacturing",
  "annualProduction",
  "countriesServed",
  "productionTraceability",
  "performanceWarranty",
  "internationalCertifications",
] as const;

const HEADING_DELAY_MS = 80;
const GLOBE_DELAY_MS = 160;
const STAT_BASE_DELAY_MS = 160;
const STAT_STEP_MS = 80;
const STAT_STAGGER_CAP_MS = 400;

export default async function GlobalConfidence() {
  const t = await getTranslations("about.whyChooseCnx.globalConfidence");

  return (
    <section aria-label={t("heading")} className="w-full bg-white">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <div className="flex max-w-656 flex-col gap-8">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={t("eyebrow")} />
          </Reveal>
          <Reveal as="div" delay={HEADING_DELAY_MS}>
            <Heading level={2} size="h2" className="text-balance">
              {t("heading")}
            </Heading>
          </Reveal>
        </div>

        <div className="flex flex-col gap-40 lg:flex-row lg:items-center lg:gap-80">
          <Reveal
            variant="scale"
            delay={GLOBE_DELAY_MS}
            className="relative w-full lg:flex-1"
          >
            <div
              aria-hidden="true"
              className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-full bg-surface-2"
              style={{
                backgroundImage: "radial-gradient(#CECFD1 1.5px, transparent 1.5px)",
                backgroundSize: "16px 16px",
              }}
            />
            <div className="relative mx-auto -mt-64 flex w-full max-w-[340px] flex-col gap-8 rounded-16 bg-white p-24 shadow-[0_16px_40px_rgba(10,13,27,0.12)]">
              <Heading level={3} size="h6">
                {t("certifiedTitle")}
              </Heading>
              <Text size="p3" className="text-neutral-4">
                {t("certifiedBody")}
              </Text>
            </div>
          </Reveal>

          <div className="flex w-full flex-col lg:flex-1">
            {STAT_KEYS.map((key, index) => {
              const delay = STAT_BASE_DELAY_MS + Math.min(index * STAT_STEP_MS, STAT_STAGGER_CAP_MS);
              return (
                <Reveal
                  key={key}
                  as="div"
                  delay={delay}
                  className="flex items-baseline justify-between gap-16 border-b border-neutral-10 py-20 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <span className="text-h4 font-semibold text-neutral-1">
                    {t(`stats.${key}.value`)}
                  </span>
                  <span className="text-p3 text-neutral-4">{t(`stats.${key}.label`)}</span>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
