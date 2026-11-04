/**
 * Pages built from content blocks (client revisions of 4 Nov 2026: Solar Panel
 * Revamping, the Solutions and Renewable Projects overview pages, and the
 * eight Solutions & Projects detail pages). Client-safe plain data: the page
 * renderer, the Dashboard → Pages editor (lib/page-content/registry.ts) and
 * the inquiry action all read it.
 *
 * Copy lives in messages/<locale>.json under `blockPages.<key>.<section id>`,
 * so every word, link and photo is editable in Dashboard → Pages. Each
 * section's `kind` picks the component that draws it.
 */

/** Solutions & Projects menu group (Prisma SolutionMenuGroup) — a plain string so this file stays client-safe. */
export type DetailGroup = "SOLUTIONS" | "RENEWABLE_PROJECTS";

export type BlockKind =
  | "hero"
  | "rows"
  | "imageCards"
  | "products"
  | "list"
  | "features"
  | "steps"
  | "checklist"
  | "cases"
  | "faq"
  | "cta"
  | "routes"
  | "comparison"
  | "buyers"
  | "caseExample"
  | "trust"
  | "inquiry";

export interface BlockSectionDef {
  /** Message key under the page, also the section's anchor id (#inquiry). */
  id: string;
  kind: BlockKind;
  /** Name in the dashboard editor. */
  label: string;
  description?: string;
}

export interface BlockPageDef {
  key: string;
  label: string;
  /** Dashboard → Pages group. */
  group: string;
  /** Public route of the page (detail pages: the menu link). */
  href: string;
  description: string;
  /**
   * Detail pages under a Solutions & Projects menu group. Their URL is the
   * published page's slug (Dashboard → Solutions & Projects keeps Draft /
   * Published, menu label and order); the slug's first word picks the
   * content, so "residential-solar-solutions" and "residential" both read
   * `blockPages.residential`.
   */
  detail?: { group: DetailGroup; slugWords: string[] };
  sections: BlockSectionDef[];
}

const HERO: BlockSectionDef = { id: "hero", kind: "hero", label: "Banner" };
const FAQ: BlockSectionDef = { id: "faq", kind: "faq", label: "FAQ" };
const CTA: BlockSectionDef = { id: "cta", kind: "cta", label: "Bottom call to action" };
const WHY: BlockSectionDef = { id: "whyChoose", kind: "features", label: "Why choose CNX" };

export const BLOCK_PAGES: BlockPageDef[] = [
  {
    key: "revamping",
    label: "Solar Panel Revamping",
    group: "Manufacturing",
    href: "/manufacturing/solar-panels/revamping",
    description: "Manufacturing → Solar Panels → Revamping. Plant assessment requests arrive in Dashboard → Inquiries.",
    sections: [
      HERO,
      {
        id: "routes",
        kind: "routes",
        label: "Replacement routes (4 selectable cards)",
        description: "“Goal in the form” must match one of the Project goal options in the inquiry form exactly; choosing the card pre-selects it.",
      },
      { id: "solutions", kind: "list", label: "Replacement solution (4 cards)" },
      { id: "comparison", kind: "comparison", label: "Why choose CNX (comparison table)" },
      { id: "buyers", kind: "buyers", label: "Solutions for different buyers" },
      {
        id: "caseExample",
        kind: "caseExample",
        label: "Project case example",
        description: "Keep the “Simulation case” badge and note until a real, authorised CNX project replaces this example.",
      },
      { id: "process", kind: "steps", label: "Supply & delivery process" },
      { id: "products", kind: "products", label: "Product recommendations", description: "Cards with the same Group are shown together under that group name." },
      FAQ,
      {
        id: "inquiry",
        kind: "inquiry",
        label: "Plant assessment form",
        description: "Add, remove, reorder or hide fields. The Email field is always shown and required. Validation and consent texts are shared with Pages → Contact.",
      },
      { id: "trust", kind: "trust", label: "Trust signals" },
    ],
  },
  {
    key: "solutionsHub",
    label: "Solutions (overview)",
    group: "Solutions & Projects",
    href: "/solutions-projects/solutions",
    description: "The page that opens from Solutions & Projects → Solutions. The project cards are your published Case Studies posts.",
    sections: [
      HERO,
      { id: "solutions", kind: "imageCards", label: "Choose your solution" },
      { id: "support", kind: "list", label: "How CNX supports your project (4 icon cards)" },
      { id: "sourcing", kind: "features", label: "From product selection to supply coordination" },
      { id: "cases", kind: "cases", label: "Project examples", description: "Shows the newest published Case Studies posts (Dashboard → News → Posts)." },
      { id: "process", kind: "steps", label: "Sourcing process" },
      FAQ,
      CTA,
    ],
  },
  {
    key: "projectsHub",
    label: "Renewable Projects (overview)",
    group: "Solutions & Projects",
    href: "/solutions-projects/renewable-projects",
    description: "The page that opens from Solutions & Projects → Renewable Projects. The project cards are your published Case Studies posts.",
    sections: [
      HERO,
      { id: "types", kind: "imageCards", label: "Explore projects by type" },
      { id: "considerations", kind: "list", label: "Different projects, different requirements" },
      { id: "support", kind: "features", label: "PV & BESS sourcing for projects" },
      { id: "cases", kind: "cases", label: "Selected projects", description: "Shows the newest published Case Studies posts (Dashboard → News → Posts)." },
      {
        id: "inquiry",
        kind: "inquiry",
        label: "How to start your project inquiry (checklist + form)",
        description: "The checklist sits beside a short project form. Requests arrive in Dashboard → Inquiries.",
      },
      FAQ,
      CTA,
    ],
  },
  {
    key: "residential",
    label: "Residential Solar Solutions",
    group: "Solutions & Projects",
    href: "/solutions-projects/solutions/residential",
    description: "Solutions → Residential. Draft / Published, menu label and SEO address stay in Dashboard → Solutions & Projects.",
    detail: { group: "SOLUTIONS", slugWords: ["residential"] },
    sections: [
      HERO,
      { id: "overview", kind: "rows", label: "Solar & battery storage for homes" },
      { id: "products", kind: "products", label: "Product entry points" },
      { id: "challenges", kind: "list", label: "Procurement challenges" },
      WHY,
      FAQ,
      CTA,
    ],
  },
  {
    key: "commercial",
    label: "Commercial & Industrial Solar Solutions",
    group: "Solutions & Projects",
    href: "/solutions-projects/solutions/commercial-industrial",
    description: "Solutions → C&I. Draft / Published, menu label and SEO address stay in Dashboard → Solutions & Projects.",
    detail: { group: "SOLUTIONS", slugWords: ["commercial", "ci", "c-i"] },
    sections: [
      HERO,
      { id: "overview", kind: "rows", label: "Solar & storage for C&I facilities" },
      { id: "products", kind: "products", label: "Product entry points" },
      { id: "challenges", kind: "list", label: "Procurement challenges" },
      WHY,
      { id: "applications", kind: "cases", label: "Project applications", description: "Project facets plus your newest published Case Studies posts." },
      FAQ,
      CTA,
    ],
  },
  {
    key: "utilities",
    label: "Utility-Scale Solar Solutions",
    group: "Solutions & Projects",
    href: "/solutions-projects/solutions/utilities",
    description: "Solutions → Utilities. Draft / Published, menu label and SEO address stay in Dashboard → Solutions & Projects.",
    detail: { group: "SOLUTIONS", slugWords: ["utilities", "utility"] },
    sections: [
      HERO,
      { id: "overview", kind: "rows", label: "Module sourcing for utility projects" },
      { id: "products", kind: "products", label: "Solar modules and related products" },
      { id: "requirements", kind: "list", label: "Procurement requirements" },
      WHY,
      { id: "projects", kind: "cases", label: "Project examples", description: "Shows the newest published Case Studies posts." },
      FAQ,
      CTA,
    ],
  },
  {
    key: "vpp",
    label: "Virtual Power Plant Solutions",
    group: "Solutions & Projects",
    href: "/solutions-projects/solutions/virtual-power-plant",
    description: "Solutions → Virtual Power Plant. Draft / Published, menu label and SEO address stay in Dashboard → Solutions & Projects.",
    detail: { group: "SOLUTIONS", slugWords: ["virtual", "vpp"] },
    sections: [
      HERO,
      { id: "overview", kind: "list", label: "Application overview" },
      { id: "products", kind: "products", label: "PV & BESS products" },
      { id: "scenarios", kind: "imageCards", label: "Application scenarios" },
      { id: "considerations", kind: "list", label: "Key considerations" },
      WHY,
      { id: "process", kind: "steps", label: "Procurement process" },
      FAQ,
      CTA,
    ],
  },
  {
    key: "supplyChain",
    label: "Supply Chain Financing",
    group: "Solutions & Projects",
    href: "/solutions-projects/solutions/supply-chain-financing",
    description: "Solutions → Supply Chain Financing. Draft / Published, menu label and SEO address stay in Dashboard → Solutions & Projects.",
    detail: { group: "SOLUTIONS", slugWords: ["supply"] },
    sections: [
      HERO,
      { id: "context", kind: "list", label: "Business context" },
      { id: "scope", kind: "imageCards", label: "Procurement scope" },
      { id: "challenges", kind: "list", label: "Commercial challenges" },
      { id: "support", kind: "features", label: "Support model" },
      FAQ,
      CTA,
    ],
  },
  {
    key: "gridTie",
    label: "Grid-tie Projects",
    group: "Solutions & Projects",
    href: "/solutions-projects/renewable-projects/grid-tie",
    description: "Renewable Projects → Grid-tie. Draft / Published, menu label and SEO address stay in Dashboard → Solutions & Projects.",
    detail: { group: "RENEWABLE_PROJECTS", slugWords: ["grid", "gridtie", "grid-tie", "grid-tied"] },
    sections: [
      HERO,
      { id: "equipment", kind: "rows", label: "Equipment sourcing" },
      WHY,
      { id: "requirements", kind: "list", label: "Built around your project requirements" },
      { id: "process", kind: "steps", label: "Procurement process" },
      FAQ,
      CTA,
    ],
  },
  {
    key: "offGrid",
    label: "Off-grid Projects",
    group: "Solutions & Projects",
    href: "/solutions-projects/renewable-projects/offgrid",
    description: "Renewable Projects → Off-grid. Draft / Published, menu label and SEO address stay in Dashboard → Solutions & Projects.",
    detail: { group: "RENEWABLE_PROJECTS", slugWords: ["offgrid", "off"] },
    sections: [
      HERO,
      { id: "applications", kind: "rows", label: "Applications" },
      WHY,
      { id: "requirements", kind: "list", label: "What determines the right equipment" },
      FAQ,
      CTA,
    ],
  },
  {
    key: "projectFinancing",
    label: "Project Financing",
    group: "Solutions & Projects",
    href: "/solutions-projects/renewable-projects/project-financing",
    description: "Renewable Projects → Project Financing. Draft / Published, menu label and SEO address stay in Dashboard → Solutions & Projects.",
    detail: { group: "RENEWABLE_PROJECTS", slugWords: ["project", "financing"] },
    sections: [
      HERO,
      { id: "lifecycle", kind: "list", label: "Financing needs across the project lifecycle" },
      WHY,
      { id: "process", kind: "steps", label: "Procurement process" },
      { id: "checklist", kind: "checklist", label: "What we need to understand your project" },
      FAQ,
      CTA,
    ],
  },
];

/** Message root of every block page. */
export const BLOCK_PAGES_NAMESPACE = "blockPages";

export function getBlockPage(key: string): BlockPageDef | undefined {
  return BLOCK_PAGES.find((page) => page.key === key);
}

/** The detail page whose content a Solutions & Projects slug reads, by the slug's first word. */
export function blockPageForSlug(group: DetailGroup, slug: string): BlockPageDef | undefined {
  const first = slug.toLowerCase().split("-")[0];
  return BLOCK_PAGES.find(
    (page) => page.detail?.group === group && (page.detail.slugWords.includes(first) || page.detail.slugWords.includes(slug.toLowerCase()))
  );
}

/** Block pages with a form section, and that section's id — the only forms the public inquiry action accepts. */
export function inquirySection(key: string): BlockSectionDef | undefined {
  return getBlockPage(key)?.sections.find((section) => section.kind === "inquiry");
}
