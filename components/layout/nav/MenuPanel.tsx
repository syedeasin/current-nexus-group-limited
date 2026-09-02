"use client";

import { Fragment, type KeyboardEvent } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { NavColumn, NavItem } from "@/config/nav.config";

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

function LinksColumn({
  column,
  pathname,
  t,
}: {
  column: Extract<NavColumn, { kind: "links" }>;
  pathname: string;
  t: (key: string) => string;
}) {
  return (
    <div
      className="flex flex-col items-start gap-20"
      style={column.widthPx ? { width: column.widthPx } : undefined}
    >
      {column.items.map((linkItem) => {
        const active = pathname === linkItem.href;
        return (
          <Link
            key={linkItem.href}
            href={linkItem.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-p3 text-neutral-1 transition-colors hover:text-secondary",
              active && "font-medium text-secondary"
            )}
          >
            {t(linkItem.labelKey)}
          </Link>
        );
      })}
    </div>
  );
}

// TODO: replace with real product images. Every card below points at
// /nav/placeholder.png (plain gray, 140x160) until Figma-exported product
// thumbnails are available — see config/nav.config.ts.
function ProductsColumn({
  column,
  t,
}: {
  column: Extract<NavColumn, { kind: "products" }>;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-start gap-12">
      {column.items.map((productItem) => (
        <Link
          key={productItem.href}
          href={productItem.href}
          className="flex w-200 flex-col items-center gap-20 rounded-8 bg-surface-2 p-20 transition-colors hover:bg-neutral-10"
        >
          <div className="relative h-160 w-140">
            <Image src={productItem.image} alt={t(productItem.labelKey)} fill className="object-contain" />
          </div>
          <span className="text-center text-p3 font-semibold text-neutral-1">{t(productItem.labelKey)}</span>
        </Link>
      ))}
    </div>
  );
}

export default function MenuPanel({ item, panelId, isOpen, pathname, t }: MenuPanelProps) {
  if (!item.columns?.length) return null;

  return (
    <div
      id={panelId}
      role="region"
      aria-label={t(item.labelKey)}
      aria-hidden={!isOpen}
      onKeyDown={handlePanelKeyDown}
      className={cn(
        "fixed inset-x-0 top-88 z-40 border-t border-neutral-10 bg-white",
        PANEL_TRANSITION,
        isOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-8 opacity-0"
      )}
    >
      <div className="mx-auto max-w-1600 px-80 py-48">
        <div className="flex items-start gap-40">
          {item.columns.map((column, index) => (
            <Fragment key={index}>
              {index > 0 ? <div className="w-1 self-stretch bg-neutral-10" /> : null}
              {column.kind === "links" ? (
                <LinksColumn column={column} pathname={pathname} t={t} />
              ) : (
                <ProductsColumn column={column} t={t} />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
