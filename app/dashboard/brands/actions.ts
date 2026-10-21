"use server";

import { revalidatePath } from "next/cache";
import { BrandCategory, DownloadStatus, Locale, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";
import { brandEntryHref } from "@/config/nav.config";
import { brandTemplate } from "@/lib/brands/template";
import { combine, validateNode, type PageFieldErrors } from "@/lib/page-content/validate";
import { diffNode, getAt, isTree, setAt, toStorage, type MessageTree } from "@/lib/page-content/tree";
import type { SavePageResult } from "@/app/dashboard/pages/actions";
import { BRAND_CONTENT_SECTIONS } from "./sections";

export type SimpleActionResult = { ok: true; id?: string } | { ok: false; error: string };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function uniqueSlug(base: string, locale: Locale, excludeId?: string): Promise<string> {
  const existing = await prisma.brandPage.findMany({
    where: { locale, slug: { startsWith: base }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { slug: true },
  });
  const taken = new Set(existing.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** A brand shows in the menu, footer and collection page of every page, so the whole locale is refreshed. */
function revalidate(slugs: string[]) {
  revalidatePath("/dashboard/brands", "layout");
  for (const locale of ["en", "fr"]) {
    revalidatePath(`/${locale}`, "layout");
    for (const slug of slugs) revalidatePath(`/${locale}${brandEntryHref(slug)}`);
  }
}

const settingsSchema = z.object({
  name: z.string().trim().min(1, "Enter the brand name.").max(120),
  slug: z.string().trim().max(120).regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only (e.g. ja-solar)."),
  publishStatus: z.enum(["DRAFT", "PUBLISHED"]),
  brandCategory: z.enum(["MODULES", "INVERTERS", "BESS", "MIXED"]),
  logo: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^\/(?!\/)/.test(v), "Upload the logo here — links to other websites are not supported."),
  summary: z.string().trim().max(200, "Keep this under 200 characters."),
  menuOrder: z.preprocess((v) => Number.parseInt(String(v ?? "0"), 10) || 0, z.number().int().min(0).max(9999)),
  showInMenu: z.enum(["true", "false", ""]).transform((v) => v === "true"),
});

/**
 * Save the whole brand editor. `settings` fills the row's columns; every
 * other section is stored as its difference from the template the editor
 * showed (the brand's *previous* name and category), so a renamed brand's
 * untouched copy follows the new name instead of freezing the old one.
 */
export async function saveBrandPage(id: string, sectionsJson: string): Promise<SavePageResult> {
  await requirePermission("brandPage.manage");

  const row = await prisma.brandPage.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, locale: true, category: true, publishedAt: true },
  });
  if (!row) return { ok: false, error: "This brand page no longer exists." };

  let sections: Record<string, unknown>;
  try {
    sections = JSON.parse(sectionsJson);
  } catch {
    return { ok: false, error: "Could not read the form. Please reload and try again." };
  }

  const fieldErrors: PageFieldErrors = {};
  const parsed = settingsSchema.safeParse(sections.settings);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = `brand.settings.${issue.path.join(".")}`;
      if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
    }
  }

  const shown = brandTemplate(row.name, row.category);
  let data: MessageTree = {};
  for (const section of BRAND_CONTENT_SECTIONS) {
    if (!(section.id in sections)) continue;
    const edited = sections[section.id];
    const defaults = getAt(shown, section.path);
    validateNode(edited, defaults, section.path, fieldErrors);
    const diff = diffNode(defaults, edited, section.path);
    if (diff !== undefined) data = combine(data, setAt({}, section.path, diff));
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Some fields need attention — they are highlighted below.", fieldErrors };
  }

  const settings = parsed.data;
  const clash = await prisma.brandPage.findFirst({
    where: { locale: row.locale, slug: settings.slug, id: { not: id } },
    select: { id: true },
  });
  if (clash) {
    return {
      ok: false,
      error: "Some fields need attention — they are highlighted below.",
      fieldErrors: { "brand.settings.slug": "Another brand page already uses this address." },
    };
  }

  const status = settings.publishStatus as DownloadStatus;
  try {
    await prisma.brandPage.update({
      where: { id },
      data: {
        name: settings.name,
        slug: settings.slug,
        status,
        publishedAt: status === "PUBLISHED" && !row.publishedAt ? new Date() : row.publishedAt,
        category: settings.brandCategory as BrandCategory,
        logo: settings.logo,
        summary: settings.summary,
        menuOrder: settings.menuOrder,
        showInMegaMenu: settings.showInMenu,
        content: toStorage(data) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    console.error("[brand-pages] save failed", error);
    return { ok: false, error: "Could not save this page. Please try again." };
  }

  revalidate([settings.slug, row.slug]);
  return { ok: true, changed: true };
}

/** Throw away every content edit — the page shows the template copy for its brand again. Settings stay. */
export async function resetBrandPage(id: string): Promise<SavePageResult> {
  await requirePermission("brandPage.manage");
  try {
    const row = await prisma.brandPage.update({ where: { id }, data: { content: {} }, select: { slug: true } });
    revalidate([row.slug]);
    return { ok: true, changed: true };
  } catch (error) {
    console.error("[brand-pages] reset failed", error);
    return { ok: false, error: "Could not reset this page. Please try again." };
  }
}

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter the brand name.").max(120),
  category: z.enum(["MODULES", "INVERTERS", "BESS", "MIXED"]),
  locale: z.enum(["EN", "FR"]).default("EN"),
});

/** New brand pages start as a draft with the template copy for that brand. */
export async function createBrandPage(formData: FormData): Promise<SimpleActionResult> {
  const user = await requirePermission("brandPage.manage");
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    locale: formData.get("locale") || "EN",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };

  const { name, category, locale } = parsed.data;
  const slug = await uniqueSlug(makeSlug(name) || "brand", locale as Locale);
  const last = await prisma.brandPage.findFirst({ where: { locale: locale as Locale }, orderBy: { menuOrder: "desc" }, select: { menuOrder: true } });

  try {
    const page = await prisma.brandPage.create({
      data: {
        name,
        slug,
        locale: locale as Locale,
        category: category as BrandCategory,
        status: DownloadStatus.DRAFT,
        menuOrder: (last?.menuOrder ?? 0) + 1,
        content: {},
        createdById: user.id,
      },
      select: { id: true },
    });
    revalidatePath("/dashboard/brands");
    return { ok: true, id: page.id };
  } catch (error) {
    console.error("[brand-pages] create failed", error);
    return { ok: false, error: "Could not create this page. Please try again." };
  }
}

export async function duplicateBrandPage(id: string): Promise<SimpleActionResult> {
  const user = await requirePermission("brandPage.manage");
  const source = await prisma.brandPage.findUnique({ where: { id } });
  if (!source) return { ok: false, error: "This brand page no longer exists." };

  const slug = await uniqueSlug(`${source.slug}-copy`, source.locale);
  try {
    const copy = await prisma.brandPage.create({
      data: {
        name: `${source.name} (copy)`,
        slug,
        locale: source.locale,
        category: source.category,
        status: DownloadStatus.DRAFT,
        logo: source.logo,
        summary: source.summary,
        menuOrder: source.menuOrder + 1,
        showInMegaMenu: source.showInMegaMenu,
        content: isTree(source.content) || Array.isArray(source.content) ? (source.content as Prisma.InputJsonValue) : {},
        createdById: user.id,
      },
      select: { id: true },
    });
    revalidatePath("/dashboard/brands");
    return { ok: true, id: copy.id };
  } catch (error) {
    console.error("[brand-pages] duplicate failed", error);
    return { ok: false, error: "Could not duplicate this page. Please try again." };
  }
}

export async function deleteBrandPage(id: string): Promise<SimpleActionResult> {
  await requirePermission("brandPage.manage");
  const existing = await prisma.brandPage.findUnique({ where: { id }, select: { slug: true, isProtectedTemplate: true } });
  if (!existing) return { ok: false, error: "This brand page no longer exists." };
  if (existing.isProtectedTemplate) {
    return { ok: false, error: "This is the master template and cannot be deleted. Set it to Draft to hide it." };
  }
  try {
    await prisma.brandPage.delete({ where: { id } });
    revalidate([existing.slug]);
    return { ok: true };
  } catch (error) {
    console.error("[brand-pages] delete failed", error);
    return { ok: false, error: "Could not delete this page. Please try again." };
  }
}
