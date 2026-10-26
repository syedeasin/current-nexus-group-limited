"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Container from "@/components/layout/Container";
import { Field, FieldControl } from "@/components/sections/contact/FormFields";
import { BRAND_QUOTE_EVENT } from "@/components/brands/BrandProducts";
import { submitBrandInquiry, type ContactErrorKey, type ContactFieldError } from "@/lib/inquiries/actions";
import { cascade } from "@/lib/motion/timing";
import type { BrandContent } from "@/lib/brands/content";

/** The field a product's "Request a Quote" fills in. */
const MODEL_FIELD_ID = "model";

/**
 * Final inquiry (brief §11). Fields are edited per brand in Dashboard → Tier 1
 * Brands → Final inquiry; validation messages, consent and success copy are
 * shared with the Contact form (Pages → Contact) so they're edited once.
 */
export default function BrandInquiryForm({ slug, data }: { slug: string; data: BrandContent["inquiry"] }) {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [errorKey, setErrorKey] = useState<ContactErrorKey | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldError[]>([]);
  const [sentTo, setSentTo] = useState<string | null>(null);

  // A product card's "Request a Quote" names its series here.
  useEffect(() => {
    function onQuote(event: Event) {
      const series = (event as CustomEvent<string>).detail;
      const input = formRef.current?.elements.namedItem(MODEL_FIELD_ID);
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        input.value = series;
      }
    }
    window.addEventListener(BRAND_QUOTE_EVENT, onQuote);
    return () => window.removeEventListener(BRAND_QUOTE_EVENT, onQuote);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setErrorKey(null);
    setFieldErrors([]);
    try {
      const result = await submitBrandInquiry(locale, slug, formData);
      if (result.ok) {
        setSentTo(String(formData.get("email") ?? ""));
        form.reset();
      } else {
        setErrorKey(result.error);
        setFieldErrors(result.fields ?? []);
        const first = result.fields?.[0];
        if (first) form.querySelector<HTMLElement>(`[name="${first.id}"]`)?.focus();
      }
    } catch {
      setErrorKey("generic");
    }
    setPending(false);
  }

  const err = (id: string) => {
    const found = fieldErrors.find((e) => e.id === id);
    return found ? t(`errors.${found.error}`) : undefined;
  };
  const bannerError = errorKey && fieldErrors.length === 0 ? t(`errors.${errorKey}`) : null;

  return (
    <section id="inquiry" aria-label={data.heading} className="w-full scroll-mt-96 bg-surface-2">
      <Container className="grid gap-40 py-48 md:py-64 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-80 xl:py-100">
        <div className="flex flex-col gap-24 lg:sticky lg:top-120 lg:self-start">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={data.eyebrow} />
          </Reveal>
          <TextReveal delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-balance tracking-[-1.2px]!">
              {data.heading}
            </Heading>
          </TextReveal>
          <Reveal as="div" delay={cascade(2)}>
            <Text size="p3" className="text-neutral-3">
              {data.body}
            </Text>
          </Reveal>
        </div>

        {sentTo !== null ? (
          <div role="status" className="flex flex-col items-start gap-16 rounded-24 bg-white p-32 md:p-48">
            <span className="flex size-56 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={28} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3 className="text-h4 font-semibold text-neutral-1">{t("successHeading")}</h3>
            <p className="text-p3 text-neutral-3">{t("successBody", { email: sentTo })}</p>
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="mt-8 text-p3 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t("sendAnother")}
            </button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="relative rounded-24 border border-neutral-10 bg-white p-24 md:p-40 xl:p-48">
            <p className="text-p4 text-neutral-5">{t("requiredNote")}</p>

            {bannerError && (
              <p role="alert" className="mt-20 rounded-12 border border-error/30 bg-error/5 px-16 py-12 text-p4 text-error">
                {bannerError}
              </p>
            )}

            <div className="mt-24 grid gap-20 md:grid-cols-2">
              {data.fields.map((field) => (
                <Field
                  key={field.id}
                  id={`brand-${field.id}`}
                  label={field.label}
                  required={field.required}
                  hint={field.type === "file" ? t("fileHint") : undefined}
                  error={err(field.id)}
                  className={field.fullWidth ? "md:col-span-2" : ""}
                >
                  <FieldControl
                    field={field}
                    idPrefix="brand"
                    invalid={Boolean(err(field.id))}
                    describedBy={err(field.id) ? `brand-${field.id}-error` : undefined}
                  />
                </Field>
              ))}
            </div>

            {/* Honeypot: hidden from people and assistive tech; bots fill every field. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="brand-website">Website</label>
              <input id="brand-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <input type="hidden" name="sourcePath" value={pathname} />

            <div className="mt-24">
              <label className="flex cursor-pointer items-start gap-12">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-4 size-18 shrink-0 accent-primary"
                  aria-invalid={Boolean(err("consent")) || undefined}
                  aria-describedby={err("consent") ? "brand-consent-error" : undefined}
                />
                <span className="text-p4 text-neutral-3">{t("consent")}</span>
              </label>
              {err("consent") && (
                <p id="brand-consent-error" className="mt-6 text-p4 text-error">
                  {err("consent")}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-32 inline-flex h-60 w-full items-center justify-center gap-8 rounded-full bg-secondary px-32 text-btn-lg font-semibold text-neutral-1 transition-colors duration-200 hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {pending ? t("sending") : data.submitLabel}
            </button>
          </form>
        )}
      </Container>
    </section>
  );
}
