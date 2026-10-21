-- CreateEnum
CREATE TYPE "BrandCategory" AS ENUM ('MODULES', 'INVERTERS', 'BESS', 'MIXED');

-- CreateTable
CREATE TABLE "brand_pages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'EN',
    "category" "BrandCategory" NOT NULL DEFAULT 'MODULES',
    "status" "DownloadStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "isProtectedTemplate" BOOLEAN NOT NULL DEFAULT false,
    "logo" VARCHAR(500) NOT NULL DEFAULT '',
    "summary" VARCHAR(200) NOT NULL DEFAULT '',
    "menuOrder" INTEGER NOT NULL DEFAULT 0,
    "showInMegaMenu" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brand_pages_locale_status_menuOrder_idx" ON "brand_pages"("locale", "status", "menuOrder");

-- CreateIndex
CREATE UNIQUE INDEX "brand_pages_slug_locale_key" ON "brand_pages"("slug", "locale");

-- AddForeignKey
ALTER TABLE "brand_pages" ADD CONSTRAINT "brand_pages_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

