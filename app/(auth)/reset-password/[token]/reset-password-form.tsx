"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/dashboard/form/password-input";
import { AuthNotice, authButtonClass, authLabelClass, authLinkClass } from "../../auth-ui";
import { resetPassword, type ResetPasswordResult } from "./actions";

export default function ResetPasswordForm({ token, isInvite }: { token: string; isInvite: boolean }) {
  const router = useRouter();
  const [result, setResult] = useState<ResetPasswordResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    let next: ResetPasswordResult;
    try {
      next = await resetPassword(token, new FormData(e.currentTarget));
    } catch {
      next = { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
    }
    if (next.ok) {
      router.replace(`/login?notice=${isInvite ? "welcome" : "reset"}`);
      return;
    }
    setResult(next);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-20">
      {result && !result.ok && (
        <AuthNotice tone="error">
          {result.error}{" "}
          {result.expired && (
            <Link href="/forgot-password" className={authLinkClass}>
              Get a new link
            </Link>
          )}
        </AuthNotice>
      )}
      <div>
        <label htmlFor="password" className={authLabelClass}>
          New password
        </label>
        <PasswordInput id="password" name="password" required autoComplete="new-password" showStrength allowGenerate />
      </div>
      <div>
        <label htmlFor="confirm" className={authLabelClass}>
          Confirm password
        </label>
        <PasswordInput id="confirm" name="confirm" required autoComplete="new-password" />
      </div>
      <button type="submit" disabled={loading} className={authButtonClass}>
        {loading ? "Saving…" : isInvite ? "Set password" : "Change password"}
      </button>
    </form>
  );
}
