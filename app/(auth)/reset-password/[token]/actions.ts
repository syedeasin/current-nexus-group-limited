"use server";

import { passwordSchema } from "@/lib/validation/password";
import { redeemPasswordLink } from "@/lib/password-tokens";
import { clearSessionCookie } from "@/lib/session";

export type ResetPasswordResult = { ok: true } | { ok: false; error: string; expired?: boolean };

export async function resetPassword(token: string, formData: FormData): Promise<ResetPasswordResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (password !== confirm) return { ok: false, error: "The two passwords don't match." };

  const result = await redeemPasswordLink(token, password);
  if (!result.ok) {
    return { ok: false, expired: true, error: "This link has expired or was already used. Request a new one." };
  }

  // Whoever is signed in on this browser (possibly someone else) is signed
  // out; the account's sessions were already invalidated by the reset.
  await clearSessionCookie();
  return { ok: true };
}
