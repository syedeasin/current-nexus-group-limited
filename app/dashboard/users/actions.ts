"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { Prisma, type Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { isEmailConfigured } from "@/lib/email";
import { emailPasswordLink, issuePasswordLink } from "@/lib/password-tokens";
import { passwordSchema } from "@/lib/validation/password";
import { fieldErrorsOf, userAdminSchema } from "@/lib/validation/user";

export type UserFormResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type CreateUserResult =
  | { ok: true; id: string; invite?: { url: string; emailed: boolean; emailError?: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type PasswordLinkResult =
  | { ok: true; url: string; expiresAt: string; purpose: "RESET" | "INVITE"; emailed: boolean; emailError?: string }
  | { ok: false; error: string };

export type SimpleResult = { ok: true; message?: string } | { ok: false; error: string };

function revalidateUsers(id?: string) {
  revalidatePath("/dashboard/users");
  if (id) revalidatePath(`/dashboard/users/${id}`);
  revalidatePath("/dashboard");
}

function readUserForm(formData: FormData) {
  return userAdminSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    username: String(formData.get("username") ?? ""),
    role: String(formData.get("role") ?? ""),
    isActive: formData.get("isActive") === "on",
  });
}

/** P2002 on users → which field collided, as a form error. */
function duplicateError(error: unknown): UserFormResult | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return null;
  const target = String((error.meta?.target as string[] | string | undefined) ?? "");
  if (target.includes("username")) {
    return { ok: false, error: "Fix the highlighted field.", fieldErrors: { username: "That username is already taken." } };
  }
  return { ok: false, error: "Fix the highlighted field.", fieldErrors: { email: "Another account already uses this email." } };
}

/**
 * The dashboard must always keep one active admin who can manage users — a
 * demotion, deactivation or deletion that would remove the last one is refused.
 */
async function wouldOrphanAdmins(target: { id: string; role: Role; isActive: boolean }, next: { role: Role; isActive: boolean } | null) {
  const stillAdmin = next !== null && next.role === "ADMIN" && next.isActive;
  if (target.role !== "ADMIN" || !target.isActive || stillAdmin) return false;
  const others = await prisma.user.count({ where: { role: "ADMIN", isActive: true, id: { not: target.id } } });
  return others === 0;
}

export async function createUser(formData: FormData): Promise<CreateUserResult> {
  const me = await requirePermission("user.manage");

  const parsed = readUserForm(formData);
  if (!parsed.success) {
    return { ok: false, error: "Fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const mode = formData.get("passwordMode") === "invite" ? "invite" : "password";
  let passwordHash: string;
  if (mode === "password") {
    const password = passwordSchema.safeParse(String(formData.get("password") ?? ""));
    if (!password.success) {
      return { ok: false, error: "Fix the highlighted fields.", fieldErrors: { password: password.error.issues[0].message } };
    }
    passwordHash = await hashPassword(password.data);
  } else {
    // Unguessable and never shown: the account can't sign in until the
    // invitee sets their own password through the link.
    passwordHash = await hashPassword(randomBytes(32).toString("base64url"));
  }

  let id: string;
  try {
    const user = await prisma.user.create({
      data: {
        ...parsed.data,
        passwordHash,
        passwordChangedAt: mode === "password" ? new Date() : null,
      },
      select: { id: true },
    });
    id = user.id;
  } catch (error) {
    const duplicate = duplicateError(error);
    if (duplicate && !duplicate.ok) return duplicate;
    console.error("[users] create failed", error);
    return { ok: false, error: "The account could not be created. Please try again." };
  }

  revalidateUsers();

  if (mode === "password") return { ok: true, id };

  const link = await issuePasswordLink(id, "INVITE", { issuedByAdmin: true });
  let emailed = false;
  let emailError: string | undefined;
  if (formData.get("sendEmail") === "on" && isEmailConfigured()) {
    const sent = await emailPasswordLink(parsed.data, "INVITE", link, me.name);
    emailed = sent.ok;
    if (!sent.ok) emailError = sent.error;
  }
  return { ok: true, id, invite: { url: link.url, emailed, emailError } };
}

export async function updateUser(id: string, formData: FormData): Promise<UserFormResult> {
  const me = await requirePermission("user.manage");

  const parsed = readUserForm(formData);
  if (!parsed.success) {
    return { ok: false, error: "Fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } });
  if (!target) return { ok: false, error: "This account no longer exists." };

  const data = parsed.data;
  if (id === me.id) {
    // Your own role and status can't be changed from here — otherwise one
    // misclick locks you out of the page you'd need to undo it.
    data.role = target.role;
    data.isActive = true;
  }

  if (await wouldOrphanAdmins(target, data)) {
    return { ok: false, error: "This is the only active Admin. Make another user an Admin first." };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        ...data,
        // Deactivating signs the person out of every open session at once.
        ...(target.isActive && !data.isActive ? { tokenVersion: { increment: 1 } } : {}),
      },
    });
  } catch (error) {
    const duplicate = duplicateError(error);
    if (duplicate) return duplicate;
    console.error("[users] update failed", error);
    return { ok: false, error: "The changes could not be saved. Please try again." };
  }

  revalidateUsers(id);
  return { ok: true, id };
}

export async function setUserActive(id: string, isActive: boolean): Promise<SimpleResult> {
  const me = await requirePermission("user.manage");
  if (id === me.id) return { ok: false, error: "You can't deactivate your own account." };

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } });
  if (!target) return { ok: false, error: "This account no longer exists." };
  if (await wouldOrphanAdmins(target, { role: target.role, isActive })) {
    return { ok: false, error: "This is the only active Admin. Make another user an Admin first." };
  }

  await prisma.user.update({
    where: { id },
    data: { isActive, ...(isActive ? {} : { tokenVersion: { increment: 1 } }) },
  });
  revalidateUsers(id);
  return { ok: true, message: isActive ? "Account reactivated." : "Account deactivated and signed out." };
}

export async function setUserPassword(id: string, formData: FormData): Promise<SimpleResult> {
  const me = await requirePermission("user.manage");
  if (id === me.id) return { ok: false, error: "Change your own password in Settings → Security." };

  const password = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  if (!password.success) return { ok: false, error: password.error.issues[0].message };

  const exists = await prisma.user.count({ where: { id } });
  if (!exists) return { ok: false, error: "This account no longer exists." };

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: {
        passwordHash: await hashPassword(password.data),
        passwordChangedAt: new Date(),
        tokenVersion: { increment: 1 },
      },
    }),
    // A pending reset/invite link would otherwise still override this password.
    prisma.passwordToken.deleteMany({ where: { userId: id, usedAt: null } }),
  ]);
  revalidateUsers(id);
  return { ok: true, message: "Password changed. They've been signed out everywhere and must use the new password." };
}

export async function createUserPasswordLink(id: string, sendEmail: boolean): Promise<PasswordLinkResult> {
  const me = await requirePermission("user.manage");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, isActive: true, lastLoginAt: true, passwordChangedAt: true },
  });
  if (!user) return { ok: false, error: "This account no longer exists." };
  if (!user.isActive) return { ok: false, error: "Reactivate the account first — links don't work for inactive accounts." };

  // Someone who has never had a password of their own gets the welcome
  // wording; everyone else gets a reset.
  const purpose = !user.lastLoginAt && !user.passwordChangedAt ? "INVITE" : "RESET";
  const link = await issuePasswordLink(user.id, purpose, { issuedByAdmin: true });

  let emailed = false;
  let emailError: string | undefined;
  if (sendEmail) {
    if (!isEmailConfigured()) {
      emailError = "Email isn't set up on this server — copy the link and send it yourself.";
    } else {
      const sent = await emailPasswordLink(user, purpose, link, me.name);
      emailed = sent.ok;
      if (!sent.ok) emailError = sent.error;
    }
  }

  revalidateUsers(id);
  return { ok: true, url: link.url, expiresAt: link.expiresAt.toISOString(), purpose, emailed, emailError };
}

export async function signOutUserEverywhere(id: string): Promise<SimpleResult> {
  const me = await requirePermission("user.manage");
  if (id === me.id) return { ok: false, error: "Use Settings → Security to sign out your other devices." };

  await prisma.user.update({ where: { id }, data: { tokenVersion: { increment: 1 } } });
  revalidateUsers(id);
  return { ok: true, message: "Signed out of every device." };
}

export async function deleteUser(id: string, transferToId: string): Promise<SimpleResult> {
  const me = await requirePermission("user.manage");
  if (id === me.id) return { ok: false, error: "You can't delete your own account." };

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, isActive: true, _count: { select: { posts: true } } },
  });
  if (!target) return { ok: false, error: "This account no longer exists." };
  if (await wouldOrphanAdmins(target, null)) {
    return { ok: false, error: "This is the only active Admin. Make another user an Admin first." };
  }

  if (target._count.posts > 0) {
    if (!transferToId || transferToId === id) {
      return { ok: false, error: "Choose who should take over this person's posts." };
    }
    const heir = await prisma.user.count({ where: { id: transferToId } });
    if (!heir) return { ok: false, error: "The person chosen to take over the posts no longer exists." };
  }

  // Posts require an author, so they move first; media, downloads and pages
  // only lose their "uploaded/created by" (onDelete: SetNull in the schema).
  await prisma.$transaction([
    ...(target._count.posts > 0
      ? [prisma.post.updateMany({ where: { authorId: id }, data: { authorId: transferToId } })]
      : []),
    prisma.user.delete({ where: { id } }),
  ]);

  revalidateUsers();
  revalidatePath("/dashboard/posts");
  return { ok: true };
}
