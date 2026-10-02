"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { subscribeNewsletter } from "@/lib/inquiries/actions";

type Labels = {
  label: string;
  placeholder: string;
  subscribe: string;
  success: string;
  invalid: string;
  failed: string;
};

/** Footer newsletter sign-up; entries land in Dashboard → Inquiries → Newsletter. */
export default function NewsletterForm({ labels }: { labels: Labels }) {
  const locale = useLocale();
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "pending" | "done" | "invalid" | "failed">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("pending");
    try {
      const result = await subscribeNewsletter(locale, new FormData(form));
      if (result.ok) {
        form.reset();
        setState("done");
      } else {
        setState(result.error);
      }
    } catch {
      setState("failed");
    }
  }

  const message =
    state === "done" ? labels.success : state === "invalid" ? labels.invalid : state === "failed" ? labels.failed : "";

  return (
    <div className="flex w-full flex-col gap-16 lg:max-w-480">
      <label htmlFor="footer-newsletter-email" className="text-p3 font-normal text-neutral-6">
        {labels.label}
      </label>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative flex w-full items-center gap-24 rounded-full bg-neutral-2 py-6 pl-32 pr-6"
      >
        <input
          id="footer-newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={labels.placeholder}
          aria-invalid={state === "invalid" || undefined}
          aria-describedby={message ? "footer-newsletter-status" : undefined}
          className="min-w-0 flex-1 bg-transparent text-p4 text-white placeholder:text-neutral-7 focus:outline-none"
        />
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <input type="hidden" name="sourcePath" value={pathname} />
        <button
          type="submit"
          disabled={state === "pending"}
          className="shrink-0 rounded-full bg-secondary px-24 py-12 text-btn-sm font-semibold text-neutral-1 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-60"
        >
          {labels.subscribe}
        </button>
      </form>
      <p
        id="footer-newsletter-status"
        role="status"
        className={`min-h-20 text-p4 ${state === "done" ? "text-secondary" : "text-[#f2b8b5]"}`}
      >
        {message}
      </p>
    </div>
  );
}
