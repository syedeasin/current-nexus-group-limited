"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { CARD_IMAGE_ZOOM, CARD_LIFT, LINK_CHEVRON } from "@/lib/motion/interactions";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

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
  /** Premium Solutions' tighter caption block: no side padding, 4px gap (Figma node 29:2703). */
  compactInfo?: boolean;
  className?: string;
}

export default function ProductCard({
  href,
  image,
  title,
  learnMoreLabel,
  imageAspectClassName = "aspect-[318/396]",
  imageBgClassName = "bg-white",
  imageBorderClassName = "border-[1.5px] border-neutral-10",
  imageSizes = "(min-width: 1280px) 318px, (min-width: 1024px) 32vw, (min-width: 480px) 45vw, 100vw",
  reserveTwoLineTitle = false,
  compactInfo = false,
  className,
}: ProductCardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const imgRef = useRef<HTMLImageElement>(null);
  const [mounted, setMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Cached images can finish loading before onLoad is wired up.
    if (imgRef.current?.complete) setImageLoaded(true);
  }, []);

  // SSR / no-JS / reduced-motion: render the image opaque. Otherwise fade it in
  // once it has actually loaded so it doesn't pop in mid-reveal.
  const imageShown = !mounted || reducedMotion || imageLoaded;

  return (
    <Link
      href={href}
      aria-label={title}
      className={cn(
        "group flex w-full flex-col rounded-12",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary",
        CARD_LIFT,
        className
      )}
    >
      {/* Image wrapper: fixed 12px radius + aspect ratio, never moves or animates.
          Only the <img> inside animates, and only its transform. Clipping (this
          element) and the border (the overlay below) live on separate elements —
          putting both on one element makes the clip radius and border radius
          mismatch, leaking white corners past the rounded edge. isolate +
          transform-gpu + backface-visibility:hidden force a permanent GPU layer
          at rest, otherwise corners only rasterize cleanly once a hover
          transform promotes the element. */}
      <div
        className={cn(
          "relative isolate w-full transform-gpu overflow-clip rounded-12 [backface-visibility:hidden]",
          imageBgClassName,
          imageAspectClassName
        )}
      >
        <Image
          ref={imgRef}
          src={image}
          alt=""
          aria-hidden="true"
          fill
          sizes={imageSizes}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "rounded-12 object-cover",
            CARD_IMAGE_ZOOM,
            // The entrance fade is one-off; once the photo is in, only transform
            // is animated so hover never re-runs an opacity transition.
            !imageLoaded && "transition-[opacity,transform]",
            imageShown ? "opacity-100" : "opacity-0"
          )}
        />
        {/* Border overlay: drawn on top of the already-clipped image, so the
            border never participates in clipping and can't leak a corner. */}
        <div
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-0 rounded-12", imageBorderClassName)}
        />
      </div>
      <div
        className={cn(
          "flex w-full flex-col items-center pt-20",
          compactInfo ? "gap-4" : "gap-8 px-20"
        )}
      >
        <span
          className={cn(
            "flex w-full items-center justify-center text-center text-h6 font-semibold text-white",
            reserveTwoLineTitle && "min-h-56"
          )}
        >
          {title}
        </span>
        {learnMoreLabel ? (
          <span className="inline-flex items-center justify-center gap-4 text-btn-sm font-semibold text-neutral-9 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:text-secondary group-focus-visible:text-secondary motion-reduce:transition-none">
            <span className="underline-offset-2 group-hover:underline group-focus-visible:underline">
              {learnMoreLabel}
            </span>
            <ChevronRight size={16} strokeWidth={1.5} className={LINK_CHEVRON} />
          </span>
        ) : null}
      </div>
    </Link>
  );
}
