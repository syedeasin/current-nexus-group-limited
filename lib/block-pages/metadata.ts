import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { toAbsolute } from "@/lib/manufacturing/metadata";
import { BLOCK_PAGES_NAMESPACE, type BlockPageDef } from "@/lib/block-pages/config";
import { str } from "@/lib/page-content/read";
import { getAt } from "@/lib/page-content/tree";
import { pageTitle } from "@/lib/seo";

/**
 * Metadata for a content-block page from its SEO section (Dashboard → Pages
 * → <page> → SEO), with the banner photo as the share image. `path` is the
 * public route without locale — for detail pages, the published slug's URL.
 */
export async function blockPageMetadata(page: BlockPageDef, locale: string, path: string = page.href): Promise<Metadata> {
  const tree = getAt(await getMessages({ locale }), `${BLOCK_PAGES_NAMESPACE}.${page.key}`);
  const meta = getAt(tree, "meta");
  const hero = getAt(tree, "hero");
  const title = str(meta, "title") || page.label;
  const description = str(meta, "description") || undefined;
  const image = str(hero, "image");
  const url = toAbsolute(`/${locale}${path}`);
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url, images: image ? [{ url: toAbsolute(image) }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [toAbsolute(image)] : undefined },
  };
}
