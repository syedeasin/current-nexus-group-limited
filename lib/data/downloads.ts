import "server-only";

import { Prisma, DownloadStatus, type Locale } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SORT,
  DOWNLOADS_PER_PAGE,
  type DownloadQueryResult,
  type DownloadSort,
  type FilterGroupView,
  type SelectedFilters,
} from "@/lib/downloads-types";

/**
 * Server-side query layer for Service → Downloads.
 *
 * Everything the page shows — the sidebar taxonomy, the result rows, the
 * "N results found" count, the page count — is derived from one of these
 * functions. Nothing is filtered, searched, sorted or counted in the browser:
 * a catalogue of technical documents is expected to run to thousands of rows,
 * so the database does the work and the page only ever receives one page of
 * results.
 *
 * @see prisma/schema.prisma — FilterGroup / FilterOption / DownloadResource
 */

/** Query-string keys the page owns. A filter group slug may never collide with one. */
export const RESERVED_QUERY_KEYS = ["q", "sort", "page"] as const;

// Shapes and sort vocabulary live in a client-safe module so the filter UI can
// share them without pulling `server-only` into the browser bundle. Re-exported
// here so server callers still have one import site.
export {
  DOWNLOAD_SORTS,
  DEFAULT_SORT,
  DOWNLOADS_PER_PAGE,
  isDownloadSort,
} from "@/lib/downloads-types";
export type {
  DownloadSort,
  FilterOptionView,
  FilterGroupView,
  DownloadItemView,
  DownloadQueryResult,
  SelectedFilters,
} from "@/lib/downloads-types";

export interface DownloadQuery {
  locale: Locale;
  search?: string;
  filters?: SelectedFilters;
  sort?: DownloadSort;
  page?: number;
  perPage?: number;
}

/**
 * Faceted-search semantics, and the reason the WHERE clause is shaped the way
 * it is: options *within* one group widen the result set (HJT **or** TOPCon),
 * options *across* groups narrow it (HJT **and** a Datasheet). So each group
 * contributes its own `some` clause and the clauses are AND-ed together.
 */
function buildWhere(
  locale: Locale,
  search: string | undefined,
  filters: SelectedFilters | undefined
): Prisma.DownloadResourceWhereInput {
  const and: Prisma.DownloadResourceWhereInput[] = [];

  for (const [groupSlug, optionSlugs] of Object.entries(filters ?? {})) {
    const slugs = optionSlugs.filter(Boolean);
    if (slugs.length === 0) continue;
    and.push({
      filterOptions: {
        some: {
          option: {
            isActive: true,
            slug: { in: slugs },
            group: { slug: groupSlug, locale, isActive: true },
          },
        },
      },
    });
  }

  const term = search?.trim();
  if (term) {
    and.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { fileName: { contains: term, mode: "insensitive" } },
        { tags: { has: term.toLowerCase() } },
        { filterOptions: { some: { option: { name: { contains: term, mode: "insensitive" } } } } },
      ],
    });
  }

  return {
    locale,
    status: DownloadStatus.PUBLISHED,
    ...(and.length > 0 ? { AND: and } : {}),
  };
}

function buildOrderBy(sort: DownloadSort): Prisma.DownloadResourceOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ publishedAt: "desc" }, { createdAt: "desc" }];
    case "oldest":
      return [{ publishedAt: "asc" }, { createdAt: "asc" }];
    case "az":
      return [{ title: "asc" }];
    case "relevant":
    default:
      // "Most relevant" with no relevance signal to rank by is the curated
      // order: whatever the admin pinned first, then newest.
      return [{ displayOrder: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }];
  }
}

export function downloadHref(id: string): string {
  return `/api/downloads/${id}`;
}

export async function queryDownloads({
  locale,
  search,
  filters,
  sort = DEFAULT_SORT,
  page = 1,
  perPage = DOWNLOADS_PER_PAGE,
}: DownloadQuery): Promise<DownloadQueryResult> {
  const where = buildWhere(locale, search, filters);
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  const total = await prisma.downloadResource.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  // A page number past the end (stale link, filter narrowed the set) clamps to
  // the last page instead of rendering an empty list over a non-zero count.
  const current = Math.min(safePage, totalPages);

  const rows = await prisma.downloadResource.findMany({
    where,
    orderBy: buildOrderBy(sort),
    skip: (current - 1) * perPage,
    take: perPage,
    select: {
      id: true,
      title: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
    },
  });

  return {
    items: rows.map((row) => ({ ...row, downloadHref: downloadHref(row.id) })),
    total,
    page: current,
    totalPages,
    perPage,
  };
}

/**
 * The sidebar taxonomy for one locale, with a published-resource count per
 * option. Counts ignore the active selection on purpose — a facet that drops to
 * zero the moment you tick it is worse than one that always says how much is
 * behind it.
 */
export async function getFilterTaxonomy(locale: Locale): Promise<FilterGroupView[]> {
  const groups = await prisma.filterGroup.findMany({
    where: { locale, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      options: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              downloads: {
                where: { download: { status: DownloadStatus.PUBLISHED, locale } },
              },
            },
          },
        },
      },
    },
  });

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    slug: group.slug,
    options: group.options.map((option) => ({
      id: option.id,
      name: option.name,
      slug: option.slug,
      count: option._count.downloads,
    })),
  }));
}

/** What the controlled download route needs to serve a file. */
export async function getDownloadForDelivery(id: string) {
  return prisma.downloadResource.findFirst({
    where: { id, status: DownloadStatus.PUBLISHED },
    select: { id: true, fileKey: true, fileUrl: true, fileName: true, mimeType: true, fileSize: true },
  });
}

/**
 * Best-effort delivery counter. A failure here must never turn a working
 * download into an error response, so the caller fires it and moves on.
 */
export async function recordDownloadHit(id: string): Promise<void> {
  try {
    await prisma.downloadResource.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  } catch {
    // Counting is telemetry, not part of the contract with the user.
  }
}
