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
  /**
   * Default footer social profiles — Dashboard → Pages → Footer → Social links
   * can add more (YouTube, X, WeChat…), reorder, or switch any off.
   * `platform` picks the icon (facebook, instagram, linkedin, youtube, x; any
   * other value shows a generic globe).
   */
  social: [
    { id: "facebook", platform: "facebook", label: "Facebook", href: "#", show: true },
    { id: "instagram", platform: "instagram", label: "Instagram", href: "#", show: true },
    { id: "linkedin", platform: "linkedin", label: "LinkedIn", href: "#", show: true },
    { id: "youtube", platform: "youtube", label: "YouTube", href: "", show: false },
  ],
} as const;

export type SiteConfig = typeof siteConfig;

// Header nav data model lives in config/nav.config.ts (NAV_ITEMS) — see docs/HEADER-FIX-SPEC.md.

// Footer link columns and labels live in messages/<locale>.json (`footer`)
// and are edited in Dashboard → Pages → Footer. `contact` and `social` above
// stay here as the site-level defaults; lib/page-content/messages.ts feeds
// them into the same editable tree.
