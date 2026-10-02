"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { routing, type Locale } from "@/i18n/routing";
import { getPageDef } from "@/lib/page-content/registry";
import { getBaseMessages, toPrismaLocale } from "@/lib/page-content/messages";
import { diffNode, getAt, setAt, toStorage, type MessageTree } from "@/lib/page-content/tree";
import { combine, validateNode, type PageFieldErrors } from "@/lib/page-content/validate";

export type SavePageResult =
  | { ok: true; changed: boolean }
  | { ok: false; error: string; fieldErrors?: PageFieldErrors };

function asLocale(value: string): Locale | null {
  return (routing.locales as readonly string[]).includes(value) ? (value as Locale) : null;
}

/** Every marketing page reads the merged messages, so a save refreshes the whole locale. */
function revalidateLocale(locale: Locale) {
  revalidatePath(`/${locale}`, "layout");
  revalidatePath("/dashboard/pages", "layout");
}

/**
 * Save one page's edits for one locale. `sections` is the full edited value
 * of each section (by section id), exactly as the editor shows it. Only what
 * differs from the shipped default is stored; an all-default page deletes its
 * row so future copy updates in messages/*.json reach it again.
 */
export async function savePageContent(
  pageKey: string,
  localeParam: string,
  sectionsJson: string
): Promise<SavePageResult> {
  const user = await requirePermission("page.manage");

  const page = getPageDef(pageKey);
  const locale = asLocale(localeParam);
  if (!page || !locale) return { ok: false, error: "Unknown page." };

  let sections: Record<string, unknown>;
  try {
    sections = JSON.parse(sectionsJson);
  } catch {
    return { ok: false, error: "Could not read the form. Please reload and try again." };
  }

  const base = getBaseMessages(locale);
  const fieldErrors: PageFieldErrors = {};
  let data: MessageTree = {};

  for (const section of page.sections) {
    if (!(section.id in sections)) continue;
    const edited = sections[section.id];
    const defaults = getAt(base, section.path);
    validateNode(edited, defaults, section.path, fieldErrors, section.exclude);
    const diff = diffNode(defaults, edited, section.path);
    if (diff !== undefined) data = combine(data, setAt({}, section.path, diff));
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Some fields need attention — they are highlighted below.", fieldErrors };
  }

  const where = { pageKey_locale: { pageKey, locale: toPrismaLocale(locale) } };
  const changed = Object.keys(data).length > 0;
  const stored = toStorage(data) as Prisma.InputJsonValue;

  try {
    if (changed) {
      await prisma.pageContent.upsert({
        where,
        create: {
          pageKey,
          locale: toPrismaLocale(locale),
          data: stored,
          updatedById: user.id,
        },
        update: { data: stored, updatedById: user.id },
      });
    } else {
      await prisma.pageContent.deleteMany({ where: { pageKey, locale: toPrismaLocale(locale) } });
    }
  } catch (error) {
    console.error("[pages] save failed", error);
    return { ok: false, error: "Could not save this page. Please try again." };
  }

  revalidateLocale(locale);
  return { ok: true, changed };
}

/** Throw away every edit to one page in one locale — the page shows its shipped copy again. */
export async function resetPageContent(pageKey: string, localeParam: string): Promise<SavePageResult> {
  await requirePermission("page.manage");

  const page = getPageDef(pageKey);
  const locale = asLocale(localeParam);
  if (!page || !locale) return { ok: false, error: "Unknown page." };

  try {
    await prisma.pageContent.deleteMany({ where: { pageKey, locale: toPrismaLocale(locale) } });
  } catch (error) {
    console.error("[pages] reset failed", error);
    return { ok: false, error: "Could not reset this page. Please try again." };
  }

  revalidateLocale(locale);
  return { ok: true, changed: true };
}
