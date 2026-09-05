import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "@/components/icons/ArrowUpRight";
import { CARD_IMAGE_ZOOM, CARD_LIFT } from "@/lib/motion/interactions";
import { cn } from "@/lib/utils";

interface SceneCardProps {
  href: string;
  image: string;
  title: string;
  description: string;
  imageSizes: string;
  className?: string;
}

export default function SceneCard({
  href,
  image,
  title,
  description,
  imageSizes,
  className,
}: SceneCardProps) {
  return (
    <Link
      href={href}
      aria-label={title}
      className={cn(
        "group flex w-full flex-col gap-24 rounded-12 outline-none",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary",
        CARD_LIFT,
        className
      )}
    >
      <div className="relative aspect-[424/300] w-full overflow-hidden rounded-12 bg-neutral-2">
        <Image
          src={image}
          alt=""
          aria-hidden="true"
          fill
          sizes={imageSizes}
          className={cn("object-cover", CARD_IMAGE_ZOOM)}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex scale-90 items-center justify-center opacity-0 transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        >
          <span className="flex size-48 items-center justify-center rounded-full bg-white text-neutral-1">
            <ArrowUpRight size={24} />
          </span>
        </span>
      </div>
      <div className="flex w-full flex-col gap-12 pr-24">
        <span className="text-h5 font-semibold text-neutral-1">{title}</span>
        <p className="min-h-48 text-p3 text-neutral-3 md:min-h-56">{description}</p>
      </div>
    </Link>
  );
}
