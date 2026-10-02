"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSessionToken } from "@/lib/jwt";
import { setSessionCookie } from "@/lib/session";
import { putFile, deleteFile } from "@/lib/storage";
import { validateImageUpload } from "@/lib/validation/upload";
import { passwordSchema } from "@/lib/validation/password";
import { fieldErrorsOf, profileSchema } from "@/lib/validation/user";
import { emailStatus, renderEmail, sendEmail } from "@/lib/email";
import { getLinkBaseUrl, siteSettingsSchema, type SiteSettings } from "@/lib/site-settings";
import { routing } from "@/i18n/routing";

export type FormResult = { ok: true; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

const AVATAR_MAX_BYTES = 4 * 1024 * 1024;
const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/** Keeps the current browser signed in after tokenVersion was bumped to sign out everyone else. */
async function reissueSession(user: { id: string; role: Parameters<typeof createSessionToken>[0]["role"] }, tokenVersion: number) {
  await setSessionCookie(await createSessionToken({ userId: user.id, role: user.role, tokenVersion }));
}

// ---------------------------------------------------------------------------
// Profile & security — every signed-in user, for their own account only
// ---------------------------------------------------------------------------

export async function uploadAvatar(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image first." };
  if (file.size > AVATAR_MAX_BYTES) return { ok: false, error: "Use an image under 4MB." };

  const validation = await validateImageUpload(file);
  if (!validation.ok) return { ok: false, error: validation.error };
  if (!AVATAR_TYPES.has(validation.verifiedType)) return { ok: false, error: "Use a JPG, PNG, WebP or AVIF photo." };

  try {
    const stored = await putFile(file, { prefix: "avatars" });
    return { ok: true, url: stored.url };
  } catch (error) {
    console.error("[settings] avatar upload failed", error);
    return { ok: false, error: "The photo could not be saved. Please try again." };
  }
}

function avatarKey(url: string | null): string | null {
  return url && url.startsWith("/media/avatars/") ? url.replace(/^\/media\//, "uploads/") : null;
}

export async function updateProfile(formData: FormData): Promise<FormResult> {
  const me = await requireUser();

  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    username: String(formData.get("username") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    avatarUrl: String(formData.get("avatarUrl") ?? ""),
  });
  if (!parsed.success) return { ok: false, error: "Fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };

  const before = await prisma.user.findUnique({ where: { id: me.id }, select: { avatarUrl: true } });

  try {
    await prisma.user.update({ where: { id: me.id }, data: parsed.data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = String(error.meta?.target ?? "");
      return target.includes("username")
        ? { ok: false, error: "Fix the highlighted field.", fieldErrors: { username: "That username is already taken." } }
        : { ok: false, error: "Fix the highlighted field.", fieldErrors: { email: "Another account already uses this email." } };
    }
    console.error("[settings] profile update failed", error);
    return { ok: false, error: "Your profile could not be saved. Please try again." };
  }

  // A replaced or removed avatar is only ever referenced by this account.
  const oldKey = avatarKey(before?.avatarUrl ?? null);
  if (oldKey && before?.avatarUrl !== parsed.data.avatarUrl) {
    await deleteFile(oldKey).catch((error) => console.error("[settings] could not delete old avatar", error));
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Profile saved." };
}

export async function changePassword(formData: FormData): Promise<FormResult> {
  const me = await requireUser();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const user = await prisma.user.findUnique({ where: { id: me.id }, select: { passwordHash: true } });
  if (!user || !(await verifyPassword(current, user.passwordHash))) {
    return { ok: false, error: "Fix the highlighted field.", fieldErrors: { currentPassword: "That isn't your current password." } };
  }

  const parsed = passwordSchema.safeParse(next);
  if (!parsed.success) return { ok: false, error: "Fix the highlighted field.", fieldErrors: { newPassword: parsed.error.issues[0].message } };
  if (next !== confirm) return { ok: false, error: "Fix the highlighted field.", fieldErrors: { confirmPassword: "The two passwords don't match." } };
  if (await verifyPassword(next, user.passwordHash)) {
    return { ok: false, error: "Fix the highlighted field.", fieldErrors: { newPassword: "Choose a password different from your current one." } };
  }

  const updated = await prisma.user.update({
    where: { id: me.id },
    data: { passwordHash: await hashPassword(parsed.data), passwordChangedAt: new Date(), tokenVersion: { increment: 1 } },
    select: { tokenVersion: true },
  });
  await prisma.passwordToken.deleteMany({ where: { userId: me.id, usedAt: null } });
  await reissueSession(me, updated.tokenVersion);

  return { ok: true, message: "Password changed. Other devices have been signed out." };
}

export async function signOutOtherDevices(): Promise<FormResult> {
  const me = await requireUser();
  const updated = await prisma.user.update({
    where: { id: me.id },
    data: { tokenVersion: { increment: 1 } },
    select: { tokenVersion: true },
  });
  await reissueSession(me, updated.tokenVersion);
  return { ok: true, message: "Signed out of every other device and browser." };
}

// ---------------------------------------------------------------------------
// Website settings — settings.manage
// ---------------------------------------------------------------------------

function revalidatePublicSite() {
  for (const locale of routing.locales) revalidatePath(`/${locale}`, "layout");
}

export async function saveSiteSettings(formData: FormData): Promise<FormResult> {
  const me = await requirePermission("settings.manage");

  const parsed = siteSettingsSchema.safeParse({
    siteUrl: String(formData.get("siteUrl") ?? ""),
    allowIndexing: formData.get("allowIndexing") === "on",
  });
  if (!parsed.success) return { ok: false, error: "Fix the highlighted field.", fieldErrors: fieldErrorsOf(parsed.error) };

  const entries = Object.entries(parsed.data) as [keyof SiteSettings, SiteSettings[keyof SiteSettings]][];
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value, updatedById: me.id },
        update: { value, updatedById: me.id },
      })
    )
  );

  revalidatePath("/dashboard/settings");
  revalidatePath("/robots.txt");
  revalidatePublicSite();
  return { ok: true, message: "Website settings saved." };
}

export async function sendTestEmail(): Promise<FormResult> {
  const me = await requirePermission("settings.manage");
  if (!emailStatus().configured) return { ok: false, error: "Email isn't set up on this server yet." };

  const base = await getLinkBaseUrl({ trustRequestOrigin: true });
  const result = await sendEmail({
    to: me.email,
    subject: "CNX Energy dashboard — test email",
    ...renderEmail({
      heading: "Email is working",
      paragraphs: [
        `Hi ${me.name.split(" ")[0]},`,
        "This test confirms the dashboard can send email — password reset and invitation emails will be delivered the same way.",
      ],
      action: { label: "Open the dashboard", url: `${base}/dashboard` },
    }),
  });
  return result.ok ? { ok: true, message: `Test email sent to ${me.email}.` } : result;
}

export async function refreshSiteCache(): Promise<FormResult> {
  await requirePermission("settings.manage");
  revalidatePath("/", "layout");
  revalidatePublicSite();
  return { ok: true, message: "Every public page will be rebuilt with the latest content on its next visit." };
}
