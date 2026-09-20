"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Search } from "lucide-react";
import { logoutAction } from "@/app/(auth)/login/actions";
import { NAV_ITEMS } from "@/lib/dashboard-nav";
import GlobalSearch from "@/components/dashboard/global-search";
import LiveClock from "@/components/dashboard/live-clock";

type Props = {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
};

function sectionTitle(pathname: string) {
  const exact = NAV_ITEMS.find((item) => item.href === pathname);
  if (exact) return exact.label;

  const prefixMatches = NAV_ITEMS.filter(
    (item) => !item.exact && pathname.startsWith(`${item.href}/`)
  );
  const best = prefixMatches.sort((a, b) => b.href.length - a.href.length)[0];
  return best?.label ?? "Dashboard";
}

export default function Topbar({ name, email, role, avatarUrl }: Props) {
  const pathname = usePathname();
  const title = sectionTitle(pathname);
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-neutral-10 bg-white/90 backdrop-blur-sm">
      <div className="flex h-64 items-center gap-24 px-24 lg:px-32">
        <h1 className="shrink-0 text-p3 font-medium tracking-[0.3px] text-neutral-1">{title}</h1>

        <div className="hidden flex-1 justify-center md:flex">
          <GlobalSearch />
        </div>

        <button
          type="button"
          onClick={() => setMobileSearchOpen((v) => !v)}
          aria-label="Search"
          aria-expanded={mobileSearchOpen}
          className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full text-neutral-5 transition-colors duration-200 hover:bg-surface-1 md:hidden"
        >
          <Search size={17} strokeWidth={1.5} aria-hidden="true" />
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-20">
          <LiveClock />

          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
              className="flex h-40 items-center gap-12 rounded-8 px-8 transition-colors duration-200 hover:bg-surface-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" width={32} height={32} className="h-32 w-32 rounded-full object-cover" />
              ) : (
                <span className="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-p4 font-semibold text-white">
                  {initials}
                </span>
              )}
              <span className="hidden text-left sm:block">
                <span className="block text-p4 font-medium leading-tight text-neutral-1">
                  {name}
                </span>
                <span className="block text-[11px] font-semibold uppercase tracking-[2px] text-primary">
                  {role}
                </span>
              </span>
              <ChevronDown size={15} strokeWidth={1.5} className="text-neutral-5" aria-hidden="true" />
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-8 w-256 overflow-hidden rounded-12 border border-neutral-10 bg-white shadow-xl"
              >
                <div className="border-b border-neutral-10 px-16 py-12">
                  <p className="text-p4 font-medium text-neutral-1">{name}</p>
                  <p className="truncate text-p4 font-light text-neutral-5">{email}</p>
                </div>
                <form action={logoutAction} className="p-8">
                  <button
                    type="submit"
                    role="menuitem"
                    className="flex w-full items-center gap-8 rounded-8 px-16 py-12 text-left text-p4 font-medium text-neutral-1 transition-colors duration-200 hover:bg-surface-1 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  >
                    <LogOut size={15} strokeWidth={1.5} aria-hidden="true" />
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-neutral-10 px-16 py-12 md:hidden">
          <GlobalSearch />
        </div>
      )}
    </header>
  );
}
