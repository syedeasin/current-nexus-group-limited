export interface PremiumSolutionsProduct {
  /** i18n key under home.premiumSolutions.products */
  key: string;
  image: string;
  href: string;
}

export interface PremiumSolutionsBrand {
  id: string;
  /** i18n key under home.premiumSolutions.brands (rail label) */
  brandKey: string;
  /** i18n key under home.premiumSolutions.titles (panel h3) */
  titleKey: string;
  products: PremiumSolutionsProduct[];
}

const placeholderImage = "/images/premiumSolutions/hithiumPVndEssIntegratedMachine.webp";

/**
 * TODO(Easin): only Hithium has real product photos + names today. These six
 * brands are rendering three generic "Product 1/2/3" placeholders on the
 * shared Hithium image until real content lands — JA Solar, Tongwei,
 * Growatt, DEYE, Solis, Goodwe.
 */
const placeholderProducts: PremiumSolutionsProduct[] = [
  { key: "placeholder1", image: placeholderImage, href: "/products" },
  { key: "placeholder2", image: placeholderImage, href: "/products" },
  { key: "placeholder3", image: placeholderImage, href: "/products" },
];

export const premiumSolutionsBrands: PremiumSolutionsBrand[] = [
  {
    id: "ja-solar",
    brandKey: "jaSolar",
    titleKey: "jaSolar",
    products: placeholderProducts,
  },
  {
    id: "tongwei",
    brandKey: "tongwei",
    titleKey: "tongwei",
    products: placeholderProducts,
  },
  {
    id: "hithium",
    brandKey: "hithium",
    titleKey: "hithium",
    products: [
      {
        key: "pvEssIntegratedMachine",
        image: "/images/premiumSolutions/hithiumPVndEssIntegratedMachine.webp",
        href: "/products",
      },
      {
        key: "essCabinet",
        image: "/images/premiumSolutions/hithiumEssCabinet.webp",
        href: "/products",
      },
      {
        key: "infinityBlock",
        image: "/images/premiumSolutions/hithiumBlock.webp",
        href: "/products",
      },
    ],
  },
  {
    id: "growatt",
    brandKey: "growatt",
    titleKey: "growatt",
    products: placeholderProducts,
  },
  {
    id: "deye",
    brandKey: "deye",
    titleKey: "deye",
    products: placeholderProducts,
  },
  {
    id: "solis",
    brandKey: "solis",
    titleKey: "solis",
    products: placeholderProducts,
  },
  {
    id: "goodwe",
    brandKey: "goodwe",
    titleKey: "goodwe",
    products: placeholderProducts,
  },
];
