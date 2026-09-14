import Link from "next/link";
import { Plus, SlidersHorizontal } from "lucide-react";
import { DownloadStatus, Locale, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import Pagination from "@/components/dashboard/pagination";
import EmptyState from "@/components/dashboard/empty-state";
import DownloadsFilters from "@/app/dashboard/downloads/downloads-filters";
import DownloadsTable from "@/app/dashboard/downloads/downloads-table";

const PER_PAGE = 20;
const VALID_STATUSES = new Set<string>(Object.values(DownloadStatus));
const VALID_LOCALES = new Set<string>(Object.values(Locale));

export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; locale?: string; page?: string }>;
}) {
  await requirePermission("download.manage");
  const sp = await searchParams;

  const requestedPage = Math.max(1, Math.min(10000, Number(sp.page ?? 1) || 1));
  const query = sp.q?.trim() ?? "";
  const status =
    sp.status && VALID_STATUSES.has(sp.status) ? (sp.status as DownloadStatus) : undefined;
  const locale = sp.locale && VALID_LOCALES.has(sp.locale) ? (sp.locale as Locale) : undefined;

  const where: Prisma.DownloadResourceWhereInput = {
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { fileName: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(locale ? { locale } : {}),
  };

  const total = await prisma.downloadResource.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(requestedPage, totalPages);

  const downloads = await prisma.downloadResource.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
    select: {
      id: true,
      title: true,
      slug: true,
      locale: true,
      status: true,
      mimeType: true,
      fileName: true,
      fileSize: true,
      updatedAt: true,
      filterOptions: {
        select: { option: { select: { name: true, group: { select: { name: true } } } } },
        orderBy: { option: { sortOrder: "asc" } },
      },
    },
  });

  const isFiltered = Boolean(query || status || locale);

  function pageHref(n: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    if (locale) params.set("locale", locale);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `/dashboard/downloads?${qs}` : "/dashboard/downloads";
  }

  return (
    <div>
      <div className="mb-32 flex flex-wrap items-end justify-between gap-16">
        <div>
          <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Service</p>
          <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
            Downloads
          </h1>
          <p className="mt-8 text-p3 font-light text-neutral-5">
            {total} {total === 1 ? "document" : "documents"}
            {isFiltered ? " matching your filters" : " in total"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-8">
          <Link
            href="/dashboard/downloads/filters"
            className="inline-flex items-center gap-8 rounded-full border border-neutral-10 px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <SlidersHorizontal size={15} strokeWidth={1.5} aria-hidden="true" />
            Manage filters
          </Link>
          <Link
            href="/dashboard/downloads/new"
            className="inline-flex items-center gap-8 rounded-full bg-primary px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus size={15} strokeWidth={2} aria-hidden="true" />
            New Download
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
        <DownloadsFilters query={query} status={status ?? ""} locale={locale ?? ""} />

        {downloads.length === 0 ? (
          <div className="p-32">
            <EmptyState
              title={isFiltered ? "No matching downloads" : "No downloads yet"}
              description={
                isFiltered
                  ? "Try a different search term or clear the status and locale filters."
                  : "Upload a datasheet, brochure or certificate to start the resource library."
              }
            />
          </div>
        ) : (
          <DownloadsTable downloads={downloads} />
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} hrefFor={pageHref} />
    </div>
  );
}
