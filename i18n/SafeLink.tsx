"use client";

import { createContext, useContext, useMemo, type ComponentProps, type ReactNode } from "react";
import { BaseLink } from "@/i18n/navigation";
import { CMS_DETAIL_BASES, CODE_PAGES_UNDER_CMS_BASES, ROUTES_WITHOUT_PAGE, normalizePath } from "@/config/page-visibility";

/** The path to link to, or null when the target page doesn't exist. */
type Resolve = (href: string) => string | null;

const LinkAvailabilityContext = createContext<Resolve>((href) => href);

/** "/solutions-projects/solutions/" + "commercial" for "/solutions-projects/solutions/commercial-industrial". */
function aliasKey(path: string): string | null {
  const base = CMS_DETAIL_BASES.find((prefix) => path.startsWith(prefix));
  if (!base) return null;
  const firstWord = path.slice(base.length).split("/")[0].split("-")[0];
  return firstWord ? `${base}${firstWord}` : null;
}

/**
 * Tells every <Link> on the public site which pages really exist: not hidden
 * in Settings → Page visibility, not a Phase 2 route without a page yet, and
 * — for Manufacturing / Solutions detail routes — actually published. A
 * detail link whose exact slug isn't published goes to the published page
 * whose slug starts with the same word (the header menu's rule), so
 * "/solutions-projects/solutions/residential" reaches
 * ".../residential-solar-solutions". Outside this provider (the dashboard)
 * every link is treated as available.
 */
export function LinkAvailabilityProvider({
  hidden,
  publishedDetailPaths,
  children,
}: {
  hidden: string[];
  publishedDetailPaths: string[];
  children: ReactNode;
}) {
  const resolve = useMemo<Resolve>(() => {
    const hiddenSet = new Set(hidden);
    const published = new Set(publishedDetailPaths.map((path) => normalizePath(path)));
    const aliases = new Map<string, string>();
    for (const path of published) {
      const key = aliasKey(path);
      if (key && !aliases.has(key)) aliases.set(key, path);
    }
    const exact = new Set(ROUTES_WITHOUT_PAGE.exact ?? []);
    const codePages = new Set(CODE_PAGES_UNDER_CMS_BASES);
    return (href: string) => {
      if (!href.startsWith("/")) return href;
      const path = normalizePath(href);
      if (hiddenSet.has(path) || exact.has(path)) return null;
      if ((ROUTES_WITHOUT_PAGE.prefixes ?? []).some((prefix) => path.startsWith(prefix))) return null;
      if (codePages.has(path)) return href;
      if (CMS_DETAIL_BASES.some((base) => path.startsWith(base))) {
        if (published.has(path)) return href;
        const key = aliasKey(path);
        return (key && aliases.get(key)) || null;
      }
      return href;
    };
  }, [hidden, publishedDetailPaths]);

  return <LinkAvailabilityContext.Provider value={resolve}>{children}</LinkAvailabilityContext.Provider>;
}

/**
 * Locale-aware link that degrades to plain text when its target page doesn't
 * exist yet, so cards and menus never lead visitors to a 404. With
 * `fallbackHref` (e.g. a product card: product page → its category page) it
 * links there instead while the first page is unpublished.
 */
export default function SafeLink({ fallbackHref, ...props }: ComponentProps<typeof BaseLink> & { fallbackHref?: string }) {
  const resolve = useContext(LinkAvailabilityContext);
  const href = typeof props.href === "string" ? props.href : props.href.pathname ?? "";
  if (!href) return <BaseLink {...props} />;

  const target = resolve(href) ?? (fallbackHref ? resolve(fallbackHref) : null);
  if (target === null) {
    return (
      <span className={props.className} style={props.style} aria-disabled="true">
        {props.children}
      </span>
    );
  }
  return <BaseLink {...props} href={target === href ? props.href : target} />;
}
