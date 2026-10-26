"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export interface WhyChooseReason {
  key: string;
  icon: string;
  title: string;
  body: string;
  image: string;
}

/** Scroll distance (in viewport heights) each reason holds the stage for. */
const STEP_VH = 50;

/**
 * Homepage "Why choose us".
 *
 * Desktop: the section pins while the visitor scrolls; scroll progress picks
 * the active reason, which opens on the right while the photo on the left
 * cross-fades to match. Clicking a reason scrolls to its step, so the list and
 * the scroll position never disagree. Phones and reduced motion: a plain list
 * with every answer open and one photo.
 */
export default function WhyChooseExplorer({
  header,
  reasons,
  fallbackImage,
  imageAlt,
}: {
  header: ReactNode;
  reasons: WhyChooseReason[];
  fallbackImage: string;
  imageAlt: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const reducedMotion = usePrefersReducedMotion();
  const pinned = isDesktop && !reducedMotion;
  const count = reasons.length;

  useEffect(() => {
    if (!pinned) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const track = trackRef.current;
      const sticky = stickyRef.current;
      const spacer = spacerRef.current;
      if (!track || !sticky || !spacer) return;
      const pinTop = parseFloat(getComputedStyle(sticky).top) || 0;
      const travel = spacer.offsetHeight;
      const scrolled = pinTop - track.getBoundingClientRect().top;
      const progress = travel > 0 ? Math.min(Math.max(scrolled / travel, 0), 0.9999) : 0;
      setActive(Math.floor(progress * count));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pinned, count]);

  function goTo(index: number) {
    const track = trackRef.current;
    const sticky = stickyRef.current;
    const spacer = spacerRef.current;
    if (!pinned || !track || !sticky || !spacer) return;
    const pinTop = parseFloat(getComputedStyle(sticky).top) || 0;
    const top = track.getBoundingClientRect().top + window.scrollY - pinTop + (spacer.offsetHeight * (index + 0.5)) / count;
    window.scrollTo({ top, behavior: "smooth" });
  }

  if (count === 0) return null;

  if (!pinned) {
    return (
      <div className="flex flex-col gap-40">
        {header}
        <ol className="flex flex-col border-t border-white/10">
          {reasons.map((reason) => (
            <li key={reason.key} className="flex gap-16 border-b border-white/10 py-24">
              <Image src={reason.icon} alt="" aria-hidden width={28} height={28} className="mt-2 size-28 shrink-0" />
              <div className="flex flex-col gap-8">
                <h3 className="text-h6 font-semibold text-white">{reason.title}</h3>
                {reason.body && <p className="text-p3 text-neutral-8">{reason.body}</p>}
              </div>
            </li>
          ))}
        </ol>
        {fallbackImage && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-16">
            <Image src={fallbackImage} alt={imageAlt} fill sizes="100vw" className="object-cover" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={trackRef} className="relative">
      <div ref={stickyRef} className="sticky top-[104px] xl:top-[136px]">
        <div className="grid grid-cols-2 items-stretch gap-80 xl:gap-120">
          {/* Left: header and link, then the photo for the active reason. */}
          <div className="flex flex-col justify-between gap-48">
            {header}
            <div className="relative aspect-[600/380] w-full overflow-hidden rounded-16 bg-neutral-2">
              {reasons.map((reason, index) => (
                <div
                  key={reason.key}
                  aria-hidden={index !== active}
                  className={cn(
                    "absolute inset-0 transition-[opacity,transform] duration-700 ease-out",
                    index === active ? "scale-100 opacity-100" : "scale-[1.05] opacity-0"
                  )}
                >
                  <Image
                    src={reason.image || fallbackImage}
                    alt={index === active ? imageAlt : ""}
                    fill
                    sizes="(min-width: 1280px) 600px, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: the reasons; the active one opens. */}
          <ol className="flex flex-col justify-center" aria-label="Reasons">
            {reasons.map((reason, index) => {
              const selected = index === active;
              return (
                <li key={reason.key} className="border-b border-white/10 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={selected ? "step" : undefined}
                    className={cn(
                      "flex w-full items-center gap-20 py-20 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
                      selected ? "text-white" : "text-neutral-6 hover:text-neutral-9"
                    )}
                  >
                    <Image
                      src={reason.icon}
                      alt=""
                      aria-hidden
                      width={28}
                      height={28}
                      className={cn("size-28 shrink-0 transition-opacity duration-300", selected ? "opacity-100" : "opacity-50")}
                    />
                    <h3 className="text-h5 font-semibold">{reason.title}</h3>
                  </button>
                  <div
                    className={cn(
                      "grid pl-48 transition-[grid-template-rows] duration-500 ease-out",
                      selected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-24 text-p3 text-neutral-8">{reason.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <div ref={spacerRef} aria-hidden="true" style={{ height: `${count * STEP_VH}vh` }} />
    </div>
  );
}
