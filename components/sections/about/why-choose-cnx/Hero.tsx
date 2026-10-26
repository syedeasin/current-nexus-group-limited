import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { cascade } from "@/lib/motion/timing";
import { HERO_HEADER_OFFSET } from "@/src/layout/headerOffset";
import { cn } from "@/lib/utils";

export default async function WhyChooseCnxHero() {
  const t = await getTranslations("about.whyChooseCnx.hero");
  // "One partner. Flexible sourcing. Connected energy solutions." → the three
  // lines of the "Our promise" card.
  const pillars = t("tagline")
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <section
      aria-label={t("heading")}
      data-hero-sentinel
      className={cn("relative w-full overflow-hidden bg-neutral-1", HERO_HEADER_OFFSET)}
    >
      <Image
        src={t("backgroundImage")}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
      {/* Photo stays readable on the right; the copy side and the foot go dark. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,#0A0D1B_0%,rgba(10,13,27,0.92)_38%,rgba(10,13,27,0.45)_70%,rgba(10,13,27,0.25)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(10,13,27,0.55)_0%,rgba(10,13,27,0.85)_55%,#0A0D1B_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-neutral-1 to-transparent"
      />

      {/* Taller banner with the copy anchored low (bottom-left) and the brand
          promise as its own card bottom-right (revision 1022 layout pass). */}
      <Container className="relative z-10 flex min-h-[560px] items-end pt-120 pb-48 md:min-h-[620px] md:pb-64 xl:min-h-[700px] xl:pb-88">
        <div className="grid w-full items-end gap-40 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-64">
          <div className="flex flex-col items-start gap-28 md:gap-32">
            <div className="flex flex-col gap-16">
              <Reveal as="div" delay={cascade(0)}>
                <SectionEyebrow label={t("eyebrow")} />
              </Reveal>
              <TextReveal delay={cascade(1)}>
                <Heading level={1} size="h2" className="text-balance text-white">
                  {t("heading")}
                </Heading>
              </TextReveal>
              <Reveal as="div" delay={cascade(2)}>
                <Text size="p2" className="max-w-[600px] text-neutral-9">
                  {t("subtext")}
                </Text>
              </Reveal>
            </div>
            <Reveal as="div" delay={cascade(3)} className="flex w-full flex-col gap-12 min-[481px]:w-fit min-[481px]:flex-row">
              <Button href={t("ctaHref")} size="xl" className="w-full justify-center min-[481px]:w-fit">
                {t("cta")}
                <ChevronRight size={BUTTON_ICON_SIZE} boxed />
              </Button>
              {t("secondaryCta") && (
                <Button href={t("secondaryCtaHref")} size="xl" variant="secondary" className="w-full justify-center min-[481px]:w-fit">
                  {t("secondaryCta")}
                </Button>
              )}
            </Reveal>
          </div>

          {pillars.length > 0 && (
            <Reveal as="div" delay={cascade(4)}>
              <div className="rounded-24 border border-white/15 bg-white/5 p-24 backdrop-blur-md md:p-32">
                <p className="text-p4 font-medium uppercase tracking-[1px] text-neutral-7">{t("taglineLabel")}</p>
                <ul className="mt-16 flex flex-col">
                  {pillars.map((pillar, index) => (
                    <li
                      key={pillar}
                      className="flex items-center gap-16 border-t border-white/10 py-16 first:border-t-0 first:pt-0 last:pb-0"
                    >
                      <span className="w-24 shrink-0 text-p4 font-semibold text-secondary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-h6 font-semibold text-white">{pillar}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
