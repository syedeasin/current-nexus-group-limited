-- Product cards show transparent cutouts at one product height (9 Nov 2026).
-- Data only. Each photo is swapped only while the page still holds the old
-- default, so an image chosen in the dashboard stays.

-- Tier 1 brand pages: Hithium renders on navy cards -> cutouts on the card grey.
UPDATE "brand_pages"
SET "content" = replace(replace(replace("content"::text,
  '/images/premiumSolutions/hithiumPVndEssIntegratedMachine.webp', '/images/client/products/brand/hithium-integrated.webp'),
  '/images/premiumSolutions/hithiumEssCabinet.webp', '/images/client/products/brand/hithium-ess-cabinet.webp'),
  '/images/premiumSolutions/hithiumBlock.webp', '/images/client/products/brand/hithium-block.webp')::jsonb
WHERE "content"::text LIKE '%/images/premiumSolutions/hithium%';

-- Manufacturing product pages, "Related products": white-background photos and
-- a scene photo -> 5:4 cutouts (the card's image box).
UPDATE "manufacturing_pages" AS page
SET "content" = jsonb_set(page."content", '{relatedProducts,items}', (
  SELECT jsonb_agg(
    CASE item->>'image'
      WHEN '/images/client/products/currentwave-bc.webp' THEN jsonb_set(item, '{image}', '"/images/client/products/cutout/currentwave-bc.webp"')
      WHEN '/images/client/products/currentwave-hjt.webp' THEN jsonb_set(item, '{image}', '"/images/client/products/cutout/currentwave-hjt.webp"')
      WHEN '/images/client/products/currentwave-topcon.webp' THEN jsonb_set(item, '{image}', '"/images/client/products/cutout/currentwave-topcon.webp"')
      WHEN '/images/client/products/bess-residential.webp' THEN jsonb_set(item, '{image}', '"/images/client/products/cutout/bess-residential.webp"')
      WHEN '/images/client/products/bess-ci-grid-forming.webp' THEN jsonb_set(item, '{image}', '"/images/client/products/cutout/bess-ci-grid-forming.webp"')
      WHEN '/images/client/products/bess-ci-grid-tied.webp' THEN jsonb_set(item, '{image}', '"/images/client/products/cutout/bess-ci-grid-tied.webp"')
      WHEN '/images/client/products/bess-utility-container.webp' THEN jsonb_set(item, '{image}', '"/images/client/products/cutout/bess-utility-container.webp"')
      WHEN '/images/client/why-choose/tier1-brands.webp' THEN jsonb_set(item, '{image}', '"/images/client/products/cutout/hithium-integrated.webp"')
      ELSE item
    END
    ORDER BY ord
  )
  FROM jsonb_array_elements(page."content"->'relatedProducts'->'items') WITH ORDINALITY AS x(item, ord)
))
WHERE jsonb_typeof(page."content"->'relatedProducts'->'items') = 'array'
  AND jsonb_array_length(page."content"->'relatedProducts'->'items') > 0;
