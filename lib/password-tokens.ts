import "server-only";

import { createHash, randomBytes } from "crypto";
import type { PasswordTokenPurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getLinkBaseUrl } from "@/lib/site-settings";
import { renderEmail, sendEmail, type SendResult } from "@/lib/email";

const TTL_MS: Record<PasswordTokenPurpose, number> = {
  RESET: 60 * 60 * 1000, // 1 hour
  INVITE: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Raw tokens are 43 base64url characters; anything else is rejected without a query. */
function looksLikeToken(raw: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(raw);
}

export type IssuedLink = { url: string; expiresAt: Date };

/**
 * A fresh single-use link for `userId`. Older unused links for the same user
 * stop working, so only the most recently sent email is ever valid. Pass
 * `issuedByAdmin` only from actions behind requirePermission("user.manage").
 */
export async function issuePasswordLink(
  userId: string,
  purpose: PasswordTokenPurpose,
  { issuedByAdmin = false } = {}
): Promise<IssuedLink> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_MS[purpose]);

  await prisma.$transaction([
    prisma.passwordToken.deleteMany({
      where: { OR: [{ userId, usedAt: null }, { expiresAt: { lt: new Date(Date.now() - TTL_MS.INVITE) } }] },
    }),
    prisma.passwordToken.create({ data: { userId, tokenHash: hashToken(token), purpose, expiresAt } }),
  ]);

  const base = await getLinkBaseUrl({ trustRequestOrigin: issuedByAdmin });
  return { url: `${base}/reset-password/${token}`, expiresAt };
}

/** The user a link belongs to, if the link is still usable. */
export async function findUsableToken(raw: string) {
  if (!looksLikeToken(raw)) return null;
  const row = await prisma.passwordToken.findUnique({
    where: { tokenHash: hashToken(raw) },
    select: {
      id: true,
      purpose: true,
      expiresAt: true,
      usedAt: true,
      user: { select: { id: true, name: true, email: true, isActive: true } },
    },
  });
  if (!row || row.usedAt || row.expiresAt <= new Date() || !row.user.isActive) return null;
  return row;
}

/**
 * Sets the password and burns the link in one transaction. Bumping
 * tokenVersion signs the account out everywhere — whoever asked for the reset
 * may be locking out someone who had the old password.
 */
export async function redeemPasswordLink(raw: string, newPassword: string): Promise<{ ok: true; email: string } | { ok: false }> {
  const row = await findUsableToken(raw);
  if (!row) return { ok: false };

  const passwordHash = await hashPassword(newPassword);
  const now = new Date();

  // updateMany with the "still unused" condition makes a double submit (two
  // tabs, a double click) redeem the link at most once.
  const claimed = await prisma.passwordToken.updateMany({
    where: { id: row.id, usedAt: null },
    data: { usedAt: now },
  });
  if (claimed.count !== 1) return { ok: false };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.user.id },
      data: { passwordHash, passwordChangedAt: now, tokenVersion: { increment: 1 } },
    }),
    prisma.passwordToken.deleteMany({ where: { userId: row.user.id, usedAt: null } }),
  ]);

  return { ok: true, email: row.user.email };
}

function formatExpiry(purpose: PasswordTokenPurpose): string {
  return purpose === "INVITE" ? "7 days" : "1 hour";
}

export async function emailPasswordLink(
  user: { name: string; email: string },
  purpose: PasswordTokenPurpose,
  link: IssuedLink,
  invitedBy?: string
): Promise<SendResult> {
  const first = user.name.split(" ")[0] || user.name;
  const content =
    purpose === "INVITE"
      ? renderEmail({
          heading: "You've been invited to the CNX Energy dashboard",
          paragraphs: [
            `Hi ${first},`,
            `${invitedBy ?? "An administrator"} created a dashboard account for you (${user.email}). Choose a password to sign in.`,
          ],
          action: { label: "Set your password", url: link.url },
          footnote: `This link works once and expires in ${formatExpiry(purpose)}.`,
        })
      : renderEmail({
          heading: "Reset your password",
          paragraphs: [
            `Hi ${first},`,
            "We received a request to reset the password for your CNX Energy dashboard account. Choose a new password using the button below.",
          ],
          action: { label: "Choose a new password", url: link.url },
          footnote: `This link works once and expires in ${formatExpiry(purpose)}. If you didn't ask for it, you can ignore this email — your password stays the same.`,
        });

  return sendEmail({
    to: user.email,
    subject: purpose === "INVITE" ? "Your CNX Energy dashboard account" : "Reset your CNX Energy dashboard password",
    ...content,
  });
}
