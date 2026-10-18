import { CHOICE_FIELDS } from "@/lib/page-content/tree";
import { bool, entries, str } from "@/lib/page-content/read";

/**
 * Contact form fields, edited in Dashboard → Pages → Contact → Form fields
 * (client revision 1008). Client-safe: the form renders from this and the
 * server action validates against the same list.
 *
 * Fields with these ids fill the Inquiry's own columns; any other field the
 * admin adds is stored in `Inquiry.answers` under its label.
 */
export const CORE_FIELD_IDS = ["name", "email", "company", "phone", "topic", "message"] as const;
export type CoreFieldId = (typeof CORE_FIELD_IDS)[number];

export type ContactFieldType = "text" | "email" | "tel" | "number" | "textarea" | "select";
const FIELD_TYPES = new Set((CHOICE_FIELDS.type ?? []).map((choice) => choice.value));

export interface ContactField {
  id: string;
  label: string;
  type: ContactFieldType;
  placeholder: string;
  options: string[];
  required: boolean;
  fullWidth: boolean;
}

/** Longest answer accepted per field type. */
export const FIELD_MAX_LENGTH: Record<ContactFieldType, number> = {
  text: 200,
  email: 254,
  tel: 40,
  number: 40,
  textarea: 5000,
  select: 200,
};

const EMAIL_FALLBACK: ContactField = {
  id: "email",
  label: "Email address",
  type: "email",
  placeholder: "",
  options: [],
  required: true,
  fullWidth: false,
};

/**
 * The visible fields, in the admin's order. The email field can't be hidden,
 * made optional or retyped — every enquiry needs an address to reply to — so
 * it is put back (first) if an edit removed it.
 */
export function readContactFields(raw: unknown): ContactField[] {
  const fields: ContactField[] = [];
  for (const [id, item] of entries(raw)) {
    if (id === "email") {
      fields.push({ ...EMAIL_FALLBACK, label: str(item, "label") || EMAIL_FALLBACK.label, placeholder: str(item, "placeholder"), fullWidth: bool(item, "fullWidth") });
      continue;
    }
    if (bool(item, "hidden")) continue;
    const label = str(item, "label").trim();
    if (!label) continue;
    const rawType = str(item, "type");
    const type = (FIELD_TYPES.has(rawType) ? rawType : "text") as ContactFieldType;
    const options = str(item, "options")
      .split(/\r?\n/)
      .map((option) => option.trim())
      .filter(Boolean);
    fields.push({
      id,
      label,
      // A dropdown with no options can't be answered — treat it as a text box.
      type: type === "select" && options.length === 0 ? "text" : type,
      placeholder: str(item, "placeholder"),
      options,
      required: bool(item, "required"),
      fullWidth: bool(item, "fullWidth") || type === "textarea",
    });
  }
  if (!fields.some((field) => field.id === "email")) fields.unshift(EMAIL_FALLBACK);
  return fields;
}

export function isCoreField(id: string): id is CoreFieldId {
  return (CORE_FIELD_IDS as readonly string[]).includes(id);
}
