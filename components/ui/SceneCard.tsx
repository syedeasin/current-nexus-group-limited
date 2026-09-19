import Image from "next/image";
import type { ElementType } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "@/components/icons/ArrowUpRight";
import { CARD_COLOR_WASH, CARD_IMAGE_ZOOM, CARD_LIFT } from "@/lib/motion/interactions";
import { cn } from "@/lib/utils";

interface SceneCardProps {
  /**
   * Omit for a presentational card. The Residential solutions page (Figma node
   * 4028:10553) draws the same card with nothing to navigate to, so it renders
   * as a plain block with no lift, no hover arrow and no focus target.
   */
  href?: string;
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
  const interactive = Boolean(href);
  const Tag = (interactive ? Link : "div") as ElementType;

  return (
    <Tag
      {...(interactive ? { href, "aria-label": title } : {})}
      className={cn(
        "flex w-full flex-col gap-24 rounded-12",
        interactive && [
          "group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary",
          CARD_LIFT,
        ],
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
          className={cn("object-cover", interactive && CARD_IMAGE_ZOOM)}
        />
        {interactive ? (
          <>
            <div aria-hidden="true" className={CARD_COLOR_WASH} />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex scale-90 items-center justify-center opacity-0 transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
            >
              <span className="flex size-48 items-center justify-center rounded-full bg-white text-neutral-1">
                <ArrowUpRight size={24} />
              </span>
            </span>
          </>
        ) : null}
      </div>
      <div className="flex w-full flex-col gap-12 pr-24">
        <span className="text-h5 font-semibold text-neutral-1">{title}</span>
        <p className="min-h-48 text-p3 text-neutral-3 md:min-h-56">{description}</p>
      </div>
    </Tag>
  );
}
