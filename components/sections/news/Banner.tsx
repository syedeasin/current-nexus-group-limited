import { getTranslations } from "next-intl/server";
import PageBanner from "@/components/sections/shared/PageBanner";

export default async function NewsBanner() {
  const t = await getTranslations("news");

  return (
    <PageBanner
      eyebrowLabel={t("bannerEyebrow")}
      heading={t("bannerHeading")}
      image={{ src: "/images/news/news-hjt-tracker.webp", objectPosition: "87% center" }}
      textMaxWidthClassName="max-w-718"
    />
  );
}
