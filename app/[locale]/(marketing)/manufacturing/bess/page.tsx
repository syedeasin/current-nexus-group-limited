import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPage, { categoryMetadata } from "@/components/sections/manufacturing/CategoryPage";
import { getCategory, productCategories } from "@/lib/data/manufacturing";

export function generateMetadata(): Promise<Metadata> {
  return categoryMetadata(productCategories["bess"]);
}

export default async function BessPage() {
  const category = await getCategory("bess");
  if (!category) notFound();

  return <CategoryPage category={category} />;
}
