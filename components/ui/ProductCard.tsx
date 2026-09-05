"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "@/components/icons/ChevronRight";
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
  className,
}: ProductCardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const motion = !reducedMotion;
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
        "group flex w-full flex-col rounded-12 outline-none focus-visible:ring-2 focus-visible:ring-secondary",
        // Card hover: transform only (GPU) — never border-width / shadow / blur (layout jank).
        motion &&
          "transition-transform duration-300 ease-out hover:-translate-y-4 focus-visible:-translate-y-4",
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
            motion &&
              "origin-center transform-gpu will-change-transform group-hover:scale-[1.04] group-focus-visible:scale-[1.04]",
            // Hover animates transform only. The opacity fade is a one-time
            // entrance and is dropped from the transition once the image loads.
            motion &&
              (imageLoaded
                ? "transition-transform duration-500 ease-out"
                : "transition-[opacity,transform] duration-500 ease-out"),
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
          <span className="inline-flex items-center justify-center gap-[6px] text-btn-sm font-semibold tracking-[-0.5px] text-neutral-9 transition-[color,gap] duration-200 ease-out group-hover:gap-[8px] group-hover:text-secondary group-focus-visible:gap-[8px] group-focus-visible:text-secondary">
            <span className="underline-offset-2 group-hover:underline group-focus-visible:underline">
              {learnMoreLabel}
            </span>
            <ChevronRight
              size={14}
              strokeWidth={1.5}
              className={cn(
                "shrink-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                motion &&
                  "-translate-x-[4px] transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-focus-visible:translate-x-0"
              )}
            />
          </span>
        ) : null}
      </div>
    </Link>
  );
}
