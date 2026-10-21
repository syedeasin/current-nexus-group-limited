-- Data only: publish the CNX brand page that seed-brands.ts created as a draft
-- (client, 21 Oct 2026). Uses the CNX logo and corrects the seed's cell
-- technology for Uranus Pro / Venus Pro (HJT modules, not back contact).
-- Only touches the page while it is still the untouched draft, so it never
-- overrides an edit or an unpublish made in the dashboard.
UPDATE "brand_pages"
SET
  "status" = 'PUBLISHED',
  "publishedAt" = COALESCE("publishedAt", CURRENT_TIMESTAMP),
  "logo" = CASE WHEN "logo" = '' THEN '/logos/cnx-logo-dark.svg' ELSE "logo" END,
  "content" = replace("content"::text, 'Back contact (BC)', 'HJT (heterojunction)')::jsonb,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'cnx' AND "locale" = 'EN' AND "status" = 'DRAFT';
