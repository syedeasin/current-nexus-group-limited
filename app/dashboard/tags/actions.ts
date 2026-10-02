"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";
import { fieldErrorsOf } from "@/lib/validation/user";
import type { TaxonomyResult } from "@/app/dashboard/categories/actions";

const tagSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(50, "Keep the tag under 50 characters."),
  slug: z.string().trim().max(60),
  locale: z.enum(["EN", "FR"]),
});

function read(formData: FormData) {
  return tagSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    locale: String(formData.get("locale") ?? "") || "EN",
  });
}

function revalidateTags() {
  revalidatePath("/dashboard/tags");
  revalidatePath("/dashboard/posts");
}

function isKnown(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

export async function createTag(formData: FormData): Promise<TaxonomyResult> {
  await requirePermission("tag.manage");
  const parsed = read(formData);
  if (!parsed.success) return { ok: false, error: "Fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };

  const slug = makeSlug(parsed.data.slug || parsed.data.name);
  if (!slug) return { ok: false, error: "Fix the highlighted field.", fieldErrors: { slug: "Use letters or numbers." } };
  try {
    await prisma.tag.create({ data: { ...parsed.data, slug } });
  } catch (error) {
    if (isKnown(error, "P2002")) {
      return { ok: false, error: "Fix the highlighted field.", fieldErrors: { slug: "This tag already exists in this language." } };
    }
    throw error;
  }
  revalidateTags();
  return { ok: true };
}

export async function updateTag(id: string, formData: FormData): Promise<TaxonomyResult> {
  await requirePermission("tag.manage");
  const parsed = read(formData);
  if (!parsed.success) return { ok: false, error: "Fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };

  const slug = makeSlug(parsed.data.slug || parsed.data.name);
  if (!slug) return { ok: false, error: "Fix the highlighted field.", fieldErrors: { slug: "Use letters or numbers." } };
  try {
    await prisma.tag.update({ where: { id }, data: { ...parsed.data, slug } });
  } catch (error) {
    if (isKnown(error, "P2002")) {
      return { ok: false, error: "Fix the highlighted field.", fieldErrors: { slug: "Another tag in this language already uses this slug." } };
    }
    if (isKnown(error, "P2025")) return { ok: false, error: "This tag no longer exists." };
    throw error;
  }
  revalidateTags();
  return { ok: true };
}

/** Removes the tag from every post that had it (post_tags rows cascade). */
export async function deleteTag(id: string): Promise<TaxonomyResult> {
  await requirePermission("tag.manage");
  try {
    await prisma.tag.delete({ where: { id } });
  } catch (error) {
    if (!isKnown(error, "P2025")) throw error;
  }
  revalidateTags();
  return { ok: true };
}
