import type { ManufacturingCategory } from "@prisma/client";
import type { ProductDetail } from "@/lib/data/products/types";

/** The page body is the existing ProductDetail shape (hero + 17 optional sections). */
export type ManufacturingContent = ProductDetail;

/** Extended SEO / social metadata, stored on `ManufacturingPage.seo`. */
export interface ManufacturingSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterImageAlt?: string;
}

/** A published page as the mega menu needs it. */
export interface ManufacturingMenuEntry {
  slug: string;
  menuLabel: string;
  category: ManufacturingCategory;
  menuOrder: number;
}

/** Route base for a manufacturing page, by category. */
export function manufacturingHref(category: ManufacturingCategory, slug: string): string {
  const base = category === "BESS" ? "/manufacturing/bess" : "/manufacturing/solar-panels";
  return `${base}/${slug}`;
}
