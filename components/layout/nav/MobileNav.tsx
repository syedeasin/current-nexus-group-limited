"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ChevronDown, Search, PhoneCall, Globe, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav } from "@/site.config";

interface MobileNavProps {
  onOpenChange: (isOpen: boolean) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function MobileNav({ onOpenChange }: MobileNavProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const baseId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const close = () => {
    setIsOpen(false);
    setOpenSection(null);
    triggerButtonRef.current?.focus();
  };

  useEffect(() => {
    onOpenChange(isOpen);
  }, [isOpen, onOpenChange]);

  // Route change closes the drawer.
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setIsOpen(false);
      setOpenSection(null);
    }
  }, [pathname]);

  // Body scroll lock while open.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Focus the drawer on open.
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
    <>
      <button
        ref={triggerButtonRef}
        type="button"
        aria-label={isOpen ? t("closeMenu") : t("openMenu")}
        aria-expanded={isOpen}
        aria-controls={`${baseId}-drawer`}
        onClick={() => setIsOpen((value) => !value)}
        className="relative flex size-44 items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary lg:hidden"
      >
        <span
          className={cn(
            "absolute block h-2 w-24 bg-white transition-transform duration-200 ease-out motion-reduce:transition-none",
            isOpen ? "translate-y-0 rotate-45" : "-translate-y-6"
          )}
        />
        <span
          className={cn(
            "absolute block h-2 w-24 bg-white transition-opacity duration-150 ease-out motion-reduce:transition-none",
            isOpen && "opacity-0"
          )}
        />
        <span
          className={cn(
            "absolute block h-2 w-24 bg-white transition-transform duration-200 ease-out motion-reduce:transition-none",
            isOpen ? "translate-y-0 -rotate-45" : "translate-y-6"
          )}
        />
      </button>

      {isOpen ? (
        <div
          id={`${baseId}-drawer`}
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("main")}
          onKeyDown={handleDrawerKeyDown}
          className="fixed inset-x-0 top-88 bottom-0 z-40 flex flex-col overflow-y-auto bg-primary lg:hidden md:left-auto md:w-420"
        >
          <div className="flex items-center justify-end px-20 pt-16">
            <button
              type="button"
              aria-label={t("closeMenu")}
              onClick={close}
              className="flex size-44 items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-4 px-20 pb-32">
            {mainNav.map((item) => {
              const sectionId = `${baseId}-section-${item.labelKey}`;
              const isSectionOpen = openSection === item.labelKey;

              if (!item.menu) {
                return (
                  <Link
                    key={item.labelKey}
                    href={item.href}
                    className="flex min-h-44 items-center px-4 text-p2 font-semibold text-white"
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              }

              return (
                <div key={item.labelKey} className="border-b border-white/10">
                  <button
                    type="button"
                    aria-expanded={isSectionOpen}
                    aria-controls={sectionId}
                    onClick={() => setOpenSection(isSectionOpen ? null : item.labelKey)}
                    className="flex min-h-44 w-full items-center justify-between px-4 py-8 text-left text-p2 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    {t(item.labelKey)}
                    <ChevronDown
                      size={18}
                      className={cn(
                        "transition-transform duration-200 ease-out motion-reduce:transition-none",
                        isSectionOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    id={sectionId}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                      isSectionOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-4 pb-16 pl-16">
                        {item.menu.variant === "list" ? (
                          <>
                            <Link href={item.href} className="flex min-h-44 items-center px-4 text-p3 font-semibold text-secondary">
                              {t(item.labelKey)}
                            </Link>
                            {item.menu.links.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="flex min-h-44 items-center px-4 text-p3 text-neutral-9"
                              >
                                {t(link.labelKey)}
                              </Link>
                            ))}
                          </>
                        ) : (
                          item.menu.columns.map((column) => (
                            <div key={column.labelKey} className="flex flex-col gap-4 pt-8">
                              {column.href ? (
                                <Link href={column.href} className="flex min-h-44 items-center px-4 text-p3 font-semibold text-secondary">
                                  {t(column.labelKey)}
                                </Link>
                              ) : (
                                <span className="flex min-h-44 items-center px-4 text-p3 font-semibold text-white">
                                  {t(column.labelKey)}
                                </span>
                              )}
                              {column.links.map((link) => (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  className="flex min-h-44 items-center px-4 pl-16 text-p3 text-neutral-9"
                                >
                                  {t(link.labelKey)}
                                </Link>
                              ))}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-16 border-t border-white/10 px-20 py-24">
            <button
              type="button"
              aria-label={t("search")}
              className="flex min-h-44 items-center gap-8 text-p3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <Search size={20} />
              {t("search")}
            </button>
            <Link
              href="/contact"
              className="flex min-h-44 w-full items-center justify-center gap-8 rounded-full bg-secondary px-28 text-btn-sm font-semibold text-neutral-1"
            >
              <PhoneCall size={18} />
              {t("contact")}
            </Link>
            <button
              type="button"
              aria-label={t("changeLanguage")}
              className="flex min-h-44 items-center gap-4 text-p3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <Globe size={20} />
              {locale.toUpperCase()}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
