import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/site.config";
import { manufacturingEntryHref, solutionEntryHref } from "@/config/nav.config";
import { NEWS_SECTION_LIST } from "@/lib/news-sections";

// Built per request so newly published posts and pages appear without a deploy.
export const dynamic = "force-dynamic";

/** Public pages that exist in code (the CMS-driven detail pages are added from the database below). */
const STATIC_PATHS = [
  "",
  "/about/why-choose-cnx",
  "/about/technology",
  "/about/pv-bess-brands",
  "/manufacturing/solar-panels",
  "/manufacturing/bess",
  ...NEWS_SECTION_LIST.map((section) => section.path),
  "/service/downloads",
];

function entry(locale: string, path: string, lastModified?: Date): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteConfig.url}/${locale}${path}`,
    lastModified,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `${siteConfig.url}/${l}${path}`])),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) => STATIC_PATHS.map((path) => entry(locale, path)));

  try {
    const [posts, manufacturing, solutions] = await Promise.all([
      prisma.post.findMany({
        where: { status: "PUBLISHED", noIndex: false },
        select: { slug: true, locale: true, updatedAt: true },
      }),
      prisma.manufacturingPage.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, locale: true, category: true, updatedAt: true },
      }),
      prisma.solutionPage.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, locale: true, menuGroup: true, updatedAt: true },
      }),
    ]);

    // Detail pages exist in one language only, so no hreflang alternates.
    const single = (locale: string, path: string, lastModified: Date) => ({
      url: `${siteConfig.url}/${locale.toLowerCase()}${path}`,
      lastModified,
    });
    pages.push(
      ...posts.map((p) => single(p.locale, `/news/${p.slug}`, p.updatedAt)),
      ...manufacturing.map((p) => single(p.locale, manufacturingEntryHref(p.category, p.slug), p.updatedAt)),
      ...solutions.map((p) => single(p.locale, solutionEntryHref(p.menuGroup, p.slug), p.updatedAt))
    );
  } catch (error) {
    console.error("[sitemap] database unavailable; listing static pages only", error);
  }

  return pages;
}
