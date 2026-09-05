import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import ReasonAccordion from "@/components/sections/home/why-choose-cnx/ReasonAccordion";
import { cascade, REVEAL_STEP_MS } from "@/lib/motion/timing";
import { whyChooseReasons, DEFAULT_OPEN_KEY } from "@/lib/data/whyChooseCnx";

const ACCORDION_BASE_DELAY_MS = cascade(4);

export default async function WhyChooseCnx() {
  const t = await getTranslations("home.whyChoose");

  const reasons = whyChooseReasons.map((reason) => ({
    key: reason.key,
    icon: reason.icon,
    title: t(`items.${reason.key}.title`),
    body: t(`items.${reason.key}.body`),
  }));

  return (
    <section aria-label={t("heading")} className="w-full bg-neutral-1">
      <Container className="py-48 md:py-64 xl:py-100">
        {/* Two equal 600px columns with a 120px gutter on desktop (Figma 29:2841),
            and on mobile the accordion is lifted above the photo — it carries the
            section's value and must not sit under a tall image on a phone. Both
            behaviours live in `.why-choose-grid` in globals.css. */}
        <div className="why-choose-grid">
          <div className="why-choose-textblock flex flex-col gap-12">
            <Reveal as="div" delay={cascade(0)}>
              <SectionEyebrow label={t("eyebrow")} tone="dark" />
            </Reveal>
            <div className="flex flex-col gap-16">
              <Reveal as="div" delay={cascade(1)}>
                <Heading level={2} size="h2" className="text-white">
                  {t("heading")}
                </Heading>
              </Reveal>
              <Reveal as="div" delay={cascade(2)}>
                <Text size="p2" className="text-neutral-9">
                  {t("paragraph")}
                </Text>
              </Reveal>
            </div>
          </div>

          <Reveal
            as="div"
            delay={cascade(3)}
            className="why-choose-photo relative aspect-[600/338] w-full overflow-hidden rounded-16"
          >
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

          <div className="why-choose-accordion w-full">
            <ReasonAccordion
              reasons={reasons}
              defaultOpenKey={DEFAULT_OPEN_KEY}
              baseDelay={ACCORDION_BASE_DELAY_MS}
              stepDelay={REVEAL_STEP_MS}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
