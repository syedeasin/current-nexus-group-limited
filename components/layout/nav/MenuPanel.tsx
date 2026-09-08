"use client";

import { Fragment } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/nav.config";

interface MenuPanelProps {
  item: NavItem;
  panelId: string;
  isOpen: boolean;
  pathname: string;
  onClose: () => void;
}

const WIDTH_CLASS: Record<number, string> = {
  180: "w-180",
  292: "w-292",
};

/** Moves focus between the panel's own links with Up/Down/Home/End. */
function handlePanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
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

export default function MenuPanel({ item, panelId, isOpen, pathname, onClose }: MenuPanelProps) {
  const t = useTranslations("nav");

  return (
    <div
      id={panelId}
      role="region"
      aria-label={t(item.labelKey)}
      aria-hidden={!isOpen}
      onKeyDown={handlePanelKeyDown}
      className={cn(
        "absolute left-0 right-0 top-88 z-40 hidden xl:block",
        "border-t border-neutral-10 bg-white shadow-lg",
        "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        isOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-8 opacity-0"
      )}
    >
      <div className="mx-auto max-w-1600 px-80 py-48">
        <div className="flex items-start gap-40">
          {item.columns.map((column, index) => (
            <Fragment key={index}>
              {index > 0 && <div className="w-1 self-stretch bg-neutral-10" />}

              {column.kind === "links" ? (
                <div
                  className={cn(
                    "flex flex-col items-start gap-20",
                    column.widthPx ? WIDTH_CLASS[column.widthPx] : undefined
                  )}
                >
                  {column.items.map((linkItem) => {
                    const active = pathname === linkItem.href;
                    return (
                      <Link
                        key={linkItem.href}
                        href={linkItem.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "text-p3 text-neutral-1 transition-colors",
                          "hover:text-secondary focus-visible:text-secondary",
                          active && "font-medium text-secondary"
                        )}
                      >
                        {t(linkItem.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-start gap-12">
                  {column.items.map((productItem) => (
                    <Link
                      key={productItem.href}
                      href={productItem.href}
                      onClick={onClose}
                      className="w-200 rounded-8 bg-surface-2 p-20 transition-colors hover:bg-neutral-10"
                    >
                      <div className="flex flex-col items-center gap-20">
                        <div className="relative h-160 w-140">
                          <Image src={productItem.image} alt="" fill sizes="140px" className="object-contain" />
                        </div>
                        <span className="text-center text-p3 font-semibold text-neutral-1">
                          {t(productItem.labelKey)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
