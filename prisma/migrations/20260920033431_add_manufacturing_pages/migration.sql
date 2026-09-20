-- CreateEnum
CREATE TYPE "ManufacturingCategory" AS ENUM ('SOLAR_PANELS', 'BESS');

-- CreateTable
CREATE TABLE "manufacturing_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'EN',
    "category" "ManufacturingCategory" NOT NULL,
    "status" "DownloadStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "menuLabel" TEXT NOT NULL,
    "menuOrder" INTEGER NOT NULL DEFAULT 0,
    "showInMegaMenu" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB NOT NULL,
    "seo" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "manufacturing_pages_locale_status_category_menuOrder_idx" ON "manufacturing_pages"("locale", "status", "category", "menuOrder");

-- CreateIndex
CREATE INDEX "manufacturing_pages_status_publishedAt_idx" ON "manufacturing_pages"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturing_pages_category_slug_locale_key" ON "manufacturing_pages"("category", "slug", "locale");

-- AddForeignKey
ALTER TABLE "manufacturing_pages" ADD CONSTRAINT "manufacturing_pages_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
