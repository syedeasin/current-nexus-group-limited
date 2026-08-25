import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "@/components/icons/ArrowLeft";
import { ArrowRight } from "@/components/icons/ArrowRight";
import type { NewsPost } from "@/lib/data/news";

interface PostNavProps {
  prev: NewsPost | null;
  next: NewsPost | null;
  previousLabel: string;
  nextLabel: string;
}

export default function PostNav({ prev, next, previousLabel, nextLabel }: PostNavProps) {
  if (!prev && !next) return null;

  return (
    <div className="flex w-full flex-col gap-32">
      <div className="h-px w-full bg-neutral-10" aria-hidden="true" />
      <div className="flex w-full items-center justify-between">
        {prev ? (
          <Link
            href={`/news/${prev.slug}`}
            className="flex items-center gap-4 text-btn-sm font-semibold text-neutral-1 transition-colors duration-150 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <ArrowLeft size={20} />
            <span className="hidden min-[400px]:inline">{previousLabel}</span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            href={`/news/${next.slug}`}
            className="flex items-center gap-4 text-btn-sm font-semibold text-neutral-1 transition-colors duration-150 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <span className="hidden min-[400px]:inline">{nextLabel}</span>
            <ArrowRight size={20} />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
