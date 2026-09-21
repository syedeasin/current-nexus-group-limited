import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { cascade, stagger } from "@/lib/motion/timing";

/** Order and icon mapping are fixed by Figma node 4028:10466; copy comes from i18n. */
const FEATURES = [
  {
    key: "independence",
    icon: "/images/solutionsAndProjects/solutions/residential/solar-panel-02.svg",
  },
  {
    key: "costs",
    icon: "/images/solutionsAndProjects/solutions/residential/circle-dollar-sign.svg",
  },
  {
    key: "reliability",
    icon: "/images/solutionsAndProjects/solutions/residential/solar-panel-05.svg",
  },
] as const;

const WHY_CHOOSE_IMAGE =
  "/images/solutionsAndProjects/solutions/residential/solutions-residential-whyChooseImage.webp";

export default async function WhyChooseResidential() {
  const t = await getTranslations("solutions.residential.whyChoose");

  return (
    <section aria-label={t("heading")} className="w-full bg-surface-2">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <div className="flex flex-col gap-24 lg:flex-row lg:items-end lg:justify-between lg:gap-48">
          <div className="flex flex-col gap-12 xl:max-w-482">
            <Reveal as="div" delay={cascade(0)}>
              <SectionEyebrow label={t("eyebrow")} />
            </Reveal>
            {/* Figma draws this one heading at 52/60/-1.04px in "Stack Sans
                Headline" — an unfinished placeholder style. Every H2 that uses
                the real Switzer token in this file (Stats, Applications, Case
                study) is 48/56/-1.2px, which is also what CtaBand and the BC
                product page already ship, so this page tracks -1.2px throughout
                rather than carrying the placeholder's odd -1.04px. The shared
                --text-h2 token (-0.72px) stays untouched.
                The 482px cap is what wraps the line in two — no manual <br>. */}
            <TextReveal delay={cascade(1)}>
              <Heading level={2} size="h2" className="tracking-[-1.2px]!">
                {t("heading")}
              </Heading>
            </TextReveal>
          </div>
          <Reveal as="div" delay={cascade(2)} className="max-w-600 lg:max-w-458">
            <Text size="p2" className="text-neutral-3">
              {t("description")}
            </Text>
          </Reveal>
        </div>

        <div className="flex flex-col">
          <Reveal
            variant="scale"
            delay={cascade(2)}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-16 sm:aspect-[1320/480]"
          >
            <Image
              src={WHY_CHOOSE_IMAGE}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1600px) 1320px, 100vw"
              className="object-cover"
            />
          </Reveal>

          {/* Figma puts the 204px-tall card row at y=378 inside the 480px image, so
              it hangs 102px below the photo and is inset 32px per side
              (1320 - 1256 = 64). Below lg the overlap is dropped and the cards
              flow normally under the photo. */}
          <div className="mt-24 grid grid-cols-1 gap-20 sm:mt-32 sm:grid-cols-2 lg:-mt-102 lg:grid-cols-3 lg:px-32">
            {FEATURES.map((feature, index) => (
              <Reveal
                key={feature.key}
                as="div"
                delay={stagger(index, cascade(3))}
                className="flex flex-col gap-24 rounded-16 border border-neutral-10 bg-white p-24"
              >
                <Image src={feature.icon} alt="" aria-hidden="true" width={40} height={40} />
                <div className="flex flex-col gap-8">
                  <Heading level={3} size="h6">
                    {t(`features.${feature.key}.title`)}
                  </Heading>
                  <Text size="p3" className="text-neutral-3">
                    {t(`features.${feature.key}.description`)}
                  </Text>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
