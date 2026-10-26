import { routing } from "@/i18n/routing";

/**
 * Pages an admin can show or hide in Dashboard → Settings → Page visibility.
 * Client-safe plain data (the dashboard form and the server both read it).
 *
 * A hidden page disappears from the header menu, the footer and the sitemap,
 * and its URL returns 404. Manufacturing and Solutions & Projects detail
 * pages and the Tier 1 brand pages are not listed here — they have Draft /
 * Published in their own editors.
 */
export interface VisibilityPage {
  path: string;
  label: string;
  group: string;
}

export const VISIBILITY_PAGES: VisibilityPage[] = [
  { path: "/about/technology", label: "Technology", group: "About Us" },
  { path: "/about/why-choose-cnx", label: "Why Choose CNX", group: "About Us" },
  { path: "/about/pv-bess-brands", label: "PV & BESS Brands", group: "About Us" },
  { path: "/manufacturing/solar-panels", label: "Solar Panels", group: "Manufacturing" },
  { path: "/manufacturing/bess", label: "BESS", group: "Manufacturing" },
  { path: "/tier-1-brands", label: "Tier 1 Brands (all brands page)", group: "Tier 1 Brands" },
  { path: "/solutions-projects/solutions", label: "Solutions (overview)", group: "Solutions & Projects" },
  { path: "/solutions-projects/renewable-projects", label: "Renewable Projects (overview)", group: "Solutions & Projects" },
  { path: "/products/uranus-pro", label: "Uranus Pro (menu card)", group: "Solutions & Projects" },
  { path: "/products/venus-pro", label: "Venus Pro (menu card)", group: "Solutions & Projects" },
  { path: "/service/downloads", label: "Downloads", group: "Services" },
  { path: "/service/global-distributor", label: "Global Distributor", group: "Services" },
  { path: "/service/warranty", label: "Warranty", group: "Services" },
  { path: "/service/stock-products", label: "Stock Products", group: "Services" },
  { path: "/news", label: "News", group: "News Room" },
  { path: "/news/re-analysis", label: "RE Analysis", group: "News Room" },
  { path: "/news/knowledge-database", label: "Knowledge Database", group: "News Room" },
  { path: "/news/events", label: "Events", group: "News Room" },
  { path: "/news/case-studies", label: "Case Studies", group: "News Room" },
  { path: "/contact", label: "Contact", group: "Other" },
  { path: "/privacy-policy", label: "Privacy Policy", group: "Other" },
  { path: "/cookie-policy", label: "Cookie Policy", group: "Other" },
  { path: "/terms", label: "Terms of Use", group: "Other" },
];

/**
 * Hidden until their page is designed and built (client, 13 Oct 2026: launch
 * with the finished pages, publish the rest later). Used until an admin saves
 * the visibility list for the first time.
 */
export const DEFAULT_HIDDEN_PATHS: string[] = [
  "/about/technology",
  "/about/pv-bess-brands",
  "/solutions-projects/solutions",
  "/solutions-projects/renewable-projects",
  "/products/uranus-pro",
  "/products/venus-pro",
  "/service/global-distributor",
  "/service/warranty",
  "/service/stock-products",
];

/**
 * Routes the menus, homepage cards and footer link to but that have no page
 * in the code yet (Phase 2). Links to them render as plain text instead of
 * leading to a 404. Delete an entry when its page ships.
 */
export const ROUTES_WITHOUT_PAGE: { exact?: string[]; prefixes?: string[] } = {
  exact: [
    "/projects",
    "/solutions",
    "/solutions-projects/solutions",
    "/solutions-projects/renewable-projects",
    "/service/global-distributor",
    "/service/warranty",
    "/service/stock-products",
  ],
  prefixes: ["/products/"],
};

/** CMS-driven detail routes: only the published slugs under these bases exist. */
export const CMS_DETAIL_BASES = [
  "/manufacturing/solar-panels/",
  "/manufacturing/bess/",
  "/solutions-projects/solutions/",
  "/solutions-projects/renewable-projects/",
  "/tier-1-brands/",
];

/** "/en/news/?x#y" → "/news". Locale prefix, query, hash and trailing slash removed. */
export function normalizePath(href: string, locales: readonly string[] = routing.locales): string {
  let path = href.split(/[?#]/)[0] || "/";
  const first = path.split("/")[1];
  if (first && locales.includes(first)) path = path.slice(first.length + 1) || "/";
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path;
}

export function isHiddenPath(href: string, hidden: ReadonlySet<string>): boolean {
  return hidden.size > 0 && hidden.has(normalizePath(href));
}
