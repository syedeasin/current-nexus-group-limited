"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { submitContact, type ContactErrorKey } from "@/lib/inquiries/actions";
import { INQUIRY_TOPICS } from "@/lib/inquiries/topics";

const INPUT_CLASS =
  "w-full rounded-12 border border-neutral-10 bg-white px-16 py-14 text-p3 text-neutral-1 outline-none transition-colors duration-200 placeholder:text-neutral-7 focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[invalid=true]:border-error";

function Field({
  id,
  label,
  required,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-8 block text-p4 font-medium text-neutral-3">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-4 text-error">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-6 text-p4 text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const [errorKey, setErrorKey] = useState<ContactErrorKey | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ContactErrorKey[]>([]);
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
        if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
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

  const err = (key: ContactErrorKey) => (fieldErrors.includes(key) ? t(`errors.${key}`) : undefined);
  const aria = (key: ContactErrorKey) =>
    fieldErrors.includes(key) ? { "aria-invalid": true, "aria-describedby": `contact-${key}-error` } : {};
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
        <Field id="contact-name" label={t("nameLabel")} required error={err("name")}>
          <input id="contact-name" name="name" autoComplete="name" required maxLength={100} className={INPUT_CLASS} {...aria("name")} />
        </Field>
        <Field id="contact-email" label={t("emailLabel")} required error={err("email")}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className={INPUT_CLASS}
            {...aria("email")}
          />
        </Field>
        <Field id="contact-company" label={t("companyLabel")}>
          <input id="contact-company" name="company" autoComplete="organization" maxLength={120} className={INPUT_CLASS} />
        </Field>
        <Field id="contact-phone" label={t("phoneLabel")}>
          <input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} className={INPUT_CLASS} />
        </Field>
        <Field id="contact-topic" label={t("topicLabel")} required error={err("topic")} className="md:col-span-2">
          <select id="contact-topic" name="topic" required defaultValue="" className={INPUT_CLASS} {...aria("topic")}>
            <option value="" disabled>
              {t("topicPlaceholder")}
            </option>
            {INQUIRY_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {t(`topics.${topic}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field id="contact-message" label={t("messageLabel")} required error={err("message")} className="md:col-span-2">
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            maxLength={5000}
            placeholder={t("messagePlaceholder")}
            className={`${INPUT_CLASS} resize-y`}
            {...aria("message")}
          />
        </Field>
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
