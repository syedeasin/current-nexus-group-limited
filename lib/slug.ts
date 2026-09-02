import slugify from "slugify";
import type { Locale } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function makeSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export function readingTimeFromHtml(html: string): number {
  const words = html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Returns the given slug, or slug-2, slug-3 … until free for that locale.
// excludeId lets an edit keep its own slug.
export async function uniquePostSlug(
  base: string,
  locale: Locale,
  excludeId?: string
): Promise<string> {
  const existing = await prisma.post.findMany({
    where: {
      locale,
      slug: { startsWith: base },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const taken = new Set(existing.map((p) => p.slug));
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}
