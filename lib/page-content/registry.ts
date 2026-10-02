/**
 * Every website page editable under Dashboard → Pages, and the message
 * subtrees it owns. Client-safe plain data: the editor, the save action and
 * the message merge (i18n/request.ts) all read it.
 *
 * Solutions & Projects and Manufacturing product pages are NOT here — they
 * have their own page builders (Dashboard → Solutions & Projects /
 * Manufacturing). This registry covers the fixed-design pages whose copy
 * lives in messages/<locale>.json.
 */

export interface CollectionDef {
  /** Dotted message path; "*" matches one segment. */
  pattern: string;
  /** Singular noun for the "Add …" button and item headers. */
  itemLabel: string;
  /** Item field used as the item's title in the editor list. */
  titleKey?: string;
  /** The page breaks visually below this many items. */
  minItems?: number;
}

export const COLLECTION_PATTERNS: CollectionDef[] = [
  { pattern: "home.hero.slides", itemLabel: "Slide", titleKey: "heading", minItems: 1 },
  { pattern: "home.trustedLogos.logos", itemLabel: "Logo", titleKey: "name", minItems: 1 },
  { pattern: "home.about.avatars", itemLabel: "Avatar" },
  { pattern: "home.about.stats", itemLabel: "Stat", titleKey: "label" },
  { pattern: "home.ecosystem.tabs.*.products", itemLabel: "Product", titleKey: "title" },
  { pattern: "home.premiumSolutions.brands", itemLabel: "Brand", titleKey: "label", minItems: 1 },
  { pattern: "home.premiumSolutions.brands.*.products", itemLabel: "Product", titleKey: "title" },
  { pattern: "home.applicationScenes.cards", itemLabel: "Card", titleKey: "title", minItems: 1 },
  { pattern: "home.whyChoose.items", itemLabel: "Reason", titleKey: "title" },
  { pattern: "home.awards.items", itemLabel: "Award", titleKey: "caption" },
  { pattern: "home.faq.items", itemLabel: "Question", titleKey: "question" },
  { pattern: "about.whyChooseCnx.competitiveAdvantage.items", itemLabel: "Advantage", titleKey: "title" },
  { pattern: "about.whyChooseCnx.beyondProducts.steps", itemLabel: "Step", titleKey: "title" },
  { pattern: "about.whyChooseCnx.globalConfidence.stats", itemLabel: "Stat", titleKey: "label" },
  { pattern: "about.whyChooseCnx.industryRecognition.items", itemLabel: "Certificate", titleKey: "caption" },
  { pattern: "manufacturing.*.products.items", itemLabel: "Product card", titleKey: "title" },
  { pattern: "manufacturing.*.whyChoose.features", itemLabel: "Feature", titleKey: "title" },
  { pattern: "footer.columns.*.links", itemLabel: "Link", titleKey: "label" },
];

export interface PageSectionDef {
  id: string;
  label: string;
  /** Dotted message path this section edits (an object subtree). */
  path: string;
  description?: string;
  /** Child keys of `path` handled by another section (or not editable here). */
  exclude?: string[];
}

export interface PageDef {
  key: string;
  label: string;
  group: string;
  /** Public route (without locale), or null for site-wide content. */
  href: string | null;
  description: string;
  sections: PageSectionDef[];
}

const SEO = (path: string): PageSectionDef => ({
  id: "seo",
  label: "SEO",
  path,
  description: "Browser tab title and search-result description.",
});

export const PAGES: PageDef[] = [
  {
    key: "home",
    label: "Homepage",
    group: "Primary pages",
    href: "/",
    description: "Every section of the homepage, top to bottom.",
    sections: [
      SEO("home.meta"),
      { id: "hero", label: "Hero slider", path: "home.hero" },
      { id: "trustedLogos", label: "Trusted by logos", path: "home.trustedLogos" },
      { id: "about", label: "About CNX", path: "home.about" },
      { id: "ecosystem", label: "Manufacturing products", path: "home.ecosystem" },
      { id: "premiumSolutions", label: "Tier 1 brand products", path: "home.premiumSolutions" },
      { id: "applicationScenes", label: "Scene of applications", path: "home.applicationScenes" },
      { id: "testimonials", label: "Client success story", path: "home.testimonials" },
      { id: "whyChoose", label: "Why choose us", path: "home.whyChoose" },
      { id: "awards", label: "Industry recognition", path: "home.awards" },
      {
        id: "latestNews",
        label: "Latest news",
        path: "home.latestNews",
        description: "The cards themselves are the latest published posts (Dashboard → News → Posts).",
      },
      { id: "faq", label: "FAQ", path: "home.faq" },
      { id: "cta", label: "Bottom call to action", path: "home.cta", description: "Also the default CTA on other pages." },
    ],
  },
  {
    key: "about.whyChooseCnx",
    label: "Why Choose CNX",
    group: "About Us",
    href: "/about/why-choose-cnx",
    description: "About Us → Why Choose CNX.",
    sections: [
      SEO("about.whyChooseCnx.meta"),
      { id: "hero", label: "Hero", path: "about.whyChooseCnx.hero" },
      { id: "competitiveAdvantage", label: "Competitive advantage", path: "about.whyChooseCnx.competitiveAdvantage" },
      { id: "beyondProducts", label: "Beyond products", path: "about.whyChooseCnx.beyondProducts" },
      { id: "globalConfidence", label: "Global confidence", path: "about.whyChooseCnx.globalConfidence" },
      { id: "industryRecognition", label: "Industry recognition", path: "about.whyChooseCnx.industryRecognition" },
      { id: "caseStudy", label: "Client success story", path: "about.whyChooseCnx.caseStudy" },
      { id: "cta", label: "Bottom call to action", path: "about.whyChooseCnx.cta" },
    ],
  },
  {
    key: "about.technology",
    label: "Technology",
    group: "About Us",
    href: "/about/technology",
    description: "About Us → Technology.",
    sections: [SEO("about.technology.meta"), { id: "banner", label: "Banner", path: "about.technology.banner" }],
  },
  {
    key: "about.pvBessBrands",
    label: "PV & BESS Brands",
    group: "About Us",
    href: "/about/pv-bess-brands",
    description: "About Us → PV & BESS Brands.",
    sections: [SEO("about.pvBessBrands.meta"), { id: "banner", label: "Banner", path: "about.pvBessBrands.banner" }],
  },
  {
    key: "manufacturing.solarPanels",
    label: "Solar Panels",
    group: "Manufacturing",
    href: "/manufacturing/solar-panels",
    description: "Manufacturing → Solar Panels (second-level category page).",
    sections: [
      SEO("manufacturing.solarPanels.meta"),
      { id: "banner", label: "Banner", path: "manufacturing.solarPanels.banner" },
      {
        id: "products",
        label: "Product cards",
        path: "manufacturing.solarPanels.products",
        description: "Each card links to a product page (Dashboard → Manufacturing).",
      },
      { id: "whyChoose", label: "Why choose CNX", path: "manufacturing.solarPanels.whyChoose" },
      { id: "cta", label: "Bottom call to action image", path: "manufacturing.solarPanels", exclude: ["meta", "banner", "products", "whyChoose"] },
    ],
  },
  {
    key: "manufacturing.bess",
    label: "BESS",
    group: "Manufacturing",
    href: "/manufacturing/bess",
    description: "Manufacturing → BESS (second-level category page).",
    sections: [
      SEO("manufacturing.bess.meta"),
      { id: "banner", label: "Banner", path: "manufacturing.bess.banner" },
      {
        id: "products",
        label: "Product cards",
        path: "manufacturing.bess.products",
        description: "Each card links to a product page (Dashboard → Manufacturing).",
      },
      { id: "whyChoose", label: "Why choose CNX", path: "manufacturing.bess.whyChoose" },
      { id: "cta", label: "Bottom call to action image", path: "manufacturing.bess", exclude: ["meta", "banner", "products", "whyChoose"] },
    ],
  },
  {
    key: "service.downloads",
    label: "Downloads",
    group: "Services",
    href: "/service/downloads",
    description: "Services → Downloads (the documents themselves are under Dashboard → Downloads).",
    sections: [
      SEO("service.downloads.meta"),
      { id: "banner", label: "Banner", path: "service.downloads.banner" },
      { id: "labels", label: "Search, filter and list labels", path: "service.downloads", exclude: ["meta", "banner"] },
    ],
  },
  ...(
    [
      ["news", "News", "/news"],
      ["reAnalysis", "RE Analysis", "/news/re-analysis"],
      ["knowledgeDatabase", "Knowledge Database", "/news/knowledge-database"],
      ["events", "Events", "/news/events"],
    ] as const
  ).map(
    ([key, label, href]): PageDef => ({
      key: `news.${key}`,
      label,
      group: "News Room",
      href,
      description: `News Room → ${label}. The posts listed are the published posts in the "${label}" section.`,
      sections: [
        SEO(`news.sections.${key}.meta`),
        { id: "page", label: "Banner & headings", path: `news.sections.${key}`, exclude: ["meta"] },
        ...(key === "news"
          ? [{ id: "shared", label: "Shared News Room labels", path: "news", exclude: ["sections"] }]
          : []),
      ],
    })
  ),
  {
    key: "nav",
    label: "Header navigation",
    group: "Site-wide",
    href: null,
    description: "Menu labels in the header and mega menu. Page links added in Manufacturing / Solutions use their own menu labels.",
    sections: [{ id: "nav", label: "Menu labels", path: "nav" }],
  },
  {
    key: "footer",
    label: "Footer",
    group: "Site-wide",
    href: null,
    description:
      "Footer columns, contact details, newsletter and social links. The Manufacturing and Solutions columns list your published pages automatically.",
    sections: [
      { id: "columns", label: "Link columns", path: "footer.columns" },
      { id: "contact", label: "Contact info", path: "footer.contact" },
      { id: "social", label: "Social links", path: "footer.social" },
      { id: "labels", label: "Headings & labels", path: "footer", exclude: ["columns", "contact", "social"] },
    ],
  },
];

export function getPageDef(key: string): PageDef | undefined {
  return PAGES.find((p) => p.key === key);
}

/** URL segment for a page's editor — dots in keys would read as file extensions. */
export function pageSlug(key: string): string {
  return key.replace(/\./g, "-");
}

export function getPageDefBySlug(slug: string): PageDef | undefined {
  return PAGES.find((p) => pageSlug(p.key) === slug);
}
