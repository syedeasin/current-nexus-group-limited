import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "@/components/icons/ChevronRight";

interface ProductCardProps {
  href: string;
  image: string;
  title: string;
  /** Omit to render the card as image + title only, no CTA row (Premium Solutions has no per-card "Learn More"). */
  learnMoreLabel?: string;
  /** Tailwind aspect-ratio class for the image box. Defaults to the 318:396 card from Energy Ecosystem. */
  imageAspectClassName?: string;
  /** Fill behind the image box, visible where the photo bleeds short of the box edge. */
  imageBgClassName?: string;
  imageBorderClassName?: string;
  imageSizes?: string;
  /** Reserves two lines of title height so a row of 1-line and 2-line titles still bottoms out level (Premium Solutions). */
  reserveTwoLineTitle?: boolean;
  className?: string;
}

export default function ProductCard({
  href,
  image,
  title,
  learnMoreLabel,
  imageAspectClassName = "aspect-[318/396]",
  imageBgClassName = "bg-white",
  imageBorderClassName = "border border-neutral-10",
  imageSizes = "(min-width: 1280px) 318px, (min-width: 1024px) 32vw, (min-width: 480px) 45vw, 100vw",
  reserveTwoLineTitle = false,
  className,
}: ProductCardProps) {
  return (
    <Link
      href={href}
      aria-label={title}
      className={cn(
        "group flex w-full flex-col rounded-12 outline-none transition-transform duration-200 ease-out focus-visible:ring-2 focus-visible:ring-secondary",
        "hover:-translate-y-4 focus-visible:-translate-y-4",
        className
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-12",
          imageBgClassName,
          imageBorderClassName,
          imageAspectClassName
        )}
      >
        <Image
          src={image}
          alt=""
          aria-hidden="true"
          fill
          sizes={imageSizes}
          className="object-cover transition-transform duration-200 ease-out group-hover:scale-105 group-focus-visible:scale-105"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-8 px-20 pt-20">
        <span
          className={cn(
            "flex w-full items-center justify-center text-center text-h6 font-semibold text-white",
            reserveTwoLineTitle && "min-h-56"
          )}
        >
          {title}
        </span>
        {learnMoreLabel ? (
          <span className="flex items-center gap-4 text-p3 font-semibold text-white/70 transition-colors duration-200 ease-out group-hover:text-secondary group-focus-visible:text-secondary">
            <span className="underline-offset-2 group-hover:underline group-focus-visible:underline">
              {learnMoreLabel}
            </span>
            <ChevronRight
              size={14}
              className="-translate-x-4 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            />
          </span>
        ) : null}
      </div>
    </Link>
  );
}
