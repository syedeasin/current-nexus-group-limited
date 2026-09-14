-- CreateEnum
CREATE TYPE "DownloadStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "filter_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'EN',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filter_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filter_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filter_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "download_resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'EN',
    "description" TEXT,
    "fileUrl" VARCHAR(500) NOT NULL,
    "fileKey" VARCHAR(500) NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "DownloadStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "download_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "download_resource_filter_options" (
    "downloadId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "download_resource_filter_options_pkey" PRIMARY KEY ("downloadId","optionId")
);

-- CreateIndex
CREATE INDEX "filter_groups_locale_sortOrder_idx" ON "filter_groups"("locale", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "filter_groups_slug_locale_key" ON "filter_groups"("slug", "locale");

-- CreateIndex
CREATE INDEX "filter_options_groupId_sortOrder_idx" ON "filter_options"("groupId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "filter_options_groupId_slug_key" ON "filter_options"("groupId", "slug");

-- CreateIndex
CREATE INDEX "download_resources_locale_status_displayOrder_idx" ON "download_resources"("locale", "status", "displayOrder");

-- CreateIndex
CREATE INDEX "download_resources_status_publishedAt_idx" ON "download_resources"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "download_resources_uploadedById_idx" ON "download_resources"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "download_resources_slug_locale_key" ON "download_resources"("slug", "locale");

-- CreateIndex
CREATE INDEX "download_resource_filter_options_optionId_idx" ON "download_resource_filter_options"("optionId");

-- AddForeignKey
ALTER TABLE "filter_options" ADD CONSTRAINT "filter_options_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "filter_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "download_resources" ADD CONSTRAINT "download_resources_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "download_resource_filter_options" ADD CONSTRAINT "download_resource_filter_options_downloadId_fkey" FOREIGN KEY ("downloadId") REFERENCES "download_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "download_resource_filter_options" ADD CONSTRAINT "download_resource_filter_options_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "filter_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
