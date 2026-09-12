export interface ProductCard {
  /** Appended to the category route, e.g. "bc" -> /manufacturing/solar-panels/bc */
  slug: string;
  /** Key relative to the category's i18n namespace, e.g. "products.bc.title" */
  titleKey: string;
  descriptionKey: string;
  image: string;
  /** true renders the gold "Learn more" button; only one card per category should set this. */
  featured?: boolean;
}

export interface CategoryFeature {
  /** Looked up in the ICONS map in WhyChooseCategory.tsx */
  icon: "cpu" | "trending-up" | "globe";
  titleKey: string;
  descriptionKey: string;
}

export interface ProductCategory {
  slug: "solar-panels" | "bess";
  /** i18n namespace holding banner/products/whyChoose/meta for this category */
  namespace: string;
  bannerImage: string;
  whyChooseImage: string;
  ctaImage: string;
  products: ProductCard[];
  features: CategoryFeature[];
}

export const productCategories: Record<string, ProductCategory> = {
  "solar-panels": {
    slug: "solar-panels",
    namespace: "manufacturing.solarPanels",
    bannerImage: "/images/manufacturing/solar-panels/solar-panels-banner.webp",
    whyChooseImage: "/images/manufacturing/manufacturing-why-choose-us.webp",
    ctaImage: "/images/home/CTABackground.webp",
    products: [
      {
        slug: "bc",
        titleKey: "products.bc.title",
        descriptionKey: "products.bc.description",
        image: "/images/manufacturing/solar-panels/bc-solar-panels.webp",
        featured: true,
      },
      {
        slug: "hjt",
        titleKey: "products.hjt.title",
        descriptionKey: "products.hjt.description",
        image: "/images/manufacturing/solar-panels/hjt-solar-panels.webp",
      },
      {
        slug: "topcon",
        titleKey: "products.topcon.title",
        descriptionKey: "products.topcon.description",
        image: "/images/manufacturing/solar-panels/topcon-solar-panels.webp",
      },
      {
        slug: "odm-vertical-solar-modules",
        titleKey: "products.odm.title",
        descriptionKey: "products.odm.description",
        image: "/images/manufacturing/solar-panels/private-label-solar-modules.webp",
      },
    ],
    features: [
      { icon: "cpu", titleKey: "whyChoose.features.advancedTechnology.title", descriptionKey: "whyChoose.features.advancedTechnology.description" },
      { icon: "trending-up", titleKey: "whyChoose.features.lowerLcoe.title", descriptionKey: "whyChoose.features.lowerLcoe.description" },
      { icon: "globe", titleKey: "whyChoose.features.globalSupply.title", descriptionKey: "whyChoose.features.globalSupply.description" },
    ],
  },
  bess: {
    slug: "bess",
    namespace: "manufacturing.bess",
    bannerImage: "/images/manufacturing/bess/bess-banner.webp",
    whyChooseImage: "/images/manufacturing/manufacturing-why-choose-us.webp",
    ctaImage: "/images/home/CTABackground.webp",
    products: [
      {
        slug: "residential",
        titleKey: "products.residential.title",
        descriptionKey: "products.residential.description",
        image: "/images/manufacturing/bess/residential-bess.webp",
        featured: true,
      },
      {
        slug: "112kwh",
        titleKey: "products.kwh112.title",
        descriptionKey: "products.kwh112.description",
        image: "/images/manufacturing/bess/112kwh-commercial-bess.webp",
      },
      {
        slug: "261kwh",
        titleKey: "products.kwh261.title",
        descriptionKey: "products.kwh261.description",
        image: "/images/manufacturing/bess/261kwh-commercial-bess.webp",
      },
      {
        slug: "488kwh",
        titleKey: "products.kwh488.title",
        descriptionKey: "products.kwh488.description",
        image: "/images/manufacturing/bess/488kwh-utility-bess.webp",
      },
    ],
    // Same three features as Solar Panels per the design (feature 1 name-drops HJT,
    // which reads oddly here — kept as designed, but data-driven via its own i18n
    // namespace so a BESS-specific line can be swapped in without touching the component.
    features: [
      { icon: "cpu", titleKey: "whyChoose.features.advancedTechnology.title", descriptionKey: "whyChoose.features.advancedTechnology.description" },
      { icon: "trending-up", titleKey: "whyChoose.features.lowerLcoe.title", descriptionKey: "whyChoose.features.lowerLcoe.description" },
      { icon: "globe", titleKey: "whyChoose.features.globalSupply.title", descriptionKey: "whyChoose.features.globalSupply.description" },
    ],
  },
};

export async function getCategory(slug: string): Promise<ProductCategory | null> {
  return productCategories[slug] ?? null;
}
