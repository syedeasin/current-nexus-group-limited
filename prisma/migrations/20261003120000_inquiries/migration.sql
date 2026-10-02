-- CreateEnum
CREATE TYPE "InquiryKind" AS ENUM ('CONTACT', 'NEWSLETTER');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'READ', 'ARCHIVED');

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "kind" "InquiryKind" NOT NULL DEFAULT 'CONTACT',
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "name" TEXT,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "topic" TEXT,
    "message" TEXT,
    "locale" "Locale" NOT NULL DEFAULT 'EN',
    "sourcePath" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inquiries_kind_status_createdAt_idx" ON "inquiries"("kind", "status", "createdAt");

-- CreateIndex
CREATE INDEX "inquiries_kind_email_idx" ON "inquiries"("kind", "email");

