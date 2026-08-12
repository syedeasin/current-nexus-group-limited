export const siteConfig = {
  name: "CNX Energy",
  legalName: "Current Nexus Group Limited",
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

export const mainNav = [
  { label: "About us", href: "/about", hasDropdown: true },
  { label: "Manufacturing", href: "/manufacturing", hasDropdown: true },
  { label: "Tier 1 Brands", href: "/brands", hasDropdown: true },
  { label: "Solutions & Projects", href: "/solutions", hasDropdown: true },
  { label: "Services", href: "/services", hasDropdown: true },
  { label: "News room", href: "/news", hasDropdown: true },
] as const;

export type NavItem = (typeof mainNav)[number];

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
