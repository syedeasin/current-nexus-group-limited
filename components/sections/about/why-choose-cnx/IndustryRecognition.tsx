import { getTranslations } from "next-intl/server";
import AwardsSection from "@/components/sections/shared/AwardsSection";
import { entries, str } from "@/lib/page-content/read";

export default async function IndustryRecognition() {
  const t = await getTranslations("about.whyChooseCnx.industryRecognition");

  return (
    <AwardsSection
      eyebrowLabel={t("eyebrow")}
      heading={t("heading")}
      backgroundImage={t("backgroundImage")}
      rowClassName="flex w-full flex-wrap justify-center gap-16"
      cardClassName="flex w-[300px] flex-none flex-col items-center gap-32 rounded-16 bg-white p-24"
      logoSizeClassName="relative size-140 shrink-0"
      captionClassName="w-full text-center text-p3 font-semibold text-neutral-1"
      cards={entries(t.raw("items" as never))
        .map(([, card]) => ({
          image: str(card, "image"),
          alt: str(card, "imageAlt"),
          caption: str(card, "caption"),
        }))
        .filter((card) => card.image)}
    />
  );
}
