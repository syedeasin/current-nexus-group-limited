"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { submitContact, type ContactErrorKey, type ContactFieldError } from "@/lib/inquiries/actions";
import { readContactFields } from "@/lib/inquiries/form-fields";
import { Field, FieldControl } from "@/components/sections/contact/FormFields";

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const [errorKey, setErrorKey] = useState<ContactErrorKey | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldError[]>([]);
  // Edited in Dashboard → Pages → Contact → Form fields.
  const fields = readContactFields(t.raw("fields" as never));
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setErrorKey(null);
    setFieldErrors([]);
    try {
      const result = await submitContact(locale, formData);
      if (result.ok) {
        setSentTo(String(formData.get("email") ?? ""));
        form.reset();
      } else {
        setErrorKey(result.error);
        setFieldErrors(result.fields ?? []);
        // Move focus to the first field that needs attention.
        const first = result.fields?.[0];
        if (first) form.querySelector<HTMLElement>(`[name="${first.id}"]`)?.focus();
      }
    } catch {
      setErrorKey("generic");
    }
    setPending(false);
  }

  if (sentTo !== null) {
    return (
      <div role="status" className="flex flex-col items-start gap-16 rounded-24 bg-surface-2 p-32 md:p-48">
        <span className="flex size-56 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={28} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h2 className="text-h4 font-semibold text-neutral-1">{t("successHeading")}</h2>
        <p className="text-p2 text-neutral-3">{t("successBody", { email: sentTo })}</p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="mt-8 text-p3 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  const err = (id: string) => {
    const found = fieldErrors.find((e) => e.id === id);
    return found ? t(`errors.${found.error}`) : undefined;
  };
  const aria = (id: string) => (err(id) ? { "aria-invalid": true, "aria-describedby": `contact-${id}-error` } : {});
  // Field-specific problems show under their fields; the banner covers the rest.
  const bannerError = errorKey && fieldErrors.length === 0 ? t(`errors.${errorKey}`) : null;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="contact-form-heading"
      className="rounded-24 bg-surface-2 p-24 md:p-40 xl:p-48"
    >
      <h2 id="contact-form-heading" className="text-h4 font-semibold text-neutral-1">
        {t("heading")}
      </h2>
      <p className="mt-8 text-p4 text-neutral-5">{t("requiredNote")}</p>

      {bannerError && (
        <p role="alert" className="mt-20 rounded-12 border border-error/30 bg-error/5 px-16 py-12 text-p4 text-error">
          {bannerError}
        </p>
      )}

      <div className="mt-28 grid gap-20 md:grid-cols-2">
        {fields.map((field) => (
          <Field
            key={field.id}
            id={`contact-${field.id}`}
            label={field.label}
            required={field.required}
            hint={field.type === "file" ? t("fileHint") : undefined}
            error={err(field.id)}
            className={field.fullWidth ? "md:col-span-2" : ""}
          >
            <FieldControl
              field={field}
              idPrefix="contact"
              invalid={Boolean(err(field.id))}
              describedBy={err(field.id) ? `contact-${field.id}-error` : undefined}
            />
          </Field>
        ))}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots fill every field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="sourcePath" value={pathname} />

      <div className="mt-24">
        <label className="flex cursor-pointer items-start gap-12">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-4 size-18 shrink-0 accent-primary"
            {...aria("consent")}
          />
          <span className="text-p4 text-neutral-3">{t("consent")}</span>
        </label>
        {err("consent") && (
          <p id="contact-consent-error" className="mt-6 text-p4 text-error">
            {err("consent")}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-32 inline-flex h-60 w-full items-center justify-center gap-8 rounded-full bg-secondary px-32 text-btn-lg font-semibold text-neutral-1 transition-colors duration-200 hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
