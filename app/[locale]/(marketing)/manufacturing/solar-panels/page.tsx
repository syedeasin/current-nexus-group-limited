import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import CategoryPage from "@/components/sections/manufacturing/CategoryPage";
import { getCategory } from "@/lib/data/manufacturing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "manufacturing.solarPanels.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SolarPanelsPage() {
  const category = await getCategory("solar-panels");
  if (!category) notFound();

  return <CategoryPage category={category} />;
}
