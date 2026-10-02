"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEmailConfigured } from "@/lib/email";
import { emailPasswordLink, issuePasswordLink } from "@/lib/password-tokens";

export type ForgotPasswordResult = { ok: true; emailEnabled: boolean } | { ok: false; error: string };

const WINDOW_MS = 15 * 60 * 1000;
const PER_IDENTIFIER = 3;
const PER_PROCESS = 30;
const requests = new Map<string, { count: number; firstAt: number }>();

function limited(key: string, max: number): boolean {
  const now = Date.now();
  const record = requests.get(key);
  if (!record || now - record.firstAt > WINDOW_MS) {
    requests.set(key, { count: 1, firstAt: now });
    return false;
  }
  record.count += 1;
  return record.count > max;
}

/**
 * Always answers the same way whether or not the account exists, and sends
 * the email after the response (`after`), so neither the message nor the
 * response time tells a visitor which addresses have accounts.
 */
export async function requestPasswordReset(formData: FormData): Promise<ForgotPasswordResult> {
  const identifier = String(formData.get("identifier") ?? "").trim().toLowerCase();
  if (!identifier || identifier.length > 254) {
    return { ok: false, error: "Enter the email address or username you sign in with." };
  }

  if (!isEmailConfigured()) return { ok: true, emailEnabled: false };

  if (limited(`id:${identifier}`, PER_IDENTIFIER) || limited("all", PER_PROCESS)) {
    return { ok: false, error: "Too many reset requests. Please wait 15 minutes and try again." };
  }

  after(async () => {
    try {
      const user = await prisma.user.findUnique({
        where: identifier.includes("@") ? { email: identifier } : { username: identifier },
        select: { id: true, name: true, email: true, isActive: true },
      });
      if (!user || !user.isActive) return;
      const link = await issuePasswordLink(user.id, "RESET");
      await emailPasswordLink(user, "RESET", link);
    } catch (error) {
      console.error("[forgot-password] could not send reset email", error);
    }
  });

  return { ok: true, emailEnabled: true };
}
