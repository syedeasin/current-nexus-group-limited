// components/layout/nav/DesktopNav.tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { isNavItemActive, type NavItem } from "@/config/nav.config";

interface DesktopNavProps {
  items: NavItem[];
  isTransparent: boolean;
  pathname: string;
  openKey: string | null;
  onHover: (key: string) => void;
  onToggle: (key: string) => void;
}

export default function DesktopNav({ items, isTransparent, pathname, openKey, onHover, onToggle }: DesktopNavProps) {
  const t = useTranslations("nav");

  return (
    <nav aria-label="Primary" className="hidden shrink-0 xl:flex xl:items-center">
      <ul className="flex flex-nowrap items-center gap-8 min-[1500px]:gap-16 min-[1600px]:gap-24">
        {items.map((item) => {
          const isOpen = openKey === item.labelKey;
          const isRouteActive = isNavItemActive(item, pathname);
          const active = isOpen || isRouteActive;

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
                  "flex items-center gap-4 whitespace-nowrap text-p4 transition-colors",
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
