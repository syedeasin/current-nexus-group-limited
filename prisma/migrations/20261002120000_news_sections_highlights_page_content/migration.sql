-- CreateEnum
CREATE TYPE "PostSection" AS ENUM ('NEWS', 'RE_ANALYSIS', 'KNOWLEDGE_DATABASE', 'EVENTS');

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "isHighlight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "section" "PostSection" NOT NULL DEFAULT 'NEWS';

-- CreateTable
CREATE TABLE "page_contents" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "data" JSONB NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_contents_locale_idx" ON "page_contents"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "page_contents_pageKey_locale_key" ON "page_contents"("pageKey", "locale");

-- CreateIndex
CREATE INDEX "posts_locale_status_section_publishedAt_idx" ON "posts"("locale", "status", "section", "publishedAt");

-- AddForeignKey
ALTER TABLE "page_contents" ADD CONSTRAINT "page_contents_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

