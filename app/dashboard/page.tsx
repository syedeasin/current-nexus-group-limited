import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import StatCard from "@/components/dashboard/stat-card";
import StatusBadge from "@/components/dashboard/status-badge";

export default async function DashboardOverview() {
  const user = await requireUser();

  const [published, drafts, categories, media, recent] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.category.count(),
    prisma.media.count(),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div>
      <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Overview</p>
      <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
        Welcome back, {user.name.split(" ")[0]}
      </h1>

      <div className="mt-40 overflow-hidden rounded-16 border border-neutral-10">
        <div className="grid grid-cols-1 gap-1 bg-neutral-10 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Published" value={published} hint="Live on the public site" />
          <StatCard label="Drafts" value={drafts} hint="Not yet visible" />
          <StatCard label="Categories" value={categories} hint="Across all locales" />
          <StatCard label="Media" value={media} hint="Uploaded assets" />
        </div>
      </div>

      <div className="mt-48">
        <h2 className="mb-20 text-h6 font-extralight tracking-[-0.2px] text-neutral-1">
          Recent activity
        </h2>

        {recent.length === 0 ? (
          <div className="rounded-16 border border-neutral-10 bg-white px-32 py-56 text-center">
            <p className="text-p3 font-light text-neutral-5">
              No posts yet. Once you publish your first article it will appear here.
            </p>
          </div>
        ) : (
          <ul className="rounded-16 border border-neutral-10 bg-white">
            {recent.map((post) => (
              <li
                key={post.id}
                className="flex items-center justify-between gap-16 border-b border-neutral-10 px-24 py-16 transition-colors duration-200 last:border-b-0 hover:bg-surface-1"
              >
                <div className="min-w-0">
                  <p className="truncate text-p3 font-light text-neutral-1">{post.title}</p>
                  <p className="mt-4 text-p4 text-neutral-5">
                    {post.category?.name ?? "Uncategorised"} ·{" "}
                    {post.updatedAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StatusBadge status={post.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
