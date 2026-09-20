import type { Permission } from "@/lib/permissions";

export type NavItem = {
  label: string;
  href: string;
  /** lucide-react icon name, resolved in the Sidebar component */
  icon: string;
  /** If set, the item is hidden from roles lacking this permission */
  permission?: Permission;
  /** Match the pathname exactly rather than by prefix */
  exact?: boolean;
};

export type NavGroup = {
  label: string;
  icon: string;
  children: NavItem[];
};

export type NavEntry = NavItem | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

export const NAV_ENTRIES: NavEntry[] = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard", exact: true },
  {
    label: "News",
    icon: "Newspaper",
    children: [
      { label: "Posts", href: "/dashboard/posts", icon: "FileText", permission: "post.create" },
      { label: "Categories", href: "/dashboard/categories", icon: "FolderTree", permission: "category.manage" },
      { label: "Tags", href: "/dashboard/tags", icon: "Tag", permission: "tag.manage" },
      { label: "Media", href: "/dashboard/media", icon: "Image", permission: "media.upload" },
    ],
  },
  { label: "Downloads", href: "/dashboard/downloads", icon: "Download", permission: "download.manage" },
  { label: "Manufacturing", href: "/dashboard/manufacturing", icon: "Factory", permission: "manufacturingPage.manage" },
  { label: "Solutions & Projects", href: "/dashboard/solutions-projects", icon: "LayoutTemplate", permission: "solutionsPage.manage" },
  { label: "Users", href: "/dashboard/users", icon: "Users", permission: "user.manage" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings", permission: "settings.manage" },
];

/** Flat list of every leaf nav item, used by search/breadcrumb lookups that don't care about grouping. */
export const NAV_ITEMS: NavItem[] = NAV_ENTRIES.flatMap((entry) =>
  isNavGroup(entry) ? entry.children : [entry]
);

export function filterNavEntries(
  entries: NavEntry[],
  can: (permission: Permission) => boolean
): NavEntry[] {
  return entries
    .map((entry) => {
      if (isNavGroup(entry)) {
        const children = entry.children.filter((item) => !item.permission || can(item.permission));
        return children.length > 0 ? { ...entry, children } : null;
      }
      return !entry.permission || can(entry.permission) ? entry : null;
    })
    .filter((e): e is NavEntry => e !== null);
}
