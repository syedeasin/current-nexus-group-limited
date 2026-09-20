"use server";

import { revalidatePath } from "next/cache";
import { DownloadStatus, Locale, SolutionMenuGroup } from "@prisma/client";
import type { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";
import { solutionEntryHref } from "@/config/nav.config";
import { solutionPageSchema, type SolutionPageFormValues } from "./schema";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type SimpleActionResult = { ok: true; id?: string } | { ok: false; error: string };

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function fieldErrorsFrom(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    // Flatten nested paths (content.hero.heading) to a dotted key the form can map.
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

function parseFormData(formData: FormData) {
  const content = parseJson(str(formData, "content"));
  const seo = parseJson(str(formData, "seo"));
  return {
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    locale: str(formData, "locale"),
    status: str(formData, "status"),
    menuGroup: str(formData, "menuGroup"),
    menuLabel: str(formData, "menuLabel"),
    menuOrder: str(formData, "menuOrder"),
    showInMegaMenu: str(formData, "showInMegaMenu"),
    metaTitle: str(formData, "metaTitle"),
    metaDescription: str(formData, "metaDescription"),
    content,
    seo,
  };
}

async function uniqueSlug(base: string, locale: Locale, excludeId?: string): Promise<string> {
  const existing = await prisma.solutionPage.findMany({
    where: { locale, slug: { startsWith: base }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { slug: true },
  });
  const taken = new Set(existing.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/**
 * A published Solutions page is reachable at a URL and listed in the mega menu,
 * both of which are cached. Revalidate the page (old and new slug) and the
 * marketing layout that feeds the menu, for both locales.
 */
function revalidate(slugs: string[], group: SolutionMenuGroup) {
  revalidatePath("/dashboard/solutions-projects");
  revalidatePath("/dashboard");
  for (const locale of ["en", "fr"]) {
    revalidatePath(`/${locale}`, "layout");
    for (const slug of slugs) {
      if (slug) revalidatePath(`/${locale}${solutionEntryHref(group, slug)}`);
    }
  }
}

function rowData(data: SolutionPageFormValues) {
  return {
    title: data.title,
    locale: data.locale as Locale,
    status: data.status as DownloadStatus,
    menuGroup: data.menuGroup as SolutionMenuGroup,
    menuLabel: data.menuLabel,
    menuOrder: data.menuOrder,
    showInMegaMenu: data.showInMegaMenu,
    metaTitle: data.metaTitle ?? null,
    metaDescription: data.metaDescription ?? null,
    content: data.content as object,
    seo: data.seo as object,
  };
}

export async function createSolutionPage(formData: FormData): Promise<ActionResult> {
  const user = await requirePermission("solutionsPage.manage");

  const parsed = solutionPageSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const data = parsed.data;
  const locale = data.locale as Locale;
  const slug = await uniqueSlug(data.slug ?? makeSlug(data.title), locale);

  try {
    const page = await prisma.solutionPage.create({
      data: {
        ...rowData(data),
        slug,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        createdById: user.id,
      },
      select: { id: true },
    });
    revalidate([slug], data.menuGroup as SolutionMenuGroup);
    return { ok: true, id: page.id };
  } catch (error) {
    console.error("[solution-pages] create failed", error);
    return { ok: false, error: "Could not save this page. Please try again." };
  }
}

export async function updateSolutionPage(id: string, formData: FormData): Promise<ActionResult> {
  await requirePermission("solutionsPage.manage");

  const existing = await prisma.solutionPage.findUnique({
    where: { id },
    select: { id: true, slug: true, publishedAt: true, menuGroup: true },
  });
  if (!existing) return { ok: false, error: "This page no longer exists." };

  const parsed = solutionPageSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please fix the errors below.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const data = parsed.data;
  const locale = data.locale as Locale;
  const slug = await uniqueSlug(data.slug ?? makeSlug(data.title), locale, id);

  const publishedAt =
    data.status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt;

  try {
    await prisma.solutionPage.update({
      where: { id },
      data: { ...rowData(data), slug, publishedAt },
    });
    // Revalidate both the old and new placement so a renamed/moved page's stale
    // URL and menu entry drop.
    revalidate([slug, existing.slug], data.menuGroup as SolutionMenuGroup);
    revalidate([existing.slug], existing.menuGroup);
    return { ok: true, id };
  } catch (error) {
    console.error("[solution-pages] update failed", error);
    return { ok: false, error: "Could not save this page. Please try again." };
  }
}

export async function deleteSolutionPage(id: string): Promise<SimpleActionResult> {
  await requirePermission("solutionsPage.manage");

  const existing = await prisma.solutionPage.findUnique({
    where: { id },
    select: { slug: true, menuGroup: true, isProtectedTemplate: true },
  });
  if (!existing) return { ok: false, error: "This page no longer exists." };
  if (existing.isProtectedTemplate) {
    return { ok: false, error: "This is a protected master template and cannot be deleted." };
  }

  try {
    await prisma.solutionPage.delete({ where: { id } });
    revalidate([existing.slug], existing.menuGroup);
    return { ok: true };
  } catch (error) {
    console.error("[solution-pages] delete failed", error);
    return { ok: false, error: "Could not delete this page. Please try again." };
  }
}

export async function duplicateSolutionPage(id: string): Promise<SimpleActionResult> {
  const user = await requirePermission("solutionsPage.manage");

  const source = await prisma.solutionPage.findUnique({ where: { id } });
  if (!source) return { ok: false, error: "This page no longer exists." };

  const slug = await uniqueSlug(`${source.slug}-copy`, source.locale);
  try {
    const copy = await prisma.solutionPage.create({
      data: {
        title: `${source.title} (copy)`,
        slug,
        locale: source.locale,
        status: DownloadStatus.DRAFT,
        publishedAt: null,
        menuGroup: source.menuGroup,
        menuLabel: source.menuLabel,
        menuOrder: source.menuOrder,
        showInMegaMenu: false,
        metaTitle: source.metaTitle,
        metaDescription: source.metaDescription,
        content: source.content as object,
        seo: (source.seo as object) ?? undefined,
        createdById: user.id,
      },
      select: { id: true },
    });
    revalidatePath("/dashboard/solutions-projects");
    return { ok: true, id: copy.id };
  } catch (error) {
    console.error("[solution-pages] duplicate failed", error);
    return { ok: false, error: "Could not duplicate this page. Please try again." };
  }
}
