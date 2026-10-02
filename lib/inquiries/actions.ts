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
import { INQUIRY_TOPICS, INQUIRY_TOPIC_LABELS } from "@/lib/inquiries/topics";

/**
 * Public form endpoints (Contact page, footer newsletter). Anyone can call
 * these, so each one: ignores bots that fill the hidden honeypot field,
 * rate-limits per client address, validates everything, and stores before it
 * emails — a message is never lost to an SMTP problem.
 */

/** Error keys map to messages `contact.form.errors.<key>`. */
export type ContactErrorKey = "name" | "email" | "topic" | "message" | "consent" | "tooMany" | "generic";
export type ContactResult = { ok: true } | { ok: false; error: ContactErrorKey; fields?: ContactErrorKey[] };
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

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v));

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  company: optional(120),
  phone: optional(40),
  topic: z.enum(INQUIRY_TOPICS),
  message: z.string().trim().min(10).max(5000),
  consent: z.literal(true),
});

const FIELD_ERRORS: Record<string, ContactErrorKey> = {
  name: "name",
  email: "email",
  topic: "topic",
  message: "message",
  consent: "consent",
};

/** One line, no control characters — for the email subject. */
function oneLine(value: string): string {
  return value.replace(/[\r\n\t\x00-\x1f\x7f]+/g, " ").trim();
}

export async function submitContact(localeParam: string, formData: FormData): Promise<ContactResult> {
  // Honeypot: a real visitor never sees or fills this field. Pretend success.
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const parsed = contactSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    company: String(formData.get("company") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    message: String(formData.get("message") ?? ""),
    consent: formData.get("consent") === "on",
  });
  if (!parsed.success) {
    const fields = [
      ...new Set(parsed.error.issues.map((issue) => FIELD_ERRORS[String(issue.path[0])]).filter(Boolean)),
    ];
    return { ok: false, error: fields[0] ?? "generic", fields };
  }

  const ip = await clientKey();
  if (limited(`contact:${ip}`, 5) || limited("contact:all", 200)) return { ok: false, error: "tooMany" };

  const locale = toLocale(localeParam);
  const data = parsed.data;

  let id: string;
  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        kind: "CONTACT",
        name: data.name,
        email: data.email,
        company: data.company,
        phone: data.phone,
        topic: data.topic,
        message: data.message,
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
        const [settings, messages, base] = await Promise.all([
          getSiteSettings(),
          getMergedMessages(routing.defaultLocale),
          getLinkBaseUrl(),
        ]);
        const footer = messages.footer as { contact?: { email?: string } } | undefined;
        const to = settings.inquiryEmail || footer?.contact?.email || siteConfig.contact.email;
        const rows: [string, string | null][] = [
          ["Name", data.name],
          ["Email", data.email],
          ["Company", data.company],
          ["Phone", data.phone],
          ["Topic", INQUIRY_TOPIC_LABELS[data.topic]],
          ["Language", locale.toUpperCase()],
        ];
        await sendEmail({
          to,
          replyTo: data.email,
          subject: oneLine(`New website enquiry from ${data.name} — ${INQUIRY_TOPIC_LABELS[data.topic]}`),
          ...renderEmail({
            heading: "New message from the Contact page",
            paragraphs: [
              ...rows.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`),
              data.message,
            ],
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
