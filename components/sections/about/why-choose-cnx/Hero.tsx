import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { cascade } from "@/lib/motion/timing";

export default async function WhyChooseCnxHero() {
  const t = await getTranslations("about.whyChooseCnx.hero");

  return (
    <section
      aria-label={t("heading")}
      className="relative w-full overflow-hidden bg-neutral-1"
    >
      <Image
        src="/images/home/residentialSolar.webp"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(270deg, rgba(10,13,27,0.2) 0%, rgba(10,13,27,0.8) 50%, rgba(10,13,27,0.9) 65%, #0A0D1B 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(10,13,27,0) 0%, rgba(10,13,27,0.64) 100%)",
        }}
      />

      <Container className="relative z-10 flex min-h-[480px] items-center py-96 md:min-h-[560px] xl:min-h-[660px]">
        <div className="flex w-full max-w-[771px] flex-col items-start gap-40">
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-12">
              <Reveal as="div" delay={cascade(0)}>
                <SectionEyebrow label={t("eyebrow")} />
              </Reveal>
              <Reveal as="div" delay={cascade(1)}>
                <Heading level={1} size="h1" className="text-balance text-white">
                  {t("heading")}
                </Heading>
              </Reveal>
            </div>
            <Reveal as="div" delay={cascade(2)}>
              <Text size="p1" className="text-neutral-9">
                {t("subtext")}
              </Text>
            </Reveal>
          </div>
          <Reveal as="div" delay={cascade(3)} className="w-full min-[481px]:w-fit">
            <Button href="/products" size="xl" className="w-full min-[481px]:w-fit">
              {t("cta")}
              <ChevronRight size={BUTTON_ICON_SIZE} />
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
