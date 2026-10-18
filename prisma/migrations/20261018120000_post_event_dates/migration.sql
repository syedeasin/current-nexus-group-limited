-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "eventEndDate" TIMESTAMP(3),
ADD COLUMN     "eventLocation" VARCHAR(200),
ADD COLUMN     "eventStartDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "posts_section_eventStartDate_idx" ON "posts"("section", "eventStartDate");

