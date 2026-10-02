import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { pageIcon } from "@/lib/page-content/icons";
import { entries, str } from "@/lib/page-content/read";

const HEADING_DELAY_MS = 80;
const STEP_BASE_DELAY_MS = 160;
const STEP_STEP_MS = 80;
const STEP_STAGGER_CAP_MS = 400;

export default async function BeyondProducts() {
  const t = await getTranslations("about.whyChooseCnx.beyondProducts");
  const steps = entries(t.raw("steps" as never));

  return (
    <section aria-label={t("heading")} className="w-full bg-surface-2">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <div className="flex max-w-656 flex-col gap-8">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={t("eyebrow")} />
          </Reveal>
          <TextReveal delay={HEADING_DELAY_MS}>
            <Heading level={2} size="h2" className="text-balance">
              {t("heading")}
            </Heading>
          </TextReveal>
        </div>

        <div className="flex flex-col gap-40 rounded-20 bg-white p-24 md:p-32 lg:flex-row lg:items-stretch lg:gap-60 xl:p-48">
          <div className="flex w-full flex-col lg:flex-1">
            {steps.map(([key, step], index) => {
              const Icon = pageIcon(str(step, "icon"));
              const delay = STEP_BASE_DELAY_MS + Math.min(index * STEP_STEP_MS, STEP_STAGGER_CAP_MS);
              return (
                <div key={key}>
                  {index > 0 && <div className="h-2 w-full bg-neutral-11" aria-hidden="true" />}
                  <Reveal as="div" delay={delay} className="flex items-start gap-12 py-24">
                    <span className="flex shrink-0 items-center justify-center rounded-8 border border-neutral-11 bg-surface-2 p-14">
                      <Icon size={24} className="text-neutral-1" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-4">
                      <Heading level={3} size="h6">
                        {str(step, "title")}
                      </Heading>
                      <Text size="p2" className="text-neutral-4">
                        {str(step, "body")}
                      </Text>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>

          <Reveal
            variant="scale"
            delay={STEP_BASE_DELAY_MS}
            className="relative aspect-square w-full overflow-hidden rounded-16 lg:aspect-auto lg:w-[534px] lg:shrink-0"
          >
            <Image
              src={t("image")}
              alt={t("imageAlt")}
              fill
              sizes="(min-width: 1024px) 534px, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
