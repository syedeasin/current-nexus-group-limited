import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PostStatus, type Prisma } from "@prisma/client";
import PostsFilters from "@/components/dashboard/posts-filters";
import PostsTable from "@/components/dashboard/posts-table";
import Pagination from "@/components/dashboard/pagination";
import EmptyState from "@/components/dashboard/empty-state";

const PER_PAGE = 20;
const VALID_STATUSES = new Set<string>(Object.values(PostStatus));

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const user = await requirePermission("post.create");
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const query = sp.q?.trim() ?? "";
  const status = sp.status && VALID_STATUSES.has(sp.status) ? (sp.status as PostStatus) : undefined;

  const where: Prisma.PostWhereInput = {
    ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
    ...(status ? { status } : {}),
    ...(can(user.role, "post.viewAll") ? {} : { authorId: user.id }),
  };

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        locale: true,
        status: true,
        updatedAt: true,
        viewCount: true,
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const isFiltered = Boolean(query || status);
  const canPublish = can(user.role, "post.publish");

  function pageHref(n: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `/dashboard/posts?${qs}` : "/dashboard/posts";
  }

  return (
    <div>
      <div className="mb-32 flex flex-wrap items-end justify-between gap-16">
        <div>
          <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Content</p>
          <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
            Posts
          </h1>
          <p className="mt-8 text-p3 font-light text-neutral-5">
            {total} {total === 1 ? "post" : "posts"}
            {isFiltered ? " matching your filters" : " in total"}
          </p>
        </div>

        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center gap-8 rounded-full bg-primary px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus size={15} strokeWidth={2} aria-hidden="true" />
          New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
        <PostsFilters query={query} status={status ?? ""} />

        {posts.length === 0 ? (
          <div className="p-32">
            <EmptyState
              title={isFiltered ? "No matching posts" : "No posts yet"}
              description={
                isFiltered
                  ? "Try a different search term or clear the status filter."
                  : "Create your first article to start building the CNX Energy newsroom."
              }
              actionLabel={isFiltered ? undefined : "Create your first post"}
            />
          </div>
        ) : (
          <PostsTable posts={posts} canPublish={canPublish} />
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} hrefFor={pageHref} />
    </div>
  );
}
