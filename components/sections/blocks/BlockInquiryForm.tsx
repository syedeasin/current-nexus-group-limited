"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, CircleCheck } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import TopHeavyText from "@/components/ui/TopHeavyText";
import { Field, FieldControl } from "@/components/sections/contact/FormFields";
import { INQUIRY_PREFILL_EVENT } from "@/components/sections/blocks/RouteSelector";
import { submitBlockInquiry, type ContactErrorKey, type ContactFieldError } from "@/lib/inquiries/actions";
import { readContactFields } from "@/lib/inquiries/form-fields";
import { entries, str } from "@/lib/page-content/read";
import type { MessageTree } from "@/lib/page-content/tree";
import { cascade } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

/** Field a route card pre-selects when the section names none. */
const DEFAULT_PREFILL_FIELD = "projectGoal";

/**
 * Inquiry section of a content-block page: heading, intro and an optional
 * "what to prepare" checklist beside a form whose fields are edited in
 * Dashboard → Pages. Validation and error texts are shared with the Contact
 * form; the privacy line under the button replaces the consent checkbox.
 */
export default function BlockInquiryForm({
  pageKey,
  sectionId,
  data,
  tone = "muted",
}: {
  pageKey: string;
  sectionId: string;
  data: MessageTree;
  /** Section background; the form card and checklist switch to grey on white. */
  tone?: "white" | "muted";
}) {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [errorKey, setErrorKey] = useState<ContactErrorKey | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldError[]>([]);
  const [sent, setSent] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);

  const fields = readContactFields(data.fields);
  const checklist = entries(data.items)
    .map(([id, item]) => ({ id, text: str(item, "text") }))
    .filter((item) => item.text);
  const prefillField = str(data, "prefillField") || DEFAULT_PREFILL_FIELD;
  const idPrefix = `${pageKey}-${sectionId}`;

  // A replacement-route card names the visitor's goal; pre-select it.
  useEffect(() => {
    let timer: number | undefined;
    function onPrefill(event: Event) {
      const goal = (event as CustomEvent<string>).detail;
      const control = formRef.current?.elements.namedItem(prefillField);
      if (control instanceof HTMLSelectElement && [...control.options].some((option) => option.value === goal)) {
        control.value = goal;
        setHighlight(prefillField);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setHighlight(null), 2400);
      }
    }
    window.addEventListener(INQUIRY_PREFILL_EVENT, onPrefill);
    return () => {
      window.removeEventListener(INQUIRY_PREFILL_EVENT, onPrefill);
      window.clearTimeout(timer);
    };
  }, [prefillField]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setErrorKey(null);
    setFieldErrors([]);
    try {
      const result = await submitBlockInquiry(locale, pageKey, formData);
      if (result.ok) {
        setSent(true);
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
  const heading = str(data, "heading");

  return (
    <section id={sectionId} aria-label={heading} className={cn("w-full scroll-mt-96", tone === "white" ? "bg-white" : "bg-surface-2")}>
      <Container className="grid gap-40 py-64 md:py-80 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-80 xl:py-120">
        <div className="flex flex-col gap-24 lg:sticky lg:top-120 lg:self-start">
          <div className="flex flex-col gap-12">
            {str(data, "eyebrow") ? (
              <Reveal as="div" delay={cascade(0)}>
                <SectionEyebrow label={str(data, "eyebrow")} />
              </Reveal>
            ) : null}
            <TextReveal delay={cascade(1)}>
              <Heading level={2} size="h2" className="text-balance">
                {heading}
              </Heading>
            </TextReveal>
          </div>
          {str(data, "body") ? (
            <Reveal as="div" delay={cascade(2)}>
              <TopHeavyText className="text-p3 text-neutral-3">{str(data, "body")}</TopHeavyText>
            </Reveal>
          ) : null}
          {checklist.length > 0 ? (
            <Reveal as="div" delay={cascade(3)} className={cn("flex flex-col gap-16 rounded-20 border border-neutral-10 p-24", tone === "white" ? "bg-surface-2" : "bg-white")}>
              {str(data, "checklistTitle") ? <h3 className="text-h6 font-semibold text-neutral-1">{str(data, "checklistTitle")}</h3> : null}
              <ul className="flex flex-col gap-12">
                {checklist.map((item) => (
                  <li key={item.id} className="flex items-start gap-12 text-p3 text-neutral-2">
                    <CircleCheck size={20} aria-hidden="true" className="mt-2 shrink-0 text-secondary" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              {str(data, "checklistNote") ? <p className="border-t border-neutral-10 pt-16 text-p4 text-neutral-4">{str(data, "checklistNote")}</p> : null}
            </Reveal>
          ) : null}
        </div>

        {sent ? (
          <div role="status" className={cn("flex flex-col items-start gap-16 self-start rounded-24 border border-neutral-10 p-32 md:p-48", tone === "white" ? "bg-surface-2" : "bg-white")}>
            <span className="flex size-56 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={28} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3 className="text-h4 font-semibold text-neutral-1">{str(data, "successHeading") || t("successHeading")}</h3>
            <p className="text-p3 text-neutral-3">{str(data, "successBody")}</p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-8 text-p3 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t("sendAnother")}
            </button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} noValidate className={cn("relative self-start rounded-24 border border-neutral-10 p-24 md:p-40 xl:p-48", tone === "white" ? "bg-surface-2" : "bg-white")}>
            {str(data, "formTitle") ? <h3 className="mb-8 text-h5 font-semibold text-neutral-1">{str(data, "formTitle")}</h3> : null}
            <p className="text-p4 text-neutral-5">{t("requiredNote")}</p>

            {bannerError && (
              <p role="alert" className="mt-20 rounded-12 border border-error/30 bg-error/5 px-16 py-12 text-p4 text-error">
                {bannerError}
              </p>
            )}

            <div className="mt-24 grid gap-20 md:grid-cols-2">
              {fields.map((field) => (
                <Field
                  key={field.id}
                  id={`${idPrefix}-${field.id}`}
                  label={field.label}
                  required={field.required}
                  hint={field.type === "file" ? t("fileHint") : undefined}
                  error={err(field.id)}
                  className={cn(
                    field.fullWidth || field.type === "file" ? "md:col-span-2" : "",
                    "rounded-12 transition-shadow duration-300",
                    highlight === field.id && "shadow-[0_0_0_4px_rgba(213,172,93,0.4)]"
                  )}
                >
                  <FieldControl
                    field={field}
                    idPrefix={idPrefix}
                    invalid={Boolean(err(field.id))}
                    describedBy={err(field.id) ? `${idPrefix}-${field.id}-error` : undefined}
                  />
                </Field>
              ))}
            </div>

            {/* Honeypot: hidden from people and assistive tech; bots fill every field. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={`${idPrefix}-website`}>Website</label>
              <input id={`${idPrefix}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <input type="hidden" name="sourcePath" value={pathname} />

            <button
              type="submit"
              disabled={pending}
              className="mt-32 inline-flex h-60 w-full items-center justify-center gap-8 rounded-full bg-secondary px-32 text-btn-lg font-semibold text-neutral-1 transition-colors duration-200 hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {pending ? t("sending") : str(data, "submitLabel") || t("submit")}
            </button>
            {str(data, "privacy") ? (
              <p className="mt-16 text-p4 text-neutral-5">
                {str(data, "privacy")}{" "}
                {str(data, "privacyLinkLabel") && str(data, "privacyHref") ? (
                  <Link href={str(data, "privacyHref")} className="font-medium text-neutral-2 underline underline-offset-4 hover:text-primary">
                    {str(data, "privacyLinkLabel")}
                  </Link>
                ) : null}
              </p>
            ) : null}
          </form>
        )}
      </Container>
    </section>
  );
}
