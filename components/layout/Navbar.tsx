"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronDown, Search, PhoneCall, Globe } from "lucide-react";
import Container from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import { siteConfig, mainNav } from "@/site.config";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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
        scrolled
          ? "bg-primary shadow-md"
          : "bg-gradient-to-b from-black/60 to-transparent"
      )}
    >
      <Container className="py-20">
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.svg"
              alt={siteConfig.name}
              width={130}
              height={32}
              priority
            />
          </Link>

          <nav
            aria-label="Main"
            className="hidden items-center gap-24 md:flex"
          >
            {mainNav.map((item) => (
              <button
                key={item.href}
                type="button"
                className="flex items-center gap-4 text-p4 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                {item.label}
                {item.hasDropdown && <ChevronDown size={16} />}
              </button>
            ))}
          </nav>

          <div className="hidden items-center md:flex">
            <button
              type="button"
              aria-label="Search"
              className="rounded-full p-14 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <Search size={20} />
            </button>

            <Link
              href="/contact"
              className="flex h-48 items-center gap-8 rounded-full bg-secondary px-28 text-btn-sm font-semibold text-neutral-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <PhoneCall size={18} />
              Contact us
            </Link>

            <button
              type="button"
              aria-label="Change language"
              className="flex items-center gap-4 py-12 pl-14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <Globe size={20} className="text-white" />
              <span className="text-p4 text-white">EN</span>
              <ChevronDown size={16} className="text-white" />
            </button>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            className="p-14 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary md:hidden"
          >
            <span className="block h-2 w-24 bg-white" />
            <span className="mt-6 block h-2 w-24 bg-white" />
            <span className="mt-6 block h-2 w-24 bg-white" />
          </button>
        </div>
      </Container>
    </header>
  );
}
