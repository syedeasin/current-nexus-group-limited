import { prisma } from "@/lib/prisma";

export type ActivityItem = {
  id: string;
  title: string;
  kind: "Post" | "Manufacturing" | "Solutions & Projects";
  status: string;
  updatedAt: Date;
  category?: string | null;
};

export async function getDashboardOverview() {
  const [
    publishedPosts,
    draftPosts,
    categories,
    mediaCount,
    manufacturingTotal,
    manufacturingPublished,
    manufacturingDraft,
    manufacturingProtected,
    solutionsTotal,
    solutionsPublished,
    solutionsDraft,
    downloadsTotal,
    downloadsPublished,
    downloadsDraft,
    usersTotal,
    recentPosts,
    recentManufacturing,
    recentSolutions,
  ] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.category.count(),
    prisma.media.count(),
    prisma.manufacturingPage.count(),
    prisma.manufacturingPage.count({ where: { status: "PUBLISHED" } }),
    prisma.manufacturingPage.count({ where: { status: "DRAFT" } }),
    prisma.manufacturingPage.count({ where: { isProtectedTemplate: true } }),
    prisma.solutionPage.count(),
    prisma.solutionPage.count({ where: { status: "PUBLISHED" } }),
    prisma.solutionPage.count({ where: { status: "DRAFT" } }),
    prisma.downloadResource.count(),
    prisma.downloadResource.count({ where: { status: "PUBLISHED" } }),
    prisma.downloadResource.count({ where: { status: "DRAFT" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true, category: { select: { name: true } } },
    }),
    prisma.manufacturingPage.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true, category: true },
    }),
    prisma.solutionPage.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true, menuGroup: true },
    }),
  ]);

  const recentActivity: ActivityItem[] = [
    ...recentPosts.map((p) => ({
      id: p.id,
      title: p.title,
      kind: "Post" as const,
      status: p.status,
      updatedAt: p.updatedAt,
      category: p.category?.name ?? null,
    })),
    ...recentManufacturing.map((m) => ({
      id: m.id,
      title: m.title,
      kind: "Manufacturing" as const,
      status: m.status,
      updatedAt: m.updatedAt,
      category: m.category,
    })),
    ...recentSolutions.map((s) => ({
      id: s.id,
      title: s.title,
      kind: "Solutions & Projects" as const,
      status: s.status,
      updatedAt: s.updatedAt,
      category: s.menuGroup,
    })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  return {
    posts: { published: publishedPosts, draft: draftPosts, categories, media: mediaCount },
    manufacturing: {
      total: manufacturingTotal,
      published: manufacturingPublished,
      draft: manufacturingDraft,
      protected: manufacturingProtected,
    },
    solutions: { total: solutionsTotal, published: solutionsPublished, draft: solutionsDraft },
    downloads: { total: downloadsTotal, published: downloadsPublished, draft: downloadsDraft },
    users: { total: usersTotal },
    contentOverview: {
      posts: publishedPosts + draftPosts,
      manufacturing: manufacturingTotal,
      solutions: solutionsTotal,
      downloads: downloadsTotal,
      media: mediaCount,
    },
    recentActivity,
  };
}
