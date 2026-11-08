"use client";

import { createElement, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "@/components/ui/Picture";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { pageIcon } from "@/lib/page-content/icons";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export interface Advantage {
  id: string;
  icon: string;
  title: string;
  body: string;
  cta: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
}

/** Scroll distance (in viewport heights) each advantage holds the stage for. */
const STEP_VH = 60;

/**
 * The photo box is taller than 16:9 at most screen heights, so object-cover
 * draws the 16:9 photo wider than the box (up to ~1070px at the 600px cap).
 * Declaring that width makes the browser fetch the 1080w (1x) / 2048w (2x)
 * copy instead of a 750w one that has to be stretched.
 */
const DESKTOP_PHOTO_SIZES = "(min-width: 1024px) 1000px, 100vw";
const PHOTO_QUALITY = 90;

const pad = (n: number) => String(n).padStart(2, "0");

function CtaLink({ href, label, className }: { href: string; label: string; className?: string }) {
  if (!label || !href) return null;
  return (
    <Link
      href={href}
      className={cn(
        "group inline-block w-fit text-p3 font-semibold text-neutral-1 underline decoration-secondary decoration-2 underline-offset-6 transition-colors duration-150 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary",
        className
      )}
    >
      {label}
      <ArrowRight size={16} className="ml-6 inline-block align-[-2px] transition-transform duration-200 group-hover:translate-x-2 motion-reduce:transition-none" />
    </Link>
  );
}

/**
 * The six advantages (revision 1022).
 *
 * Desktop: the section pins while the visitor scrolls; scroll progress picks
 * the active advantage (01 → 06), the list on the left tracks it and the photo
 * card on the right swaps. Clicking a title scrolls to that step, so the list
 * and scrolling never disagree. Phones: a plain stacked list with photos.
 */
export default function AdvantageExplorer({ header, items }: { header: ReactNode; items: Advantage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  // Only the layout on screen loads its photos; the hidden one's fill images
  // would otherwise sit at height 0 (and download for nothing).
  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const count = items.length;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const track = trackRef.current;
      const sticky = stickyRef.current;
      const spacer = spacerRef.current;
      if (!track || !sticky || !spacer || track.offsetParent === null) return;
      // The stage pins at its CSS `top`; the spacer below it is the scroll
      // distance the six steps share.
      const pinTop = parseFloat(getComputedStyle(sticky).top) || 0;
      const travel = spacer.offsetHeight;
      const scrolled = pinTop - track.getBoundingClientRect().top;
      const progress = travel > 0 ? Math.min(Math.max(scrolled / travel, 0), 0.9999) : 0;
      const scaled = progress * count;
      setActive(Math.floor(scaled));
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
  }, [count]);

  function goTo(index: number) {
    const track = trackRef.current;
    const sticky = stickyRef.current;
    const spacer = spacerRef.current;
    if (!track || !sticky || !spacer) return;
    const pinTop = parseFloat(getComputedStyle(sticky).top) || 0;
    const top = track.getBoundingClientRect().top + window.scrollY - pinTop + (spacer.offsetHeight * (index + 0.5)) / count;
    window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
  }

  if (count === 0) return null;
  const current = items[active] ?? items[0];

  return (
    <>
      {/* ── Phones and tablets: stacked, each advantage with its photo. ── */}
      <div className="flex flex-col gap-40 lg:hidden">
        {header}
        <ol className="flex flex-col gap-40">
          {items.map((item, index) => (
            <li key={item.id} className="flex flex-col gap-20">
              {!isDesktop && item.image && (
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-16">
                  <Image src={item.image} alt={item.imageAlt} fill sizes="115vw" quality={PHOTO_QUALITY} className="object-cover" />
                  <span className="absolute top-16 left-16 flex size-44 items-center justify-center rounded-12 bg-white text-neutral-1">
                    {createElement(pageIcon(item.icon), { size: 24, strokeWidth: 1.5, "aria-hidden": true })}
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-12">
                <span className="text-p3 font-semibold text-secondary tabular-nums">{pad(index + 1)}</span>
                <h3 className="text-h5 font-semibold text-neutral-1">{item.title}</h3>
              </div>
              <p className="text-p4 leading-[22px] text-neutral-4">{item.body}</p>
              <CtaLink href={item.ctaHref} label={item.cta} />
            </li>
          ))}
        </ol>
      </div>

      {/* ── Desktop: pinned stage driven by scroll. ── */}
      <div ref={trackRef} className="relative hidden lg:block">
        {/* Pins 32px under the header, so the section keeps its normal top and
            bottom padding before and after the pinned stretch. */}
        <div ref={stickyRef} className="sticky top-[88px] xl:top-[120px]">
          <div className="grid w-full grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-stretch gap-48 xl:gap-64">
            {/* Left: heading + list as one group, centred against the card. */}
            <div className="flex flex-col justify-center gap-40">
              {header}
              <ol className="flex flex-col border-t border-neutral-10" aria-label="Advantages">
                {items.map((item, index) => {
                  const selected = index === active;
                  return (
                    <li key={item.id} className="border-b border-neutral-10">
                      <button
                        type="button"
                        onClick={() => goTo(index)}
                        aria-current={selected ? "step" : undefined}
                        className={cn(
                          "flex w-full items-center gap-16 py-16 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none",
                          selected ? "text-neutral-1" : "text-neutral-7 hover:text-neutral-4"
                        )}
                      >
                        <span
                          className={cn(
                            "w-24 shrink-0 text-p4 font-semibold tabular-nums transition-colors duration-300",
                            selected ? "text-secondary" : "text-neutral-8"
                          )}
                        >
                          {pad(index + 1)}
                        </span>
                        <span className="text-h6 font-semibold">{item.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Right: the card fills its (wider) column; the photo's height follows
                the screen height so the whole card always fits under the header. */}
            <div className="flex w-full flex-col rounded-20 border border-neutral-10 bg-white p-8 shadow-[0_24px_64px_rgba(10,13,27,0.06)]">
              <div className="relative h-[clamp(280px,calc(100svh-400px),600px)] w-full overflow-hidden rounded-12 bg-neutral-1">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    aria-hidden={index !== active}
                    className={cn(
                      "absolute inset-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
                      index === active ? "scale-100 opacity-100" : "scale-[1.05] opacity-0"
                    )}
                  >
                    {isDesktop && item.image && (
                      <Image src={item.image} alt={item.imageAlt} fill sizes={DESKTOP_PHOTO_SIZES} quality={PHOTO_QUALITY} className="object-cover" />
                    )}
                  </div>
                ))}
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(10,13,27,0.55),transparent_45%)]" />
                <div className="absolute top-20 right-24 flex items-baseline gap-4 text-white">
                  <span key={current.id} className="animate-[fade-up_400ms_ease-out] text-[56px] font-semibold leading-none tracking-[-1.5px] tabular-nums motion-reduce:animate-none">
                    {pad(active + 1)}
                  </span>
                  <span className="text-p4 font-medium text-white/70">/{pad(count)}</span>
                </div>
              </div>

              <div key={current.id} className="flex animate-[fade-up_450ms_ease-out] items-start gap-16 px-16 pt-20 pb-16 motion-reduce:animate-none xl:px-20 xl:pt-24 xl:pb-20">
                <span aria-hidden="true" className="flex size-40 shrink-0 items-center justify-center rounded-8 bg-surface-1 text-primary">
                  {createElement(pageIcon(current.icon), { size: 20, strokeWidth: 1.5 })}
                </span>
                <div className="flex min-w-0 flex-col gap-8">
                  <h3 className="text-h6 font-semibold text-neutral-1">{current.title}</h3>
                  <p className="max-w-[560px] text-p4 leading-[22px] text-neutral-4">{current.body}</p>
                  <CtaLink href={current.ctaHref} label={current.cta} className="mt-4 text-p4" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref={spacerRef} aria-hidden="true" style={{ height: `${count * STEP_VH}vh` }} />
      </div>
    </>
  );
}
