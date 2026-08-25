"use client";

import type { KeyboardEvent } from "react";
import { Link } from "@/i18n/navigation";
import Container from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/site.config";

interface MenuPanelProps {
  item: NavItem;
  panelId: string;
  isOpen: boolean;
  pathname: string;
  t: (key: string) => string;
}

/** Moves focus between the panel's own links with Up/Down/Home/End; Escape bubbles up to the nav's handler. */
function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const root = event.currentTarget;
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>("a[href]"));
  if (links.length === 0) return;
  const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);

  let nextIndex = currentIndex;
  if (event.key === "ArrowDown") nextIndex = currentIndex + 1 >= links.length ? 0 : currentIndex + 1;
  else if (event.key === "ArrowUp") nextIndex = currentIndex - 1 < 0 ? links.length - 1 : currentIndex - 1;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = links.length - 1;

  event.preventDefault();
  links[nextIndex]?.focus();
}

const PANEL_TRANSITION =
  "transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none";

export default function MenuPanel({ item, panelId, isOpen, pathname, t }: MenuPanelProps) {
  if (!item.menu) return null;
  const { menu } = item;
  const isCurrent = (href: string) => pathname === href;

  const linkClass = (href: string) =>
    cn(
      "block rounded-8 px-16 py-10 text-p4 text-neutral-9 transition-colors duration-150 ease-out hover:translate-x-2 hover:text-white",
      isCurrent(href) && "text-white"
    );

  if (menu.variant === "mega") {
    return (
      <div
        id={panelId}
        role="group"
        aria-label={t(item.labelKey)}
        aria-hidden={!isOpen}
        onKeyDown={handlePanelKeyDown}
        className={cn(
          "fixed inset-x-0 top-88 z-40 border-t border-white/10 bg-primary shadow-xl",
          PANEL_TRANSITION,
          isOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-8 opacity-0"
        )}
      >
        <Container className="grid grid-cols-2 gap-48 py-40">
          {menu.columns.map((column) => (
            <div key={column.labelKey} className="flex flex-col gap-16">
              {column.href ? (
                <Link
                  href={column.href}
                  aria-current={isCurrent(column.href) ? "page" : undefined}
                  className="text-h6 font-semibold text-white hover:underline underline-offset-4"
                >
                  {t(column.labelKey)}
                </Link>
              ) : (
                <span className="text-h6 font-semibold text-white">{t(column.labelKey)}</span>
              )}
              <ul className="flex flex-col">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isCurrent(link.href) ? "page" : undefined}
                      className={linkClass(link.href)}
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Container>
      </div>
    );
  }

  const isWide = menu.links.length > 5;

  return (
    <div
      id={panelId}
      role="group"
      aria-label={t(item.labelKey)}
      aria-hidden={!isOpen}
      onKeyDown={handlePanelKeyDown}
      className={cn(
        "absolute left-0 top-full z-40 pt-12",
        PANEL_TRANSITION,
        isOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-8 opacity-0"
      )}
    >
      <div
        className={cn(
          "min-w-240 rounded-12 border-t border-white/10 bg-primary p-8 shadow-xl",
          isWide && "w-480 columns-2 gap-x-32"
        )}
      >
        <Link
          href={item.href}
          aria-current={isCurrent(item.href) ? "page" : undefined}
          className={cn(
            "mb-4 block break-inside-avoid rounded-8 px-16 py-10 text-p4 font-semibold text-white hover:bg-white/10",
            isCurrent(item.href) && "text-secondary"
          )}
        >
          {t(item.labelKey)}
        </Link>
        {menu.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isCurrent(link.href) ? "page" : undefined}
            className={cn("block break-inside-avoid rounded-8 px-16 py-10 text-p4 text-neutral-9 hover:bg-white/10 hover:text-white", isCurrent(link.href) && "text-white")}
          >
            {t(link.labelKey)}
          </Link>
        ))}
      </div>
    </div>
  );
}
