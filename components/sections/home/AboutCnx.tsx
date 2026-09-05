import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { ChevronRight } from "@/components/icons/ChevronRight";
import StatsRow from "@/components/sections/home/about-cnx/StatsRow";
import { cascade } from "@/lib/motion/timing";

const avatars = [
  "/images/aboutCNX/person01.webp",
  "/images/aboutCNX/person02.webp",
  "/images/aboutCNX/person03.webp",
  "/images/aboutCNX/person04.webp",
];

export default async function AboutCnx() {
  const t = await getTranslations("home.about");

  return (
    <section aria-label={t("heading")} className="w-full bg-surface-2">
      <Container className="flex flex-col gap-40 py-48 md:py-64 lg:gap-60 xl:py-80">
        <div className="flex flex-col gap-40 lg:grid lg:grid-cols-[610fr_630fr] lg:items-start lg:gap-48 xl:gap-80">
          {/* Left column */}
          <div className="flex w-full min-w-0 flex-col gap-40">
            <div className="flex flex-col gap-16">
              <div className="flex flex-col gap-12">
                <Reveal as="div" delay={cascade(0)}>
                  <SectionEyebrow label={t("eyebrow")} />
                </Reveal>
                <Reveal as="div" delay={cascade(1)}>
                  <Heading level={2} size="h2">
                    {t("heading")}
                  </Heading>
                </Reveal>
              </div>
              <div className="flex flex-col gap-12">
                <Reveal as="div" delay={cascade(2)}>
                  <Text size="p2" className="text-neutral-3">
                    {t("paragraph1")}
                  </Text>
                </Reveal>
                <Reveal as="div" delay={cascade(3)}>
                  <Text size="p2" className="text-neutral-3">
                    {t("paragraph2")}
                  </Text>
                </Reveal>
              </div>
            </div>
            <Reveal as="div" delay={cascade(4)}>
              <Button href="/about" size="xl" className="w-full min-[481px]:w-fit">
                {t("cta")}
                <ChevronRight size={BUTTON_ICON_SIZE} />
              </Button>
            </Reveal>
          </div>

          {/* Right column */}
          <div className="relative w-full min-w-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-16 lg:aspect-[630/476]">
              <Reveal variant="scale" as="div" className="absolute inset-0">
                <Image
                  src="/images/aboutCNX/aboutCNXRightImage.webp"
                  alt="Technician inspecting photovoltaic modules on the CNX manufacturing line"
                  fill
                  sizes="(min-width: 1024px) 630px, 100vw"
                  className="object-cover"
                />
              </Reveal>
              <div className="about-cnx-scrim pointer-events-none absolute inset-0" />
              <Reveal
                variant="fade"
                delay={200}
                as="div"
                className="absolute bottom-16 left-16 flex w-[306px] max-w-[calc(100%-32px)] flex-col gap-12 min-[480px]:bottom-24 min-[480px]:left-24 lg:bottom-40 lg:left-40"
              >
                <div className="flex items-center" aria-hidden="true">
                  {avatars.map((src, index) => (
                    <Reveal
                      key={src}
                      variant="fade"
                      delay={60 * index}
                      as="div"
                      className={cn(
                        "relative size-32 shrink-0 overflow-hidden rounded-full ring-[1.5px] ring-white min-[480px]:size-40",
                        index > 0 && "-ml-12"
                      )}
                    >
                      <Image src={src} alt="" fill sizes="40px" className="object-cover" />
                    </Reveal>
                  ))}
                </div>
                <Text size="p3" className="text-white">
                  {t.rich("trustCard", {
                    strong: (chunks) => <span className="font-medium">{chunks}</span>,
                  })}
                </Text>
              </Reveal>
            </div>
          </div>
        </div>

        <StatsRow />
      </Container>
    </section>
  );
}
