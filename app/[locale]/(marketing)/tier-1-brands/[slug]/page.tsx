import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandPageTemplate from "@/components/brands/BrandPageTemplate";
import { getPublishedBrandPage } from "@/lib/data/brands";
import { readBrandContent } from "@/lib/brands/content";
import { brandEntryHref } from "@/config/nav.config";
import { toAbsolute } from "@/lib/manufacturing/metadata";
import { NOT_FOUND_METADATA } from "@/lib/solutions-projects/metadata";
import { pageTitle } from "@/lib/seo";

interface RouteParams {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const brand = await getPublishedBrandPage(slug, locale);
  if (!brand) return NOT_FOUND_METADATA;

  const { seo, hero } = readBrandContent(brand.name, brand.category, brand.content);
  const url = toAbsolute(`/${locale}${brandEntryHref(brand.slug)}`);
  const image = hero.backgroundImage ? toAbsolute(hero.backgroundImage) : undefined;
  return {
    title: pageTitle(seo.metaTitle || brand.name),
    description: seo.metaDescription || undefined,
    alternates: { canonical: url },
    openGraph: { type: "website", title: seo.metaTitle, description: seo.metaDescription, url, images: image ? [{ url: image }] : undefined },
    twitter: { card: "summary_large_image", title: seo.metaTitle, description: seo.metaDescription, images: image ? [image] : undefined },
  };
}

export default async function BrandPage({ params }: RouteParams) {
  const { locale, slug } = await params;
  const brand = await getPublishedBrandPage(slug, locale);
  if (!brand) notFound();

  return (
    <BrandPageTemplate
      name={brand.name}
      slug={brand.slug}
      logo={brand.logo}
      locale={locale}
      content={readBrandContent(brand.name, brand.category, brand.content)}
    />
  );
}
