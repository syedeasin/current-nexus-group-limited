export const siteConfig = {
  name: "CNX Energy",
  legalName: "Current Nexus Group Limited",
  /** Placeholder production domain — used for canonical URLs, OG/Twitter tags, and share links until the real domain is confirmed. */
  url: "https://www.currentnexus.com",
  contact: {
    location: "Hong Kong, China",
    email: "info@CurrentNexus.com",
    phone: "+1 (000) 000-0000",
  },
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
  },
} as const;

export type SiteConfig = typeof siteConfig;

export interface NavLink {
  /** i18n key under "nav" */
  labelKey: string;
  href: string;
}

export interface NavColumn {
  /** column heading, e.g. "Solar Panels" */
  labelKey: string;
  /** heading itself can be a link */
  href?: string;
  links: NavLink[];
}

export type NavMenu =
  | { variant: "list"; links: NavLink[] }
  | {
      variant: "mega";
      columns: NavColumn[];
      feature?: { titleKey: string; bodyKey: string; href: string; image: string };
    };

export interface NavItem {
  labelKey: string;
  /** parents always resolve somewhere, never "#" */
  href: string;
  menu?: NavMenu;
}

export const mainNav: NavItem[] = [
  {
    labelKey: "aboutUs",
    href: "/about/why-choose-cnx",
    menu: {
      variant: "list",
      links: [
        { labelKey: "technology", href: "/about/technology" },
        { labelKey: "whyChooseCnx", href: "/about/why-choose-cnx" },
        { labelKey: "pvBessBrands", href: "/about/pv-bess-brands" },
      ],
    },
  },
  {
    labelKey: "manufacturing",
    href: "/manufacturing/solar-panels",
    menu: {
      variant: "mega",
      columns: [
        {
          labelKey: "solarPanels",
          href: "/manufacturing/solar-panels",
          links: [
            { labelKey: "bc", href: "/manufacturing/solar-panels/bc" },
            { labelKey: "hjt", href: "/manufacturing/solar-panels/hjt" },
            { labelKey: "topcon", href: "/manufacturing/solar-panels/topcon" },
            { labelKey: "odmVerticalSolarModules", href: "/manufacturing/solar-panels/odm-vertical-solar-modules" },
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
    href: "/tier-1-brands",
    menu: {
      variant: "list",
      links: [
        { labelKey: "jaSolar", href: "/tier-1-brands/ja-solar" },
        { labelKey: "tongwei", href: "/tier-1-brands/tongwei" },
        { labelKey: "hithium", href: "/tier-1-brands/hithium" },
        { labelKey: "growatt", href: "/tier-1-brands/growatt" },
        { labelKey: "deye", href: "/tier-1-brands/deye" },
        { labelKey: "solis", href: "/tier-1-brands/solis" },
        { labelKey: "goodwe", href: "/tier-1-brands/goodwe" },
      ],
    },
  },
  {
    labelKey: "solutionsProjects",
    href: "/solutions-projects/solutions",
    menu: {
      variant: "mega",
      columns: [
        {
          labelKey: "solutions",
          href: "/solutions-projects/solutions",
          links: [
            { labelKey: "residential", href: "/solutions-projects/solutions/residential" },
            { labelKey: "commercialIndustrial", href: "/solutions-projects/solutions/commercial-industrial" },
            { labelKey: "utilities", href: "/solutions-projects/solutions/utilities" },
            { labelKey: "virtualPowerPlant", href: "/solutions-projects/solutions/virtual-power-plant" },
            { labelKey: "supplyChainFinancing", href: "/solutions-projects/solutions/supply-chain-financing" },
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
    labelKey: "newsRoom",
    href: "/news",
    menu: {
      variant: "list",
      links: [
        { labelKey: "news", href: "/news" },
        { labelKey: "reAnalysis", href: "/news/re-analysis" },
        { labelKey: "knowledgeDatabase", href: "/news/knowledge-database" },
        { labelKey: "events", href: "/news/events" },
      ],
    },
  },
  {
    labelKey: "service",
    href: "/service/downloads",
    menu: {
      variant: "list",
      links: [
        { labelKey: "downloads", href: "/service/downloads" },
        { labelKey: "globalDistributor", href: "/service/global-distributor" },
        { labelKey: "warranty", href: "/service/warranty" },
        { labelKey: "stockProducts", href: "/service/stock-products" },
      ],
    },
  },
];

export const footerNav = [
  {
    heading: "Quick links",
    links: [
      { label: "Technology", href: "/technology" },
      { label: "Why choose CNX", href: "/about" },
      { label: "PV and BESS Brands", href: "/brands" },
      { label: "Manufacturing", href: "/manufacturing" },
      { label: "Solutions", href: "/solutions" },
      { label: "Renewable projects", href: "/projects" },
      { label: "Downloads", href: "/downloads" },
      { label: "Newsroom", href: "/news" },
    ],
  },
  {
    heading: "Tier 1 brands",
    links: [
      { label: "JA solar", href: "/brands/ja-solar" },
      { label: "TONGWEI", href: "/brands/tongwei" },
      { label: "Hithium", href: "/brands/hithium" },
      { label: "Growatt", href: "/brands/growatt" },
      { label: "DEYE", href: "/brands/deye" },
      { label: "Solis", href: "/brands/solis" },
      { label: "Goodwe", href: "/brands/goodwe" },
    ],
  },
  {
    // TODO: Figma repeats the Tier 1 brands list here. Replace with real
    // solution links once the client confirms them.
    heading: "Solutions",
    links: [
      { label: "JA solar", href: "/brands/ja-solar" },
      { label: "TONGWEI", href: "/brands/tongwei" },
      { label: "Hithium", href: "/brands/hithium" },
      { label: "Growatt", href: "/brands/growatt" },
      { label: "DEYE", href: "/brands/deye" },
      { label: "Solis", href: "/brands/solis" },
      { label: "Goodwe", href: "/brands/goodwe" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "Downloads", href: "/downloads" },
      { label: "Global distributors", href: "/distributors" },
      { label: "Warranty", href: "/warranty" },
      { label: "Stock products with discount price", href: "/stock" },
    ],
  },
] as const;

export type FooterColumn = (typeof footerNav)[number];

export const socialLinks = [
  { label: "Facebook", href: siteConfig.social.facebook, icon: "facebook" },
  { label: "Instagram", href: siteConfig.social.instagram, icon: "instagram" },
  { label: "LinkedIn", href: siteConfig.social.linkedin, icon: "linkedin" },
] as const;
