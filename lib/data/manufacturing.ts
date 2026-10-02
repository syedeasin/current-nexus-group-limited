/**
 * The Manufacturing second-level (category) pages: /manufacturing/solar-panels
 * and /manufacturing/bess. Their whole content — banner, product cards, "why
 * choose" block, CTA image, SEO — lives in messages under `namespace` and is
 * edited from Dashboard → Pages → Manufacturing (also linked from Dashboard →
 * Manufacturing). Only the route and namespace are fixed here.
 */
export interface ProductCategory {
  slug: "solar-panels" | "bess";
  /** i18n namespace holding meta/banner/products/whyChoose/ctaImage for this category. */
  namespace: "manufacturing.solarPanels" | "manufacturing.bess";
  /** Dashboard → Pages registry key for this category page. */
  pageKey: string;
}

export const productCategories: Record<ProductCategory["slug"], ProductCategory> = {
  "solar-panels": {
    slug: "solar-panels",
    namespace: "manufacturing.solarPanels",
    pageKey: "manufacturing.solarPanels",
  },
  bess: {
    slug: "bess",
    namespace: "manufacturing.bess",
    pageKey: "manufacturing.bess",
  },
};

export async function getCategory(slug: string): Promise<ProductCategory | null> {
  return productCategories[slug as ProductCategory["slug"]] ?? null;
}
