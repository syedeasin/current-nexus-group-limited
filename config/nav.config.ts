/**
 * Header + mega menu data model (docs/HEADER-MEGAMENU-SPEC.md §2).
 *
 * Hrefs and labelKeys reuse `site.config.ts`'s existing `mainNav` routes
 * wherever the meaning already matches — those are the site's real routes.
 * New labelKeys were only added where the mega menu needs Figma-exact text
 * that no existing key carries (product-card labels, expanded labels).
 * See messages/en.json → "nav" for the new keys.
 *
 * TODO: every product `image` below points at /nav/placeholder.png (plain
 * gray, 140x160). Swap in real Figma-exported product thumbnails when
 * available — see the TODO on ProductCard in MenuPanel.tsx. The
 * uranusPro/venusPro product hrefs are also placeholders — no
 * `/products/*` detail routes exist yet.
 */

import type messages from "@/messages/en.json";

export type NavLabelKey = keyof typeof messages.nav;

export type NavColumnKind = "links" | "products";

export type NavLink = {
  labelKey: NavLabelKey;
  href: string;
};

export type NavProduct = {
  labelKey: NavLabelKey;
  href: string;
  image: string;
};

export type NavColumn =
  | { kind: "links"; widthPx?: number; items: NavLink[] }
  | { kind: "products"; items: NavProduct[] };

export type NavItem = {
  labelKey: NavLabelKey;
  href: string;
  columns: NavColumn[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    labelKey: "aboutUs",
    href: "/about/why-choose-cnx",
    columns: [
      {
        kind: "links",
        items: [
          { labelKey: "technology", href: "/about/technology" },
          { labelKey: "whyChooseCnx", href: "/about/why-choose-cnx" },
          { labelKey: "pvBessBrands", href: "/about/pv-bess-brands" },
        ],
      },
    ],
  },
  {
    labelKey: "manufacturing",
    href: "/manufacturing/solar-panels",
    columns: [
      {
        kind: "links",
        widthPx: 180,
        items: [
          { labelKey: "solarPanels", href: "/manufacturing/solar-panels" },
          { labelKey: "bess", href: "/manufacturing/bess" },
        ],
      },
      {
        kind: "products",
        items: [
          { labelKey: "backContact", href: "/manufacturing/solar-panels/bc", image: "/nav/placeholder.png" },
          { labelKey: "hjt", href: "/manufacturing/solar-panels/hjt", image: "/nav/placeholder.png" },
          { labelKey: "topcon", href: "/manufacturing/solar-panels/topcon", image: "/nav/placeholder.png" },
          {
            labelKey: "odmVertical",
            href: "/manufacturing/solar-panels/odm-vertical-solar-modules",
            image: "/nav/placeholder.png",
          },
        ],
      },
    ],
  },
  {
    labelKey: "tier1Brands",
    href: "/tier-1-brands/ja-solar",
    columns: [
      {
        kind: "links",
        items: [
          { labelKey: "jaSolar", href: "/tier-1-brands/ja-solar" },
          { labelKey: "tongwei", href: "/tier-1-brands/tongwei" },
          { labelKey: "hithium", href: "/tier-1-brands/hithium" },
          { labelKey: "growatt", href: "/tier-1-brands/growatt" },
          { labelKey: "deye", href: "/tier-1-brands/deye" },
          { labelKey: "solis", href: "/tier-1-brands/solis" },
          { labelKey: "goodwe", href: "/tier-1-brands/goodwe" },
        ],
      },
    ],
  },
  {
    labelKey: "solutionsProjects",
    href: "/solutions-projects/solutions",
    columns: [
      {
        kind: "links",
        widthPx: 180,
        items: [
          { labelKey: "solutions", href: "/solutions-projects/solutions" },
          { labelKey: "renewableProjects", href: "/solutions-projects/renewable-projects" },
        ],
      },
      {
        kind: "links",
        widthPx: 292,
        items: [
          { labelKey: "residential", href: "/solutions-projects/solutions/residential" },
          { labelKey: "ci", href: "/solutions-projects/solutions/commercial-industrial" },
          { labelKey: "utilities", href: "/solutions-projects/solutions/utilities" },
          { labelKey: "virtualPowerPlant", href: "/solutions-projects/solutions/virtual-power-plant" },
          { labelKey: "supplyChainFinancing", href: "/solutions-projects/solutions/supply-chain-financing" },
        ],
      },
      {
        kind: "products",
        items: [
          { labelKey: "uranusPro", href: "/products/uranus-pro", image: "/nav/placeholder.png" },
          { labelKey: "venusPro", href: "/products/venus-pro", image: "/nav/placeholder.png" },
        ],
      },
    ],
  },
  {
    labelKey: "service",
    href: "/service/downloads",
    columns: [
      {
        kind: "links",
        items: [
          { labelKey: "downloads", href: "/service/downloads" },
          { labelKey: "globalDistributor", href: "/service/global-distributor" },
          { labelKey: "warranty", href: "/service/warranty" },
          { labelKey: "stockProducts", href: "/service/stock-products" },
        ],
      },
    ],
  },
  {
    labelKey: "newsRoom",
    href: "/news",
    columns: [
      {
        kind: "links",
        items: [
          { labelKey: "news", href: "/news" },
          { labelKey: "reAnalysis", href: "/news/re-analysis" },
          { labelKey: "knowledgeDatabase", href: "/news/knowledge-database" },
          { labelKey: "events", href: "/news/events" },
        ],
      },
    ],
  },
];
