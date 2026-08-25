import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
}

function pageHref(basePath: string, page: number) {
  return page <= 1 ? { pathname: basePath } : { pathname: basePath, query: { page: String(page) } };
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  ariaLabel,
  previousLabel,
  nextLabel,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label={ariaLabel} className="flex items-center justify-center gap-8">
      {hasPrev ? (
        <Link
          href={pageHref(basePath, currentPage - 1)}
          aria-label={previousLabel}
          className="flex size-40 items-center justify-center rounded-full text-neutral-1 outline-none transition-colors duration-150 hover:bg-neutral-11 focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <ChevronLeft size={24} />
        </Link>
      ) : (
        <span aria-hidden="true" className="flex size-40 cursor-not-allowed items-center justify-center rounded-full text-neutral-1 opacity-40">
          <ChevronLeft size={24} />
        </span>
      )}

      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <Link
            key={page}
            href={pageHref(basePath, page)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex size-40 items-center justify-center rounded-full text-p1 font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-secondary",
              isActive ? "text-secondary" : "text-neutral-5 hover:text-neutral-1"
            )}
          >
            {page}
          </Link>
        );
      })}

      {hasNext ? (
        <Link
          href={pageHref(basePath, currentPage + 1)}
          aria-label={nextLabel}
          className="flex size-40 items-center justify-center rounded-full text-neutral-1 outline-none transition-colors duration-150 hover:bg-neutral-11 focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <ChevronRight size={24} />
        </Link>
      ) : (
        <span aria-hidden="true" className="flex size-40 cursor-not-allowed items-center justify-center rounded-full text-neutral-1 opacity-40">
          <ChevronRight size={24} />
        </span>
      )}
    </nav>
  );
}
