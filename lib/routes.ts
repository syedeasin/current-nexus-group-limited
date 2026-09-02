import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type RouteLocale = (typeof routing.locales)[number];

function isRouteLocale(locale: string): locale is RouteLocale {
  return (routing.locales as readonly string[]).includes(locale);
}

/**
 * The single source of truth for a post's public path. Everything that
 * needs it — search preview, slug preview, "View on site", and later
 * canonical URL / og:url / sitemap — calls this instead of hardcoding
 * "/news/..." or "/blog/...".
 *
 * Post.locale (Prisma: EN | FR) is not the same set as i18n/routing.ts
 * (en | zh) — there is no "fr" route configured. For a locale outside
 * routing.locales this still returns a same-shaped path so callers always
 * get a string, but that path will 404 until routing supports it; callers
 * should surface that gap explicitly rather than presenting it as a normal link.
 */
export function postPublicPath(locale: string, slug: string): string {
  const normalized = locale.toLowerCase();
  if (isRouteLocale(normalized)) {
    return getPathname({ href: `/news/${slug}`, locale: normalized });
  }
  return `/${normalized}/news/${slug}`;
}

export function postPublicUrl(locale: string, slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return `${base}${postPublicPath(locale, slug)}`;
}
