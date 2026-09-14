"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";
import {
  filterGroupSchema,
  filterOptionSchema,
  RESERVED_GROUP_SLUGS,
} from "@/app/dashboard/downloads/schema";

export type TaxonomyResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type SimpleTaxonomyResult = { ok: true } | { ok: false; error: string };

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function fieldErrorsFrom(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

function revalidateTaxonomy() {
  revalidatePath("/dashboard/downloads/filters");
  revalidatePath("/dashboard/downloads");
  revalidatePath("/en/service/downloads");
  revalidatePath("/fr/service/downloads");
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export async function createFilterGroup(formData: FormData): Promise<TaxonomyResult> {
  await requirePermission("download.manage");

  const parsed = filterGroupSchema.safeParse({
    name: formValue(formData, "name"),
    slug: formValue(formData, "slug"),
    locale: formValue(formData, "locale"),
    sortOrder: formValue(formData, "sortOrder"),
    isActive: formValue(formData, "isActive"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const slug = parsed.data.slug ?? makeSlug(parsed.data.name);
  // Each group owns a query-string key on the public page; the page's own keys
  // are off limits or the facet would be unreachable.
  if (RESERVED_GROUP_SLUGS.has(slug)) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: { slug: `"${slug}" is reserved by the downloads page. Choose another slug.` },
    };
  }

  try {
    const group = await prisma.filterGroup.create({
      data: { ...parsed.data, slug },
      select: { id: true },
    });
    revalidateTaxonomy();
    return { ok: true, id: group.id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: "Please fix the errors below.",
        fieldErrors: { slug: "A group with this slug already exists for that locale." },
      };
    }
    console.error("[downloads] create filter group failed", error);
    return { ok: false, error: "Could not create this group. Please try again." };
  }
}

export async function updateFilterGroup(
  id: string,
  formData: FormData
): Promise<TaxonomyResult> {
  await requirePermission("download.manage");

  const parsed = filterGroupSchema.safeParse({
    name: formValue(formData, "name"),
    slug: formValue(formData, "slug"),
    locale: formValue(formData, "locale"),
    sortOrder: formValue(formData, "sortOrder"),
    isActive: formValue(formData, "isActive"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const slug = parsed.data.slug ?? makeSlug(parsed.data.name);
  if (RESERVED_GROUP_SLUGS.has(slug)) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: { slug: `"${slug}" is reserved by the downloads page. Choose another slug.` },
    };
  }

  try {
    await prisma.filterGroup.update({ where: { id }, data: { ...parsed.data, slug } });
    revalidateTaxonomy();
    return { ok: true, id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: "Please fix the errors below.",
        fieldErrors: { slug: "A group with this slug already exists for that locale." },
      };
    }
    console.error("[downloads] update filter group failed", error);
    return { ok: false, error: "Could not save this group. Please try again." };
  }
}

export async function deleteFilterGroup(id: string): Promise<SimpleTaxonomyResult> {
  await requirePermission("download.manage");

  try {
    // Options and their join rows cascade — see prisma/schema.prisma.
    await prisma.filterGroup.delete({ where: { id } });
  } catch (error) {
    console.error("[downloads] delete filter group failed", error);
    return { ok: false, error: "Could not delete this group. Please try again." };
  }

  revalidateTaxonomy();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export async function createFilterOption(formData: FormData): Promise<TaxonomyResult> {
  await requirePermission("download.manage");

  const parsed = filterOptionSchema.safeParse({
    groupId: formValue(formData, "groupId"),
    name: formValue(formData, "name"),
    slug: formValue(formData, "slug"),
    sortOrder: formValue(formData, "sortOrder"),
    isActive: formValue(formData, "isActive"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const group = await prisma.filterGroup.findUnique({
    where: { id: parsed.data.groupId },
    select: { id: true },
  });
  if (!group) return { ok: false, error: "That filter group no longer exists." };

  const slug = parsed.data.slug ?? makeSlug(parsed.data.name);

  try {
    const option = await prisma.filterOption.create({
      data: { ...parsed.data, slug },
      select: { id: true },
    });
    revalidateTaxonomy();
    return { ok: true, id: option.id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: "Please fix the errors below.",
        fieldErrors: { slug: "An option with this slug already exists in that group." },
      };
    }
    console.error("[downloads] create filter option failed", error);
    return { ok: false, error: "Could not create this option. Please try again." };
  }
}

export async function updateFilterOption(
  id: string,
  formData: FormData
): Promise<TaxonomyResult> {
  await requirePermission("download.manage");

  const existing = await prisma.filterOption.findUnique({
    where: { id },
    select: { groupId: true },
  });
  if (!existing) return { ok: false, error: "That option no longer exists." };

  const parsed = filterOptionSchema.safeParse({
    // An option never moves between groups from this screen.
    groupId: existing.groupId,
    name: formValue(formData, "name"),
    slug: formValue(formData, "slug"),
    sortOrder: formValue(formData, "sortOrder"),
    isActive: formValue(formData, "isActive"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const slug = parsed.data.slug ?? makeSlug(parsed.data.name);

  try {
    await prisma.filterOption.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
    });
    revalidateTaxonomy();
    return { ok: true, id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: "Please fix the errors below.",
        fieldErrors: { slug: "An option with this slug already exists in that group." },
      };
    }
    console.error("[downloads] update filter option failed", error);
    return { ok: false, error: "Could not save this option. Please try again." };
  }
}

export async function deleteFilterOption(id: string): Promise<SimpleTaxonomyResult> {
  await requirePermission("download.manage");

  try {
    await prisma.filterOption.delete({ where: { id } });
  } catch (error) {
    console.error("[downloads] delete filter option failed", error);
    return { ok: false, error: "Could not delete this option. Please try again." };
  }

  revalidateTaxonomy();
  return { ok: true };
}
