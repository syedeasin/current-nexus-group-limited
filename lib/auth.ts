import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSessionCookie } from "@/lib/session";
import { verifySessionToken } from "@/lib/jwt";
import { can, type Permission } from "@/lib/permissions";

export const getCurrentUser = cache(async () => {
  const token = await readSessionCookie();
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      tokenVersion: true,
    },
  });

  if (!user) return null;
  if (!user.isActive) return null;
  if (user.tokenVersion !== payload.tokenVersion) return null;

  return user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  if (!can(user.role, permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
  return user;
}
