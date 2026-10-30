// components/layout/nav/DesktopNav.tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { directLinkHref, isNavItemActive, type NavItem } from "@/config/nav.config";

interface DesktopNavProps {
  items: NavItem[];
  isTransparent: boolean;
  pathname: string;
  openKey: string | null;
  onHover: (key: string) => void;
  onToggle: (key: string) => void;
  /** Closes any open panel — hovering a plain-link item. */
  onLeaveAll?: () => void;
}

export default function DesktopNav({ items, isTransparent, pathname, openKey, onHover, onToggle, onLeaveAll }: DesktopNavProps) {
  const t = useTranslations("nav");

  return (
    <nav aria-label="Primary" className="hidden shrink-0 xl:flex xl:items-center">
      <ul className="flex flex-nowrap items-center gap-12 min-[1400px]:gap-20 min-[1500px]:gap-24 min-[1600px]:gap-32">
        {items.map((item) => {
          const isOpen = openKey === item.labelKey;
          const isRouteActive = isNavItemActive(item, pathname);
          const active = isOpen || isRouteActive;

          const directHref = directLinkHref(item);
          if (directHref) {
            return (
              <li key={item.labelKey}>
                <Link
                  href={directHref}
                  onMouseEnter={onLeaveAll}
                  aria-current={isRouteActive ? "page" : undefined}
                  className={cn(
                    "flex items-center whitespace-nowrap text-p3 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
                    isTransparent ? "text-white hover:text-secondary" : "text-neutral-1 hover:text-secondary",
                    isRouteActive && "font-medium text-secondary"
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.labelKey}>
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-controls={`mega-${item.labelKey}`}
                onClick={() => onToggle(item.labelKey)}
                onMouseEnter={() => onHover(item.labelKey)}
                className={cn(
                  "flex items-center gap-4 whitespace-nowrap text-p3 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
                  isTransparent ? "text-white hover:text-secondary" : "text-neutral-1 hover:text-secondary",
                  active && "font-medium text-secondary"
                )}
              >
                <span className="whitespace-nowrap">{t(item.labelKey)}</span>
                <span className="flex items-center pt-5 pb-3">
                  <ChevronDown size={16} className={cn("transition-transform duration-200", active && "rotate-180")} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
