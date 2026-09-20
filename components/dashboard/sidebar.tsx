"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  Image as ImageIcon,
  Download,
  LayoutTemplate,
  Factory,
  Users,
  Settings,
  Newspaper,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { isNavGroup, type NavEntry, type NavItem } from "@/lib/dashboard-nav";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  Image: ImageIcon,
  Download,
  LayoutTemplate,
  Factory,
  Users,
  Settings,
  Newspaper,
};

function isItemActive(item: NavItem, pathname: string) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = ICONS[item.icon] ?? FileText;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={[
        "flex items-center gap-12 rounded-r-8 border-l-2 px-24 py-12 text-p4 font-medium tracking-[0.3px] transition-colors duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tertiary",
        active
          ? "border-tertiary bg-white/[0.04] text-white"
          : "border-transparent text-white/45 hover:bg-white/[0.03] hover:text-white/80",
      ].join(" ")}
    >
      <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
      {item.label}
    </Link>
  );
}

function NavGroupItem({ group, pathname }: { group: Extract<NavEntry, { children: NavItem[] }>; pathname: string }) {
  const containsActive = group.children.some((child) => isItemActive(child, pathname));
  const [open, setOpen] = useState(containsActive);
  const expanded = open || containsActive;
  const Icon = ICONS[group.icon] ?? FileText;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={expanded}
        className={[
          "flex w-full items-center gap-12 rounded-r-8 border-l-2 px-24 py-12 text-p4 font-medium tracking-[0.3px] transition-colors duration-200",
          "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tertiary",
          containsActive
            ? "border-tertiary text-white"
            : "border-transparent text-white/45 hover:bg-white/[0.03] hover:text-white/80",
        ].join(" ")}
      >
        <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          aria-hidden="true"
          className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <ul className="min-h-0 overflow-hidden py-4 pl-32">
          {group.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                aria-current={isItemActive(child, pathname) ? "page" : undefined}
                className={[
                  "block rounded-8 px-16 py-10 text-p4 font-medium tracking-[0.3px] transition-colors duration-200",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tertiary",
                  isItemActive(child, pathname)
                    ? "bg-white/[0.06] text-white"
                    : "text-white/45 hover:bg-white/[0.03] hover:text-white/80",
                ].join(" ")}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function Sidebar({ items }: { items: NavEntry[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-240 shrink-0 flex-col bg-neutral-1 lg:flex">
      <div className="flex h-64 items-center border-b border-white/10 px-24">
        <Image src="/logos/cnx-logo-white.svg" alt="CNX Energy" width={129} height={32} className="h-32 w-auto" priority />
      </div>

      <nav aria-label="Dashboard" className="min-h-0 flex-1 overflow-y-auto py-24">
        <p className="mb-12 px-24 text-p4 font-semibold uppercase tracking-[2px] text-white/25">
          Manage
        </p>
        <ul>
          {items.map((entry) =>
            isNavGroup(entry) ? (
              <NavGroupItem key={entry.label} group={entry} pathname={pathname} />
            ) : (
              <li key={entry.href}>
                <NavLink item={entry} active={isItemActive(entry, pathname)} />
              </li>
            )
          )}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-24 py-16">
        <p className="text-p4 font-light text-white/25">CNX Energy CMS</p>
      </div>
    </aside>
  );
}
