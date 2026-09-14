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

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard", exact: true },
  { label: "Posts", href: "/dashboard/posts", icon: "FileText", permission: "post.create" },
  { label: "Categories", href: "/dashboard/categories", icon: "FolderTree", permission: "category.manage" },
  { label: "Tags", href: "/dashboard/tags", icon: "Tag", permission: "tag.manage" },
  { label: "Media", href: "/dashboard/media", icon: "Image", permission: "media.upload" },
  { label: "Downloads", href: "/dashboard/downloads", icon: "Download", permission: "download.manage" },
  { label: "Users", href: "/dashboard/users", icon: "Users", permission: "user.manage" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings", permission: "settings.manage" },
];
