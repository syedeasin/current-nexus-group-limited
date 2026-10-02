export const siteConfig = {
  name: "CNX Energy",
  legalName: "Current Nexus Group Limited",
  /** Placeholder production domain — used for canonical URLs, OG/Twitter tags, and share links until the real domain is confirmed. */
  url: "https://www.currentnexus.com",
  /** Defaults — overridable in Dashboard → Pages → Footer → Contact info. */
  contact: {
    location: "Hong Kong, China",
    email: "info@CurrentNexus.com",
    phone: "+1 (000) 000-0000",
  },
  /** Defaults — overridable in Dashboard → Pages → Footer → Social links. Empty hides a link. */
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
  },
} as const;

export type SiteConfig = typeof siteConfig;

// Header nav data model lives in config/nav.config.ts (NAV_ITEMS) — see docs/HEADER-FIX-SPEC.md.

// Footer link columns and labels live in messages/<locale>.json (`footer`)
// and are edited in Dashboard → Pages → Footer. `contact` and `social` above
// stay here as the site-level defaults; lib/page-content/messages.ts feeds
// them into the same editable tree.

export const socialLinks = [
  { label: "Facebook", href: siteConfig.social.facebook, icon: "facebook" },
  { label: "Instagram", href: siteConfig.social.instagram, icon: "instagram" },
  { label: "LinkedIn", href: siteConfig.social.linkedin, icon: "linkedin" },
] as const;
