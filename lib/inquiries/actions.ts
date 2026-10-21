"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isEmailConfigured, renderEmail, sendEmail } from "@/lib/email";
import { getLinkBaseUrl, getSiteSettings } from "@/lib/site-settings";
import { getMergedMessages, toPrismaLocale } from "@/lib/page-content/messages";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/site.config";
import { FIELD_MAX_LENGTH, isCoreField, readContactFields, type ContactField, type CoreFieldId } from "@/lib/inquiries/form-fields";
import { attachmentHref, saveInquiryAttachment } from "@/lib/inquiries/attachments";
import { getPublishedBrandPage } from "@/lib/data/brands";
import { readBrandContent } from "@/lib/brands/content";

/**
 * Public form endpoints (Contact page, Tier 1 brand and product quote forms,
 * footer newsletter). Anyone can call
 * these, so each one: ignores bots that fill the hidden honeypot field,
 * rate-limits per client address, validates everything, and stores before it
 * emails — a message is never lost to an SMTP problem.
 */

/** Error keys map to messages `contact.form.errors.<key>`. */
export type ContactErrorKey =
  | "required"
  | "email"
  | "choice"
  | "number"
  | "date"
  | "fileType"
  | "fileSize"
  | "tooLong"
  | "consent"
  | "tooMany"
  | "generic";
/** `id` is a form field id (Pages → Contact → Form fields) or "consent". */
export type ContactFieldError = { id: string; error: ContactErrorKey };
export type ContactResult = { ok: true } | { ok: false; error: ContactErrorKey; fields?: ContactFieldError[] };
export type NewsletterResult = { ok: true } | { ok: false; error: "invalid" | "failed" };

const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; firstAt: number }>();

function limited(key: string, max: number): boolean {
  const now = Date.now();
  if (hits.size > 5000) hits.clear(); // a flood of unique keys must not grow memory forever
  const record = hits.get(key);
  if (!record || now - record.firstAt > WINDOW_MS) {
    hits.set(key, { count: 1, firstAt: now });
    return false;
  }
  record.count += 1;
  return record.count > max;
}

/** nginx sets X-Real-IP to the connecting address; X-Forwarded-For's first entry is client-controlled. */
async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",").pop()?.trim() ?? "unknown";
}

function toLocale(value: string): Locale {
  return (routing.locales as readonly string[]).includes(value) ? (value as Locale) : routing.defaultLocale;
}

function safePath(value: FormDataEntryValue | null): string | null {
  const path = typeof value === "string" ? value.slice(0, 300) : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : null;
}

const emailSchema = z.string().max(254).pipe(z.email());

/** One line, no control characters — for the email subject. */
function oneLine(value: string): string {
  return value.replace(/[\r\n\t\x00-\x1f\x7f]+/g, " ").trim();
}

/** Problem with one answer, or null when it is acceptable. */
function checkField(field: ContactField, value: string): ContactErrorKey | null {
  if (!value) return field.required ? "required" : null;
  if (value.length > FIELD_MAX_LENGTH[field.type]) return "tooLong";
  if (field.type === "email" && !emailSchema.safeParse(value).success) return "email";
  if (field.type === "number" && !/^-?\d+([.,]\d+)?$/.test(value)) return "number";
  if (field.type === "select" && !field.options.includes(value)) return "choice";
  if (field.type === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)))) return "date";
  return null;
}

/** Where an enquiry came from — decides the stored topic, the email heading and the rate-limit bucket. */
interface FormSource {
  /** Stored as the topic when the form has no topic field. */
  topic: string | null;
  emailHeading: string;
  /** Rate-limit bucket, so one busy form can't lock out another. */
  bucket: string;
}

/**
 * Shared by every enquiry form: validate the configured fields, rate-limit,
 * store the attachment and the enquiry, then email the team. Field ids that
 * match a core column fill it; everything else lands in `answers`.
 */
async function handleEnquiry(
  locale: Locale,
  fields: ContactField[],
  formData: FormData,
  source: FormSource
): Promise<ContactResult> {
  // Honeypot: a real visitor never sees or fills this field. Pretend success.
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const values = new Map<string, string>();
  const files = new Map<string, File>();
  const errors: ContactFieldError[] = [];
  for (const field of fields) {
    if (field.type === "file") {
      const entry = formData.get(field.id);
      const file = entry instanceof File && entry.size > 0 ? entry : null;
      if (file) files.set(field.id, file);
      else if (field.required) errors.push({ id: field.id, error: "required" });
      continue;
    }
    const raw = String(formData.get(field.id) ?? "").trim();
    const value = field.type === "email" ? raw.toLowerCase() : raw;
    const problem = checkField(field, value);
    if (problem) errors.push({ id: field.id, error: problem });
    else if (value) values.set(field.id, value);
  }
  if (formData.get("consent") !== "on") errors.push({ id: "consent", error: "consent" });
  if (errors.length > 0) return { ok: false, error: errors[0].error, fields: errors };

  const ip = await clientKey();
  if (limited(`${source.bucket}:${ip}`, 5) || limited(`${source.bucket}:all`, 200)) return { ok: false, error: "tooMany" };

  // Checked and stored only once everything else passed, so a rejected form
  // never leaves an orphan file behind.
  const attachments = new Map<string, { key: string; fileName: string }>();
  for (const [id, file] of files) {
    let saved;
    try {
      saved = await saveInquiryAttachment(file);
    } catch (error) {
      console.error("[enquiry] could not store attachment", error);
      return { ok: false, error: "generic" };
    }
    if (!saved.ok) return { ok: false, error: saved.error, fields: [{ id, error: saved.error }] };
    attachments.set(id, { key: saved.key, fileName: saved.fileName });
  }

  const core = (id: CoreFieldId) => values.get(id) ?? null;
  const email = core("email")!;
  const answers = fields
    .filter((field) => !isCoreField(field.id) && (values.has(field.id) || attachments.has(field.id)))
    .map((field) => {
      const attachment = attachments.get(field.id);
      return attachment
        ? { label: field.label, value: attachment.fileName, file: attachment.key }
        : { label: field.label, value: values.get(field.id)! };
    });
  const topic = core("topic") ?? source.topic;

  let id: string;
  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        kind: "CONTACT",
        name: core("name")?.slice(0, 200) ?? null,
        email,
        company: core("company"),
        phone: core("phone"),
        topic,
        message: core("message"),
        answers: answers.length > 0 ? answers : undefined,
        locale: toPrismaLocale(locale),
        sourcePath: safePath(formData.get("sourcePath")),
      },
      select: { id: true },
    });
    id = inquiry.id;
  } catch (error) {
    console.error("[enquiry] could not save enquiry", error);
    return { ok: false, error: "generic" };
  }

  revalidatePath("/dashboard", "layout");

  if (isEmailConfigured()) {
    after(async () => {
      try {
        const [settings, defaultMessages, base] = await Promise.all([
          getSiteSettings(),
          getMergedMessages(routing.defaultLocale),
          getLinkBaseUrl(),
        ]);
        const footer = defaultMessages.footer as { contact?: { email?: string } } | undefined;
        const to = settings.inquiryEmail || footer?.contact?.email || siteConfig.contact.email;
        const sender = core("name") ?? email;
        const rows = fields
          .filter((field) => field.id !== "message" && (values.has(field.id) || attachments.has(field.id)))
          .map((field) => {
            const attachment = attachments.get(field.id);
            return attachment
              ? `${field.label}: ${attachment.fileName} (${base}${attachmentHref(attachment.key)})`
              : `${field.label}: ${values.get(field.id)}`;
          });
        await sendEmail({
          to,
          replyTo: email,
          subject: oneLine(`New website enquiry from ${sender}${topic ? ` — ${topic}` : ""}`),
          ...renderEmail({
            heading: source.emailHeading,
            paragraphs: [...rows, `Language: ${locale.toUpperCase()}`, ...(core("message") ? [core("message")!] : [])],
            action: { label: "Open in dashboard", url: `${base}/dashboard/inquiries?id=${id}` },
            footnote: "Reply to this email to answer the sender directly.",
          }),
        });
      } catch (error) {
        console.error("[enquiry] notification email failed", error);
      }
    });
  }

  return { ok: true };
}

export async function submitContact(localeParam: string, formData: FormData): Promise<ContactResult> {
  const locale = toLocale(localeParam);
  const messages = await getMergedMessages(locale);
  const formMessages = (messages.contact as { form?: { fields?: unknown } } | undefined)?.form;
  return handleEnquiry(locale, readContactFields(formMessages?.fields), formData, {
    topic: null,
    emailHeading: "New message from the Contact page",
    bucket: "contact",
  });
}

/** "Still comparing models?" form at the bottom of a Tier 1 brand page. Fields come from that brand's page. */
export async function submitBrandInquiry(localeParam: string, slug: string, formData: FormData): Promise<ContactResult> {
  const locale = toLocale(localeParam);
  const brand = await getPublishedBrandPage(slug, locale);
  if (!brand) return { ok: false, error: "generic" };
  const content = readBrandContent(brand.name, brand.category, brand.content);
  return handleEnquiry(locale, content.inquiry.fields, formData, {
    topic: `Quote request · ${brand.name}`,
    emailHeading: `New quote request from the ${brand.name} page`,
    bucket: "quote",
  });
}

/** The quotation form on Manufacturing product pages — a fixed set of fields. */
const PRODUCT_QUOTE_FIELDS: ContactField[] = (
  [
    ["name", "Full name", "text", true],
    ["email", "Email", "email", true],
    ["company", "Company", "text", false],
    ["country", "Country", "text", true],
    ["phone", "Phone number", "tel", true],
    ["productInterest", "Product interest", "text", false],
    ["targetPowerRange", "Target power range", "text", false],
    ["quantity", "Quantity / MW", "text", false],
    ["projectTimeline", "Project timeline", "text", false],
    ["message", "Message", "textarea", false],
  ] as const
).map(([id, label, type, required]) => ({ id, label, type, required, placeholder: "", options: [], fullWidth: false }));

export async function submitProductQuote(localeParam: string, formData: FormData): Promise<ContactResult> {
  const product = oneLine(String(formData.get("product") ?? "")).slice(0, 120);
  return handleEnquiry(toLocale(localeParam), PRODUCT_QUOTE_FIELDS, formData, {
    topic: product ? `Quote request · ${product}` : "Quote request",
    emailHeading: `New quote request from a product page${product ? ` (${product})` : ""}`,
    bucket: "quote",
  });
}

export async function subscribeNewsletter(localeParam: string, formData: FormData): Promise<NewsletterResult> {
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const email = z.string().trim().toLowerCase().max(254).pipe(z.email()).safeParse(String(formData.get("email") ?? ""));
  if (!email.success) return { ok: false, error: "invalid" };

  const ip = await clientKey();
  if (limited(`newsletter:${ip}`, 5) || limited("newsletter:all", 300)) return { ok: false, error: "failed" };

  try {
    // Already subscribed answers the same way, so the form can't be used to
    // check who is on the list.
    const existing = await prisma.inquiry.findFirst({
      where: { kind: "NEWSLETTER", email: email.data },
      select: { id: true },
    });
    if (!existing) {
      await prisma.inquiry.create({
        data: {
          kind: "NEWSLETTER",
          email: email.data,
          locale: toPrismaLocale(toLocale(localeParam)),
          sourcePath: safePath(formData.get("sourcePath")),
        },
      });
      revalidatePath("/dashboard", "layout");
    }
    return { ok: true };
  } catch (error) {
    console.error("[newsletter] could not save sign-up", error);
    return { ok: false, error: "failed" };
  }
}
