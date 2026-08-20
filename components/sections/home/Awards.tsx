import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { awards } from "@/lib/data/awards";

const HEADING_DELAY_MS = 80;
const CARD_BASE_DELAY_MS = 160;
const CARD_STEP_MS = 80;
const CARD_STAGGER_CAP_MS = 400;

export default async function Awards() {
  const t = await getTranslations("home.awards");

  return (
    <section aria-label={t("heading")} className="relative w-full overflow-hidden bg-white">
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/home/Awards.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>
      <Container size="section" className="relative py-48 md:py-64 xl:py-100">
        <div className="flex flex-col items-center gap-32 md:gap-40 xl:gap-48">
          <div className="flex max-w-690 flex-col items-center gap-12 text-center">
            <Reveal as="div">
              <SectionEyebrow label={t("eyebrow")} />
            </Reveal>
            <Reveal as="div" delay={HEADING_DELAY_MS}>
              <Heading level={2} size="h2" className="text-balance">
                {t("heading")}
              </Heading>
            </Reveal>
          </div>

          <div className="flex w-full flex-wrap justify-center gap-16">
            {awards.map((award, index) => {
              const delay =
                CARD_BASE_DELAY_MS + Math.min(index * CARD_STEP_MS, CARD_STAGGER_CAP_MS);
              return (
                <Reveal
                  key={award.key}
                  as="div"
                  delay={delay}
                  className="flex flex-none basis-[calc((100%-16px)/2-1px)] flex-col items-center gap-12 rounded-16 bg-white p-12 min-[480px]:gap-16 min-[480px]:p-16 md:basis-[calc((100%-32px)/3-1px)] md:gap-24 md:p-20 lg:basis-[calc((100%-48px)/4-1px)] xl:basis-[calc((100%-64px)/5-1px)] xl:gap-32 xl:p-24"
                >
                  <div className="relative size-72 shrink-0 min-[480px]:size-88 md:size-120 xl:size-140">
                    <Image
                      src={award.image}
                      alt={award.alt}
                      fill
                      sizes="(min-width: 1280px) 140px, (min-width: 768px) 120px, (min-width: 480px) 88px, 72px"
                      className="object-contain"
                    />
                  </div>
                  <p className="line-clamp-2 min-h-40 w-full text-center text-p4 font-medium text-neutral-1 md:min-h-48">
                    {t(`items.${award.key}.caption`)}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
