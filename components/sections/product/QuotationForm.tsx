"use client";

import { useId, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { cn } from "@/lib/utils";
import type { QuotationFormSection } from "@/lib/data/products/types";

const COUNTRIES = [
  "United States", "United Kingdom", "Germany", "France", "Spain", "Italy", "Netherlands",
  "Poland", "Australia", "Brazil", "Mexico", "South Africa", "United Arab Emirates",
  "Saudi Arabia", "India", "Japan", "South Korea", "Vietnam", "Philippines", "Indonesia",
  "Malaysia", "Thailand", "Chile", "Colombia", "Egypt", "Turkey", "Hong Kong", "China",
  "Canada", "Other",
] as const;

interface FormValues {
  fullName: string;
  email: string;
  company: string;
  country: string;
  phone: string;
  productInterest: string;
  targetPowerRange: string;
  quantity: string;
  projectTimeline: string;
  message: string;
  consent: boolean;
}

const INITIAL_VALUES: FormValues = {
  fullName: "",
  email: "",
  company: "",
  country: "",
  phone: "",
  productInterest: "",
  targetPowerRange: "",
  quantity: "",
  projectTimeline: "",
  message: "",
  consent: false,
};

type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Phase 1 stub — logs the payload. Real delivery (email/database) is a follow-up task. */
async function submitInquiryStub(payload: FormValues): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.info("[QuotationForm] stub submit — payload:", payload);
}

const inputBaseClass =
  "h-60 w-full rounded-8 border-[1.5px] bg-white px-20 py-18 text-p3 text-neutral-4 outline-none transition-colors duration-150 ease-out placeholder:text-neutral-6 focus-visible:ring-2 focus-visible:ring-secondary";

export default function QuotationForm({ data }: { data: QuotationFormSection }) {
  const baseId = useId();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): Partial<Record<keyof FormValues, string>> {
    const next: Partial<Record<keyof FormValues, string>> = {};
    if (!values.fullName.trim()) next.fullName = "Full name is required.";
    if (!values.email.trim()) next.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(values.email)) next.email = "Enter a valid email address.";
    if (!values.country.trim()) next.country = "Select a country.";
    if (!values.phone.trim()) next.phone = "Phone number is required.";
    if (!values.consent) next.consent = "Please accept the privacy policy to continue.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("submitting");
    try {
      await submitInquiryStub(values);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function fieldError(key: keyof FormValues) {
    return errors[key];
  }

  function errorId(key: keyof FormValues) {
    return `${baseId}-${key}-error`;
  }

  if (status === "success") {
    return (
      <section
        id="quotation"
        className="w-full bg-white pt-48 pb-48 md:pt-64 md:pb-64 xl:pt-80 xl:pb-100"
      >
        <Container className="flex flex-col items-center gap-48">
          <div className="mx-auto flex max-w-660 flex-col items-center gap-12 text-center">
            <SectionEyebrow label={data.eyebrow} />
            {/* Figma node 114:99537: H2 here tracks -1.2px, not the shared --text-h2 token's -0.72px. */}
            <Heading level={2} size="h2" className="text-balance tracking-[-1.2px]!">
              {data.heading}
            </Heading>
          </div>
          <div className="flex w-full max-w-840 flex-col items-center gap-16 rounded-16 border border-neutral-10 bg-surface-2 p-48 text-center">
            <Heading level={3} size="h5">
              Thanks — your inquiry is in.
            </Heading>
            <Text size="p1" className="text-neutral-3">
              A CNX specialist will follow up shortly at {values.email || "the email you provided"}.
            </Text>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      id="quotation"
      className="w-full bg-white pt-48 pb-48 md:pt-64 md:pb-64 xl:pt-80 xl:pb-100"
    >
      <Container className="flex flex-col gap-48">
        <div className="mx-auto flex max-w-660 flex-col items-center gap-12 text-center">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={data.eyebrow} />
          </Reveal>
          <TextReveal delay={80}>
            {/* Figma node 114:99537: H2 here tracks -1.2px, not the shared --text-h2 token's -0.72px. */}
            <Heading level={2} size="h2" className="text-balance tracking-[-1.2px]!">
              {data.heading}
            </Heading>
          </TextReveal>
        </div>

        <Reveal as="div" delay={160} className="mx-auto w-full max-w-840">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-32 rounded-16 border border-neutral-10 bg-surface-2 p-24 md:p-32 lg:p-48"
          >
            {status === "error" ? (
              <div className="rounded-8 border border-error/30 bg-error/5 px-20 py-16 text-p3 text-error">
                Something went wrong sending your inquiry. Please try again.
              </div>
            ) : null}

            <div className="flex flex-col gap-16 md:flex-row">
              <Field label="Full Name" required error={fieldError("fullName")} errorId={errorId("fullName")}>
                <input
                  type="text"
                  value={values.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  aria-invalid={!!fieldError("fullName")}
                  aria-describedby={fieldError("fullName") ? errorId("fullName") : undefined}
                  className={cn(inputBaseClass, fieldError("fullName") ? "border-error" : "border-neutral-10")}
                />
              </Field>
              <Field label="Email" required error={fieldError("email")} errorId={errorId("email")}>
                <input
                  type="email"
                  value={values.email}
                  onChange={(e) => update("email", e.target.value)}
                  aria-invalid={!!fieldError("email")}
                  aria-describedby={fieldError("email") ? errorId("email") : undefined}
                  className={cn(inputBaseClass, fieldError("email") ? "border-error" : "border-neutral-10")}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-16 md:flex-row">
              <Field label="Company">
                <input
                  type="text"
                  value={values.company}
                  onChange={(e) => update("company", e.target.value)}
                  className={cn(inputBaseClass, "border-neutral-10")}
                />
              </Field>
              <Field label="Country" required error={fieldError("country")} errorId={errorId("country")}>
                <select
                  value={values.country}
                  onChange={(e) => update("country", e.target.value)}
                  aria-invalid={!!fieldError("country")}
                  aria-describedby={fieldError("country") ? errorId("country") : undefined}
                  className={cn(inputBaseClass, fieldError("country") ? "border-error" : "border-neutral-10")}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex flex-col gap-16 md:flex-row">
              <Field label="Phone number" required error={fieldError("phone")} errorId={errorId("phone")}>
                <input
                  type="tel"
                  value={values.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  aria-invalid={!!fieldError("phone")}
                  aria-describedby={fieldError("phone") ? errorId("phone") : undefined}
                  className={cn(inputBaseClass, fieldError("phone") ? "border-error" : "border-neutral-10")}
                />
              </Field>
              <Field label="Product interest">
                <select
                  value={values.productInterest}
                  onChange={(e) => update("productInterest", e.target.value)}
                  className={cn(inputBaseClass, "border-neutral-10")}
                >
                  <option value="">{data.productInterestPlaceholder}</option>
                  {data.productInterestOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex flex-col gap-16 md:flex-row">
              <Field label="Target power range">
                <input
                  type="text"
                  value={values.targetPowerRange}
                  onChange={(e) => update("targetPowerRange", e.target.value)}
                  className={cn(inputBaseClass, "border-neutral-10")}
                />
              </Field>
              <Field label="Quantity / MW">
                <input
                  type="text"
                  value={values.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  className={cn(inputBaseClass, "border-neutral-10")}
                />
              </Field>
            </div>

            <Field label="Project timeline">
              <input
                type="text"
                value={values.projectTimeline}
                onChange={(e) => update("projectTimeline", e.target.value)}
                className={cn(inputBaseClass, "border-neutral-10")}
              />
            </Field>

            <Field label="Message">
              <textarea
                value={values.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Type here.."
                className={cn(inputBaseClass, "h-122 resize-none border-neutral-10 py-18")}
              />
            </Field>

            <div className="flex flex-col gap-8">
              <label className="flex items-start gap-12 text-p4 text-neutral-3">
                <input
                  type="checkbox"
                  checked={values.consent}
                  onChange={(e) => update("consent", e.target.checked)}
                  aria-invalid={!!fieldError("consent")}
                  aria-describedby={fieldError("consent") ? errorId("consent") : undefined}
                  className="mt-2 size-16 shrink-0 rounded-4 border-neutral-10 text-secondary focus-visible:ring-2 focus-visible:ring-secondary"
                />
                <span>
                  I agree to the processing of my data in accordance with the{" "}
                  <Link href="/privacy" className="font-medium text-neutral-1 underline underline-offset-2">
                    privacy policy
                  </Link>
                  .
                </span>
              </label>
              {fieldError("consent") ? (
                <p id={errorId("consent")} className="text-p4 text-error">
                  {fieldError("consent")}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              // Figma node 114:99595: button text tracks -1px, not the shared --text-btn-lg token's -0.2px.
              className="flex h-60 w-full items-center justify-center gap-8 rounded-full bg-secondary text-btn-lg font-semibold tracking-[-1px]! text-neutral-1 outline-none transition-colors duration-150 ease-out hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 size={20} className="animate-spin motion-reduce:animate-none" />
                  Sending…
                </>
              ) : (
                <>
                  Submit inquiry
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>
        </Reveal>
      </Container>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  errorId,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      {/* Figma node 114:99537: label tracks 0px, not the shared --text-p3 token's -0.09px. */}
      <span className="text-p3 tracking-[0px]! text-neutral-1">
        {label}
        {required ? <span className="text-secondary"> *</span> : null}
      </span>
      {children}
      {error ? (
        <p id={errorId} className="text-p4 text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
