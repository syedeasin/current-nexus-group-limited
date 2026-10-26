import type { ReactNode } from "react";
import DatePicker from "@/components/sections/contact/DatePicker";
import { FIELD_MAX_LENGTH, INQUIRY_FILE_ACCEPT, type ContactField } from "@/lib/inquiries/form-fields";

/**
 * Field rendering shared by every enquiry form built in the dashboard (the
 * Contact page and the Tier 1 brand pages): one control per field type, a
 * label with the required marker and an error line wired to aria-describedby.
 */

/** Browser autofill hints for the built-in fields. */
const AUTOCOMPLETE: Record<string, string> = {
  name: "name",
  email: "email",
  company: "organization",
  phone: "tel",
  country: "country-name",
};

export const INPUT_CLASS =
  "w-full rounded-12 border border-neutral-10 bg-white px-16 py-14 text-p3 text-neutral-1 outline-none transition-colors duration-200 placeholder:text-neutral-7 focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[invalid=true]:border-error";

export function FieldControl({
  field,
  idPrefix,
  describedBy,
  invalid,
  defaultValue,
}: {
  field: ContactField;
  idPrefix: string;
  describedBy?: string;
  invalid: boolean;
  defaultValue?: string;
}) {
  const common = {
    id: `${idPrefix}-${field.id}`,
    name: field.id,
    required: field.required,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
  };
  if (field.type === "file") {
    return (
      <input
        {...common}
        type="file"
        accept={INQUIRY_FILE_ACCEPT}
        className={`${INPUT_CLASS} cursor-pointer file:mr-16 file:cursor-pointer file:rounded-full file:border-0 file:bg-surface-2 file:px-16 file:py-8 file:text-p4 file:font-semibold file:text-neutral-1 hover:file:bg-neutral-10`}
      />
    );
  }
  if (field.type === "date") {
    return (
      <DatePicker
        {...common}
        defaultValue={defaultValue}
        placeholder={field.placeholder || undefined}
        className={INPUT_CLASS}
      />
    );
  }
  if (field.type === "textarea") {
    return (
      <textarea
        {...common}
        maxLength={FIELD_MAX_LENGTH.textarea}
        rows={6}
        defaultValue={defaultValue}
        placeholder={field.placeholder || undefined}
        className={`${INPUT_CLASS} resize-y`}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select {...common} defaultValue={defaultValue ?? ""} className={INPUT_CLASS}>
        <option value="" disabled={field.required}>
          {field.placeholder || "—"}
        </option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      {...common}
      type={field.type === "number" ? "text" : field.type}
      inputMode={field.type === "number" ? "decimal" : undefined}
      maxLength={FIELD_MAX_LENGTH[field.type]}
      autoComplete={AUTOCOMPLETE[field.id]}
      defaultValue={defaultValue}
      placeholder={field.placeholder || undefined}
      className={INPUT_CLASS}
    />
  );
}

export function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  required?: boolean;
  /** Small helper line under the control (e.g. accepted file types). */
  hint?: string;
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
      {hint && !error && <p className="mt-6 text-p4 text-neutral-5">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-6 text-p4 text-error">
          {error}
        </p>
      )}
    </div>
  );
}
