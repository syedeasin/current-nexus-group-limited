"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FieldLabel from "@/components/dashboard/form/field-label";
import FieldError from "@/components/dashboard/form/field-error";
import PasswordInput from "@/components/dashboard/form/password-input";
import { cardClass, cardTitleClass, noticeClass, primaryButtonClass } from "@/components/dashboard/ui-classes";
import { changePassword, type FormResult } from "./actions";

export default function PasswordForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);
  // Remounts the fields after a successful change so nothing stays filled in.
  const [formKey, setFormKey] = useState(0);
  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {};

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const next = await changePassword(new FormData(e.currentTarget));
      setResult(next);
      if (next.ok) {
        setFormKey((k) => k + 1);
        router.refresh();
      }
    } catch {
      setResult({ ok: false, error: "Couldn't reach the server. Check your connection and try again." });
    }
    setPending(false);
  }

  const fields = [
    { id: "currentPassword", label: "Current password", autoComplete: "current-password", strength: false },
    { id: "newPassword", label: "New password", autoComplete: "new-password", strength: true },
    { id: "confirmPassword", label: "Confirm new password", autoComplete: "new-password", strength: false },
  ];

  return (
    <form key={formKey} onSubmit={handleSubmit} noValidate className={cardClass} aria-labelledby="password-title">
      <h2 id="password-title" className={cardTitleClass}>
        Change password
      </h2>
      <p className="mt-6 text-p4 font-light text-neutral-5">
        You stay signed in here; every other device and browser is signed out.
      </p>

      {result && (
        <div role={result.ok ? "status" : "alert"} className={`mt-20 ${result.ok ? noticeClass.success : noticeClass.error}`}>
          {result.ok ? result.message : result.error}
        </div>
      )}

      {/* Lets password managers attach the new password to the right account. */}
      <input type="text" name="username" autoComplete="username" className="hidden" aria-hidden="true" tabIndex={-1} readOnly />

      <div className="mt-24 max-w-[480px] space-y-20">
        {fields.map((field) => (
          <div key={field.id}>
            <FieldLabel htmlFor={field.id} required>
              {field.label}
            </FieldLabel>
            <PasswordInput
              id={field.id}
              name={field.id}
              autoComplete={field.autoComplete}
              showStrength={field.strength}
              allowGenerate={field.strength}
              aria-invalid={Boolean(fieldErrors[field.id])}
              aria-describedby={fieldErrors[field.id] ? `${field.id}-error` : undefined}
            />
            <FieldError id={`${field.id}-error`}>{fieldErrors[field.id]}</FieldError>
          </div>
        ))}
      </div>

      <button type="submit" disabled={pending} className={`${primaryButtonClass} mt-28`}>
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
