"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken } from "@/lib/jwt";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";

const loginSchema = z.object({
  identifier: z.string().min(1, "Enter your email address or username").max(254),
  password: z.string().min(1, "Password is required"),
});

type ActionResult = { ok: true } | { ok: false; error: string };

const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now - record.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return false;
  }
  record.count += 1;
  return record.count > MAX_ATTEMPTS;
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    identifier: String(formData.get("identifier") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { identifier, password } = parsed.data;

  if (tooManyAttempts(identifier)) {
    return { ok: false, error: "Too many attempts. Please try again in 10 minutes." };
  }

  // Usernames can't contain "@" (lib/validation/user.ts), so the two never collide.
  const user = identifier.includes("@")
    ? await prisma.user.findUnique({ where: { email: identifier } })
    : await prisma.user.findUnique({ where: { username: identifier } });
  if (!user || !user.isActive) {
    return { ok: false, error: "Those sign-in details don't match an active account." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Those sign-in details don't match an active account." };
  }

  attempts.delete(identifier);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await createSessionToken({
    userId: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  await setSessionCookie(token);
  return { ok: true };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login?notice=signedout");
}
