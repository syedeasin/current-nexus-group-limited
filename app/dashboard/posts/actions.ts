"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import type { Locale, PostStatus } from "@prisma/client";
import type { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { can, canEditPost, canDeletePost } from "@/lib/permissions";
import { postSchema, type PostFormValues } from "@/lib/validation/post";
import { makeSlug, uniquePostSlug, readingTimeFromHtml } from "@/lib/slug";
import { sanitizePostHtml } from "@/lib/sanitize-html";

export type ActionResult =
  | { ok: true; id: string; note?: string }
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
    excerpt: formValue(formData, "excerpt"),
    content: formValue(formData, "content"),
    status: formValue(formData, "status"),
    categoryId: formValue(formData, "categoryId"),
    tags: formValue(formData, "tags"),
    featuredImage: formValue(formData, "featuredImage"),
    featuredImageAlt: formValue(formData, "featuredImageAlt"),
    metaTitle: formValue(formData, "metaTitle"),
    metaDescription: formValue(formData, "metaDescription"),
    focusKeyword: formValue(formData, "focusKeyword"),
    canonicalUrl: formValue(formData, "canonicalUrl"),
    ogImage: formValue(formData, "ogImage"),
    noIndex: formValue(formData, "noIndex"),
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

function resolveStatus(
  requested: PostStatus,
  canPublish: boolean
): { status: PostStatus; note?: string } {
  if (requested === "PUBLISHED" && !canPublish) {
    return {
      status: "PENDING_REVIEW",
      note: "You do not have permission to publish directly. Submitted for review instead.",
    };
  }
  return { status: requested };
}

function sharedPostData(data: PostFormValues) {
  return {
    title: data.title,
    locale: data.locale,
    excerpt: data.excerpt ?? null,
    content: data.content,
    categoryId: data.categoryId,
    featuredImage: data.featuredImage ?? null,
    featuredImageAlt: data.featuredImageAlt ?? null,
    metaTitle: data.metaTitle ?? null,
    metaDescription: data.metaDescription ?? null,
    focusKeyword: data.focusKeyword ?? null,
    canonicalUrl: data.canonicalUrl ?? null,
    ogImage: data.ogImage ?? null,
    noIndex: data.noIndex,
  };
}

async function resolveTagIds(raw: string | undefined, locale: Locale): Promise<string[]> {
  if (!raw) return [];

  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of raw.split(",")) {
    const name = part.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }

  const ids: string[] = [];
  for (const name of names) {
    const slug = makeSlug(name);
    const tag = await prisma.tag.upsert({
      where: { slug_locale: { slug, locale } },
      update: {},
      create: { name, slug, locale },
    });
    ids.push(tag.id);
  }
  return ids;
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  const user = await requirePermission("post.create");

  const parsed = postSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  const data = { ...parsed.data, content: sanitizePostHtml(parsed.data.content) };

  const { status, note } = resolveStatus(data.status, can(user.role, "post.publish"));

  const baseSlug = data.slug ?? makeSlug(data.title);
  const slug = await uniquePostSlug(baseSlug, data.locale);
  const readingTime = readingTimeFromHtml(data.content);
  const tagIds = await resolveTagIds(data.tags, data.locale);

  const post = await prisma.post.create({
    data: {
      ...sharedPostData(data),
      slug,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      readingTime,
      authorId: user.id,
    },
  });

  if (tagIds.length) {
    await prisma.postTag.createMany({
      data: tagIds.map((tagId) => ({ postId: post.id, tagId })),
    });
  }

  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard");

  return { ok: true, id: post.id, note };
}

export async function updatePost(id: string, formData: FormData): Promise<ActionResult> {
  const user = await requirePermission("post.create");

  const existing = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true, status: true, publishedAt: true },
  });
  if (!existing) notFound();
  if (!canEditPost(user, existing)) notFound();

  const parsed = postSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  const data = { ...parsed.data, content: sanitizePostHtml(parsed.data.content) };

  const { status, note } = resolveStatus(data.status, can(user.role, "post.publish"));

  const baseSlug = data.slug ?? makeSlug(data.title);
  const slug = await uniquePostSlug(baseSlug, data.locale, id);
  const readingTime = readingTimeFromHtml(data.content);
  const newTagIds = await resolveTagIds(data.tags, data.locale);

  const publishedAt =
    status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt;

  await prisma.post.update({
    where: { id },
    data: {
      ...sharedPostData(data),
      slug,
      status,
      publishedAt,
      readingTime,
    },
  });

  const currentTagRows = await prisma.postTag.findMany({
    where: { postId: id },
    select: { tagId: true },
  });
  const currentTagIds = new Set(currentTagRows.map((row) => row.tagId));
  const newTagIdSet = new Set(newTagIds);
  const toRemove = [...currentTagIds].filter((tagId) => !newTagIdSet.has(tagId));
  const toAdd = newTagIds.filter((tagId) => !currentTagIds.has(tagId));

  await prisma.$transaction([
    prisma.postTag.deleteMany({ where: { postId: id, tagId: { in: toRemove } } }),
    prisma.postTag.createMany({ data: toAdd.map((tagId) => ({ postId: id, tagId })) }),
  ]);

  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard");

  return { ok: true, id, note };
}

export async function deletePost(id: string): Promise<SimpleActionResult> {
  const user = await requirePermission("post.create");

  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true, status: true },
  });
  if (!post) notFound();
  if (!canDeletePost(user, post)) notFound();

  await prisma.post.delete({ where: { id } });

  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard");

  return { ok: true };
}

export async function publishPost(id: string): Promise<SimpleActionResult> {
  await requirePermission("post.publish");

  const post = await prisma.post.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!post) notFound();

  await prisma.post.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: post.publishedAt ?? new Date() },
  });

  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard");

  return { ok: true };
}

export async function unpublishPost(id: string): Promise<SimpleActionResult> {
  await requirePermission("post.publish");

  const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
  if (!post) notFound();

  await prisma.post.update({ where: { id }, data: { status: "DRAFT" } });

  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard");

  return { ok: true };
}
