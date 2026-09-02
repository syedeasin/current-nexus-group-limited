import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Heading from "@/components/ui/Heading";
import { formatDate } from "@/lib/formatDate";
import type { NewsPost } from "@/lib/data/news";

interface HighlightCardProps {
  post: NewsPost;
  /** "X min read" label. Rendered only when the post has a non-zero reading time. */
  readingMinutesLabel: string;
}

export default function HighlightCard({ post, readingMinutesLabel }: HighlightCardProps) {
  return (
    <Link
      href={`/news/${post.slug}`}
      aria-label={post.title}
      className="group flex w-full flex-col outline-none"
    >
      <div className="relative aspect-[648/364] w-full overflow-hidden rounded-12 bg-neutral-2">
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            aria-hidden={post.coverImageAlt ? undefined : true}
            fill
            sizes="(min-width: 1024px) 648px, (min-width: 600px) 64vw, 85vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none"
          />
        )}
      </div>
      <div className="mt-24 flex flex-col gap-12">
        <div className="flex items-center gap-12 text-p1 font-medium text-neutral-4">
          <span>{formatDate(post.publishedAt)}</span>
          {post.readingMinutes > 0 && (
            <>
              <span aria-hidden="true" className="h-14 w-px bg-neutral-10" />
              <span>{readingMinutesLabel}</span>
            </>
          )}
        </div>
        <Heading
          level={3}
          size="h5"
          className="line-clamp-2 pr-40 text-neutral-1 transition-colors duration-300 ease-out group-hover:text-secondary group-focus-visible:text-secondary motion-reduce:transition-none"
        >
          {post.title}
        </Heading>
      </div>
      <div className="mt-32 h-2 w-full bg-neutral-10" aria-hidden="true" />
    </Link>
  );
}
