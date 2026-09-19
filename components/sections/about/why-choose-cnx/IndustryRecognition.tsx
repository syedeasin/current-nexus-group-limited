import { getTranslations } from "next-intl/server";
import AwardsSection from "@/components/sections/shared/AwardsSection";

const CARDS = [
  { key: "iec", image: "/images/about/whyChooseCNX/iecLogo.webp", alt: "IEC certification logo" },
  { key: "tuv", image: "/images/about/whyChooseCNX/tuvLogo.webp", alt: "TÜV certification logo" },
  {
    key: "yellowSolar",
    image: "/images/about/whyChooseCNX/yollowSolarLogo.webp",
    alt: "Yellow Solar certification logo",
  },
] as const;

export default async function IndustryRecognition() {
  const t = await getTranslations("about.whyChooseCnx.industryRecognition");

  return (
    <AwardsSection
      eyebrowLabel={t("eyebrow")}
      heading={t("heading")}
      backgroundImage="/images/home/Awards.webp"
      rowClassName="flex w-full flex-wrap justify-center gap-16"
      cardClassName="flex w-[300px] flex-none flex-col items-center gap-32 rounded-16 bg-white p-24"
      logoSizeClassName="relative size-140 shrink-0"
      captionClassName="w-full text-center text-p3 font-semibold text-neutral-1"
      cards={CARDS.map((card) => ({
        image: card.image,
        alt: card.alt,
        caption: t(`items.${card.key}.caption`),
      }))}
    />
  );
}
