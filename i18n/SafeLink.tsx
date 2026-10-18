"use client";

import { createContext, useContext, useMemo, type ComponentProps, type ReactNode } from "react";
import { BaseLink } from "@/i18n/navigation";
import { CMS_DETAIL_BASES, ROUTES_WITHOUT_PAGE, normalizePath } from "@/config/page-visibility";

type Availability = (href: string) => boolean;

const LinkAvailabilityContext = createContext<Availability>(() => true);

/**
 * Tells every <Link> on the public site which pages really exist: not hidden
 * in Settings → Page visibility, not a Phase 2 route without a page yet, and
 * — for Manufacturing / Solutions detail routes — actually published. Outside
 * this provider (the dashboard) every link is treated as available.
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
  const isAvailable = useMemo<Availability>(() => {
    const hiddenSet = new Set(hidden);
    const published = new Set(publishedDetailPaths.map((path) => normalizePath(path)));
    const exact = new Set(ROUTES_WITHOUT_PAGE.exact ?? []);
    return (href: string) => {
      if (!href.startsWith("/")) return true;
      const path = normalizePath(href);
      if (hiddenSet.has(path) || exact.has(path)) return false;
      if ((ROUTES_WITHOUT_PAGE.prefixes ?? []).some((prefix) => path.startsWith(prefix))) return false;
      if (CMS_DETAIL_BASES.some((base) => path.startsWith(base))) return published.has(path);
      return true;
    };
  }, [hidden, publishedDetailPaths]);

  return <LinkAvailabilityContext.Provider value={isAvailable}>{children}</LinkAvailabilityContext.Provider>;
}

/**
 * Locale-aware link that degrades to plain text when its target page doesn't
 * exist yet, so cards and menus never lead visitors to a 404.
 */
export default function SafeLink(props: ComponentProps<typeof BaseLink>) {
  const isAvailable = useContext(LinkAvailabilityContext);
  const href = typeof props.href === "string" ? props.href : props.href.pathname ?? "";
  if (href && !isAvailable(href)) {
    return (
      <span className={props.className} style={props.style} aria-disabled="true">
        {props.children}
      </span>
    );
  }
  return <BaseLink {...props} />;
}
