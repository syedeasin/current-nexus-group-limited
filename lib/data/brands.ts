import "server-only";

import { cache } from "react";
import { DownloadStatus, type BrandCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toPrismaLocale } from "@/lib/data/solutions-projects";

export interface PublishedBrandPage {
  name: string;
  slug: string;
  category: BrandCategory;
  logo: string;
  /** Stored edits over the brand template — read with readBrandContent. */
  content: unknown;
  updatedAt: Date;
}

/** One published brand page for `/tier-1-brands/[slug]`. Draft/missing → null. */
export const getPublishedBrandPage = cache(async (slug: string, locale: string): Promise<PublishedBrandPage | null> => {
  return prisma.brandPage.findFirst({
    where: { slug, locale: toPrismaLocale(locale), status: DownloadStatus.PUBLISHED },
    select: { name: true, slug: true, category: true, logo: true, content: true, updatedAt: true },
  });
});

/** A published brand as the mega menu, footer and collection page list it. */
export interface BrandEntry {
  name: string;
  slug: string;
  category: BrandCategory;
  logo: string;
  summary: string;
  showInMegaMenu: boolean;
  /** Stored page edits, for the collection page's product display. */
  content: unknown;
}

export async function getPublishedBrands(locale: string): Promise<BrandEntry[]> {
  return prisma.brandPage.findMany({
    where: { locale: toPrismaLocale(locale), status: DownloadStatus.PUBLISHED },
    orderBy: [{ menuOrder: "asc" }, { name: "asc" }],
    select: { name: true, slug: true, category: true, logo: true, summary: true, showInMegaMenu: true, content: true },
  });
}
