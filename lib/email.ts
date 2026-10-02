import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import { siteConfig } from "@/site.config";

/**
 * Outgoing email over SMTP, configured only through the server's .env so the
 * credentials never reach the database or the dashboard:
 *
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASSWORD,
 *   SMTP_FROM (e.g. "CNX Energy <no-reply@currentnexus.com>"),
 *   SMTP_SECURE ("true" for port 465 / implicit TLS; default: port === 465)
 *
 * Without SMTP_HOST and SMTP_FROM, email features degrade gracefully: the
 * forgot-password page says so, and admins copy reset/invite links instead.
 */

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  from: string;
};

function readConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.SMTP_FROM?.trim();
  if (!host || !from) return null;

  const port = Number(process.env.SMTP_PORT ?? 587) || 587;
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  return {
    host,
    port,
    secure: secureEnv ? secureEnv === "true" : port === 465,
    user: process.env.SMTP_USER?.trim() || undefined,
    password: process.env.SMTP_PASSWORD || undefined,
    from,
  };
}

export function isEmailConfigured(): boolean {
  return readConfig() !== null;
}

/** Non-secret view of the configuration, for Dashboard → Settings → Email. */
export function emailStatus() {
  const config = readConfig();
  if (!config) return { configured: false as const };
  return {
    configured: true as const,
    host: config.host,
    port: config.port,
    secure: config.secure,
    from: config.from,
    authenticated: Boolean(config.user),
  };
}

let transporter: Transporter | null = null;

function getTransporter(config: SmtpConfig): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user ? { user: config.user, pass: config.password } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
}

export type SendResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(message: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const config = readConfig();
  if (!config) return { ok: false, error: "Email is not set up on this server." };

  try {
    await getTransporter(config).sendMail({ from: config.from, ...message });
    return { ok: true };
  } catch (error) {
    console.error("[email] send failed", error);
    return { ok: false, error: "The email could not be sent. Check the SMTP settings on the server." };
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/**
 * One plain, table-free layout for every transactional email: brand line,
 * heading, paragraphs, an optional button. Inline styles only — email clients
 * ignore <style> blocks.
 */
export function renderEmail({
  heading,
  paragraphs,
  action,
  footnote,
}: {
  heading: string;
  paragraphs: string[];
  action?: { label: string; url: string };
  footnote?: string;
}): { html: string; text: string } {
  const p = (t: string) =>
    `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#3b3d49">${escapeHtml(t)}</p>`;
  const button = action
    ? `<p style="margin:24px 0"><a href="${escapeHtml(action.url)}" style="display:inline-block;background:#1b2b69;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:999px">${escapeHtml(action.label)}</a></p>
       <p style="margin:0 0 16px;font-size:13px;line-height:20px;color:#6c6e76">Or paste this link into your browser:<br><span style="word-break:break-all;color:#1b2b69">${escapeHtml(action.url)}</span></p>`
    : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f8f8f8;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px">
    <p style="margin:0 0 24px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1b2b69">${escapeHtml(siteConfig.legalName)}</p>
    <div style="background:#ffffff;border:1px solid #e7e7e8;border-radius:16px;padding:32px">
      <h1 style="margin:0 0 20px;font-size:22px;line-height:30px;font-weight:400;color:#0a0d1b">${escapeHtml(heading)}</h1>
      ${paragraphs.map(p).join("")}
      ${button}
      ${footnote ? `<p style="margin:16px 0 0;font-size:13px;line-height:20px;color:#84868d">${escapeHtml(footnote)}</p>` : ""}
    </div>
    <p style="margin:24px 0 0;font-size:12px;color:#9d9ea4">${escapeHtml(siteConfig.name)} dashboard</p>
  </div></body></html>`;

  const text = [
    heading,
    "",
    ...paragraphs.flatMap((t) => [t, ""]),
    ...(action ? [`${action.label}: ${action.url}`, ""] : []),
    ...(footnote ? [footnote] : []),
  ].join("\n");

  return { html, text };
}
