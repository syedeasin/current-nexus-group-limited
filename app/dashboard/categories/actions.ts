"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";
import { fieldErrorsOf } from "@/lib/validation/user";
import { routing } from "@/i18n/routing";

export type TaxonomyResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

const categorySchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(80, "Keep the name under 80 characters."),
  slug: z.string().trim().max(80),
  locale: z.enum(["EN", "FR"]),
  description: optionalText(300, "Description"),
  parentId: z.string().trim().transform((v) => (v === "" ? null : v)),
  sortOrder: z.coerce.number().int("Use a whole number.").min(0).max(9999),
  metaTitle: optionalText(70, "SEO title"),
  metaDescription: optionalText(170, "SEO description"),
});

function revalidateCategories() {
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/posts");
  // Category names appear on article pages.
  for (const locale of routing.locales) revalidatePath(`/${locale}/news`, "layout");
}

function read(formData: FormData) {
  const value = (key: string) => String(formData.get(key) ?? "");
  return categorySchema.safeParse({
    name: value("name"),
    slug: value("slug"),
    locale: value("locale") || "EN",
    description: value("description"),
    parentId: value("parentId"),
    sortOrder: value("sortOrder") || "0",
    metaTitle: value("metaTitle"),
    metaDescription: value("metaDescription"),
  });
}

async function validateParent(parentId: string | null, locale: "EN" | "FR", selfId?: string): Promise<string | null> {
  if (!parentId) return null;
  if (parentId === selfId) return "A category can't be its own parent.";
  const parent = await prisma.category.findUnique({ where: { id: parentId }, select: { locale: true, parentId: true } });
  if (!parent) return "That parent category no longer exists.";
  if (parent.locale !== locale) return "Pick a parent in the same language.";
  // Walk up from the chosen parent: reaching selfId would create a loop.
  let cursor = parent.parentId;
  for (let depth = 0; cursor && depth < 20; depth += 1) {
    if (cursor === selfId) return "That would put the category inside itself.";
    cursor = (await prisma.category.findUnique({ where: { id: cursor }, select: { parentId: true } }))?.parentId ?? null;
  }
  return null;
}

function slugTaken(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createCategory(formData: FormData): Promise<TaxonomyResult> {
  await requirePermission("category.manage");
  const parsed = read(formData);
  if (!parsed.success) return { ok: false, error: "Fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };

  const data = parsed.data;
  const slug = makeSlug(data.slug || data.name);
  if (!slug) return { ok: false, error: "Fix the highlighted field.", fieldErrors: { slug: "Use letters or numbers in the name or slug." } };
  const parentError = await validateParent(data.parentId, data.locale);
  if (parentError) return { ok: false, error: "Fix the highlighted field.", fieldErrors: { parentId: parentError } };

  try {
    await prisma.category.create({ data: { ...data, slug } });
  } catch (error) {
    if (slugTaken(error)) {
      return { ok: false, error: "Fix the highlighted field.", fieldErrors: { slug: "Another category in this language already uses this slug." } };
    }
    throw error;
  }
  revalidateCategories();
  return { ok: true };
}

export async function updateCategory(id: string, formData: FormData): Promise<TaxonomyResult> {
  await requirePermission("category.manage");
  const parsed = read(formData);
  if (!parsed.success) return { ok: false, error: "Fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };

  const data = parsed.data;
  const slug = makeSlug(data.slug || data.name);
  if (!slug) return { ok: false, error: "Fix the highlighted field.", fieldErrors: { slug: "Use letters or numbers in the name or slug." } };
  const parentError = await validateParent(data.parentId, data.locale, id);
  if (parentError) return { ok: false, error: "Fix the highlighted field.", fieldErrors: { parentId: parentError } };

  try {
    await prisma.category.update({ where: { id }, data: { ...data, slug } });
  } catch (error) {
    if (slugTaken(error)) {
      return { ok: false, error: "Fix the highlighted field.", fieldErrors: { slug: "Another category in this language already uses this slug." } };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "This category no longer exists." };
    }
    throw error;
  }
  revalidateCategories();
  return { ok: true };
}

/** Posts in the category become uncategorised and child categories move up a level (onDelete: SetNull). */
export async function deleteCategory(id: string): Promise<TaxonomyResult> {
  await requirePermission("category.manage");
  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return { ok: true };
    throw error;
  }
  revalidateCategories();
  return { ok: true };
}
