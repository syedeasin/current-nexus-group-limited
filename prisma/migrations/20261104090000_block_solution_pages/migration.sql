-- Publish the Solutions & Projects detail pages whose copy now lives in the
-- content-block pages (client revisions, 4 Nov 2026; lib/block-pages/config.ts).
-- The page row keeps Draft / Published, menu label and order in Dashboard →
-- Solutions & Projects; the copy is edited in Dashboard → Pages.
--
-- Data only and idempotent: a page is added only when its group has no page
-- whose slug starts with the same word (an admin may already have made one).
-- `content` copies the protected Residential template so the page builder can
-- still open the row.

INSERT INTO "solution_pages" ("id", "title", "slug", "locale", "status", "publishedAt", "menuGroup", "menuLabel", "menuOrder", "showInMegaMenu", "content", "createdAt", "updatedAt")
SELECT v.id, v.title, v.slug, 'EN'::"Locale", 'PUBLISHED'::"DownloadStatus", NOW(), v.grp::"SolutionMenuGroup", v.label, v.ord, true,
       COALESCE((SELECT "content" FROM "solution_pages" WHERE "isProtectedTemplate" = true ORDER BY "createdAt" LIMIT 1), '{}'::jsonb),
       NOW(), NOW()
FROM (VALUES
  ('blockpage_utilities_en',       'Utility-Scale Solar Solutions',      'utilities',              'SOLUTIONS',          'Utilities',                              3, 'utilit'),
  ('blockpage_vpp_en',             'Virtual Power Plant Solutions',      'virtual-power-plant',    'SOLUTIONS',          'Virtual Power Plant Solutions',          4, 'virtual'),
  ('blockpage_supplychain_en',     'Solar & BESS Supply Chain Financing', 'supply-chain-financing', 'SOLUTIONS',          'Supply Chain Financing for PV and BESS', 5, 'supply'),
  ('blockpage_gridtie_en',         'Grid-tie Projects',                  'grid-tie',               'RENEWABLE_PROJECTS', 'Grid-tie Projects',                      1, 'grid'),
  ('blockpage_offgrid_en',         'Off-grid Projects',                  'offgrid',                'RENEWABLE_PROJECTS', 'Offgrid Projects',                       2, 'off'),
  ('blockpage_projectfinance_en',  'Project Financing',                  'project-financing',      'RENEWABLE_PROJECTS', 'Project Financing',                      3, 'project')
) AS v(id, title, slug, grp, label, ord, prefix)
WHERE NOT EXISTS (
  SELECT 1 FROM "solution_pages" s
  WHERE s."locale" = 'EN' AND s."menuGroup" = v.grp::"SolutionMenuGroup" AND s."slug" LIKE v.prefix || '%'
)
AND NOT EXISTS (SELECT 1 FROM "solution_pages" s WHERE s."slug" = v.slug AND s."locale" = 'EN');
