"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ThumbnailImage from "../ui/ThumbnailImage";

/**
 * Locally-defined replacement for the source project's `HomepageStory` type
 * (originally imported from a CLIENT-tagged lib/queries.ts, not part of this export).
 */
export interface CarouselStory {
  id: string;
  slug: string;
  name: string;
  thumbnail_url: string | null;
  badge?: string | null;
  /** Extra meta chips shown under the title, e.g. a category + a year. Rendered in order, separated by a divider. */
  meta?: (string | null | undefined)[];
}

/* Shared container padding — identical to every other section. */
const CONTAINER = "mx-auto w-full max-w-[1280px] px-5 xl:px-10 2xl:px-0";

function MetaDivider() {
    return (
        <span
            aria-hidden="true"
            className="inline-block h-[14px] w-px shrink-0 bg-line-dark"
        />
    );
}

// Dark-surface card — matches the Figma "Stories from the archive" section.
function NarratorCard({ story, hrefBase }: { story: CarouselStory; hrefBase: string }) {
    const meta = (story.meta ?? []).filter(Boolean) as string[];

    return (
        <Link
            href={`${hrefBase}/${story.slug}`}
            className="group flex w-[calc((100%-24px)/1.25)] shrink-0 snap-start flex-col gap-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-4 focus-visible:ring-offset-secondary sm:w-[calc((100%-1px-2*24px)/2.25)] xl:w-[calc((100%-3*1px-3*24px)/3.25)]"
        >
            <div className="relative aspect-[368/320] w-full overflow-hidden rounded-xl bg-white/5">
                <ThumbnailImage
                    src={story.thumbnail_url}
                    alt={story.name}
                    name={story.name}
                    className="object-cover grayscale transition-transform duration-300 group-hover:scale-105"
                />
                {story.badge && (
                    <div className="absolute left-4 top-4 md:left-6 md:top-6">
                        <span className="rounded-[6px] bg-cream px-3 py-1.5 font-mono text-[14px] font-medium leading-6 tracking-[-0.8px] text-ink lg:text-[16px]">
                            {story.badge}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="font-fjalla text-[20px] leading-[26px] tracking-[-0.4px] text-paper transition-colors group-hover:text-primary-light lg:text-[24px] lg:leading-[28px] lg:tracking-[-0.48px]">
                    {story.name}
                </h3>
                {meta.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[15px] leading-[24px] tracking-[-0.7px] text-paper-2 lg:text-[18px] lg:leading-[28px] lg:tracking-[-0.9px]">
                        {meta.map((item, i) => (
                            <span key={item} className="flex items-center gap-3">
                                {i > 0 && <MetaDivider />}
                                {item}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}

interface NarratorsCarouselProps {
    eyebrow: string;
    title: string;
    stories: CarouselStory[];
    ctaLabel: string;
    ctaHref: string;
    /** Base path each card links to, e.g. '/stories'. Card href is `${hrefBase}/${story.slug}`. */
    hrefBase?: string;
    /** Shown when `stories` is empty. */
    emptyMessage?: string;
    /* Optional per-page leaf override (position/size). Defaults to top-right. */
    leafClassName?: string;
    /* Optional divider line below the section (matches the For Everyone design). */
    showBottomBorder?: boolean;
}

export default function NarratorsCarousel({
                                              eyebrow,
                                              title,
                                              stories,
                                              ctaLabel,
                                              ctaHref,
                                              hrefBase = "/stories",
                                              emptyMessage = "Nothing published yet.",
                                              leafClassName,
                                              showBottomBorder = false,
                                          }: NarratorsCarouselProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);

    const scrollBy = (direction: "prev" | "next") => {
        const el = scrollerRef.current;
        if (!el) return;
        const card = el.querySelector<HTMLElement>("a");
        const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
        el.scrollBy({ left: direction === "next" ? step : -step, behavior: "smooth" });
    };

    return (
        <section className="relative overflow-hidden bg-secondary py-[60px] md:py-[90px] lg:py-[120px]">
            {/* Decorative leaf — dark section, cropped by the top-right corner */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/images/community-leaf-dark.svg"
                alt=""
                aria-hidden="true"
                className={
                    leafClassName ??
                    "pointer-events-none absolute -right-[140px] -top-[160px] hidden w-[560px] -scale-x-100 select-none lg:block xl:w-[680px]"
                }
            />

            {/* Header */}
            <div className={`relative z-10 ${CONTAINER}`}>
                <div className="mb-8 flex flex-col items-center gap-2 text-center md:mb-10 lg:mb-12">
                    <p className="font-fjalla text-[14px] uppercase leading-[28px] tracking-[2.88px] text-primary-light lg:text-[18px]">
                        {eyebrow}
                    </p>
                    <h2 className="font-fjalla text-[32px] uppercase leading-[1.1] tracking-[-0.48px] text-paper md:text-[40px] lg:text-[48px] lg:leading-[52px]">
                        {title}
                    </h2>
                </div>
            </div>

            {stories.length === 0 ? (
                <div className={`relative z-10 ${CONTAINER}`}>
                    <div className="rounded-xl border border-line-dark bg-white/5 px-6 py-12 text-center font-mono text-[14px] text-paper-2">
                        {emptyMessage}
                    </div>
                </div>
            ) : (
                <>
                    {/* Carousel — native touch swipe on mobile, buttons on desktop */}
                    <div className={`relative z-10 ${CONTAINER}`}>
                        <div
                            ref={scrollerRef}
                            className="flex touch-pan-x snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {stories.map((story, i) => (
                                <div key={story.id} className="contents">
                                    {i > 0 && (
                                        <div
                                            aria-hidden="true"
                                            className="w-px shrink-0 self-stretch bg-line-dark"
                                        />
                                    )}
                                    <NarratorCard story={story} hrefBase={hrefBase} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls — CTA on top / arrows below on mobile, side by side on desktop */}
                    <div className={`relative z-10 mt-8 md:mt-10 lg:mt-12 ${CONTAINER}`}>
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <Link
                                href={ctaHref}
                                className="order-1 w-fit rounded-full bg-primary px-8 py-[18px] font-mono text-[16px] font-semibold uppercase leading-6 tracking-[-0.8px] text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-secondary sm:order-2 lg:text-[20px]"
                            >
                                {ctaLabel}
                            </Link>

                            <div className="order-2 flex items-center gap-3 sm:order-1">
                                <button
                                    type="button"
                                    onClick={() => scrollBy("prev")}
                                    aria-label="Previous narrators"
                                    className="flex h-12 w-12 items-center justify-center rounded-[8px] border border-line-dark bg-transparent text-paper transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                                >
                                    <ArrowLeft className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollBy("next")}
                                    aria-label="Next narrators"
                                    className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-primary text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                                >
                                    <ArrowRight className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showBottomBorder && (
                <div className={`relative z-10 mt-[60px] md:mt-[90px] lg:mt-[120px] ${CONTAINER}`}>
                    <div className="h-px w-full bg-line-dark" />
                </div>
            )}
        </section>
    );
}
