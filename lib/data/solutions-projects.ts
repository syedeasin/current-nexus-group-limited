import "server-only";

import { DownloadStatus, Locale, SolutionMenuGroup } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SolutionPageContent, SolutionMenuEntry, SolutionSeo } from "@/lib/solutions-projects/types";

/** Route param ("en"/"fr") → Prisma Locale. */
export function toPrismaLocale(locale: string): Locale {
  return locale.toLowerCase() === "fr" ? Locale.FR : Locale.EN;
}

export interface PublishedSolutionPage {
  title: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  content: SolutionPageContent;
  seo: SolutionSeo | null;
}

/**
 * A single published page for the `[slug]` route. Draft/missing → null, which
 * the route turns into the site's normal not-found.
 */
export async function getPublishedSolutionPage(
  slug: string,
  locale: string,
  group?: SolutionMenuGroup
): Promise<PublishedSolutionPage | null> {
  const row = await prisma.solutionPage.findFirst({
    where: {
      slug,
      locale: toPrismaLocale(locale),
      status: DownloadStatus.PUBLISHED,
      ...(group ? { menuGroup: group } : {}),
    },
    select: { title: true, slug: true, metaTitle: true, metaDescription: true, seo: true, content: true },
  });
  if (!row) return null;
  return {
    ...row,
    content: row.content as unknown as SolutionPageContent,
    seo: (row.seo as unknown as SolutionSeo) ?? null,
  };
}

/**
 * Published pages flagged for the mega menu, grouped and ordered. This is the
 * only source the header's Solutions & Projects panel reads — a draft, hidden,
 * or deleted page is simply absent.
 */
export async function getSolutionMenuEntries(locale: string): Promise<SolutionMenuEntry[]> {
  const rows = await prisma.solutionPage.findMany({
    where: {
      locale: toPrismaLocale(locale),
      status: DownloadStatus.PUBLISHED,
      showInMegaMenu: true,
    },
    orderBy: [{ menuGroup: "asc" }, { menuOrder: "asc" }, { menuLabel: "asc" }],
    select: { slug: true, menuLabel: true, menuGroup: true, menuOrder: true },
  });
  return rows.map((r) => ({
    slug: r.slug,
    menuLabel: r.menuLabel,
    menuGroup: r.menuGroup as SolutionMenuGroup,
    menuOrder: r.menuOrder,
  }));
}
