"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FieldLabel from "@/components/dashboard/form/field-label";
import FieldHint from "@/components/dashboard/form/field-hint";
import FieldError from "@/components/dashboard/form/field-error";
import TextInput from "@/components/dashboard/form/text-input";
import { cardClass, cardTitleClass, noticeClass, primaryButtonClass } from "@/components/dashboard/ui-classes";
import { saveSiteSettings, type FormResult } from "./actions";

type Props = {
  settings: { siteUrl: string; allowIndexing: boolean; inquiryEmail: string };
  /** Where Contact-page messages go when "Send enquiries to" is empty. */
  contactEmail: string;
  /** What links use when Site address is left empty. */
  fallbackUrl: string;
};

export default function SiteSettingsForm({ settings, fallbackUrl, contactEmail }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);
  const [allowIndexing, setAllowIndexing] = useState(settings.allowIndexing);
  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {};

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const next = await saveSiteSettings(new FormData(e.currentTarget));
      setResult(next);
      if (next.ok) router.refresh();
    } catch {
      setResult({ ok: false, error: "Couldn't reach the server. Check your connection and try again." });
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cardClass} aria-labelledby="site-title">
      <h2 id="site-title" className={cardTitleClass}>
        Website
      </h2>

      {result && (
        <div role={result.ok ? "status" : "alert"} className={`mt-20 ${result.ok ? noticeClass.success : noticeClass.error}`}>
          {result.ok ? result.message : result.error}
        </div>
      )}

      <div className="mt-24 max-w-[560px]">
        <FieldLabel htmlFor="siteUrl">Site address for email links</FieldLabel>
        <TextInput
          id="siteUrl"
          name="siteUrl"
          type="url"
          inputMode="url"
          placeholder={fallbackUrl}
          defaultValue={settings.siteUrl}
          aria-invalid={Boolean(fieldErrors.siteUrl)}
          aria-describedby={["siteUrl-hint", fieldErrors.siteUrl && "siteUrl-error"].filter(Boolean).join(" ")}
        />
        <FieldHint id="siteUrl-hint">
          Password-reset and invitation emails link here. While the domain isn&apos;t connected yet, enter the
          server&apos;s address (e.g. http://your-server-ip). Leave empty to use {fallbackUrl}.
        </FieldHint>
        <FieldError id="siteUrl-error">{fieldErrors.siteUrl}</FieldError>
      </div>

      <div className="mt-24 max-w-[560px]">
        <FieldLabel htmlFor="inquiryEmail">Send Contact-page messages to</FieldLabel>
        <TextInput
          id="inquiryEmail"
          name="inquiryEmail"
          type="email"
          placeholder={contactEmail}
          defaultValue={settings.inquiryEmail}
          aria-invalid={Boolean(fieldErrors.inquiryEmail)}
          aria-describedby={["inquiryEmail-hint", fieldErrors.inquiryEmail && "inquiryEmail-error"].filter(Boolean).join(" ")}
        />
        <FieldHint id="inquiryEmail-hint">
          Every message is also kept in Dashboard → Inquiries. Leave empty to use the public contact email ({contactEmail}).
          Needs email delivery to be set up.
        </FieldHint>
        <FieldError id="inquiryEmail-error">{fieldErrors.inquiryEmail}</FieldError>
      </div>

      <div className="mt-28 border-t border-neutral-10 pt-24">
        <label className="flex cursor-pointer items-start justify-between gap-24">
          <span>
            <span className="block text-p3 font-medium text-neutral-1">Let search engines index the website</span>
            <span className="mt-2 block max-w-[560px] text-p4 font-light text-neutral-5">
              Turn off while the site is being prepared: robots.txt then asks every search engine to stay away from the
              whole site. Turn it back on at launch.
            </span>
          </span>
          <span className="relative mt-4 inline-flex shrink-0">
            <input
              type="checkbox"
              name="allowIndexing"
              checked={allowIndexing}
              onChange={(e) => setAllowIndexing(e.target.checked)}
              role="switch"
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="h-28 w-48 rounded-full bg-neutral-9 transition-colors duration-200 peer-checked:bg-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
            />
            <span
              aria-hidden="true"
              className="absolute left-3 top-3 h-22 w-22 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-20"
            />
          </span>
        </label>
        <p className={`mt-12 text-p4 font-medium ${allowIndexing ? "text-success" : "text-warning"}`}>
          {allowIndexing ? "Search engines are allowed." : "Search engines are blocked."}
        </p>
      </div>

      <button type="submit" disabled={pending} className={`${primaryButtonClass} mt-28`}>
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
