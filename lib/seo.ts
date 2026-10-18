import type { Metadata } from "next";
import { siteConfig } from "@/site.config";

/**
 * Page <title> that respects the root layout's "%s | CNX Energy" template.
 * Copy and CMS editors often already end titles with the site name
 * ("Solar Panels | CNX Energy Manufacturing"); running those through the
 * template doubled it ("… | CNX Energy | CNX Energy"). Titles that already
 * mention the site name are used as-is.
 */
export function pageTitle(title: string): Metadata["title"] {
  return title.includes(siteConfig.name) ? { absolute: title } : title;
}
