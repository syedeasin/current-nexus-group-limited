"use server";

import { revalidatePath } from "next/cache";
import { DownloadStatus, Locale, ManufacturingCategory } from "@prisma/client";
import type { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";
import { manufacturingEntryHref } from "@/config/nav.config";
import { manufacturingPageSchema, type ManufacturingPageFormValues } from "./schema";

export type SimpleActionResult = { ok: true; id?: string } | { ok: false; error: string };

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function formStr(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function fieldErrorsFrom(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return { __invalid: true };
  }
}

function parseForm(formData: FormData) {
  return {
    title: formStr(formData, "title"),
    slug: formStr(formData, "slug"),
    locale: formStr(formData, "locale"),
    category: formStr(formData, "category"),
    status: formStr(formData, "status"),
    menuLabel: formStr(formData, "menuLabel"),
    menuOrder: formStr(formData, "menuOrder"),
    showInMegaMenu: formStr(formData, "showInMegaMenu"),
    content: parseJson(formStr(formData, "content")),
    seo: parseJson(formStr(formData, "seo")),
  };
}

async function uniquePageSlug(
  base: string,
  category: ManufacturingCategory,
  locale: Locale,
  excludeId?: string
): Promise<string> {
  const existing = await prisma.manufacturingPage.findMany({
    where: { category, locale, slug: { startsWith: base }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { slug: true },
  });
  const taken = new Set(existing.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

function rowData(data: ManufacturingPageFormValues, slug: string) {
  return {
    title: data.title,
    slug,
    locale: data.locale as Locale,
    category: data.category as ManufacturingCategory,
    status: data.status as DownloadStatus,
    menuLabel: data.menuLabel,
    menuOrder: data.menuOrder,
    showInMegaMenu: data.showInMegaMenu,
    // Keep content.slug/category in sync with the row so the rendered page's
    // internal references stay correct.
    content: { ...data.content, slug, category: data.category === "BESS" ? "bess" : "solar-panels" } as object,
    seo: data.seo as object,
  };
}

export async function createManufacturingPage(formData: FormData): Promise<ActionResult> {
  const user = await requirePermission("manufacturingPage.manage");
  const parsed = manufacturingPageSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const data = parsed.data;
  const category = data.category as ManufacturingCategory;
  const locale = data.locale as Locale;
  const slug = await uniquePageSlug(data.slug ?? makeSlug(data.title), category, locale);

  try {
    const page = await prisma.manufacturingPage.create({
      data: {
        ...rowData(data, slug),
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        createdById: user.id,
      },
      select: { id: true },
    });
    revalidate(slug, category);
    return { ok: true, id: page.id };
  } catch (error) {
    console.error("[manufacturing] create failed", error);
    return { ok: false, error: "Could not save this page. Please try again." };
  }
}

export async function updateManufacturingPage(id: string, formData: FormData): Promise<ActionResult> {
  await requirePermission("manufacturingPage.manage");
  const existing = await prisma.manufacturingPage.findUnique({
    where: { id },
    select: { slug: true, category: true, publishedAt: true },
  });
  if (!existing) return { ok: false, error: "This page no longer exists." };

  const parsed = manufacturingPageSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const data = parsed.data;
  const category = data.category as ManufacturingCategory;
  const locale = data.locale as Locale;
  const slug = await uniquePageSlug(data.slug ?? makeSlug(data.title), category, locale, id);

  const publishedAt =
    data.status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt;

  try {
    await prisma.manufacturingPage.update({ where: { id }, data: { ...rowData(data, slug), publishedAt } });
    revalidate(slug, category);
    revalidate(existing.slug, existing.category);
    return { ok: true, id };
  } catch (error) {
    console.error("[manufacturing] update failed", error);
    return { ok: false, error: "Could not save this page. Please try again." };
  }
}

/**
 * A published manufacturing page has a URL and a mega-menu entry, both cached.
 * Revalidate the page and the marketing layout (menu) for both locales.
 */
function revalidate(slug: string, category: ManufacturingCategory) {
  revalidatePath("/dashboard/manufacturing");
  revalidatePath("/dashboard");
  for (const locale of ["en", "fr"]) {
    revalidatePath(`/${locale}`, "layout");
    revalidatePath(`/${locale}${manufacturingEntryHref(category, slug)}`);
  }
}

export async function setManufacturingStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED"
): Promise<SimpleActionResult> {
  await requirePermission("manufacturingPage.manage");
  const existing = await prisma.manufacturingPage.findUnique({
    where: { id },
    select: { slug: true, category: true, publishedAt: true },
  });
  if (!existing) return { ok: false, error: "This page no longer exists." };

  try {
    await prisma.manufacturingPage.update({
      where: { id },
      data: {
        status: status as DownloadStatus,
        publishedAt:
          status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });
    revalidate(existing.slug, existing.category);
    return { ok: true };
  } catch (error) {
    console.error("[manufacturing] status change failed", error);
    return { ok: false, error: "Could not update this page. Please try again." };
  }
}

export async function deleteManufacturingPage(id: string): Promise<SimpleActionResult> {
  await requirePermission("manufacturingPage.manage");
  const existing = await prisma.manufacturingPage.findUnique({
    where: { id },
    select: { slug: true, category: true },
  });
  if (!existing) return { ok: false, error: "This page no longer exists." };

  try {
    await prisma.manufacturingPage.delete({ where: { id } });
    revalidate(existing.slug, existing.category);
    return { ok: true };
  } catch (error) {
    console.error("[manufacturing] delete failed", error);
    return { ok: false, error: "Could not delete this page. Please try again." };
  }
}

async function uniqueSlug(base: string, category: ManufacturingCategory, locale: "EN" | "FR") {
  const existing = await prisma.manufacturingPage.findMany({
    where: { category, locale, slug: { startsWith: base } },
    select: { slug: true },
  });
  const taken = new Set(existing.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function duplicateManufacturingPage(id: string): Promise<SimpleActionResult> {
  const user = await requirePermission("manufacturingPage.manage");
  const source = await prisma.manufacturingPage.findUnique({ where: { id } });
  if (!source) return { ok: false, error: "This page no longer exists." };

  const slug = await uniqueSlug(`${source.slug}-copy`, source.category, source.locale);
  try {
    const copy = await prisma.manufacturingPage.create({
      data: {
        title: `${source.title} (copy)`,
        slug,
        locale: source.locale,
        category: source.category,
        status: DownloadStatus.DRAFT,
        publishedAt: null,
        menuLabel: source.menuLabel,
        menuOrder: source.menuOrder,
        showInMegaMenu: false,
        content: source.content as object,
        seo: (source.seo as object) ?? undefined,
        createdById: user.id,
      },
      select: { id: true },
    });
    revalidatePath("/dashboard/manufacturing");
    return { ok: true, id: copy.id };
  } catch (error) {
    console.error("[manufacturing] duplicate failed", error);
    return { ok: false, error: "Could not duplicate this page. Please try again." };
  }
}
