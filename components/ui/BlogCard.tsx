import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Heading from "@/components/ui/Heading";
import { CARD_IMAGE_ZOOM, CARD_LIFT, CARD_TITLE_TINT } from "@/lib/motion/interactions";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  href: string;
  /** Cover image path, or null to render a plain placeholder block. */
  image: string | null;
  /** Alt text. When non-empty the image is exposed to assistive tech; empty = decorative. */
  imageAlt?: string;
  imageSizes: string;
  title: string;
  /** ISO date (UTC) — rendered through the fixed-locale formatter. */
  date: string;
  /** "X min read" label. Omit (or pass falsy) to hide the chip entirely — never render "0 min read". */
  readTime?: string;
  /** Semantic heading level for the title. Defaults to h3 (post title within an h2 section). */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export default function BlogCard({
  href,
  image,
  imageAlt = "",
  imageSizes,
  title,
  date,
  readTime,
  headingLevel = 3,
  className,
}: BlogCardProps) {
  return (
    <Link
      href={href}
      aria-label={title}
      className={cn(
        "group flex w-full flex-col gap-24 rounded-12",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary",
        CARD_LIFT,
        className
      )}
    >
      <div className="relative aspect-[424/300] w-full overflow-hidden rounded-12 bg-neutral-2">
        {image && (
          <Image
            src={image}
            alt={imageAlt}
            aria-hidden={imageAlt ? undefined : true}
            fill
            sizes={imageSizes}
            className={cn("object-cover", CARD_IMAGE_ZOOM)}
          />
        )}
      </div>
      <div className="flex w-full flex-col gap-12">
        <div className="flex items-center gap-12 text-p3 font-medium text-neutral-4">
          <span>{formatDate(date)}</span>
          {readTime && (
            <>
              <span aria-hidden="true" className="h-14 w-px bg-neutral-9" />
              <span>{readTime}</span>
            </>
          )}
        </div>
        <Heading
          level={headingLevel}
          size="h6"
          className={cn("line-clamp-2 min-h-52 pr-32 text-neutral-1 md:min-h-56", CARD_TITLE_TINT)}
        >
          {title}
        </Heading>
      </div>
    </Link>
  );
}
