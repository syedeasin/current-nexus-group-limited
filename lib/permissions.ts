import type { Role } from "@prisma/client";

export const PERMISSIONS = [
  "post.viewAll",
  "post.create",
  "post.editAny",
  "post.deleteAny",
  "post.publish",
  "category.manage",
  "tag.manage",
  "media.upload",
  "media.deleteAny",
  "download.manage",
  "user.manage",
  "settings.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [...PERMISSIONS],
  EDITOR: [
    "post.viewAll",
    "post.create",
    "post.editAny",
    "post.deleteAny",
    "post.publish",
    "category.manage",
    "tag.manage",
    "media.upload",
    "media.deleteAny",
    "download.manage",
  ],
  AUTHOR: ["post.create", "media.upload"],
  VIEWER: [],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canEditPost(
  user: { id: string; role: Role },
  post: { authorId: string }
): boolean {
  if (can(user.role, "post.editAny")) return true;
  return user.role === "AUTHOR" && post.authorId === user.id;
}

export function canDeletePost(
  user: { id: string; role: Role },
  post: { authorId: string; status: string }
): boolean {
  if (can(user.role, "post.deleteAny")) return true;
  return user.role === "AUTHOR" && post.authorId === user.id && post.status === "DRAFT";
}
