"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Search, Phone } from "lucide-react";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import MobileDrawer from "./MobileDrawer";
import MenuPanel from "./MenuPanel";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchOverlay from "./SearchOverlay";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/nav.config";
import { useMenuState } from "@/src/hooks/useMenuState";
import { useHeaderScroll } from "@/src/hooks/useHeaderScroll";

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { openKey, scheduleOpen, scheduleClose, close, toggle } = useMenuState(headerRef, pathname);

  const forceOpen = openKey !== null || isSearchOpen || isMobileOpen;
  const { visual, hidden } = useHeaderScroll({ forceOpen });
  const isTransparent = visual === "transparent";

  function handleHoverItem(key: string) {
    setIsSearchOpen(false);
    scheduleOpen(key);
  }

  function handleToggleItem(key: string) {
    setIsSearchOpen(false);
    toggle(key);
  }

  function handleOpenSearch() {
    close();
    setIsSearchOpen((value) => !value);
  }

  function handleCloseSearch() {
    setIsSearchOpen(false);
  }

  function handleMobileOpenChange(next: boolean) {
    if (next) {
      close();
      setIsSearchOpen(false);
    }
    setIsMobileOpen(next);
  }

  return (
      <>
        <header
            ref={headerRef}
            onMouseLeave={scheduleClose}
            style={{
              transitionProperty: "transform, opacity, background-color, border-color, box-shadow, color",
              // Slide DOWN into view: long, heavily decelerated (ease-out-expo) — reads as settling.
              // Slide UP out of view: shorter, accelerated (ease-in) — gets out of the way fast.
              transitionDuration: hidden
                ? "280ms, 220ms, 400ms, 300ms, 250ms, 250ms"
                : "560ms, 360ms, 400ms, 300ms, 450ms, 250ms",
              transitionTimingFunction: hidden
                ? "cubic-bezier(0.4, 0, 1, 1), linear, ease-out, ease-out, ease-out, ease-out"
                : "cubic-bezier(0.16, 1, 0.3, 1), ease-out, ease-out, ease-out, cubic-bezier(0.16, 1, 0.3, 1), ease-out",
            }}
            className={cn(
                "inset-x-0 top-0 z-50 h-56 lg:h-88 transform-gpu will-change-transform motion-reduce:transition-none",
                // Over the hero: absolute, so it scrolls away with the section (not sticky).
                // Past the hero: fixed, with the hide-on-down / show-on-up behavior.
                isTransparent ? "absolute" : "fixed",
                hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
                isTransparent
                    ? "bg-transparent text-white"
                    : "bg-white text-neutral-1 border-b border-neutral-10 shadow-sm"
            )}
        >
          {/* ডেস্কটপ রো */}
          <div className="mx-auto hidden h-full max-w-1600 items-center justify-between px-80 py-20 lg:flex">
            <Link href="/" className="shrink-0">
              <Logo isTransparent={isTransparent} width={129} height={32} className="h-32 w-129" />
            </Link>

            <DesktopNav
                isTransparent={isTransparent}
                pathname={pathname}
                openKey={openKey}
                onHover={handleHoverItem}
                onToggle={handleToggleItem}
            />

            <div className="flex items-center">
              <button
                  type="button"
                  aria-label={t("search")}
                  onClick={handleOpenSearch}
                  className={cn(
                      "rounded-full p-14 transition-colors hover:text-secondary",
                      isTransparent ? "text-white" : "text-neutral-1"
                  )}
              >
                <Search size={20} />
              </button>

              <Link
                  href="/contact"
                  className="flex h-48 items-center gap-8 rounded-full bg-secondary px-28 text-p2 font-semibold text-neutral-1 transition-colors hover:brightness-95"
              >
                <Phone size={18} />
                <span className="whitespace-nowrap">{t("contact")}</span>
              </Link>

              <LanguageSwitcher isTransparent={isTransparent} />
            </div>
          </div>

          {/* মোবাইল কম্প্যাক্ট বার */}
          <MobileNav
              isTransparent={isTransparent}
              isOpen={isMobileOpen}
              onOpenChange={handleMobileOpenChange}
              onOpenSearch={handleOpenSearch}
              triggerRef={mobileTriggerRef}
          />

          {/* মেগা মেনু প্যানেল — হেডারের সাথে অ্যাংকর করা, ফুল উইড্থ */}
          {NAV_ITEMS.map((item) => (
              <MenuPanel
                  key={item.labelKey}
                  item={item}
                  panelId={`mega-${item.labelKey}`}
                  isOpen={openKey === item.labelKey}
                  pathname={pathname}
                  onClose={close}
              />
          ))}

          <SearchOverlay isOpen={isSearchOpen} onClose={handleCloseSearch} />
        </header>

        {/* ফুল-স্ক্রিন মোবাইল ড্রয়ার — হেডারের বাইরে, DOM-এ পরে থাকায় এটি হেডারের উপরে বসে (z-50 উভয়ই) */}
        <MobileDrawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} triggerRef={mobileTriggerRef} />

        {/* স্পেসার - হেডারের উচ্চতা অনুযায়ী (হিরো পেজে HeroCarousel এর negative margin এটা ক্যান্সেল করে) */}
        <div className="h-56 lg:h-88" />
      </>
  );
}
