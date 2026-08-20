import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Heading from "@/components/ui/Heading";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  href: string;
  image: string;
  imageSizes: string;
  title: string;
  /** ISO date (UTC) — rendered through the fixed-locale formatter. */
  date: string;
  readTime: string;
  /** Semantic heading level for the title. Defaults to h3 (post title within an h2 section). */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export default function BlogCard({
  href,
  image,
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
        "group flex w-full flex-col gap-24 rounded-16 outline-none transition-transform duration-[250ms] ease-out motion-reduce:transition-none",
        "hover:-translate-y-4 focus-visible:-translate-y-4 focus-visible:ring-2 focus-visible:ring-secondary",
        className
      )}
    >
      <div className="relative aspect-[424/300] w-full overflow-hidden rounded-16 bg-neutral-2">
        <Image
          src={image}
          alt=""
          aria-hidden="true"
          fill
          sizes={imageSizes}
          className="object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
      <div className="flex w-full flex-col gap-12">
        <div className="flex items-center gap-12 text-p3 text-neutral-4">
          <span>{formatDate(date)}</span>
          <span aria-hidden="true" className="h-14 w-px bg-neutral-9" />
          <span>{readTime}</span>
        </div>
        <Heading
          level={headingLevel}
          size="h6"
          className="line-clamp-2 min-h-52 pr-32 text-neutral-1 transition-colors duration-[250ms] ease-out group-hover:text-secondary group-focus-visible:text-secondary motion-reduce:transition-none md:min-h-56"
        >
          {title}
        </Heading>
      </div>
    </Link>
  );
}
