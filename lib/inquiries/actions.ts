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

/**
 * Public form endpoints (Contact page, footer newsletter). Anyone can call
 * these, so each one: ignores bots that fill the hidden honeypot field,
 * rate-limits per client address, validates everything, and stores before it
 * emails — a message is never lost to an SMTP problem.
 */

/** Error keys map to messages `contact.form.errors.<key>`. */
export type ContactErrorKey = "required" | "email" | "choice" | "number" | "tooLong" | "consent" | "tooMany" | "generic";
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
  return null;
}

export async function submitContact(localeParam: string, formData: FormData): Promise<ContactResult> {
  // Honeypot: a real visitor never sees or fills this field. Pretend success.
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const locale = toLocale(localeParam);
  const messages = await getMergedMessages(locale);
  const formMessages = (messages.contact as { form?: { fields?: unknown } } | undefined)?.form;
  const fields = readContactFields(formMessages?.fields);

  const values = new Map<string, string>();
  const errors: ContactFieldError[] = [];
  for (const field of fields) {
    const raw = String(formData.get(field.id) ?? "").trim();
    const value = field.type === "email" ? raw.toLowerCase() : raw;
    const problem = checkField(field, value);
    if (problem) errors.push({ id: field.id, error: problem });
    else if (value) values.set(field.id, value);
  }
  if (formData.get("consent") !== "on") errors.push({ id: "consent", error: "consent" });
  if (errors.length > 0) return { ok: false, error: errors[0].error, fields: errors };

  const ip = await clientKey();
  if (limited(`contact:${ip}`, 5) || limited("contact:all", 200)) return { ok: false, error: "tooMany" };

  const core = (id: CoreFieldId) => values.get(id) ?? null;
  const email = core("email")!;
  const answers = fields
    .filter((field) => !isCoreField(field.id) && values.has(field.id))
    .map((field) => ({ label: field.label, value: values.get(field.id)! }));
  const topic = core("topic");

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
    console.error("[contact] could not save enquiry", error);
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
          .filter((field) => field.id !== "message" && values.has(field.id))
          .map((field) => `${field.label}: ${values.get(field.id)}`);
        await sendEmail({
          to,
          replyTo: email,
          subject: oneLine(`New website enquiry from ${sender}${topic ? ` — ${topic}` : ""}`),
          ...renderEmail({
            heading: "New message from the Contact page",
            paragraphs: [...rows, `Language: ${locale.toUpperCase()}`, ...(core("message") ? [core("message")!] : [])],
            action: { label: "Open in dashboard", url: `${base}/dashboard/inquiries?id=${id}` },
            footnote: "Reply to this email to answer the sender directly.",
          }),
        });
      } catch (error) {
        console.error("[contact] notification email failed", error);
      }
    });
  }

  return { ok: true };
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
