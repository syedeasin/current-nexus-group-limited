"use client";

import { useState } from "react";
import { ChevronDown, Loader2, CheckCircle2 } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

const DEFAULT_ROLES = [
  "Researcher",
  "Academic",
  "Librarian",
  "Writer",
  "Publisher",
  "Other (Please specify)",
];

const underlineBase =
    "w-full border-0 border-b bg-transparent py-4 font-mono text-[18px] tracking-[-0.9px] text-dark outline-none transition-colors placeholder:text-dark/70 disabled:opacity-60";

function fieldClass(hasError: boolean) {
  return `${underlineBase} ${hasError ? "border-red-500" : "border-dark focus:border-primary"}`;
}

export default function ResearchAccessForm({
  roles = DEFAULT_ROLES,
  materialsLabel = "our materials",
}: {
  /** Options for the role <select>. Last entry should stay an "Other" option to keep the roleOther field working. */
  roles?: string[]
  /** Fills the "how do you intend to use ___" copy, e.g. "our materials" or "the archive collection". */
  materialsLabel?: string
}) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    affiliation: "",
    role: "",
    roleOther: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const busy = formState === "submitting";
  const otherOption = roles[roles.length - 1];
  const isOther = values.role === otherOption;

  function update(name: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[name];
        return next;
      });
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!values.firstName.trim()) e.firstName = "Please enter your first name.";
    if (!values.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "That email address doesn't look right.";
    if (isOther && !values.roleOther.trim()) e.roleOther = "Please specify your role.";
    if (!values.message.trim()) e.message = "Please tell us how you intend to use the materials.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const firstKey = ["firstName", "email", "roleOther", "message"].find((k) => found[k]);
      if (firstKey) document.getElementById(firstKey)?.focus();
      return;
    }
    setFormState("submitting");
    try {
      await new Promise((r) => setTimeout(r, 800));
      setFormState("success");
    } catch {
      setFormState("error");
    }
  }

  function resetForm() {
    setValues({ firstName: "", lastName: "", email: "", affiliation: "", role: "", roleOther: "", message: "" });
    setErrors({});
    setFormState("idle");
  }

  if (formState === "success") {
    return (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="h-7 w-7" /></span>
          <p className="font-fjalla text-[32px] leading-tight text-primary">Request received.</p>
          <p className="max-w-[420px] font-mono text-[16px] leading-[26px] tracking-[-0.5px] text-dark/70">
            Thanks for reaching out. We review all requests on a rolling basis and will get back to you soon.
          </p>
          <button onClick={resetForm} className="mt-2 font-mono text-[14px] uppercase tracking-[1px] text-secondary underline-offset-4 hover:underline">
            Submit another request
          </button>
        </div>
    );
  }

  return (
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-[24px]">
          <div className="flex flex-1 flex-col">
            <label htmlFor="firstName" className="sr-only">First name (required)</label>
            <input id="firstName" type="text" value={values.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="First name" className={fieldClass(!!errors.firstName)} disabled={busy} aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? "firstName-err" : undefined} />
            {errors.firstName && <p id="firstName-err" className="mt-1 font-mono text-[12px] text-red-500">{errors.firstName}</p>}
          </div>
          <div className="flex flex-1 flex-col">
            <label htmlFor="lastName" className="sr-only">Last name</label>
            <input id="lastName" type="text" value={values.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Last name" className={fieldClass(false)} disabled={busy} />
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="sr-only">Email (required)</label>
          <input id="email" type="email" value={values.email} onChange={(e) => update("email", e.target.value)} placeholder="Email address" className={fieldClass(!!errors.email)} disabled={busy} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} />
          {errors.email && <p id="email-err" className="mt-1 font-mono text-[12px] text-red-500">{errors.email}</p>}
        </div>

        <div className="flex flex-col">
          <label htmlFor="affiliation" className="sr-only">Professional affiliation</label>
          <input id="affiliation" type="text" value={values.affiliation} onChange={(e) => update("affiliation", e.target.value)} placeholder="Professional affiliation" className={fieldClass(false)} disabled={busy} />
        </div>

        <div className="flex flex-col">
          <label htmlFor="role" className="sr-only">I&apos;m a</label>
          <div className="relative">
            <select id="role" value={values.role} onChange={(e) => update("role", e.target.value)} disabled={busy} className={`${fieldClass(false)} appearance-none pr-10 ${values.role ? "text-dark" : "text-dark/70"}`}>
              <option value="">Select your role</option>
              {roles.map((r) => (<option key={r} value={r} className="text-dark">{r}</option>))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/70" />
          </div>
        </div>

        {isOther && (
            <div className="flex flex-col">
              <label htmlFor="roleOther" className="sr-only">Please specify your role</label>
              <input id="roleOther" type="text" value={values.roleOther} onChange={(e) => update("roleOther", e.target.value)} placeholder="Please specify your role" className={fieldClass(!!errors.roleOther)} disabled={busy} aria-invalid={!!errors.roleOther} aria-describedby={errors.roleOther ? "roleOther-err" : undefined} />
              {errors.roleOther && <p id="roleOther-err" className="mt-1 font-mono text-[12px] text-red-500">{errors.roleOther}</p>}
            </div>
        )}

        <div className="flex flex-col">
          <label htmlFor="message" className="sr-only">Tell us how you intend to use {materialsLabel} (required)</label>
          <textarea id="message" value={values.message} onChange={(e) => update("message", e.target.value)} rows={3} placeholder={`Tell us about how you intend to use ${materialsLabel}`} className={`${fieldClass(!!errors.message)} resize-none pb-8`} disabled={busy} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-err" : undefined} />
          {errors.message && <p id="message-err" className="mt-1 font-mono text-[12px] text-red-500">{errors.message}</p>}
        </div>

        {formState === "error" && <p className="font-mono text-[13px] text-red-600">Something went wrong. Please try again or email us directly.</p>}

        <div className="mt-4 flex flex-col gap-2">
          <button type="submit" disabled={busy} className="inline-flex w-fit items-center justify-center gap-2 rounded-[74px] bg-primary px-[32px] py-[18px] font-mono text-[20px] font-semibold uppercase tracking-[-0.8px] text-cream transition-colors hover:bg-primary/90 disabled:opacity-60">
            {busy ? (<><Loader2 className="h-5 w-5 animate-spin" />Submitting</>) : "Submit request"}
          </button>
          <p className="font-mono text-[16px] tracking-[-0.8px] text-dark/70">We&apos;ll only use your details to reply. No spam, no sharing.</p>
        </div>
      </form>
  );
}
