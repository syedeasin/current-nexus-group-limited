import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FiltersManager, { type GroupView } from "@/app/dashboard/downloads/filters/filters-manager";

export default async function DownloadFiltersPage() {
  await requirePermission("download.manage");

  const groups = await prisma.filterGroup.findMany({
    orderBy: [{ locale: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      locale: true,
      sortOrder: true,
      isActive: true,
      options: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          sortOrder: true,
          isActive: true,
          _count: { select: { downloads: true } },
        },
      },
    },
  });

  // A download tagged with two options in the same group must only be warned
  // about once, so the per-group figure is counted over distinct downloads.
  const joins = await prisma.downloadResourceFilterOption.findMany({
    select: { downloadId: true, option: { select: { groupId: true } } },
  });
  const distinctByGroup = new Map<string, Set<string>>();
  for (const join of joins) {
    const set = distinctByGroup.get(join.option.groupId) ?? new Set<string>();
    set.add(join.downloadId);
    distinctByGroup.set(join.option.groupId, set);
  }

  const views: GroupView[] = groups.map((group) => ({
    id: group.id,
    name: group.name,
    slug: group.slug,
    locale: group.locale,
    sortOrder: group.sortOrder,
    isActive: group.isActive,
    taggedDownloads: distinctByGroup.get(group.id)?.size ?? 0,
    options: group.options.map((option) => ({
      id: option.id,
      name: option.name,
      slug: option.slug,
      sortOrder: option.sortOrder,
      isActive: option.isActive,
      downloadCount: option._count.downloads,
    })),
  }));

  return (
    <div>
      <div className="mb-32">
        <Link
          href="/dashboard/downloads"
          className="inline-flex items-center gap-4 text-p4 font-semibold uppercase tracking-[2px] text-primary transition-colors duration-200 hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
          Downloads
        </Link>
        <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
          Filter taxonomy
        </h1>
        <p className="mt-8 max-w-2xl text-p3 font-light text-neutral-5">
          Groups are the facets beside the public downloads list; options are the checkboxes inside
          them. Each group owns a query-string key named after its slug, and groups are
          locale-specific. Deactivating hides a facet from the public site without losing how
          documents are tagged.
        </p>
      </div>

      <FiltersManager groups={views} />
    </div>
  );
}
