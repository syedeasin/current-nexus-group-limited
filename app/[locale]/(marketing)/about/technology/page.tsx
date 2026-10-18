import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PageBanner from "@/components/sections/shared/PageBanner";
import { pageTitle } from "@/lib/seo";
import { assertPageVisible } from "@/lib/page-visibility";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.technology.meta" });

  return {
    title: pageTitle(t("title")),
    description: t("description"),
  };
}

export default async function TechnologyPage() {
  await assertPageVisible("/about/technology");
  const t = await getTranslations("about.technology.banner");

  return (
    <PageBanner
      eyebrowLabel={t("eyebrow")}
      heading={t("heading")}
      description={t("description") || undefined}
      image={{ src: t("image") }}
    />
  );
}
