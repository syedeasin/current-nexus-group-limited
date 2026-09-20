import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManufacturingCategory } from "@prisma/client";
import ProductDetailPage from "@/components/sections/product/ProductDetailPage";
import { getPublishedManufacturingPage } from "@/lib/data/manufacturing-pages";
import { buildManufacturingMetadata, NOT_FOUND_METADATA } from "@/lib/manufacturing/metadata";

interface RouteParams {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPublishedManufacturingPage(ManufacturingCategory.SOLAR_PANELS, slug, locale);
  if (!page) return NOT_FOUND_METADATA;
  return buildManufacturingMetadata(page, "solar-panels", locale);
}

export default async function SolarPanelSlugPage({ params }: RouteParams) {
  const { locale, slug } = await params;
  const page = await getPublishedManufacturingPage(ManufacturingCategory.SOLAR_PANELS, slug, locale);
  if (!page) notFound();
  return <ProductDetailPage product={page.content} />;
}
