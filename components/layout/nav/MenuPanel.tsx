"use client";

import { Fragment, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAV_BRAND_LOGO_HEIGHT, type NavGroup, type NavItem } from "@/config/nav.config";

interface MenuPanelProps {
  item: NavItem;
  panelId: string;
  isOpen: boolean;
  pathname: string;
  onClose: () => void;
}

/**
 * Every panel link uses the same type ramp. The design separates the second and
 * third level with a rule and column position, not with size — the only state
 * signal is the secondary (gold) colour on hover, focus and the active route.
 */
const PANEL_LINK =
  "text-p3 text-neutral-1 transition-colors duration-150 hover:text-secondary focus-visible:text-secondary";

/** Thin vertical rule between panel columns and between row items. */
function Divider({ className }: { className?: string }) {
  return <div aria-hidden className={cn("w-1 shrink-0 bg-neutral-10", className)} />;
}

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

/** Product card — only Solutions carries these in the design. */
function ProductCard({
  href,
  image,
  label,
  onClose,
}: {
  href: string;
  image: string;
  label: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="w-200 rounded-8 bg-surface-2 p-16 transition-colors duration-150 hover:bg-neutral-10"
    >
      <div className="flex flex-col items-center gap-16">
        <div className="relative h-172 w-144">
          <Image src={image} alt="" fill sizes="144px" className="object-contain" />
        </div>
        <span className="text-center text-p4 font-semibold text-neutral-1">{label}</span>
      </div>
    </Link>
  );
}

/**
 * Second-level column, a rule, then the active group's third level.
 *
 * Hovering (or focusing) a second-level entry swaps the third level beside it,
 * so Solutions and Renewable Projects — and Solar Panels / BESS — each show
 * their own children instead of sharing one list.
 */
function GroupsPanel({
  groups,
  pathname,
  isOpen,
  onClose,
}: {
  groups: NavGroup[];
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("nav");
  const [activeIndex, setActiveIndex] = useState(0);
  const [wasOpen, setWasOpen] = useState(isOpen);

  // Reopening the menu starts from the first group again, not from wherever the
  // pointer happened to leave off last time. Adjusted during render rather than
  // in an effect so the closed panel never commits a stale highlight first.
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setActiveIndex(0);
  }

  const active = groups[activeIndex] ?? groups[0];
  const hasProducts = (active.products?.length ?? 0) > 0;

  return (
    <div className="flex items-start">
      {/* Second level */}
      <ul className="flex w-220 shrink-0 flex-col gap-20 pr-40">
        {groups.map((group, index) => {
          const isActive = index === activeIndex;
          return (
            <li key={group.href}>
              <Link
                href={group.href}
                onClick={onClose}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                aria-current={pathname === group.href ? "page" : undefined}
                className={cn(PANEL_LINK, isActive && "text-secondary")}
              >
                {t(group.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>

      <Divider className="self-stretch" />

      {/* Third level */}
      {(active.links?.length ?? 0) > 0 && (
        <ul className={cn("flex shrink-0 flex-col gap-20 pl-40", hasProducts ? "w-372 pr-40" : "pr-40")}>
          {active.links?.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(PANEL_LINK, pathname === link.href && "text-secondary")}
              >
                {link.label ?? (link.labelKey ? t(link.labelKey) : "")}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {hasProducts && (
        <>
          <Divider className="self-stretch" />
          <div className="flex items-start gap-12 pl-40">
            {active.products?.map((product) => (
              <ProductCard
                key={product.href}
                href={product.href}
                image={product.image}
                label={t(product.labelKey)}
                onClose={onClose}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MenuPanel({ item, panelId, isOpen, pathname, onClose }: MenuPanelProps) {
  const t = useTranslations("nav");
  const panel = item.panel;

  return (
    <div
      id={panelId}
      role="region"
      aria-label={t(item.labelKey)}
      aria-hidden={!isOpen}
      onKeyDown={handlePanelKeyDown}
      className={cn(
        "absolute left-0 right-0 top-88 z-40 hidden xl:block",
        // No top border: the header's 1px bottom border already draws the seam.
        // A soft downward shadow separates the panel from the page content below.
        "bg-white shadow-[0_20px_28px_-16px_rgba(10,13,27,0.16)]",
        "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        isOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-8 opacity-0"
      )}
    >
      <div className="cnx-container py-48">
        {panel.kind === "flat" && (
          // One horizontal row, items separated by a hairline rule.
          <div className="flex flex-wrap items-center gap-y-20">
            {panel.items.map((link, index) => {
              const active = pathname === link.href;
              return (
                <Fragment key={link.href}>
                  {index > 0 && <Divider className="mx-20 h-16" />}
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(PANEL_LINK, active && "text-secondary")}
                  >
                    {link.label ?? (link.labelKey ? t(link.labelKey) : "")}
                  </Link>
                </Fragment>
              );
            })}
          </div>
        )}

        {panel.kind === "brands" && (
          // Logos sit desaturated and faded until pointed at, then show their
          // own colours.
          <ul className="flex flex-wrap items-center gap-y-24">
            {panel.items.map((brand, index) => {
              const active = pathname === brand.href;
              return (
                <Fragment key={brand.href}>
                  {index > 0 && <Divider className="mx-24 h-32" />}
                  <li>
                    <Link
                      href={brand.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className="flex items-center px-8 py-8"
                    >
                      <Image
                        src={brand.logo}
                        alt={t(brand.labelKey)}
                        width={brand.logoWidth}
                        height={NAV_BRAND_LOGO_HEIGHT}
                        style={{ height: NAV_BRAND_LOGO_HEIGHT, width: brand.logoWidth }}
                        className={cn(
                          "object-contain transition-[filter,opacity] duration-150",
                          active
                            ? "opacity-100 grayscale-0"
                            : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                        )}
                      />
                    </Link>
                  </li>
                </Fragment>
              );
            })}
          </ul>
        )}

        {panel.kind === "groups" && (
          <GroupsPanel groups={panel.groups} pathname={pathname} isOpen={isOpen} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
