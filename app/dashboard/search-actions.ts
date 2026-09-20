"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type SearchResult = {
  type: "Post" | "Manufacturing" | "Solutions & Projects" | "Download" | "Media";
  title: string;
  subtitle?: string;
  status?: string;
  href: string;
};

const PER_TYPE_LIMIT = 5;

export async function globalSearch(rawQuery: string): Promise<SearchResult[]> {
  await requireUser();

  const query = rawQuery.trim();
  if (query.length < 2) return [];

  const [posts, manufacturing, solutions, downloads, media] = await Promise.all([
    prisma.post.findMany({
      where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }] },
      select: { id: true, title: true, status: true, category: { select: { name: true } } },
      take: PER_TYPE_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.manufacturingPage.findMany({
      where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }] },
      select: { id: true, title: true, status: true, category: true },
      take: PER_TYPE_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.solutionPage.findMany({
      where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }] },
      select: { id: true, title: true, status: true, menuGroup: true },
      take: PER_TYPE_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.downloadResource.findMany({
      where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }] },
      select: { id: true, title: true, status: true },
      take: PER_TYPE_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.media.findMany({
      where: { OR: [{ fileName: { contains: query, mode: "insensitive" } }, { alt: { contains: query, mode: "insensitive" } }] },
      select: { id: true, fileName: true },
      take: PER_TYPE_LIMIT,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const results: SearchResult[] = [
    ...posts.map((p) => ({
      type: "Post" as const,
      title: p.title,
      subtitle: p.category?.name,
      status: p.status,
      href: `/dashboard/posts/${p.id}/edit`,
    })),
    ...manufacturing.map((m) => ({
      type: "Manufacturing" as const,
      title: m.title,
      subtitle: m.category,
      status: m.status,
      href: `/dashboard/manufacturing/${m.id}/edit`,
    })),
    ...solutions.map((s) => ({
      type: "Solutions & Projects" as const,
      title: s.title,
      subtitle: s.menuGroup,
      status: s.status,
      href: `/dashboard/solutions-projects/${s.id}/edit`,
    })),
    ...downloads.map((d) => ({
      type: "Download" as const,
      title: d.title,
      status: d.status,
      href: `/dashboard/downloads/${d.id}/edit`,
    })),
    ...media.map((m) => ({
      type: "Media" as const,
      title: m.fileName,
      href: `/dashboard/media`,
    })),
  ];

  return results;
}
