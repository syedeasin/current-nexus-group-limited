"use client";

import { useEffect, useRef, type FocusEvent, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/nav.config";
import MenuPanel from "@/components/layout/nav/MenuPanel";
import { useMenuState } from "@/components/layout/nav/useMenuState";
import type { HeaderState } from "@/components/layout/nav/Navbar";

interface DesktopNavProps {
  state: HeaderState;
  onOpenChange: (isOpen: boolean) => void;
}

export default function DesktopNav({ state, onOpenChange }: DesktopNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const containerRef = useRef<HTMLElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const { openKey, open, close, toggle, scheduleOpen, scheduleClose } = useMenuState(containerRef, pathname);

  useEffect(() => {
    onOpenChange(openKey !== null);
  }, [openKey, onOpenChange]);

  const isSectionActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  function focusFirstPanelLink(panelId: string) {
    requestAnimationFrame(() => {
      document.getElementById(panelId)?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
    });
  }

  function handleNavKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && openKey) {
      event.preventDefault();
      const key = openKey;
      close();
      triggerRefs.current[key]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const target = event.target as HTMLElement;
      const keys = NAV_ITEMS.map((item) => item.labelKey);
      const currentIndex = keys.findIndex((key) => triggerRefs.current[key] === target);
      if (currentIndex === -1) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + keys.length) % keys.length;
      triggerRefs.current[keys[nextIndex]]?.focus();
    }
  }

  // Tabbing out of the nav entirely (not into the open panel) closes it.
  function handleNavBlur(event: FocusEvent<HTMLElement>) {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) close();
  }

  const textColorClass = state === "light" ? "text-neutral-1" : "text-white";

  return (
    <nav
      ref={containerRef}
      aria-label="Primary"
      onKeyDown={handleNavKeyDown}
      onBlur={handleNavBlur}
      className="hidden items-center gap-24 lg:flex"
    >
      {NAV_ITEMS.map((item) => {
        const isOpen = openKey === item.labelKey;
        const panelId = `mega-${item.labelKey}`;
        const hasMenu = Boolean(item.columns?.length);
        const active = isOpen || isSectionActive(item.href);

        return (
          <div
            key={item.labelKey}
            className="relative"
            onMouseEnter={() => {
              if (hasMenu) scheduleOpen(item.labelKey);
            }}
            onMouseLeave={() => {
              if (hasMenu) scheduleClose();
            }}
          >
            <Link
              href={item.href}
              ref={(node) => {
                triggerRefs.current[item.labelKey] = node;
              }}
              aria-haspopup={hasMenu ? "true" : undefined}
              aria-expanded={hasMenu ? isOpen : undefined}
              aria-controls={hasMenu ? panelId : undefined}
              onFocus={() => {
                if (hasMenu) open(item.labelKey);
              }}
              onClick={(event) => {
                if (!hasMenu) return;
                event.preventDefault();
                toggle(item.labelKey);
              }}
              onKeyDown={(event) => {
                if (hasMenu && event.key === "ArrowDown") {
                  event.preventDefault();
                  open(item.labelKey);
                  focusFirstPanelLink(panelId);
                }
              }}
              className={cn(
                "flex items-center gap-4 whitespace-nowrap text-p3 outline-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary",
                active ? "font-medium text-secondary" : cn(textColorClass, "hover:text-secondary")
              )}
            >
              {t(item.labelKey)}
              {hasMenu ? (
                <span className="pt-5 pb-3">
                  <ChevronDown
                    size={16}
                    className={cn("transition-transform duration-150 motion-reduce:transition-none", isOpen && "rotate-180")}
                  />
                </span>
              ) : null}
            </Link>

            {hasMenu ? (
              <div onMouseEnter={() => open(item.labelKey)} onMouseLeave={() => scheduleClose()}>
                <MenuPanel item={item} panelId={panelId} isOpen={isOpen} pathname={pathname} t={t} />
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
