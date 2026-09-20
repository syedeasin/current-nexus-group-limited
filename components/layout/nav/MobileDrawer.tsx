"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ChevronDown, X } from "lucide-react";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { cn } from "@/lib/utils";
import { isNavItemActive, type NavItem, type NavLink } from "@/config/nav.config";
import { useLocaleSwitch } from "@/src/hooks/useLocaleSwitch";
import type { Locale } from "@/i18n/routing";

interface MobileDrawerProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** One link row inside an expanded drawer section. */
function DrawerLink({
  link,
  pathname,
  onClose,
}: {
  link: Pick<NavLink, "labelKey" | "label" | "href">;
  pathname: string;
  onClose: () => void;
}) {
  const t = useTranslations("nav");
  const active = pathname === link.href;

  return (
      <Link
          href={link.href}
          onClick={onClose}
          aria-current={active ? "page" : undefined}
          className={cn(
              "py-12 text-p4 transition-colors duration-150 hover:text-secondary",
              active ? "font-medium text-secondary" : "text-neutral-4"
          )}
      >
        {link.label ?? (link.labelKey ? t(link.labelKey) : "")}
      </Link>
  );
}

export default function MobileDrawer({ items, isOpen, onClose, triggerRef }: MobileDrawerProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const baseId = useId();
  const { locale, locales, selectLocale } = useLocaleSwitch();

  const [openSection, setOpenSection] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const close = () => {
    onClose();
    setOpenSection(null);
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 100);
  };

  // রাউট চেঞ্জ হলে ড্রয়ার ক্লোজ
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
      setOpenSection(null);
    }
  }, [pathname, onClose]);

  // বডি স্ক্রল লক
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // ড্রয়ার ওপেন হলে প্রথম ফোকাসেবল এলিমেন্টে ফোকাস
  useEffect(() => {
    if (!isOpen) return;
    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstFocusable?.focus();
  }, [isOpen]);

  function handleDrawerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
      <div className={cn("fixed inset-0 z-50 xl:hidden", !isOpen && "pointer-events-none")} aria-hidden={!isOpen}>
        {/* স্ক্রিম */}
        <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={close}
            className={cn(
                "absolute inset-0 bg-black/40 transition-opacity duration-250 ease-out motion-reduce:transition-none",
                isOpen ? "opacity-100" : "pointer-events-none opacity-0"
            )}
        />

        {/* প্যানেল */}
        <div
            id={`${baseId}-drawer`}
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("main")}
            onKeyDown={handleDrawerKeyDown}
            className={cn(
                "absolute inset-y-0 right-0 flex w-full max-w-390 flex-col bg-white text-neutral-1",
                "transition-transform duration-300 ease-out motion-reduce:transition-none",
                isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
            )}
        >
          {/* ড্রয়ার হেডার */}
          <div className="flex h-56 shrink-0 items-center justify-between border-b border-neutral-10 px-20 py-16">
            <Link href="/" className="shrink-0">
              <Image src="/logos/cnx-logo-dark.svg" alt="CNX Energy" width={98} height={24} className="h-24 w-98" />
            </Link>
            {/* p-10 -m-10: see MobileNav.tsx — pads the hit area to ~44px without
                shifting the icon's visual position or the header row's layout. */}
            <button
                type="button"
                aria-label={t("closeMenu")}
                onClick={close}
                className="-m-10 flex items-center justify-center p-10 text-neutral-1 transition-colors duration-150 hover:text-secondary"
            >
              <X size={24} />
            </button>
          </div>

          {/* ড্রয়ার বডি */}
          <div className="flex-1 overflow-y-auto">
            {items.map((item) => {
              const sectionId = `${baseId}-section-${item.labelKey}`;
              const isSectionOpen = openSection === item.labelKey;
              const isRouteActive = isNavItemActive(item, pathname);
              const active = isSectionOpen || isRouteActive;

              return (
                  <div key={item.labelKey}>
                    <button
                        type="button"
                        aria-expanded={isSectionOpen}
                        aria-controls={sectionId}
                        onClick={() => setOpenSection(isSectionOpen ? null : item.labelKey)}
                        className={cn(
                            "flex w-full items-center justify-between border-b border-neutral-10 px-20 py-16 text-left text-p3 font-medium",
                            "transition-colors duration-150 focus-visible:outline-none",
                            active ? "text-secondary" : "text-neutral-1"
                        )}
                    >
                      {t(item.labelKey)}
                      <ChevronDown
                          size={20}
                          className={cn("text-neutral-4 transition-transform duration-200 ease-out", active && "rotate-180 text-secondary")}
                      />
                    </button>

                    <div
                        id={sectionId}
                        className={cn(
                            "grid transition-[grid-template-rows] duration-250 ease-out motion-reduce:transition-none",
                            isSectionOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        )}
                    >
                      <div className="overflow-hidden">
                        <div className="flex flex-col gap-16 bg-surface-2 px-20 pb-16 pt-12">
                          {item.panel.kind === "groups" ? (
                              // Second level as a sub-heading with its own third level under it,
                              // mirroring the desktop panel's two tiers.
                              item.panel.groups.map((group) => (
                                  <div key={group.href} className="flex flex-col">
                                    <Link
                                        href={group.href}
                                        onClick={close}
                                        aria-current={pathname === group.href ? "page" : undefined}
                                        className={cn(
                                            "py-12 text-p4 font-semibold transition-colors duration-150 hover:text-secondary",
                                            pathname === group.href ? "text-secondary" : "text-neutral-1"
                                        )}
                                    >
                                      {t(group.labelKey)}
                                    </Link>

                                    {group.links && group.links.length > 0 && (
                                        <div className="flex flex-col pl-16">
                                          {group.links.map((link) => (
                                              <DrawerLink key={link.href} link={link} pathname={pathname} onClose={close} />
                                          ))}
                                        </div>
                                    )}

                                    {group.products && group.products.length > 0 && (
                                        <div className="flex gap-12 overflow-x-auto py-12">
                                          {group.products.map((product) => (
                                              <Link
                                                  key={product.href}
                                                  href={product.href}
                                                  onClick={close}
                                                  className="flex w-140 shrink-0 flex-col items-center gap-12 rounded-8 bg-white p-12"
                                              >
                                                <div className="relative h-120 w-100">
                                                  <Image src={product.image} alt="" fill className="object-contain" />
                                                </div>
                                                <span className="text-center text-p4 font-semibold text-neutral-1">
                                                  {t(product.labelKey)}
                                                </span>
                                              </Link>
                                          ))}
                                        </div>
                                    )}
                                  </div>
                              ))
                          ) : (
                              <div className="flex flex-col">
                                {item.panel.items.map((link) => (
                                    <DrawerLink key={link.href} link={link} pathname={pathname} onClose={close} />
                                ))}
                              </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
              );
            })}
          </div>

          {/* ড্রয়ার ফুটার */}
          <div className="shrink-0 border-t border-neutral-10 px-20 py-20">
            <Link
                href="/contact"
                onClick={close}
                className="flex h-48 w-full items-center justify-center gap-8 rounded-full bg-secondary text-p3 font-semibold text-neutral-1 transition-[filter] duration-150 hover:brightness-95"
            >
              {t("contact")}
              <ArrowRight size={18} />
            </Link>

            <div className="mt-16 flex items-center justify-center gap-16 py-4">
              {locales.map((code) => (
                  <button
                      key={code}
                      type="button"
                      aria-pressed={locale === code}
                      onClick={() => {
                        selectLocale(code);
                        close();
                      }}
                      className={cn(
                          "text-p3 transition-colors duration-150",
                          locale === code ? "font-medium text-secondary" : "text-neutral-4 hover:text-secondary"
                      )}
                  >
                    {LOCALE_LABELS[code] ?? code.toUpperCase()}
                  </button>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
