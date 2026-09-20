import type { Metadata } from "next";
import type { SolutionMenuGroup } from "@prisma/client";
import { solutionEntryHref } from "@/config/nav.config";
import { toAbsolute } from "@/lib/manufacturing/metadata";
import type { PublishedSolutionPage } from "@/lib/data/solutions-projects";

/** Metadata for a page that isn't published (draft, deleted, or wrong group). Explicitly noindex — mirrors lib/manufacturing/metadata.ts's NOT_FOUND_METADATA. */
export const NOT_FOUND_METADATA: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * Next Metadata from a Solutions & Projects page's SEO block, falling back to
 * metaTitle/metaDescription and the hero image where a dedicated value is
 * unset. Canonical/OG/Twitter URLs are resolved absolute — mirrors
 * buildManufacturingMetadata exactly (see that file for why).
 */
export function buildSolutionMetadata(
  page: PublishedSolutionPage,
  group: SolutionMenuGroup,
  locale: string
): Metadata {
  const seo = page.seo ?? {};
  const metaTitle = seo.metaTitle || page.metaTitle || page.title;
  const metaDescription = seo.metaDescription || page.metaDescription || undefined;

  const ogImagePath = seo.ogImage || page.content.hero?.backgroundImage;
  const ogImage = ogImagePath ? toAbsolute(ogImagePath) : undefined;
  const twitterImagePath = seo.twitterImage || ogImagePath;
  const twitterImage = twitterImagePath ? toAbsolute(twitterImagePath) : undefined;

  const url = toAbsolute(`/${locale}${solutionEntryHref(group, page.slug)}`);
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
