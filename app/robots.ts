import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { siteConfig } from "@/site.config";

// Reads the Settings → Website switch on every request.
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { allowIndexing } = await getSiteSettings();

  if (!allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/login", "/forgot-password", "/reset-password", "/api/", "/en/search", "/fr/search"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
