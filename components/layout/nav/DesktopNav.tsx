"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav } from "@/site.config";
import MenuPanel from "@/components/layout/nav/MenuPanel";
import { useMenuState } from "@/components/layout/nav/useMenuState";

interface DesktopNavProps {
  onOpenChange: (isOpen: boolean) => void;
}

export default function DesktopNav({ onOpenChange }: DesktopNavProps) {
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
      const keys = mainNav.map((item) => item.labelKey);
      const currentIndex = keys.findIndex((key) => triggerRefs.current[key] === target);
      if (currentIndex === -1) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + keys.length) % keys.length;
      triggerRefs.current[keys[nextIndex]]?.focus();
    }
  }

  return (
    <nav
      ref={containerRef}
      aria-label={t("main")}
      onKeyDown={handleNavKeyDown}
      className="hidden items-center gap-24 lg:flex"
    >
      {mainNav.map((item) => {
        const isOpen = openKey === item.labelKey;
        const panelId = `nav-panel-${item.labelKey}`;
        const active = isSectionActive(item.href);

        return (
          <div
            key={item.labelKey}
            className="relative"
            onMouseEnter={() => {
              if (item.menu) scheduleOpen(item.labelKey);
            }}
            onMouseLeave={() => {
              if (item.menu) scheduleClose();
            }}
          >
            <Link
              href={item.href}
              ref={(node) => {
                triggerRefs.current[item.labelKey] = node;
              }}
              aria-haspopup={item.menu ? "true" : undefined}
              aria-expanded={item.menu ? isOpen : undefined}
              aria-controls={item.menu ? panelId : undefined}
              onClick={(event) => {
                if (!item.menu) return;
                event.preventDefault();
                toggle(item.labelKey);
              }}
              onKeyDown={(event) => {
                if (item.menu && event.key === "ArrowDown") {
                  event.preventDefault();
                  open(item.labelKey);
                  focusFirstPanelLink(panelId);
                }
              }}
              className={cn(
                "flex items-center gap-4 py-8 text-p4 text-white outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              )}
            >
              <span className={cn("pb-2", active && "border-b-2 border-secondary text-secondary")}>
                {t(item.labelKey)}
              </span>
              {item.menu ? (
                <ChevronDown
                  size={16}
                  className={cn("transition-transform duration-150 motion-reduce:transition-none", isOpen && "rotate-180")}
                />
              ) : null}
            </Link>

            {item.menu ? (
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
