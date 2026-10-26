import { getTranslations } from "next-intl/server";
import AwardsSection from "@/components/sections/shared/AwardsSection";
import { entries, str } from "@/lib/page-content/read";

export default async function Awards() {
  const t = await getTranslations("home.awards");
  // Hidden until the client has real awards (revision 1022); switched on in
  // Dashboard → Pages → Homepage → Industry recognition → Show on the website.
  if (t("show") !== "true") return null;

  return (
    <AwardsSection
      eyebrowLabel={t("eyebrow")}
      heading={t("heading")}
      backgroundImage={t("backgroundImage")}
      cards={entries(t.raw("items" as never))
        .map(([, award]) => ({
          image: str(award, "image"),
          alt: str(award, "imageAlt"),
          caption: str(award, "caption"),
        }))
        .filter((award) => award.image)}
    />
  );
}
