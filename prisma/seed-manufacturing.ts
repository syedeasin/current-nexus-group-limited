/**
 * Seeds the BC product page — the master design — into ManufacturingPage.
 * Content is the existing static ProductDetail (lib/data/products/bc.ts), so the
 * DB-rendered page is byte-identical to the old bespoke page.
 *
 * Run: npx tsx prisma/seed-manufacturing.ts
 */

import { DownloadStatus, Locale, ManufacturingCategory, PrismaClient } from "@prisma/client";
import { bcProductDetail } from "../lib/data/products/bc";

const prisma = new PrismaClient();

async function main() {
  const seo = {
    metaTitle: bcProductDetail.meta.title,
    metaDescription: bcProductDetail.meta.description,
  };

  await prisma.manufacturingPage.upsert({
    where: {
      category_slug_locale: {
        category: ManufacturingCategory.SOLAR_PANELS,
        slug: "bc",
        locale: Locale.EN,
      },
    },
    update: {
      title: "BC Solar Panels",
      status: DownloadStatus.PUBLISHED,
      publishedAt: new Date(),
      menuLabel: "Back Contact",
      menuOrder: 1,
      showInMegaMenu: true,
      isProtectedTemplate: true,
      content: bcProductDetail as object,
      seo,
    },
    create: {
      title: "BC Solar Panels",
      slug: "bc",
      locale: Locale.EN,
      category: ManufacturingCategory.SOLAR_PANELS,
      status: DownloadStatus.PUBLISHED,
      publishedAt: new Date(),
      menuLabel: "Back Contact",
      menuOrder: 1,
      showInMegaMenu: true,
      isProtectedTemplate: true,
      content: bcProductDetail as object,
      seo,
    },
  });

  console.log("Seeded BC manufacturing page.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
