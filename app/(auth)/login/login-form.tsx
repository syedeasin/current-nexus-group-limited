"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/dashboard/form/password-input";
import { AuthNotice, authButtonClass, authInputClass, authLabelClass, authLinkClass } from "../auth-ui";
import { loginAction } from "./actions";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await loginAction(formData);
      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setError(result.error);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-20">
      {error && <AuthNotice tone="error">{error}</AuthNotice>}

      <div>
        <label htmlFor="identifier" className={authLabelClass}>
          Email or username
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          required
          autoComplete="username"
          autoCapitalize="off"
          spellCheck={false}
          className={authInputClass}
        />
      </div>

      <div>
        <div className="mb-8 flex items-baseline justify-between gap-12">
          <label htmlFor="password" className={`${authLabelClass} mb-0`}>
            Password
          </label>
          <Link href="/forgot-password" className={`text-p4 ${authLinkClass}`}>
            Forgot password?
          </Link>
        </div>
        <PasswordInput id="password" name="password" required autoComplete="current-password" />
      </div>

      <button type="submit" disabled={loading} className={authButtonClass}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
