-- CreateEnum
CREATE TYPE "SolutionMenuGroup" AS ENUM ('SOLUTIONS', 'RENEWABLE_PROJECTS');

-- CreateTable
CREATE TABLE "solution_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'EN',
    "status" "DownloadStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "menuGroup" "SolutionMenuGroup" NOT NULL DEFAULT 'SOLUTIONS',
    "menuLabel" TEXT NOT NULL,
    "menuOrder" INTEGER NOT NULL DEFAULT 0,
    "showInMegaMenu" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" TEXT,
    "metaDescription" VARCHAR(500),
    "content" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solution_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "solution_pages_locale_status_menuGroup_menuOrder_idx" ON "solution_pages"("locale", "status", "menuGroup", "menuOrder");

-- CreateIndex
CREATE INDEX "solution_pages_status_publishedAt_idx" ON "solution_pages"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "solution_pages_slug_locale_key" ON "solution_pages"("slug", "locale");

-- AddForeignKey
ALTER TABLE "solution_pages" ADD CONSTRAINT "solution_pages_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
