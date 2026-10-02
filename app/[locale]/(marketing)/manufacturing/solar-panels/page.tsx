import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPage, { categoryMetadata } from "@/components/sections/manufacturing/CategoryPage";
import { getCategory, productCategories } from "@/lib/data/manufacturing";

export function generateMetadata(): Promise<Metadata> {
  return categoryMetadata(productCategories["solar-panels"]);
}

export default async function SolarPanelsPage() {
  const category = await getCategory("solar-panels");
  if (!category) notFound();

  return <CategoryPage category={category} />;
}
