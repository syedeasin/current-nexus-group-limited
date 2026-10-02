import { getTranslations } from "next-intl/server";
import PageBanner from "@/components/sections/shared/PageBanner";
import type { NewsSectionDef } from "@/lib/news-sections";

export default async function NewsBanner({ messageKey }: { messageKey: NewsSectionDef["messageKey"] }) {
  const t = await getTranslations(`news.sections.${messageKey}`);

  return (
    <PageBanner
      eyebrowLabel={t("bannerEyebrow")}
      heading={t("bannerHeading")}
      image={{ src: t("bannerImage"), objectPosition: t("bannerImagePosition") || undefined }}
      textMaxWidthClassName="max-w-718"
    />
  );
}
