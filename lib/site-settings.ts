import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/site.config";

/**
 * Site-wide switches edited in Dashboard → Settings → Website. Each key is one
 * `site_settings` row; a missing row (or a database outage) means the default.
 */
export const siteSettingsSchema = z.object({
  /**
   * Address the dashboard uses when it builds absolute links that leave the
   * browser — password-reset and invitation emails. Empty: APP_URL from .env,
   * then site.config.ts `url`.
   */
  siteUrl: z
    .string()
    .trim()
    .max(200)
    .transform((value) => value.replace(/\/+$/, ""))
    .refine((value) => value === "" || /^https?:\/\/[^\s/?#]+(:\d+)?$/i.test(value), {
      message: "Enter just the address, starting with http:// or https:// — no page path.",
    }),
  /** false: robots.txt disallows everything and every public page gets noindex. */
  allowIndexing: z.boolean(),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const SITE_SETTING_DEFAULTS: SiteSettings = {
  siteUrl: "",
  allowIndexing: true,
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  let rows: { key: string; value: unknown }[] = [];
  try {
    rows = await prisma.siteSetting.findMany({ select: { key: true, value: true } });
  } catch (error) {
    console.error("[site-settings] could not load settings; using defaults", error);
  }

  const raw: Record<string, unknown> = { ...SITE_SETTING_DEFAULTS };
  for (const row of rows) {
    if (row.key in SITE_SETTING_DEFAULTS) raw[row.key] = row.value;
  }

  // A row written by an older version that no longer validates falls back to
  // its default rather than breaking every page that reads settings.
  const settings = { ...SITE_SETTING_DEFAULTS };
  for (const key of Object.keys(SITE_SETTING_DEFAULTS) as (keyof SiteSettings)[]) {
    const field = siteSettingsSchema.shape[key].safeParse(raw[key]);
    if (field.success) (settings as Record<string, unknown>)[key] = field.data;
  }
  return settings;
});

/**
 * Base for absolute links in emails, without a trailing slash.
 *
 * `trustRequestOrigin` is only for actions an authenticated admin triggers:
 * their own request's Host then stands in for an unset Site address, so a
 * copied link points at the server they are actually using. Never for
 * unauthenticated requests (forgot password) — a forged Host header would
 * otherwise put an attacker's domain in a real reset email.
 */
export async function getLinkBaseUrl({ trustRequestOrigin = false } = {}): Promise<string> {
  const { siteUrl } = await getSiteSettings();
  const configured = siteUrl || process.env.APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (trustRequestOrigin) {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host && /^[a-z0-9.-]+(:\d+)?$/i.test(host)) {
      const proto = h.get("x-forwarded-proto")?.split(",")[0].trim() === "https" ? "https" : "http";
      return `${proto}://${host}`;
    }
  }
  return siteConfig.url.replace(/\/+$/, "");
}
