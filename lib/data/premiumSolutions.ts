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
 *
 * Every product card here links to its own brand's page — the same
 * /tier-1-brands/<id> path config/nav.config.ts already uses for that brand
 * in the mega menu, so the whole site has one URL per brand. None of those
 * pages exist yet, so the link falls through to the app's not-found page;
 * no new pages are being added for the first MVP pass — client's explicit
 * call. Once a brand's page is built at that same path, these links (and the
 * nav's) start working with no data change.
 */
function placeholderProductsFor(brandId: string): PremiumSolutionsProduct[] {
  const href = `/tier-1-brands/${brandId}`;
  return [
    { key: "placeholder1", image: placeholderImage, href },
    { key: "placeholder2", image: placeholderImage, href },
    { key: "placeholder3", image: placeholderImage, href },
  ];
}

export const premiumSolutionsBrands: PremiumSolutionsBrand[] = [
  {
    id: "ja-solar",
    brandKey: "jaSolar",
    titleKey: "jaSolar",
    products: placeholderProductsFor("ja-solar"),
  },
  {
    id: "tongwei",
    brandKey: "tongwei",
    titleKey: "tongwei",
    products: placeholderProductsFor("tongwei"),
  },
  {
    id: "hithium",
    brandKey: "hithium",
    titleKey: "hithium",
    products: [
      {
        key: "pvEssIntegratedMachine",
        image: "/images/premiumSolutions/hithiumPVndEssIntegratedMachine.webp",
        href: "/tier-1-brands/hithium",
      },
      {
        key: "essCabinet",
        image: "/images/premiumSolutions/hithiumEssCabinet.webp",
        href: "/tier-1-brands/hithium",
      },
      {
        key: "infinityBlock",
        image: "/images/premiumSolutions/hithiumBlock.webp",
        href: "/tier-1-brands/hithium",
      },
    ],
  },
  {
    id: "growatt",
    brandKey: "growatt",
    titleKey: "growatt",
    products: placeholderProductsFor("growatt"),
  },
  {
    id: "deye",
    brandKey: "deye",
    titleKey: "deye",
    products: placeholderProductsFor("deye"),
  },
  {
    id: "solis",
    brandKey: "solis",
    titleKey: "solis",
    products: placeholderProductsFor("solis"),
  },
  {
    id: "goodwe",
    brandKey: "goodwe",
    titleKey: "goodwe",
    products: placeholderProductsFor("goodwe"),
  },
];
