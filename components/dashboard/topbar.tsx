"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { ChevronDown, ExternalLink, KeyRound, LogOut, Search, Settings, UserRound, Users } from "lucide-react";
import { logoutAction } from "@/app/(auth)/login/actions";
import { NAV_ITEMS } from "@/lib/dashboard-nav";
import { ROLE_META } from "@/lib/roles";
import GlobalSearch from "@/components/dashboard/global-search";
import LiveClock from "@/components/dashboard/live-clock";
import UserAvatar from "@/components/dashboard/user-avatar";
import RoleBadge from "@/components/dashboard/role-badge";

type Props = {
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  canManageUsers: boolean;
  canManageSettings: boolean;
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

const menuItemClass =
  "flex w-full items-center gap-12 rounded-8 px-12 py-10 text-left text-p4 font-medium text-neutral-3 transition-colors duration-150 hover:bg-surface-2 hover:text-neutral-1 focus-visible:bg-surface-2 focus-visible:outline-none";

export default function Topbar({ name, email, role, avatarUrl, canManageUsers, canManageSettings }: Props) {
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

  const firstName = name.split(" ")[0] || name;

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

        <div className="ml-auto flex shrink-0 items-center gap-12">
          <LiveClock />

          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="hidden h-40 items-center gap-8 rounded-full border border-neutral-10 bg-white px-14 text-[13px] font-semibold text-neutral-3 shadow-[0_1px_2px_rgba(10,13,27,0.04)] transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex"
          >
            <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
            View site
            <span className="sr-only">(opens in a new tab)</span>
          </a>

          <span aria-hidden="true" className="mx-4 hidden h-28 w-px bg-neutral-10 sm:block" />

          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-label={`Account menu for ${name}`}
              className={[
                "group flex h-48 items-center gap-12 rounded-full border py-4 pl-4 pr-12 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                open
                  ? "border-primary/30 bg-surface-1/60 shadow-[0_2px_10px_rgba(27,43,105,0.10)]"
                  : "border-transparent hover:border-neutral-10 hover:bg-white hover:shadow-[0_2px_10px_rgba(10,13,27,0.06)]",
              ].join(" ")}
            >
              <span className="relative rounded-full bg-gradient-to-br from-secondary via-tertiary to-primary p-[2px]">
                <UserAvatar name={name} avatarUrl={avatarUrl} size="sm" className="ring-2 ring-white" />
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full border-2 border-white bg-success"
                />
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block max-w-[160px] truncate text-p4 font-semibold text-neutral-1">{name}</span>
                <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[1.5px] text-primary/80">
                  {ROLE_META[role].label}
                </span>
              </span>
              <ChevronDown
                size={15}
                strokeWidth={1.75}
                aria-hidden="true"
                className={`text-neutral-6 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </button>

            <div
              role="menu"
              aria-label="Account"
              hidden={!open}
              className="absolute right-0 top-full z-50 mt-10 w-[300px] origin-top-right overflow-hidden rounded-16 border border-neutral-10 bg-white shadow-[0_16px_48px_rgba(10,13,27,0.14)]"
            >
              <div className="relative overflow-hidden bg-neutral-1 px-20 pb-20 pt-24">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-48 -top-64 h-160 w-160 rounded-full bg-tertiary/25 blur-2xl"
                />
                <div className="relative flex items-center gap-14">
                  <UserAvatar name={name} avatarUrl={avatarUrl} size="lg" className="ring-2 ring-white/20" />
                  <div className="min-w-0">
                    <p className="truncate text-p3 font-medium text-white">{name}</p>
                    <p className="truncate text-p4 font-light text-white/55">{email}</p>
                  </div>
                </div>
                <div className="relative mt-14 flex items-center justify-between gap-8">
                  <RoleBadge role={role} onDark />
                  <span className="text-[12px] font-medium text-white/45">Hi, {firstName}</span>
                </div>
              </div>

              <div className="p-8">
                <Link href="/dashboard/settings?tab=profile" role="menuitem" className={menuItemClass} onClick={() => setOpen(false)}>
                  <UserRound size={16} strokeWidth={1.5} aria-hidden="true" className="text-neutral-6" />
                  My profile
                </Link>
                <Link href="/dashboard/settings?tab=security" role="menuitem" className={menuItemClass} onClick={() => setOpen(false)}>
                  <KeyRound size={16} strokeWidth={1.5} aria-hidden="true" className="text-neutral-6" />
                  Password & security
                </Link>
                {canManageUsers && (
                  <Link href="/dashboard/users" role="menuitem" className={menuItemClass} onClick={() => setOpen(false)}>
                    <Users size={16} strokeWidth={1.5} aria-hidden="true" className="text-neutral-6" />
                    Manage users
                  </Link>
                )}
                {canManageSettings && (
                  <Link href="/dashboard/settings?tab=website" role="menuitem" className={menuItemClass} onClick={() => setOpen(false)}>
                    <Settings size={16} strokeWidth={1.5} aria-hidden="true" className="text-neutral-6" />
                    Site settings
                  </Link>
                )}
                <a href="/" target="_blank" rel="noopener" role="menuitem" className={menuItemClass} onClick={() => setOpen(false)}>
                  <ExternalLink size={16} strokeWidth={1.5} aria-hidden="true" className="text-neutral-6" />
                  View website
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>

              <form action={logoutAction} className="border-t border-neutral-10 p-8">
                <button type="submit" role="menuitem" className={`${menuItemClass} text-error hover:bg-error/5 hover:text-error`}>
                  <LogOut size={16} strokeWidth={1.5} aria-hidden="true" />
                  Sign out
                </button>
              </form>
            </div>
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
