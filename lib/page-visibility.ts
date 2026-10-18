import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DEFAULT_HIDDEN_PATHS, VISIBILITY_PAGES, normalizePath } from "@/config/page-visibility";

/** One `site_settings` row; absent until an admin first saves Page visibility. */
export const HIDDEN_PATHS_KEY = "hiddenPaths";

const KNOWN_PATHS = new Set(VISIBILITY_PAGES.map((page) => page.path));

export const hiddenPathsSchema = z
  .array(z.string().max(200))
  .max(VISIBILITY_PAGES.length)
  .transform((paths) => [...new Set(paths.map((path) => normalizePath(path)))].filter((path) => KNOWN_PATHS.has(path)));

/** Paths currently hidden from the public site. A database outage falls back to the defaults. */
export const getHiddenPaths = cache(async (): Promise<Set<string>> => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: HIDDEN_PATHS_KEY }, select: { value: true } });
    if (row) {
      const parsed = hiddenPathsSchema.safeParse(row.value);
      if (parsed.success) return new Set(parsed.data);
    }
  } catch (error) {
    console.error("[page-visibility] could not load hidden pages; using defaults", error);
  }
  return new Set(DEFAULT_HIDDEN_PATHS);
});

/** Call at the top of a page component: a hidden page answers 404. */
export async function assertPageVisible(path: string): Promise<void> {
  const hidden = await getHiddenPaths();
  if (hidden.has(normalizePath(path))) notFound();
}
