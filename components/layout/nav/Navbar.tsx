"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search, PhoneCall, Globe, ChevronDown } from "lucide-react";
import DesktopNav from "@/components/layout/nav/DesktopNav";
import MobileNav from "@/components/layout/nav/MobileNav";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/site.config";

/**
 * transparent: header starts see-through over a dark hero, fades to Light on
 *   scroll (docs/HEADER-MEGAMENU-SPEC.md §4.2).
 * light: always solid white / dark text, for pages with a light hero or none.
 * dark: reserved for future dark-theme pages, not used yet.
 */
export type HeaderVariant = "transparent" | "light" | "dark";
export type HeaderState = "transparent" | "light" | "dark";

const SCROLL_THRESHOLD = 80;

interface NavbarProps {
  variant?: HeaderVariant;
}

export default function Navbar({ variant = "light" }: NavbarProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);

  useEffect(() => {
    if (variant !== "transparent") return;

    let ticking = false;
    function evaluate() {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(evaluate);
    }

    evaluate();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  // Mega menu is white, so a transparent header switches to Light while one
  // is open — otherwise the white panel would sit under a see-through bar.
  const state: HeaderState =
    variant === "dark" ? "dark" : variant === "light" ? "light" : isScrolled || isMegaOpen ? "light" : "transparent";

  const isLight = state === "light";
  const isDark = state === "dark";
  const textColorClass = isLight ? "text-neutral-1" : "text-white";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-88 transition-[background-color,color,border-color,box-shadow] duration-250 ease-in-out motion-reduce:transition-none",
        isLight && "border-b border-neutral-10 bg-white",
        isDark && "bg-neutral-1",
        state === "transparent" && "border-b border-transparent bg-transparent"
      )}
    >
      <div className="flex h-full w-full items-center justify-between px-80 py-20">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.svg"
            alt={siteConfig.name}
            width={129}
            height={32}
            priority
            className="h-32 w-129"
          />
        </Link>

        <DesktopNav state={state} onOpenChange={setIsMegaOpen} />

        <div className="hidden items-center lg:flex">
          <button
            type="button"
            aria-label={t("search")}
            className={cn(
              "rounded-full p-14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary",
              textColorClass
            )}
          >
            <Search size={20} />
          </button>

          <Link
            href="/contact"
            className="flex h-48 items-center gap-8 rounded-full bg-secondary px-28 text-btn-sm font-semibold text-neutral-1 transition-[filter] hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary"
          >
            <PhoneCall size={18} />
            {t("contact")}
          </Link>

          <button
            type="button"
            aria-label={t("changeLanguage")}
            className={cn(
              "flex items-center gap-4 rounded-full py-12 pl-14 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary",
              textColorClass
            )}
          >
            <Globe size={20} />
            <span className="text-p3">{locale.toUpperCase()}</span>
            <ChevronDown size={20} />
          </button>
        </div>

        <MobileNav onOpenChange={setIsMegaOpen} />
      </div>
    </header>
  );
}
