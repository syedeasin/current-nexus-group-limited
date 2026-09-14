"use server";

import { revalidatePath } from "next/cache";
import type { Locale } from "@prisma/client";
import type { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";
import { putFile, deleteFile, type StoredFile } from "@/lib/storage";
import { validateDocumentUpload } from "@/lib/validation/upload";
import { downloadSchema, type DownloadFormValues } from "@/app/dashboard/downloads/schema";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type SimpleActionResult = { ok: true } | { ok: false; error: string };

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseFormData(formData: FormData) {
  return {
    title: formValue(formData, "title"),
    slug: formValue(formData, "slug"),
    locale: formValue(formData, "locale"),
    description: formValue(formData, "description"),
    status: formValue(formData, "status"),
    displayOrder: formValue(formData, "displayOrder"),
    tags: formValue(formData, "tags"),
  };
}

function fieldErrorsFrom(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const tag = part.trim().toLowerCase();
    if (tag) seen.add(tag);
  }
  return [...seen].slice(0, 20);
}

/**
 * Option ids come off a checkbox list in the browser, so they are re-checked
 * against the taxonomy before any join row is written.
 */
async function resolveOptionIds(formData: FormData): Promise<string[]> {
  const submitted = formData
    .getAll("filterOptionIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  if (submitted.length === 0) return [];

  const known = await prisma.filterOption.findMany({
    where: { id: { in: [...new Set(submitted)] } },
    select: { id: true },
  });
  return known.map((option) => option.id);
}

/** slug, or slug-2, slug-3 … until free within the locale. */
async function uniqueDownloadSlug(
  base: string,
  locale: Locale,
  excludeId?: string
): Promise<string> {
  const existing = await prisma.downloadResource.findMany({
    where: {
      locale,
      slug: { startsWith: base },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const taken = new Set(existing.map((row) => row.slug));
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}

/**
 * Unlink a storage object only once nothing points at it any more.
 *
 * An EN row and a FR row may legitimately share one language-neutral PDF, so a
 * blind delete on replace or delete would break the sibling. The DB is the
 * source of truth: this runs after the row has been written, and a failure is
 * logged rather than surfaced — an orphaned byte range costs disk, a failed
 * request costs the user their work.
 */
async function unlinkIfOrphaned(fileKey: string): Promise<void> {
  try {
    const references = await prisma.downloadResource.count({ where: { fileKey } });
    if (references > 0) return;
    await deleteFile(fileKey);
  } catch (error) {
    console.error(`[downloads] storage cleanup failed for key "${fileKey}"`, error);
  }
}

function revalidateDownloads() {
  revalidatePath("/dashboard/downloads");
  revalidatePath("/dashboard");
  revalidatePath("/en/service/downloads");
  revalidatePath("/fr/service/downloads");
}

function sharedData(data: DownloadFormValues) {
  return {
    title: data.title,
    locale: data.locale,
    description: data.description ?? null,
    status: data.status,
    displayOrder: data.displayOrder,
    tags: parseTags(data.tags),
  };
}

/** Validates magic bytes before anything touches storage. */
async function storeUpload(
  file: File
): Promise<{ ok: true; stored: StoredFile } | { ok: false; error: string }> {
  const validation = await validateDocumentUpload(file);
  if (!validation.ok) return { ok: false, error: validation.error };

  try {
    const stored = await putFile(file, { prefix: "downloads" });
    return { ok: true, stored };
  } catch (error) {
    console.error("[downloads] upload failed", error);
    return { ok: false, error: "Could not store the file. Please try again." };
  }
}

export async function createDownload(formData: FormData): Promise<ActionResult> {
  const user = await requirePermission("download.manage");

  const parsed = downloadSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  const data = parsed.data;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: { file: "A document is required." },
    };
  }

  const upload = await storeUpload(file);
  if (!upload.ok) {
    return { ok: false, error: "Please fix the errors below.", fieldErrors: { file: upload.error } };
  }
  const stored = upload.stored;

  const optionIds = await resolveOptionIds(formData);
  const slug = await uniqueDownloadSlug(data.slug ?? makeSlug(data.title), data.locale);

  try {
    const resource = await prisma.downloadResource.create({
      data: {
        ...sharedData(data),
        slug,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        fileUrl: stored.url,
        fileKey: stored.key,
        fileName: stored.fileName,
        mimeType: stored.mimeType,
        fileSize: stored.size,
        uploadedById: user.id,
        ...(optionIds.length
          ? { filterOptions: { createMany: { data: optionIds.map((optionId) => ({ optionId })) } } }
          : {}),
      },
      select: { id: true },
    });

    revalidateDownloads();
    return { ok: true, id: resource.id };
  } catch (error) {
    console.error("[downloads] create failed", error);
    // The key was minted by putFile moments ago and nothing else can reference
    // it yet, so rolling it back needs no reference check.
    await deleteFile(stored.key).catch((cleanupError) => {
      console.error(`[downloads] rollback failed for key "${stored.key}"`, cleanupError);
    });
    return { ok: false, error: "Could not save this download. Please try again." };
  }
}

export async function updateDownload(id: string, formData: FormData): Promise<ActionResult> {
  await requirePermission("download.manage");

  const existing = await prisma.downloadResource.findUnique({
    where: { id },
    select: { id: true, fileKey: true, publishedAt: true },
  });
  if (!existing) return { ok: false, error: "This download no longer exists." };

  const parsed = downloadSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  const data = parsed.data;

  // On edit the file is optional: an empty input means "keep what is there".
  const file = formData.get("file");
  let stored: StoredFile | null = null;
  if (file instanceof File && file.size > 0) {
    const upload = await storeUpload(file);
    if (!upload.ok) {
      return {
        ok: false,
        error: "Please fix the errors below.",
        fieldErrors: { file: upload.error },
      };
    }
    stored = upload.stored;
  }

  const optionIds = await resolveOptionIds(formData);
  const slug = await uniqueDownloadSlug(data.slug ?? makeSlug(data.title), data.locale, id);

  // Publishing stamps publishedAt once; unpublishing leaves it alone so the
  // original go-live date survives a round trip through DRAFT.
  const publishedAt =
    data.status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt;

  try {
    await prisma.$transaction([
      prisma.downloadResource.update({
        where: { id },
        data: {
          ...sharedData(data),
          slug,
          publishedAt,
          ...(stored
            ? {
                fileUrl: stored.url,
                fileKey: stored.key,
                fileName: stored.fileName,
                mimeType: stored.mimeType,
                fileSize: stored.size,
              }
            : {}),
        },
      }),
      prisma.downloadResourceFilterOption.deleteMany({ where: { downloadId: id } }),
      prisma.downloadResourceFilterOption.createMany({
        data: optionIds.map((optionId) => ({ downloadId: id, optionId })),
      }),
    ]);
  } catch (error) {
    console.error("[downloads] update failed", error);
    if (stored) {
      await deleteFile(stored.key).catch((cleanupError) => {
        console.error(`[downloads] rollback failed for key "${stored.key}"`, cleanupError);
      });
    }
    return { ok: false, error: "Could not save this download. Please try again." };
  }

  // Row is committed, so the old key can be counted honestly.
  if (stored && existing.fileKey !== stored.key) {
    await unlinkIfOrphaned(existing.fileKey);
  }

  revalidateDownloads();
  return { ok: true, id };
}

export async function deleteDownload(id: string): Promise<SimpleActionResult> {
  await requirePermission("download.manage");

  const existing = await prisma.downloadResource.findUnique({
    where: { id },
    select: { fileKey: true },
  });
  if (!existing) return { ok: false, error: "This download no longer exists." };

  try {
    // Join rows go with it via onDelete: Cascade.
    await prisma.downloadResource.delete({ where: { id } });
  } catch (error) {
    console.error("[downloads] delete failed", error);
    return { ok: false, error: "Could not delete this download. Please try again." };
  }

  await unlinkIfOrphaned(existing.fileKey);

  revalidateDownloads();
  return { ok: true };
}
