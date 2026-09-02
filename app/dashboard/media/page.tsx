import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import MediaTile from "@/components/dashboard/media-tile";
import EmptyState from "@/components/dashboard/empty-state";
import Pagination from "@/components/dashboard/pagination";

const PER_PAGE = 24;

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requirePermission("media.upload");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const [total, media] = await Promise.all([
    prisma.media.count(),
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        url: true,
        fileName: true,
        size: true,
        width: true,
        height: true,
        alt: true,
        createdAt: true,
        uploadedById: true,
        uploadedBy: { select: { name: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const canDeleteAny = can(user.role, "media.deleteAny");

  function pageHref(n: number) {
    return n > 1 ? `/dashboard/media?page=${n}` : "/dashboard/media";
  }

  return (
    <div>
      <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Content</p>
      <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
        Media
      </h1>
      <p className="mt-8 text-p3 font-light text-neutral-5">
        {total} {total === 1 ? "file" : "files"}
      </p>

      <div className="mt-32">
        {media.length === 0 ? (
          <EmptyState
            title="No media yet"
            description="Uploads from the post editor will show up here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {media.map((item) => (
              <MediaTile
                key={item.id}
                media={item}
                canDelete={canDeleteAny || item.uploadedById === user.id}
              />
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} hrefFor={pageHref} />
    </div>
  );
}
