import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ParsedDownloadParams } from "@/lib/downloads-params";
import { cn } from "@/lib/utils";
import { pageHref } from "./links";
import { formatLabel, type DownloadsLabels } from "./labels";

interface DownloadsPaginationProps {
  currentPage: number;
  totalPages: number;
  params: ParsedDownloadParams;
  basePath: string;
  labels: DownloadsLabels;
}

/** Figma node 2080:38697 draws a 216x40 rail: 40 + 8 + (3 x 40) + 8 + 40. */
const PAGE_WINDOW = 3;

const cellStyles =
  "flex size-40 items-center justify-center rounded-full transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none";

/**
 * Separate from `components/sections/news/Pagination.tsx` because this one has
 * to carry the search, the facets and the sort through every hop — it builds
 * hrefs with `buildDownloadQuery` — and because Figma windows the numbers to
 * three rather than listing every page.
 */
export default function DownloadsPagination({
  currentPage,
  totalPages,
  params,
  basePath,
  labels,
}: DownloadsPaginationProps) {
  if (totalPages <= 1) return null;

  const size = Math.min(PAGE_WINDOW, totalPages);
  const start = Math.min(Math.max(currentPage - 1, 1), totalPages - size + 1);
  const pages = Array.from({ length: size }, (_, index) => start + index);

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label={labels.pagination} className="flex items-center justify-center gap-8">
      {hasPrev ? (
        <Link
          href={pageHref(basePath, params, currentPage - 1)}
          scroll={false}
          aria-label={labels.previous}
          className={cn(cellStyles, "text-neutral-1 hover:bg-neutral-11")}
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label={labels.previous}
          className={cn(cellStyles, "text-neutral-1 opacity-40")}
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>
      )}

      <ul className="flex items-center">
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <li key={page}>
              <Link
                href={pageHref(basePath, params, page)}
                scroll={false}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={formatLabel(labels.goToPage, { page })}
                className={cn(
                  cellStyles,
                  "text-p3 font-medium",
                  isCurrent ? "text-secondary" : "text-neutral-5 hover:text-neutral-1"
                )}
              >
                {page}
              </Link>
            </li>
          );
        })}
      </ul>

      {hasNext ? (
        <Link
          href={pageHref(basePath, params, currentPage + 1)}
          scroll={false}
          aria-label={labels.next}
          className={cn(cellStyles, "text-neutral-1 hover:bg-neutral-11")}
        >
          <ChevronRight size={24} aria-hidden="true" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label={labels.next}
          className={cn(cellStyles, "text-neutral-1 opacity-40")}
        >
          <ChevronRight size={24} aria-hidden="true" />
        </button>
      )}
    </nav>
  );
}
