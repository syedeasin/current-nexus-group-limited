import "server-only";

import { cache } from "react";
import { Locale as PrismaLocale } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/site.config";
import type { Locale } from "@/i18n/routing";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import { mergeNode, type MessageTree } from "@/lib/page-content/tree";

/**
 * Statically imported so the dev server actually reloads a message file when it
 * changes. A dynamic `import(`../messages/${locale}.json`)` compiles to a glob
 * whose modules Turbopack caches for the life of the process: edits to the JSON
 * rebuild the chunk on disk but the running server keeps serving the old copy,
 * which surfaces as MISSING_MESSAGE for any newly added key until a restart.
 */
const STATIC_MESSAGES: Record<Locale, typeof en> = { en, fr };

export function toPrismaLocale(locale: string): PrismaLocale {
  return locale.toLowerCase() === "fr" ? PrismaLocale.FR : PrismaLocale.EN;
}

/**
 * The shipped defaults for a locale: the message file plus the site-level
 * values that live in site.config.ts (contact details, social links), so the
 * footer reads them through the same editable tree as everything else.
 */
export function getBaseMessages(locale: Locale): MessageTree {
  const messages = STATIC_MESSAGES[locale] as unknown as MessageTree;
  return {
    ...messages,
    footer: {
      ...(messages.footer as MessageTree),
      contact: { ...siteConfig.contact },
      social: { ...siteConfig.social },
    },
  };
}

/** Saved page edits for a locale, oldest first so the most recent edit of a shared key wins. */
async function loadOverrides(locale: Locale): Promise<unknown[]> {
  const rows = await prisma.pageContent.findMany({
    where: { locale: toPrismaLocale(locale) },
    orderBy: { updatedAt: "asc" },
    select: { data: true },
  });
  return rows.map((row) => row.data);
}

/**
 * Defaults with every saved Dashboard → Pages edit laid over them. This is
 * what next-intl serves (i18n/request.ts). A database outage degrades to the
 * shipped copy instead of failing the page.
 */
export const getMergedMessages = cache(async (locale: Locale): Promise<MessageTree> => {
  const base = getBaseMessages(locale);
  let overrides: unknown[] = [];
  try {
    overrides = await loadOverrides(locale);
  } catch (error) {
    console.error("[page-content] could not load page edits; serving default copy", error);
  }
  return overrides.reduce<MessageTree>((acc, data) => (mergeNode(acc, data) as MessageTree) ?? acc, base);
});
