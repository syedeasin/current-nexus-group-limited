import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { BODY_DELAY_MS, CTA_DELAY_MS } from "@/lib/motion/timing";

/**
 * About Us → "Final inquiry" (revision 1022), built like the site-wide CtaBand:
 * full-bleed photo, a gradient that ends in the footer's #0A0D1B so the two
 * sections run together, copy centred. Keeps this page's extra lead line.
 */
export default async function FinalInquiry() {
  const t = await getTranslations("about.whyChooseCnx.cta");
  const image = (t.has("image") && t("image")) || "/images/home/CTABackground.webp";
  const lead = t.has("lead") ? t("lead") : "";

  return (
    <section
      aria-label={t("heading")}
      className="relative flex w-full min-h-[520px] flex-col items-center justify-end overflow-hidden bg-neutral-1 pt-120 pb-64 md:min-h-[600px] md:pb-80 xl:min-h-[760px] xl:pb-120"
    >
      <Reveal variant="scale" as="div" className="absolute inset-0">
        <Image src={image} alt="" aria-hidden="true" fill sizes="100vw" className="object-cover object-center" />
      </Reveal>
      {/* Clear at the top, solid footer colour (#0A0D1B) at the bottom, like
          CtaBand. On phones the copy covers most of the photo, so it darkens
          sooner to keep the heading readable. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,13,27,0.15)_0%,rgba(10,13,27,0.8)_32%,#0a0d1b_100%)] md:bg-[linear-gradient(180deg,rgba(10,13,27,0)_10%,rgba(10,13,27,0.86)_62%,#0a0d1b_100%)]"
      />

      {/* Rhythm: heading → 24 → lead → 12 → note → 40 → buttons. Widths keep
          the heading, lead and note at two balanced lines each on desktop. */}
      <Container className="relative flex flex-col items-center gap-40">
        <div className="flex flex-col items-center text-center">
          <TextReveal className="flex flex-col items-center">
            <Heading level={2} size="h2" className="max-w-[760px] text-balance text-center text-white">
              {t("heading")}
            </Heading>
          </TextReveal>
          <Reveal as="div" delay={BODY_DELAY_MS} className="mt-24 flex flex-col items-center gap-12">
            {lead && (
              <Text size="p2" className="max-w-[720px] text-balance font-medium text-white lg:text-wrap">
                {lead}
              </Text>
            )}
            <Text size="p3" className="max-w-[700px] text-balance text-neutral-8">
              {t("subtext")}
            </Text>
          </Reveal>
        </div>
        <Reveal
          as="div"
          delay={CTA_DELAY_MS}
          className="flex w-full flex-col items-center gap-12 min-[481px]:w-auto min-[481px]:flex-row min-[481px]:gap-16"
        >
          <Button href={t("primaryCta.href")} size="xl" className="w-full justify-center min-[481px]:w-auto">
            {t("primaryCta.label")}
            <ChevronRight size={BUTTON_ICON_SIZE} boxed />
          </Button>
          <Button href={t("secondaryCta.href")} size="xl" variant="secondary" className="w-full justify-center min-[481px]:w-auto">
            {t("secondaryCta.label")}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
