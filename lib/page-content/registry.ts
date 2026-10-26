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
  { pattern: "about.whyChooseCnx.whoWeAre.stats", itemLabel: "Stat", titleKey: "label" },
  { pattern: "about.whyChooseCnx.sourcingRoutes.cards", itemLabel: "Card", titleKey: "title" },
  { pattern: "about.whyChooseCnx.beyondProducts.steps", itemLabel: "Step", titleKey: "title" },
  { pattern: "about.whyChooseCnx.globalConfidence.stats", itemLabel: "Stat", titleKey: "label" },
  { pattern: "about.whyChooseCnx.industryRecognition.items", itemLabel: "Certificate", titleKey: "caption" },
  { pattern: "manufacturing.*.products.items", itemLabel: "Product card", titleKey: "title" },
  { pattern: "manufacturing.*.whyChoose.features", itemLabel: "Feature", titleKey: "title" },
  { pattern: "footer.menu", itemLabel: "Column", titleKey: "heading", minItems: 1 },
  { pattern: "footer.menu.*.links", itemLabel: "Link", titleKey: "label" },
  { pattern: "footer.socialLinks", itemLabel: "Social link", titleKey: "label" },
  { pattern: "legal.*.sections", itemLabel: "Section", titleKey: "heading", minItems: 1 },
  { pattern: "contact.form.fields", itemLabel: "Field", titleKey: "label", minItems: 1 },
  { pattern: "contact.offices", itemLabel: "Address", titleKey: "label" },
  // Tier 1 brand pages (Dashboard → Tier 1 Brands; defaults in lib/brands/template.ts).
  { pattern: "brand.products.items", itemLabel: "Product", titleKey: "series" },
  { pattern: "brand.products.items.*.specs", itemLabel: "Parameter", titleKey: "label" },
  { pattern: "brand.advantages.items", itemLabel: "Advantage", titleKey: "title" },
  { pattern: "brand.buyers.items", itemLabel: "Item", titleKey: "title" },
  { pattern: "brand.documents.items", itemLabel: "Document type", titleKey: "title" },
  { pattern: "brand.applications.items", itemLabel: "Scenario", titleKey: "title" },
  { pattern: "brand.cases.items", itemLabel: "Case study", titleKey: "title" },
  { pattern: "brand.procurement.steps", itemLabel: "Step", titleKey: "title" },
  { pattern: "brand.faq.items", itemLabel: "Question", titleKey: "question" },
  { pattern: "brand.inquiry.fields", itemLabel: "Field", titleKey: "label", minItems: 1 },
  // Tier 1 brands collection page (/tier-1-brands).
  { pattern: "tier1Brands.mix.items", itemLabel: "Reason", titleKey: "title" },
  { pattern: "tier1Brands.partnership.stats", itemLabel: "Stat", titleKey: "label" },
  { pattern: "tier1Brands.faq.items", itemLabel: "Question", titleKey: "question" },
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
    label: "About Us (Why Choose CNX)",
    group: "About Us",
    href: "/about/why-choose-cnx",
    description: "The About Us page (menu → About Us). Sections from the client's About Us brief, revision 1022.",
    sections: [
      SEO("about.whyChooseCnx.meta"),
      { id: "hero", label: "Hero", path: "about.whyChooseCnx.hero" },
      { id: "whoWeAre", label: "Who we are + business at a glance", path: "about.whyChooseCnx.whoWeAre" },
      { id: "competitiveAdvantage", label: "Why choose us (6 advantages)", path: "about.whyChooseCnx.competitiveAdvantage" },
      { id: "sourcingRoutes", label: "One partner, multiple sourcing routes", path: "about.whyChooseCnx.sourcingRoutes" },
      { id: "industryRecognition", label: "Industry recognition", path: "about.whyChooseCnx.industryRecognition" },
      { id: "caseStudy", label: "Project case (proven capabilities)", path: "about.whyChooseCnx.caseStudy" },
      { id: "cta", label: "Final inquiry", path: "about.whyChooseCnx.cta" },
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
    description: "About Us → PV & BESS Brands. When this page is switched on it forwards to the Tier 1 Brands page.",
    sections: [SEO("about.pvBessBrands.meta"), { id: "banner", label: "Banner", path: "about.pvBessBrands.banner" }],
  },
  {
    key: "tier1Brands",
    label: "Tier 1 Brands (all brands)",
    group: "Tier 1 Brands",
    href: "/tier-1-brands",
    description:
      "The page that opens from the Tier 1 Brands menu. The brand cards, the product display and the menu logos come from the published brand pages (Dashboard → Tier 1 Brands).",
    sections: [
      SEO("tier1Brands.meta"),
      { id: "hero", label: "Hero", path: "tier1Brands.hero" },
      { id: "mix", label: "Why our brand mix", path: "tier1Brands.mix" },
      { id: "portfolio", label: "Brand portfolio", path: "tier1Brands.portfolio", description: "Heading and the CNX own-brand cards. The partner brand cards are your published brand pages." },
      { id: "partnership", label: "Global partnership", path: "tier1Brands.partnership" },
      { id: "products", label: "Product display", path: "tier1Brands.products", description: "The products shown are the first products on each published brand page." },
      { id: "news", label: "Brand news", path: "tier1Brands.news", description: "Shows the latest published posts (Dashboard → News → Posts)." },
      { id: "faq", label: "FAQ", path: "tier1Brands.faq" },
      { id: "cta", label: "Bottom call to action", path: "tier1Brands.cta" },
      { id: "brandPage", label: "Labels on every brand page", path: "tier1Brands.brandPage" },
    ],
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
  {
    key: "contact",
    label: "Contact",
    group: "Services",
    href: "/contact",
    description:
      "The Contact page. The office, email and phone shown on it are the ones in Pages → Footer → Contact info; messages sent through the form arrive in Dashboard → Inquiries.",
    sections: [
      SEO("contact.meta"),
      { id: "banner", label: "Banner", path: "contact.banner" },
      { id: "intro", label: "Introduction", path: "contact.intro" },
      { id: "offices", label: "Addresses (factory, office)", path: "contact.offices" },
      { id: "details", label: "Contact details labels", path: "contact.details" },
      {
        id: "formFields",
        label: "Form fields",
        path: "contact.form.fields",
        description:
          "Add, remove, reorder or hide fields and choose which are required. The Email field is always shown and required — it is how we reply.",
      },
      { id: "form", label: "Form labels & messages", path: "contact.form", exclude: ["fields"] },
    ],
  },
  ...(
    [
      ["news", "News", "/news"],
      ["reAnalysis", "RE Analysis", "/news/re-analysis"],
      ["knowledgeDatabase", "Knowledge Database", "/news/knowledge-database"],
      ["events", "Events", "/news/events"],
      ["caseStudies", "Case Studies", "/news/case-studies"],
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
      "Footer columns, contact details, newsletter and social links. Add, remove, rename or reorder columns and their links. The “Manufacturing” and “Solutions & Projects” columns also list your published pages automatically.",
    sections: [
      {
        id: "columns",
        label: "Link columns",
        path: "footer.menu",
        description: "One column per menu section. Published Manufacturing and Solutions & Projects pages are added under the columns with those ids automatically.",
      },
      { id: "contact", label: "Contact info", path: "footer.contact" },
      {
        id: "social",
        label: "Social links",
        path: "footer.socialLinks",
        description: "Platform sets the icon: facebook, instagram, linkedin, youtube or x (anything else shows a globe). Turn “Show” off to hide a link without deleting it.",
      },
      { id: "labels", label: "Headings & labels", path: "footer", exclude: ["menu", "contact", "socialLinks"] },
    ],
  },
  {
    key: "privacy",
    label: "Privacy Policy",
    group: "Legal",
    href: "/privacy-policy",
    description: "Privacy Policy text. Each section is a heading and its paragraphs (a new line starts a new paragraph; \"- \" starts a bullet). \"At a glance\" lines show as the summary box.",
    sections: [
      SEO("legal.privacy.meta"),
      { id: "content", label: "Content", path: "legal.privacy", exclude: ["meta"] },
      { id: "ui", label: "Sidebar labels (all legal pages)", path: "legal.ui" },
    ],
  },
  {
    key: "cookies",
    label: "Cookie Policy",
    group: "Legal",
    href: "/cookie-policy",
    description: "Cookie Policy text, linked from the cookie banner and the footer.",
    sections: [
      SEO("legal.cookies.meta"),
      { id: "content", label: "Content", path: "legal.cookies", exclude: ["meta"] },
    ],
  },
  {
    key: "terms",
    label: "Terms of Use",
    group: "Legal",
    href: "/terms",
    description: "Terms of Use text.",
    sections: [
      SEO("legal.terms.meta"),
      { id: "content", label: "Content", path: "legal.terms", exclude: ["meta"] },
    ],
  },
  {
    key: "cookieBanner",
    label: "Cookie banner",
    group: "Legal",
    href: null,
    description: "The cookie pop-up shown to visitors until they accept or reject.",
    sections: [{ id: "banner", label: "Banner text", path: "cookieConsent" }],
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
