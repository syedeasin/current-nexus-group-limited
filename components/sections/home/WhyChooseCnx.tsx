import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import ReasonAccordion from "@/components/sections/home/why-choose-cnx/ReasonAccordion";
import { whyChooseReasons, DEFAULT_OPEN_KEY } from "@/lib/data/whyChooseCnx";

const LEFT_STEP_MS = 80;
const ACCORDION_BASE_DELAY_MS = 320;
const ACCORDION_STEP_MS = 80;

export default async function WhyChooseCnx() {
  const t = await getTranslations("home.whyChoose");

  const reasons = whyChooseReasons.map((reason) => ({
    key: reason.key,
    icon: reason.icon,
    title: t(`items.${reason.key}.title`),
    body: t(`items.${reason.key}.body`),
  }));

  return (
    <section aria-label={t("heading")} className="w-full bg-primary">
      <Container size="section" className="py-48 md:py-64 xl:py-100">
        <div className="why-choose-grid w-full">
          <div className="why-choose-textblock flex flex-col gap-12">
            <Reveal as="div" delay={0}>
              <SectionEyebrow label={t("eyebrow")} tone="dark" />
            </Reveal>
            <div className="flex flex-col gap-16">
              <Reveal as="div" delay={LEFT_STEP_MS}>
                <Heading level={2} size="h2" className="text-white">
                  {t("heading")}
                </Heading>
              </Reveal>
              <Reveal as="div" delay={LEFT_STEP_MS * 2}>
                <Text size="p2" className="text-neutral-9">
                  {t("paragraph")}
                </Text>
              </Reveal>
            </div>
          </div>

          <div className="why-choose-photo w-full">
            <Reveal as="div" delay={LEFT_STEP_MS * 3} className="relative aspect-[600/338] w-full overflow-hidden rounded-16">
              <Reveal variant="scale" as="div" className="absolute inset-0">
                <Image
                  src="/images/home/whyChooseUs.webp"
                  alt="Technician monitoring the automated solar panel line inside CNX's manufacturing facility"
                  fill
                  sizes="(min-width: 1024px) 600px, 100vw"
                  className="object-cover"
                />
              </Reveal>
            </Reveal>
          </div>

          <div className="why-choose-accordion w-full">
            <ReasonAccordion
              reasons={reasons}
              defaultOpenKey={DEFAULT_OPEN_KEY}
              baseDelay={ACCORDION_BASE_DELAY_MS}
              stepDelay={ACCORDION_STEP_MS}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
