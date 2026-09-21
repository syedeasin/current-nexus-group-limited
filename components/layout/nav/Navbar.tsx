"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { ArrowRight } from "@/components/icons/ArrowRight";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import MobileDrawer from "./MobileDrawer";
import MenuPanel from "./MenuPanel";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchOverlay from "./SearchOverlay";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "@/config/nav.config";
import { useMenuState } from "@/src/hooks/useMenuState";
import { useHeaderScroll } from "@/src/hooks/useHeaderScroll";

export default function Navbar({ navItems = NAV_ITEMS }: { navItems?: NavItem[] }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { openKey, open, scheduleOpen, scheduleClose, close } = useMenuState(headerRef, pathname);

  const forceOpen = openKey !== null || isSearchOpen || isMobileOpen;
  const { visual, hidden } = useHeaderScroll({ forceOpen, pathname });
  const isTransparent = visual === "transparent";

  function handleHoverItem(key: string) {
    setIsSearchOpen(false);
    scheduleOpen(key);
  }

  // Click opens (never toggles closed): hover already auto-opens the panel, so a
  // toggle would race — by the time the click lands the panel is usually open,
  // and toggling would close it, which read as "the click did nothing". Opening
  // is idempotent, so one click is always deterministic. Close via hover-away,
  // outside-click, or Escape.
  function handleToggleItem(key: string) {
    setIsSearchOpen(false);
    open(key);
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
              // No opacity here: the white bar must stay fully opaque as it moves,
              // otherwise the page scrolls through it while it slides. Only the
              // transform animates the show/hide; colour props cover the
              // transparent <-> white swap over the hero.
              transitionProperty: "transform, background-color, border-color, box-shadow, color",
              // Slide DOWN into view: long and gently decelerated (ease-out-cubic) — a
              // slow, smooth settle rather than a snap. Slide UP out of view: short
              // and accelerated (ease-in) — gets out of the way fast.
              // Order: transform, background-color, border-color, box-shadow, color.
              transitionDuration: hidden
                ? "280ms, 400ms, 300ms, 250ms, 250ms"
                : "820ms, 400ms, 300ms, 450ms, 250ms",
              transitionTimingFunction: hidden
                ? "cubic-bezier(0.4, 0, 1, 1), ease-out, ease-out, ease-out, ease-out"
                : "cubic-bezier(0.33, 1, 0.68, 1), ease-out, ease-out, ease-out, ease-out",
            }}
            className={cn(
                "inset-x-0 top-0 z-50 h-56 xl:h-88 transform-gpu will-change-transform motion-reduce:transition-none",
                // Over the hero: absolute, so it scrolls away with the section (not sticky).
                // Past the hero: fixed, with the hide-on-down / show-on-up behavior.
                isTransparent ? "absolute" : "fixed",
                hidden ? "-translate-y-full" : "translate-y-0",
                isTransparent
                    ? "bg-transparent text-white"
                    : "bg-white text-neutral-1 border-b border-neutral-10",
                // Subtle shadow lifts the white bar off the page. While a mega
                // panel is open the shadow belongs to the panel, not the bar, so
                // drop it here to avoid a second seam under the header.
                !isTransparent &&
                    openKey === null &&
                    "shadow-[0_4px_12px_-6px_rgba(10,13,27,0.10)]"
            )}
        >
          {/* ডেস্কটপ রো */}
          {/* The row now sits on the global 1320 grid (64px gutters), which leaves
              it ~1150px between 1280 and 1440 — just under what the logo, six
              mega-menu labels and the action cluster need at their full spacing.
              So the *chrome* compresses in that band rather than the container
              widening: gaps and button padding step up at 1400/1500 instead of
              the header claiming its own wider grid. */}
          <div className="cnx-container hidden h-full items-center justify-between gap-8 py-20 min-[1400px]:gap-16 min-[1500px]:gap-24 xl:flex">
            <Link href="/" className="shrink-0">
              <Logo isTransparent={isTransparent} width={129} height={32} className="h-32 w-129" />
            </Link>

            <DesktopNav
                items={navItems}
                isTransparent={isTransparent}
                pathname={pathname}
                openKey={openKey}
                onHover={handleHoverItem}
                onToggle={handleToggleItem}
            />

            <div className="flex shrink-0 items-center">
              <button
                  type="button"
                  aria-label={t("search")}
                  onClick={handleOpenSearch}
                  className={cn(
                      "rounded-full p-10 transition-colors hover:text-secondary min-[1500px]:p-14",
                      isTransparent ? "text-white" : "text-neutral-1"
                  )}
              >
                <Search size={20} />
              </button>

              <Link
                  href="/contact"
                  className="flex h-48 shrink-0 items-center gap-8 rounded-full bg-secondary px-16 text-btn-sm font-semibold text-neutral-1 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] hover:brightness-95 min-[1500px]:px-24"
              >
                <span className="whitespace-nowrap">{t("contact")}</span>
                <ArrowRight size={20} />
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
          {navItems.map((item) => (
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
        <MobileDrawer items={navItems} isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} triggerRef={mobileTriggerRef} />

        {/* স্পেসার - হেডারের উচ্চতা অনুযায়ী (হিরো পেজে HeroCarousel এর negative margin এটা ক্যান্সেল করে) */}
        <div className="h-56 xl:h-88" />
      </>
  );
}
