import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import type { PublishedManufacturingPage } from "@/lib/data/manufacturing-pages";

/** Resolve a stored image path (or absolute URL) to an absolute URL for OG/Twitter tags and JSON-LD. Mirrors news/[slug]'s toAbsolute(). */
export function toAbsolute(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;
  return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function manufacturingUrl(categorySegment: "solar-panels" | "bess", locale: string, slug: string): string {
  return toAbsolute(`/${locale}/manufacturing/${categorySegment}/${slug}`);
}

/** Metadata for a page that isn't published (draft, deleted, or the slug/category don't match). Explicitly noindex — a 404 body alone doesn't guarantee search engines treat the URL as unindexable. */
export const NOT_FOUND_METADATA: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * Next Metadata from a manufacturing page's SEO block, falling back to the
 * page's own content.meta and hero image where a dedicated value is unset.
 * Canonical/OG/Twitter URLs are resolved absolute — a bare relative path in
 * `alternates.canonical` renders literally into the HTML with no origin,
 * since this project sets no `metadataBase`.
 */
export function buildManufacturingMetadata(
  page: PublishedManufacturingPage,
  categorySegment: "solar-panels" | "bess",
  locale: string
): Metadata {
  const seo = page.seo ?? {};
  const metaTitle = seo.metaTitle || page.content.meta?.title || page.title;
  const metaDescription = seo.metaDescription || page.content.meta?.description || undefined;

  const ogImagePath = seo.ogImage || page.content.hero?.backgroundImage;
  const ogImage = ogImagePath ? toAbsolute(ogImagePath) : undefined;
  const twitterImagePath = seo.twitterImage || ogImagePath;
  const twitterImage = twitterImagePath ? toAbsolute(twitterImagePath) : undefined;

  const url = manufacturingUrl(categorySegment, locale, page.slug);
  const canonical = seo.canonicalUrl || url;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: seo.keywords || undefined,
    alternates: { canonical },
    robots: {
      index: !seo.noIndex,
      follow: !seo.noFollow,
    },
    openGraph: {
      type: "website",
      title: seo.ogTitle || metaTitle,
      description: seo.ogDescription || metaDescription,
      url,
      images: ogImage ? [{ url: ogImage, alt: seo.ogImageAlt || undefined }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || metaTitle,
      description: seo.twitterDescription || seo.ogDescription || metaDescription,
      images: twitterImage ? [twitterImage] : undefined,
    },
  };
}
