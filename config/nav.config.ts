/**
 * Header + mega menu data model (docs/HEADER-MEGAMENU-SPEC.md §2).
 *
 * Hrefs and labelKeys reuse `site.config.ts`'s existing `mainNav` routes
 * wherever the meaning already matches — those are the site's real routes.
 * New labelKeys were only added where the mega menu needs Figma-exact text
 * that no existing key carries (product-card labels, expanded labels).
 * See messages/en.json → "nav" for the new keys.
 *
 * Panel shapes follow the client's nav structure table (revision doc, §1-6):
 *  - "flat"   — one list of second-level links, laid out in a horizontal row.
 *               Vertical stacks left the panel mostly empty ("非常空白").
 *  - "brands" — the Tier 1 partners, shown as their logos in a horizontal row.
 *  - "groups" — second-level entries that each own a third level. Hovering a
 *               group swaps the third-level content beside it, so Solutions and
 *               Renewable Projects (and Solar Panels / BESS) no longer share
 *               one undifferentiated list.
 *
 * Product `image`s reuse the manufacturing product photos in
 * /public/images/manufacturing (726x836, matching the 140x160 nav card box).
 * uranusPro/venusPro now use their real G12-0BB Uranus/Venus Pro shots
 * (added alongside the BC product detail page) — no `/products/*` detail
 * routes exist yet though, so those two hrefs remain placeholders.
 *
 * Brand logos reuse /public/images/trustedLogos (the home-page logo ticker
 * assets). `logoWidth` is the native width at `NAV_BRAND_LOGO_HEIGHT`, so the
 * aspect ratio never distorts — same convention as lib/data/trustedLogos.ts.
 */

import type { SolutionMenuGroup, ManufacturingCategory } from "@prisma/client";
import type messages from "@/messages/en.json";
import type { SolutionMenuEntry } from "@/lib/solutions-projects/types";
import type { ManufacturingMenuEntry } from "@/lib/manufacturing/types";

export type NavLabelKey = keyof typeof messages.nav;

/** Rendered height of a brand logo in the Tier 1 Brands panel. */
export const NAV_BRAND_LOGO_HEIGHT = 24;

export type NavLink = {
  /** i18n key for static links. Dynamic (DB) links carry a raw `label` instead. */
  labelKey?: NavLabelKey;
  /** Raw, already-localised label — used by DB-driven links that have no i18n key. */
  label?: string;
  href: string;
};

export type NavProduct = {
  labelKey: NavLabelKey;
  href: string;
  image: string;
};

export type NavBrand = {
  labelKey: NavLabelKey;
  href: string;
  logo: string;
  /** Native width at NAV_BRAND_LOGO_HEIGHT px tall. */
  logoWidth: number;
};

/** A second-level entry that owns a third level. */
export type NavGroup = {
  labelKey: NavLabelKey;
  href: string;
  /** Third-level links, revealed when this group is hovered or focused. */
  links?: NavLink[];
  /** Third-level product cards, revealed alongside `links`. */
  products?: NavProduct[];
};

export type NavPanel =
  | { kind: "flat"; items: NavLink[] }
  | { kind: "brands"; items: NavBrand[] }
  | { kind: "groups"; groups: NavGroup[] };

export type NavItem = {
  labelKey: NavLabelKey;
  href: string;
  panel: NavPanel;
};

export const NAV_ITEMS: NavItem[] = [
  {
    labelKey: "aboutUs",
    href: "/about/why-choose-cnx",
    panel: {
      kind: "flat",
      items: [
        { labelKey: "technology", href: "/about/technology" },
        { labelKey: "whyChooseCnx", href: "/about/why-choose-cnx" },
        { labelKey: "pvBessBrands", href: "/about/pv-bess-brands" },
      ],
    },
  },
  {
    labelKey: "manufacturing",
    href: "/manufacturing/solar-panels",
    panel: {
      kind: "groups",
      groups: [
        {
          labelKey: "solarPanels",
          href: "/manufacturing/solar-panels",
          links: [
            { labelKey: "backContact", href: "/manufacturing/solar-panels/bc" },
            { labelKey: "hjt", href: "/manufacturing/solar-panels/hjt" },
            { labelKey: "topcon", href: "/manufacturing/solar-panels/topcon" },
            {
              labelKey: "odmVerticalSolarModules",
              href: "/manufacturing/solar-panels/odm-vertical-solar-modules",
            },
            { labelKey: "revamping", href: "/manufacturing/solar-panels/revamping" },
          ],
        },
        {
          labelKey: "bess",
          href: "/manufacturing/bess",
          links: [
            { labelKey: "residentialBess", href: "/manufacturing/bess/residential" },
            { labelKey: "bess112", href: "/manufacturing/bess/112kwh" },
            { labelKey: "bess261", href: "/manufacturing/bess/261kwh" },
            { labelKey: "bess488", href: "/manufacturing/bess/488kwh" },
          ],
        },
      ],
    },
  },
  {
    labelKey: "tier1Brands",
    href: "/tier-1-brands/ja-solar",
    panel: {
      kind: "brands",
      items: [
        {
          labelKey: "jaSolar",
          href: "/tier-1-brands/ja-solar",
          logo: "/images/trustedLogos/jaSolarLogo.svg",
          logoWidth: 122,
        },
        {
          labelKey: "tongwei",
          href: "/tier-1-brands/tongwei",
          logo: "/images/trustedLogos/twSolarLogo.svg",
          logoWidth: 140,
        },
        {
          labelKey: "hithium",
          href: "/tier-1-brands/hithium",
          logo: "/images/trustedLogos/hthium%20Logo.svg",
          logoWidth: 101,
        },
        {
          labelKey: "growatt",
          href: "/tier-1-brands/growatt",
          logo: "/images/trustedLogos/growatt%20Logo.svg",
          logoWidth: 143,
        },
        {
          labelKey: "deye",
          href: "/tier-1-brands/deye",
          logo: "/images/trustedLogos/deye%20Logo.svg",
          logoWidth: 53,
        },
        {
          labelKey: "solis",
          href: "/tier-1-brands/solis",
          logo: "/images/trustedLogos/solisLogo.svg",
          logoWidth: 65,
        },
        {
          labelKey: "goodwe",
          href: "/tier-1-brands/goodwe",
          logo: "/images/trustedLogos/goodweLogo.svg",
          logoWidth: 132,
        },
      ],
    },
  },
  {
    labelKey: "solutionsProjects",
    href: "/solutions-projects/solutions",
    panel: {
      kind: "groups",
      groups: [
        {
          labelKey: "solutions",
          href: "/solutions-projects/solutions",
          links: [
            { labelKey: "residential", href: "/solutions-projects/solutions/residential" },
            { labelKey: "ci", href: "/solutions-projects/solutions/commercial-industrial" },
            { labelKey: "utilities", href: "/solutions-projects/solutions/utilities" },
            { labelKey: "virtualPowerPlant", href: "/solutions-projects/solutions/virtual-power-plant" },
            { labelKey: "supplyChainFinancing", href: "/solutions-projects/solutions/supply-chain-financing" },
          ],
          products: [
            {
              labelKey: "uranusPro",
              href: "/products/uranus-pro",
              image: "/images/manufacturing/bc-solar/g12-0bb-uranus-pro.webp",
            },
            {
              labelKey: "venusPro",
              href: "/products/venus-pro",
              image: "/images/manufacturing/bc-solar/g12-0bb-venus-pro.webp",
            },
          ],
        },
        {
          labelKey: "renewableProjects",
          href: "/solutions-projects/renewable-projects",
          links: [
            { labelKey: "gridTie", href: "/solutions-projects/renewable-projects/grid-tie" },
            { labelKey: "offgrid", href: "/solutions-projects/renewable-projects/offgrid" },
            { labelKey: "projectFinancing", href: "/solutions-projects/renewable-projects/project-financing" },
          ],
        },
      ],
    },
  },
  {
    labelKey: "service",
    href: "/service/downloads",
    panel: {
      kind: "flat",
      items: [
        { labelKey: "downloads", href: "/service/downloads" },
        { labelKey: "globalDistributor", href: "/service/global-distributor" },
        { labelKey: "warranty", href: "/service/warranty" },
        { labelKey: "stockProducts", href: "/service/stock-products" },
      ],
    },
  },
  {
    labelKey: "newsRoom",
    href: "/news",
    panel: {
      kind: "flat",
      items: [
        { labelKey: "news", href: "/news" },
        { labelKey: "reAnalysis", href: "/news/re-analysis" },
        { labelKey: "knowledgeDatabase", href: "/news/knowledge-database" },
        { labelKey: "events", href: "/news/events" },
      ],
    },
  },
];

/**
 * Whether a top-level nav item owns the current route.
 *
 * Matches on the item's section (the first path segment of its href) rather
 * than an exact list of leaf hrefs: every page under a section — including
 * detail/leaf routes the menu doesn't list, e.g. `/news/<slug>` or
 * `/manufacturing/solar-panels/hjt` — highlights that section's top item. Each
 * top item owns a distinct first segment, so exactly one item can ever match.
 */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const base = `/${item.href.split("/")[1]}`;
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Route base for a Solutions page, by its mega-menu group. */
export function solutionEntryHref(group: SolutionMenuGroup, slug: string): string {
  const base =
    group === "RENEWABLE_PROJECTS"
      ? "/solutions-projects/renewable-projects"
      : "/solutions-projects/solutions";
  return `${base}/${slug}`;
}

/** Which static group in the Solutions panel a DB group maps onto. */
const SOLUTION_GROUP_LABEL_KEY: Record<SolutionMenuGroup, NavLabelKey> = {
  SOLUTIONS: "solutions",
  RENEWABLE_PROJECTS: "renewableProjects",
};

/** Which static group in the Manufacturing panel a DB category maps onto. */
const MANUFACTURING_GROUP_LABEL_KEY: Record<ManufacturingCategory, NavLabelKey> = {
  SOLAR_PANELS: "solarPanels",
  BESS: "bess",
};

/** Route base for a manufacturing page, by category. */
export function manufacturingEntryHref(category: ManufacturingCategory, slug: string): string {
  const base = category === "BESS" ? "/manufacturing/bess" : "/manufacturing/solar-panels";
  return `${base}/${slug}`;
}

export interface DynamicMenu {
  solutions?: SolutionMenuEntry[];
  manufacturing?: ManufacturingMenuEntry[];
}

/**
 * NAV_ITEMS with the Solutions & Projects and Manufacturing panels' child links
 * replaced by the live, published pages. Group headers and product cards stay;
 * only the page links become data-driven, so a draft or deleted page is absent
 * and a newly published one appears. Called per request in the marketing layout.
 */
export function buildNavItems({ solutions = [], manufacturing = [] }: DynamicMenu): NavItem[] {
  const solutionLinks = new Map<NavLabelKey, NavLink[]>();
  for (const e of solutions) {
    const key = SOLUTION_GROUP_LABEL_KEY[e.menuGroup];
    const links = solutionLinks.get(key) ?? [];
    links.push({ label: e.menuLabel, href: solutionEntryHref(e.menuGroup, e.slug) });
    solutionLinks.set(key, links);
  }

  const manufacturingLinks = new Map<NavLabelKey, NavLink[]>();
  for (const e of manufacturing) {
    const key = MANUFACTURING_GROUP_LABEL_KEY[e.category];
    const links = manufacturingLinks.get(key) ?? [];
    links.push({ label: e.menuLabel, href: manufacturingEntryHref(e.category, e.slug) });
    manufacturingLinks.set(key, links);
  }

  function withDynamicGroups(item: NavItem, source: Map<NavLabelKey, NavLink[]>): NavItem {
    if (item.panel.kind !== "groups") return item;
    return {
      ...item,
      panel: {
        ...item.panel,
        groups: item.panel.groups.map((group) => ({ ...group, links: source.get(group.labelKey) ?? [] })),
      },
    };
  }

  return NAV_ITEMS.map((item) => {
    if (item.labelKey === "solutionsProjects") return withDynamicGroups(item, solutionLinks);
    if (item.labelKey === "manufacturing") return withDynamicGroups(item, manufacturingLinks);
    return item;
  });
}

/** Every href a panel can reach — used for active-route matching. */
export function navItemHrefs(item: NavItem): string[] {
  const panel = item.panel;
  if (panel.kind === "groups") {
    return panel.groups.flatMap((group) => [
      group.href,
      ...(group.links ?? []).map((link) => link.href),
      ...(group.products ?? []).map((product) => product.href),
    ]);
  }
  return panel.items.map((entry) => entry.href);
}
