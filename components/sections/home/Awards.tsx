import { getTranslations } from "next-intl/server";
import AwardsSection from "@/components/sections/shared/AwardsSection";
import { awards } from "@/lib/data/awards";

export default async function Awards() {
  const t = await getTranslations("home.awards");

  return (
    <AwardsSection
      eyebrowLabel={t("eyebrow")}
      heading={t("heading")}
      backgroundImage="/images/home/Awards.webp"
      cards={awards.map((award) => ({
        image: award.image,
        alt: award.alt,
        caption: t(`items.${award.key}.caption`),
      }))}
    />
  );
}
