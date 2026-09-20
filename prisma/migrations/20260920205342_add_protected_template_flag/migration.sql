-- AlterTable
ALTER TABLE "manufacturing_pages" ADD COLUMN     "isProtectedTemplate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "solution_pages" ADD COLUMN     "isProtectedTemplate" BOOLEAN NOT NULL DEFAULT false;

-- Flag the two existing master templates as protected. New environments get
-- this from the seed scripts too, but an already-running database (like
-- production) only gets flipped here, at migrate time.
UPDATE "manufacturing_pages" SET "isProtectedTemplate" = true WHERE "slug" = 'bc' AND "category" = 'SOLAR_PANELS';
UPDATE "solution_pages" SET "isProtectedTemplate" = true WHERE "slug" = 'residential' AND "menuGroup" = 'SOLUTIONS';
