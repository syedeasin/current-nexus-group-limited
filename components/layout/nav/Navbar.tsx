"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Search, PhoneCall, Globe, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import Container from "@/components/layout/Container";
import DesktopNav from "@/components/layout/nav/DesktopNav";
import MobileNav from "@/components/layout/nav/MobileNav";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/site.config";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /** Pages whose hero has its own dark scrim read poorly under a transparent header, so they stay solid regardless of scroll: news detail pages, and the BC product detail page (docs/figma/product-detail-bc.md). */
  const isSolidPage = /^\/news\/.+/.test(pathname) || pathname === "/manufacturing/solar-panels/bc";
  const solid = scrolled || isSolidPage || menuOpen;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 32);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 z-50 w-full transition-[background-color,box-shadow] duration-200",
        solid ? "bg-primary shadow-md" : "bg-gradient-to-b from-black/60 to-transparent"
      )}
    >
      <Container className="py-20">
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="shrink-0">
            <Image src="/logo.svg" alt={siteConfig.name} width={130} height={32} priority />
          </Link>

          <DesktopNav onOpenChange={setMenuOpen} />

          <div className="hidden items-center lg:flex">
            <button
              type="button"
              aria-label={t("search")}
              className="rounded-full p-14 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <Search size={20} />
            </button>

            <Link
              href="/contact"
              className="flex h-48 items-center gap-8 rounded-full bg-secondary px-28 text-btn-sm font-semibold text-neutral-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <PhoneCall size={18} />
              {t("contact")}
            </Link>

            <button
              type="button"
              aria-label={t("changeLanguage")}
              className="flex items-center gap-4 py-12 pl-14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <Globe size={20} className="text-white" />
              <span className="text-p4 text-white">{locale.toUpperCase()}</span>
              <ChevronDown size={16} className="text-white" />
            </button>
          </div>

          <MobileNav onOpenChange={setMenuOpen} />
        </div>
      </Container>
    </header>
  );
}
