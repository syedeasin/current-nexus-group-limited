import type { Role } from "@prisma/client";
import { PERMISSIONS, type Permission } from "@/lib/permissions";

/** Display order, most to least privileged. */
export const ROLES: Role[] = ["ADMIN", "EDITOR", "AUTHOR", "VIEWER"];

export const ROLE_META: Record<Role, { label: string; summary: string; badge: string }> = {
  ADMIN: {
    label: "Admin",
    summary: "Full access, including user accounts and site settings.",
    badge: "bg-primary text-white",
  },
  EDITOR: {
    label: "Editor",
    summary: "Manages all website content — pages, news, downloads, products — but not users or settings.",
    badge: "bg-tertiary/15 text-primary",
  },
  AUTHOR: {
    label: "Author",
    summary: "Writes their own news posts and uploads images. Publishing needs an Editor or Admin.",
    badge: "bg-secondary/20 text-[#6b4f12]",
  },
  VIEWER: {
    label: "Viewer",
    summary: "Read-only: can sign in and see the overview, nothing else.",
    badge: "bg-neutral-11 text-neutral-4",
  },
};

export const PERMISSION_GROUPS: { label: string; permissions: { key: Permission; label: string }[] }[] = [
  {
    label: "News",
    permissions: [
      { key: "post.create", label: "Write posts" },
      { key: "post.viewAll", label: "See everyone's posts" },
      { key: "post.editAny", label: "Edit anyone's posts" },
      { key: "post.deleteAny", label: "Delete anyone's posts" },
      { key: "post.publish", label: "Publish & highlight posts" },
      { key: "category.manage", label: "Manage categories" },
      { key: "tag.manage", label: "Manage tags" },
    ],
  },
  {
    label: "Media",
    permissions: [
      { key: "media.upload", label: "Upload images" },
      { key: "media.deleteAny", label: "Delete anyone's images" },
    ],
  },
  {
    label: "Website",
    permissions: [
      { key: "page.manage", label: "Edit pages (home, about, footer…)" },
      { key: "manufacturingPage.manage", label: "Manage manufacturing products" },
      { key: "solutionsPage.manage", label: "Manage solutions & projects" },
      { key: "download.manage", label: "Manage downloads" },
      { key: "inquiry.manage", label: "Read contact messages & newsletter list" },
    ],
  },
  {
    label: "Administration",
    permissions: [
      { key: "user.manage", label: "Manage users & roles" },
      { key: "settings.manage", label: "Change site settings" },
    ],
  },
];

// Keep the matrix honest: every permission must appear in exactly one group.
if (process.env.NODE_ENV !== "production") {
  const listed = PERMISSION_GROUPS.flatMap((group) => group.permissions.map((p) => p.key));
  const missing = PERMISSIONS.filter((p) => !listed.includes(p));
  if (missing.length > 0) console.warn(`[roles] permissions missing from PERMISSION_GROUPS: ${missing.join(", ")}`);
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}
