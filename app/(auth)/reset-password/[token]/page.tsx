import Link from "next/link";
import type { Metadata } from "next";
import { findUsableToken } from "@/lib/password-tokens";
import { AuthHeading, AuthNotice, authLinkClass } from "../../auth-ui";
import ResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = {
  title: "Choose a password | CNX Energy",
  robots: { index: false, follow: false },
  // The token is in the URL — never send it to another site as a Referer.
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await findUsableToken(token);

  if (!row) {
    return (
      <>
        <AuthHeading eyebrow="Account recovery" title="Link no longer valid" />
        <AuthNotice tone="error">
          This password link has expired or has already been used. Links work once — reset links for 1 hour,
          invitations for 7 days.
        </AuthNotice>
        <p className="text-p4 text-neutral-5">
          <Link href="/forgot-password" className={authLinkClass}>
            Request a new reset link
          </Link>{" "}
          or ask an administrator to send a new invitation.
        </p>
      </>
    );
  }

  const isInvite = row.purpose === "INVITE";

  return (
    <>
      <AuthHeading eyebrow={isInvite ? "Welcome" : "Account recovery"} title={isInvite ? "Set your password" : "Choose a new password"}>
        {isInvite ? (
          <>
            Hi {row.user.name.split(" ")[0]} — choose a password for <strong className="font-medium text-neutral-3">{row.user.email}</strong> to
            finish setting up your dashboard account.
          </>
        ) : (
          <>
            Choose a new password for <strong className="font-medium text-neutral-3">{row.user.email}</strong>. You&apos;ll be signed
            out everywhere else.
          </>
        )}
      </AuthHeading>
      <ResetPasswordForm token={token} isInvite={isInvite} />
    </>
  );
}
