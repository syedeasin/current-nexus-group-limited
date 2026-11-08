-- Client image pack (Vicky, 4 Nov 2026): point manufacturing product pages at
-- the client's photos. Data only, and each photo is replaced only while the
-- page still holds the old default — an image chosen in the dashboard stays.

UPDATE "manufacturing_pages"
SET "content" = jsonb_set("content", '{manufacturingReliability,image}', '"/images/client/manufacturing/technology-3.webp"')
WHERE "content" #>> '{manufacturingReliability,image}' = '/images/manufacturing/bc-solar/Manufacturing-excellence.webp';

UPDATE "manufacturing_pages"
SET "content" = jsonb_set("content", '{odm,image}', '"/images/client/manufacturing/technology-1.webp"')
WHERE "content" #>> '{odm,image}' = '/images/manufacturing/bc-solar/odm-customization-service-img.webp';

UPDATE "manufacturing_pages"
SET "content" = jsonb_set("content", '{relatedProducts,items,0,image}', '"/images/client/products/currentwave-topcon.webp"')
WHERE "content" #>> '{relatedProducts,items,0,image}' = '/images/manufacturing/solar-panels/topcon-solar-panels.webp';

UPDATE "manufacturing_pages"
SET "content" = jsonb_set("content", '{relatedProducts,items,1,image}', '"/images/client/products/currentwave-bc.webp"')
WHERE "content" #>> '{relatedProducts,items,1,image}' = '/images/manufacturing/solar-panels/bc-solar-panels.webp';

UPDATE "manufacturing_pages"
SET "content" = jsonb_set("content", '{relatedProducts,items,2,image}', '"/images/client/products/bess-utility-container.webp"')
WHERE "content" #>> '{relatedProducts,items,2,image}' = '/images/manufacturing/bess/488kwh-utility-bess.webp';

-- The related-inverters card pointed at a .jpg that never existed.
UPDATE "manufacturing_pages"
SET "content" = jsonb_set("content", '{relatedProducts,items,3,image}', '"/images/client/why-choose/tier1-brands.webp"')
WHERE "content" #>> '{relatedProducts,items,3,image}' IN ('/images/products/bc/related-inverters.jpg', '/images/products/bc/related-inverters.webp');
