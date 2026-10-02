"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthNotice, authButtonClass, authInputClass, authLabelClass, authLinkClass } from "../auth-ui";
import { requestPasswordReset, type ForgotPasswordResult } from "./actions";

export default function ForgotPasswordForm() {
  const [result, setResult] = useState<ForgotPasswordResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      setResult(await requestPasswordReset(new FormData(e.currentTarget)));
    } catch {
      setResult({ ok: false, error: "Couldn't reach the server. Check your connection and try again." });
    }
    setLoading(false);
  }

  const backLink = (
    <Link href="/login" className={`mt-24 inline-flex items-center gap-8 text-p4 ${authLinkClass}`}>
      <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" />
      Back to sign in
    </Link>
  );

  if (result?.ok && result.emailEnabled) {
    return (
      <div>
        <div className="rounded-16 border border-neutral-10 bg-white p-24">
          <span className="flex h-44 w-44 items-center justify-center rounded-full bg-surface-1 text-primary">
            <MailCheck size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p role="status" className="mt-16 text-p3 font-light leading-relaxed text-neutral-3">
            If an active account matches what you entered, a reset link is on its way. It works once and expires in
            1 hour — check your spam folder if it doesn&apos;t arrive within a few minutes.
          </p>
        </div>
        {backLink}
      </div>
    );
  }

  if (result?.ok && !result.emailEnabled) {
    return (
      <div>
        <AuthNotice tone="info">
          Password emails aren&apos;t switched on for this site yet. Ask an administrator to send you a reset link from
          Dashboard → Users — they can copy it to you directly.
        </AuthNotice>
        {backLink}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-20">
      {result && !result.ok && <AuthNotice tone="error">{result.error}</AuthNotice>}
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
      <button type="submit" disabled={loading} className={authButtonClass}>
        {loading ? "Sending…" : "Send reset link"}
      </button>
      {backLink}
    </form>
  );
}
