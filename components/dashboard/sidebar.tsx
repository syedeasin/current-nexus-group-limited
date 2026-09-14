"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  Image as ImageIcon,
  Download,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { NavItem } from "@/lib/dashboard-nav";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  Image: ImageIcon,
  Download,
  Users,
  Settings,
};

export default function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <aside className="hidden w-240 shrink-0 flex-col bg-primary lg:flex">
      <div className="flex h-64 items-center border-b border-white/10 px-24">
        <div>
          <p className="text-p4 font-medium leading-tight text-white">CurrentNexus</p>
          <p className="text-p4 font-medium uppercase tracking-[2px] text-tertiary">
            Group Limited
          </p>
        </div>
      </div>

      <nav aria-label="Dashboard" className="flex-1 py-24">
        <p className="mb-12 px-24 text-p4 font-semibold uppercase tracking-[2px] text-white/25">
          Manage
        </p>
        <ul>
          {items.map((item) => {
            const Icon = ICONS[item.icon] ?? FileText;
            const active = isActive(item);
            return (
              <li key={item.href}>
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
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-24 py-16">
        <p className="text-p4 font-light text-white/25">CNX Energy CMS</p>
      </div>
    </aside>
  );
}
