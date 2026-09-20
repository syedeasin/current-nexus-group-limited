import "server-only";

import { DownloadStatus, Locale, ManufacturingCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ManufacturingContent, ManufacturingSeo, ManufacturingMenuEntry } from "@/lib/manufacturing/types";

export function toPrismaLocale(locale: string): Locale {
  return locale.toLowerCase() === "fr" ? Locale.FR : Locale.EN;
}

/** Route category segment ("solar-panels"/"bess") → enum. */
export function toCategory(segment: string): ManufacturingCategory | null {
  if (segment === "solar-panels") return ManufacturingCategory.SOLAR_PANELS;
  if (segment === "bess") return ManufacturingCategory.BESS;
  return null;
}

export interface PublishedManufacturingPage {
  title: string;
  slug: string;
  content: ManufacturingContent;
  seo: ManufacturingSeo | null;
}

export async function getPublishedManufacturingPage(
  category: ManufacturingCategory,
  slug: string,
  locale: string
): Promise<PublishedManufacturingPage | null> {
  const row = await prisma.manufacturingPage.findFirst({
    where: { category, slug, locale: toPrismaLocale(locale), status: DownloadStatus.PUBLISHED },
    select: { title: true, slug: true, content: true, seo: true },
  });
  if (!row) return null;
  return {
    title: row.title,
    slug: row.slug,
    content: row.content as unknown as ManufacturingContent,
    seo: (row.seo as unknown as ManufacturingSeo) ?? null,
  };
}

/** Published pages flagged for the mega menu, grouped by category and ordered. */
export async function getManufacturingMenuEntries(locale: string): Promise<ManufacturingMenuEntry[]> {
  const rows = await prisma.manufacturingPage.findMany({
    where: { locale: toPrismaLocale(locale), status: DownloadStatus.PUBLISHED, showInMegaMenu: true },
    orderBy: [{ category: "asc" }, { menuOrder: "asc" }, { menuLabel: "asc" }],
    select: { slug: true, menuLabel: true, category: true, menuOrder: true },
  });
  return rows.map((r) => ({
    slug: r.slug,
    menuLabel: r.menuLabel,
    category: r.category,
    menuOrder: r.menuOrder,
  }));
}
