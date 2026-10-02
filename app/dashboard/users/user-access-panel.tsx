"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Link2, LogOut, Power } from "lucide-react";
import PasswordInput from "@/components/dashboard/form/password-input";
import CopyField from "@/components/dashboard/copy-field";
import { cardClass, cardTitleClass, noticeClass, primaryButtonClass, secondaryButtonClass } from "@/components/dashboard/ui-classes";
import {
  createUserPasswordLink,
  setUserActive,
  setUserPassword,
  signOutUserEverywhere,
  type PasswordLinkResult,
} from "./actions";

type Props = {
  user: { id: string; name: string; isActive: boolean };
  emailEnabled: boolean;
};

type Notice = { tone: "success" | "error" | "warning"; text: string } | null;

export default function UserAccessPanel({ user, emailEnabled }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [link, setLink] = useState<Extract<PasswordLinkResult, { ok: true }> | null>(null);

  async function run(key: string, task: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    setBusy(key);
    setNotice(null);
    try {
      const result = await task();
      if (result.ok) {
        if (result.message) setNotice({ tone: "success", text: result.message });
        router.refresh();
      } else {
        setNotice({ tone: "error", text: result.error ?? "Something went wrong." });
      }
    } catch {
      setNotice({ tone: "error", text: "Couldn't reach the server. Check your connection and try again." });
    }
    setBusy(null);
  }

  async function makeLink(sendEmail: boolean) {
    setBusy(sendEmail ? "email" : "link");
    setNotice(null);
    setLink(null);
    try {
      const result = await createUserPasswordLink(user.id, sendEmail);
      if (!result.ok) {
        setNotice({ tone: "error", text: result.error });
      } else {
        setLink(result);
        if (result.emailed) setNotice({ tone: "success", text: "Email sent. The link below is the same one." });
        else if (result.emailError) setNotice({ tone: "warning", text: result.emailError });
      }
    } catch {
      setNotice({ tone: "error", text: "Couldn't reach the server. Check your connection and try again." });
    }
    setBusy(null);
  }

  return (
    <section className={cardClass} aria-labelledby="access-heading">
      <h2 id="access-heading" className={cardTitleClass}>
        Password & sign-in
      </h2>
      <p className="mt-6 text-p4 font-light text-neutral-5">
        Every option here signs {user.name.split(" ")[0]} out of devices that used the old password.
      </p>

      {notice && (
        <div role={notice.tone === "error" ? "alert" : "status"} className={`mt-16 ${noticeClass[notice.tone]}`}>
          {notice.text}
        </div>
      )}

      <div className="mt-20 space-y-12">
        <div className="flex flex-wrap gap-8">
          <button
            type="button"
            onClick={() => makeLink(true)}
            disabled={busy !== null || !user.isActive || !emailEnabled}
            title={emailEnabled ? undefined : "Email isn't set up on this server — use Copy reset link"}
            className={secondaryButtonClass}
          >
            <Link2 size={15} strokeWidth={1.75} aria-hidden="true" />
            {busy === "email" ? "Sending…" : "Email reset link"}
          </button>
          <button type="button" onClick={() => makeLink(false)} disabled={busy !== null || !user.isActive} className={secondaryButtonClass}>
            <Link2 size={15} strokeWidth={1.75} aria-hidden="true" />
            {busy === "link" ? "Creating…" : "Copy reset link"}
          </button>
          <button
            type="button"
            onClick={() => setShowSetPassword((v) => !v)}
            aria-expanded={showSetPassword}
            disabled={busy !== null}
            className={secondaryButtonClass}
          >
            <KeyRound size={15} strokeWidth={1.75} aria-hidden="true" />
            Set new password
          </button>
        </div>

        {link && (
          <div className="rounded-12 border border-neutral-10 bg-surface-2 p-16">
            <p className="mb-10 text-p4 text-neutral-4">
              {link.purpose === "INVITE" ? "Invitation" : "Reset"} link — works once, expires{" "}
              {new Date(link.expiresAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}.
              Older links for this account no longer work.
            </p>
            <CopyField value={link.url} label="Password link" />
          </div>
        )}

        {showSetPassword && (
          <form
            className="rounded-12 border border-neutral-10 bg-surface-2 p-16"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              void run("password", async () => {
                const result = await setUserPassword(user.id, formData);
                if (result.ok) setShowSetPassword(false);
                return result;
              });
            }}
          >
            <label htmlFor="admin-new-password" className="mb-8 block text-p4 font-medium text-neutral-4">
              New password for {user.name}
            </label>
            <PasswordInput id="admin-new-password" name="password" autoComplete="new-password" showStrength allowGenerate />
            <button type="submit" disabled={busy !== null} className={`${primaryButtonClass} mt-16 px-20 py-10 text-p4`}>
              {busy === "password" ? "Saving…" : "Save password"}
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-8 border-t border-neutral-10 pt-16">
          <button
            type="button"
            onClick={() => run("signout", () => signOutUserEverywhere(user.id))}
            disabled={busy !== null || !user.isActive}
            className={secondaryButtonClass}
          >
            <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
            {busy === "signout" ? "Signing out…" : "Sign out everywhere"}
          </button>
          <button
            type="button"
            onClick={() => run("active", () => setUserActive(user.id, !user.isActive))}
            disabled={busy !== null}
            className={secondaryButtonClass}
          >
            <Power size={15} strokeWidth={1.75} aria-hidden="true" />
            {busy === "active" ? "Saving…" : user.isActive ? "Deactivate account" : "Reactivate account"}
          </button>
        </div>
      </div>
    </section>
  );
}
