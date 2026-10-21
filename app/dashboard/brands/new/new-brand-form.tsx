"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FieldLabel from "@/components/dashboard/form/field-label";
import TextInput from "@/components/dashboard/form/text-input";
import Select from "@/components/dashboard/form/select";
import FieldHint from "@/components/dashboard/form/field-hint";
import { BRAND_CATEGORY_LABELS } from "@/lib/brands/template";
import { createBrandPage } from "../actions";

export default function NewBrandForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await createBrandPage(formData);
      if (result.ok) router.push(`/dashboard/brands/${result.id}/edit`);
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-560 space-y-20 rounded-16 border border-neutral-10 bg-white p-24 md:p-32">
      {error && (
        <div role="alert" className="rounded-12 border border-error bg-error/5 px-16 py-12 text-p4 text-error">
          {error}
        </div>
      )}
      <div>
        <FieldLabel htmlFor="brand-name" required>
          Brand name
        </FieldLabel>
        <TextInput id="brand-name" name="name" required maxLength={120} placeholder="e.g. Trina Solar" />
      </div>
      <div>
        <FieldLabel htmlFor="brand-category" required>
          Product category
        </FieldLabel>
        <Select id="brand-category" name="category" defaultValue="MODULES">
          {Object.entries(BRAND_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <FieldHint>Decides the template wording (e.g. “Source … PV Modules Through CNX Energy”) and the group on the Tier 1 Brands page.</FieldHint>
      </div>
      <div>
        <FieldLabel htmlFor="brand-locale">Language</FieldLabel>
        <Select id="brand-locale" name="locale" defaultValue="EN">
          <option value="EN">English</option>
          <option value="FR">French</option>
        </Select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-primary px-24 py-14 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90 disabled:opacity-60"
      >
        {isPending ? "Creating…" : "Create draft"}
      </button>
    </form>
  );
}
