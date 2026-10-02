"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { CheckCircle2, KeyRound, Mail } from "lucide-react";
import FieldLabel from "@/components/dashboard/form/field-label";
import FieldHint from "@/components/dashboard/form/field-hint";
import FieldError from "@/components/dashboard/form/field-error";
import TextInput from "@/components/dashboard/form/text-input";
import PasswordInput from "@/components/dashboard/form/password-input";
import CopyField from "@/components/dashboard/copy-field";
import { ROLES, ROLE_META } from "@/lib/roles";
import { cardClass, cardTitleClass, noticeClass, primaryButtonClass as primaryButton } from "@/components/dashboard/ui-classes";
import { createUser, updateUser } from "./actions";

type UserFormProps = {
  mode: "create" | "edit";
  user?: { id: string; name: string; email: string; username: string | null; role: Role; isActive: boolean };
  isSelf?: boolean;
  emailEnabled: boolean;
};


export default function UserForm({ mode, user, isSelf = false, emailEnabled }: UserFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [role, setRole] = useState<Role>(user?.role ?? "AUTHOR");
  const [passwordMode, setPasswordMode] = useState<"password" | "invite">("password");
  const [invite, setInvite] = useState<{ id: string; url: string; emailed: boolean; emailError?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);
    const formData = new FormData(e.currentTarget);

    try {
      if (mode === "create") {
        const result = await createUser(formData);
        if (!result.ok) {
          setError(result.error);
          setFieldErrors(result.fieldErrors ?? {});
        } else if (result.invite) {
          setInvite({ id: result.id, ...result.invite });
        } else {
          router.push(`/dashboard/users/${result.id}?created=1`);
          return;
        }
      } else if (user) {
        const result = await updateUser(user.id, formData);
        if (!result.ok) {
          setError(result.error);
          setFieldErrors(result.fieldErrors ?? {});
        } else {
          setSaved(true);
          router.refresh();
        }
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    }
    setPending(false);
  }

  if (invite) {
    return (
      <div className={`${cardClass} max-w-[720px]`}>
        <span className="flex h-48 w-48 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={22} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h2 className={`${cardTitleClass} mt-16`}>Account created</h2>
        <p className="mt-8 text-p3 font-light text-neutral-5">
          {invite.emailed
            ? "The invitation email is on its way. You can also copy the link below and send it yourself."
            : "Send this link to the new user so they can choose their password. It works once and expires in 7 days."}
        </p>
        {invite.emailError && <p className="mt-12 text-p4 text-warning">{invite.emailError}</p>}
        <div className="mt-20">
          <CopyField value={invite.url} label="Invitation link" />
        </div>
        <div className="mt-24 flex flex-wrap gap-12">
          <Link href={`/dashboard/users/${invite.id}`} className={primaryButton}>
            Open their account
          </Link>
          <Link
            href="/dashboard/users"
            className="inline-flex items-center rounded-full border border-neutral-10 px-24 py-14 text-btn-sm font-semibold uppercase tracking-[0.5px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary"
          >
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  const describedBy = (id: string, err?: string) => [id, err && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-24">
      {error && (
        <div role="alert" className={noticeClass.error}>
          {error}
        </div>
      )}
      {saved && (
        <div role="status" className={noticeClass.success}>
          Changes saved.
        </div>
      )}

      <section className={cardClass} aria-labelledby="profile-heading">
        <h2 id="profile-heading" className={cardTitleClass}>
          Profile
        </h2>
        <div className="mt-24 grid gap-20 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel htmlFor="name" required>
              Full name
            </FieldLabel>
            <TextInput
              id="name"
              name="name"
              defaultValue={user?.name}
              required
              autoComplete="off"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            <FieldError id="name-error">{fieldErrors.name}</FieldError>
          </div>
          <div>
            <FieldLabel htmlFor="email" required>
              Email address
            </FieldLabel>
            <TextInput
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email}
              required
              autoComplete="off"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={describedBy("email-hint", fieldErrors.email)}
            />
            <FieldHint id="email-hint">Used to sign in and for password emails.</FieldHint>
            <FieldError id="email-hint-error">{fieldErrors.email}</FieldError>
          </div>
          <div>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <div className="relative">
              <span aria-hidden="true" className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 text-p3 text-neutral-6">
                @
              </span>
              <TextInput
                id="username"
                name="username"
                defaultValue={user?.username ?? ""}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="pl-36"
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby={describedBy("username-hint", fieldErrors.username)}
              />
            </div>
            <FieldHint id="username-hint">Optional — lets them sign in without typing their email.</FieldHint>
            <FieldError id="username-hint-error">{fieldErrors.username}</FieldError>
          </div>
        </div>
      </section>

      <section className={cardClass} aria-labelledby="role-heading">
        <h2 id="role-heading" className={cardTitleClass}>
          Role & access
        </h2>
        <p className="mt-6 text-p4 font-light text-neutral-5">
          {isSelf
            ? "You can't change your own role — ask another Admin."
            : "Decides which parts of the dashboard this person can open. See Users → Roles & permissions for the full list."}
        </p>
        <fieldset className="mt-20" disabled={isSelf}>
          <legend className="sr-only">Role</legend>
          <div className="grid gap-12 md:grid-cols-2">
            {ROLES.map((r) => (
              <label
                key={r}
                className={[
                  "flex cursor-pointer gap-12 rounded-12 border p-16 transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                  role === r ? "border-primary bg-surface-1/60" : "border-neutral-10 hover:border-neutral-8",
                  isSelf ? "cursor-not-allowed opacity-70" : "",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="mt-4 h-16 w-16 shrink-0 accent-primary"
                />
                <span>
                  <span className="block text-p3 font-medium text-neutral-1">{ROLE_META[r].label}</span>
                  <span className="mt-2 block text-p4 font-light leading-snug text-neutral-5">{ROLE_META[r].summary}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {/* Disabled radios aren't submitted; the server keeps your own role regardless. */}
        {isSelf && <input type="hidden" name="role" value={role} />}
        <FieldError>{fieldErrors.role}</FieldError>

        {mode === "edit" && !isSelf ? (
          <label className="mt-24 flex cursor-pointer items-start gap-12 border-t border-neutral-10 pt-20">
            <input type="checkbox" name="isActive" defaultChecked={user?.isActive} className="mt-4 h-16 w-16 accent-primary" />
            <span>
              <span className="block text-p3 font-medium text-neutral-1">Account active</span>
              <span className="block text-p4 font-light text-neutral-5">
                Untick to block sign-in without deleting anything. They&apos;re signed out immediately.
              </span>
            </span>
          </label>
        ) : (
          <input type="hidden" name="isActive" value="on" />
        )}
      </section>

      {mode === "create" && (
        <section className={cardClass} aria-labelledby="signin-heading">
          <h2 id="signin-heading" className={cardTitleClass}>
            How they&apos;ll sign in
          </h2>
          <fieldset className="mt-20">
            <legend className="sr-only">Password setup</legend>
            <div className="grid gap-12 md:grid-cols-2">
              {[
                {
                  value: "password" as const,
                  icon: KeyRound,
                  title: "Set a password now",
                  text: "You choose the password and share it with them.",
                },
                {
                  value: "invite" as const,
                  icon: Mail,
                  title: "Send an invitation link",
                  text: "They choose their own password with a 7-day link.",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={[
                    "flex cursor-pointer gap-12 rounded-12 border p-16 transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                    passwordMode === option.value ? "border-primary bg-surface-1/60" : "border-neutral-10 hover:border-neutral-8",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="passwordMode"
                    value={option.value}
                    checked={passwordMode === option.value}
                    onChange={() => setPasswordMode(option.value)}
                    className="sr-only"
                  />
                  <option.icon size={20} strokeWidth={1.5} aria-hidden="true" className="mt-2 shrink-0 text-primary" />
                  <span>
                    <span className="block text-p3 font-medium text-neutral-1">{option.title}</span>
                    <span className="mt-2 block text-p4 font-light text-neutral-5">{option.text}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-24">
            {passwordMode === "password" ? (
              <div className="max-w-[480px]">
                <FieldLabel htmlFor="password" required>
                  Password
                </FieldLabel>
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  showStrength
                  allowGenerate
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
                <FieldError id="password-error">{fieldErrors.password}</FieldError>
              </div>
            ) : (
              <label className={`flex items-start gap-12 ${emailEnabled ? "cursor-pointer" : "cursor-not-allowed"}`}>
                <input
                  type="checkbox"
                  name="sendEmail"
                  defaultChecked={emailEnabled}
                  disabled={!emailEnabled}
                  className="mt-4 h-16 w-16 accent-primary"
                />
                <span>
                  <span className={`block text-p3 font-medium ${emailEnabled ? "text-neutral-1" : "text-neutral-6"}`}>
                    Email the invitation to them
                  </span>
                  <span className="block text-p4 font-light text-neutral-5">
                    {emailEnabled
                      ? "You'll also get the link to copy, in case it lands in spam."
                      : "Email isn't set up on this server yet (Settings → Email), so you'll get a link to copy and send yourself."}
                  </span>
                </span>
              </label>
            )}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-12">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : mode === "create" ? "Create user" : "Save changes"}
        </button>
        <Link
          href="/dashboard/users"
          className="rounded-full px-16 py-14 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5 transition-colors duration-200 hover:text-neutral-1"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
