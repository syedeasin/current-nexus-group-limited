-- Data only: hide the CNX brand page again (client revision 1022, 24 Oct 2026:
-- "The CNX brand is not displayed, deleted"). Set to Draft rather than deleted,
-- so it can be published again from Dashboard → Tier 1 Brands.
UPDATE "brand_pages"
SET "status" = 'DRAFT', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'cnx' AND "status" = 'PUBLISHED';
