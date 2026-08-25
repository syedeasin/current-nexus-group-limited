"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface FloatingActionBarProps {
  requestQuoteLabel: string;
  requestQuoteHref: string;
  downloadLabel: string;
  downloadHref: string;
  specialistLabel: string;
  specialistHref: string;
}

/** Marks where the hero ends — the bar fades in once this scrolls past the top of the viewport. */
export function HeroEndSentinel() {
  return <div id="product-hero-end-sentinel" aria-hidden="true" style={{ height: 1, width: "100%" }} />;
}

export default function FloatingActionBar({
  requestQuoteLabel,
  requestQuoteHref,
  downloadLabel,
  downloadHref,
  specialistLabel,
  specialistHref,
}: FloatingActionBarProps) {
  const [pastHero, setPastHero] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const heroSentinel = document.getElementById("product-hero-end-sentinel");
    const footer = document.querySelector("footer");

    // Not-intersecting alone is ambiguous (sentinel can be below the fold on
    // load, or scrolled past) — boundingClientRect.top tells us which side.
    const heroObserver = heroSentinel
      ? new IntersectionObserver(([entry]) => setPastHero(entry.boundingClientRect.top <= 0), { threshold: 0 })
      : null;
    const footerObserver = footer
      ? new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0 })
      : null;

    if (heroSentinel && heroObserver) heroObserver.observe(heroSentinel);
    if (footer && footerObserver) footerObserver.observe(footer);

    return () => {
      heroObserver?.disconnect();
      footerObserver?.disconnect();
    };
  }, []);

  const visible = pastHero && !footerVisible;

  const transitionClass = cn(
    "fixed z-40 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
    visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"
  );

  return (
    <>
      <div className={cn(transitionClass, "inset-x-0 bottom-24 hidden justify-center px-20 lg:flex")} aria-hidden={!visible}>
        <nav
          aria-label="Quick actions"
          className="flex w-full max-w-784 items-center gap-12 rounded-full border border-neutral-10 bg-white p-6 shadow-lg"
        >
          <Link
            href={requestQuoteHref}
            tabIndex={visible ? 0 : -1}
            className="flex flex-1 items-center justify-center rounded-full border-[1.5px] border-neutral-10 px-32 py-18 text-btn-lg font-semibold text-neutral-1 outline-none transition-colors duration-150 ease-out hover:bg-neutral-11 focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {requestQuoteLabel}
          </Link>
          <Link
            href={downloadHref}
            tabIndex={visible ? 0 : -1}
            className="flex flex-1 items-center justify-center gap-8 rounded-full bg-secondary px-32 py-18 text-btn-lg font-semibold text-neutral-1 outline-none transition-colors duration-150 ease-out hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <Download size={20} />
            {downloadLabel}
          </Link>
          <Link
            href={specialistHref}
            tabIndex={visible ? 0 : -1}
            className="flex flex-1 items-center justify-center rounded-full border-[1.5px] border-neutral-10 px-32 py-18 text-btn-lg font-semibold text-neutral-1 outline-none transition-colors duration-150 ease-out hover:bg-neutral-11 focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {specialistLabel}
          </Link>
        </nav>
      </div>

      <div className={cn(transitionClass, "inset-x-0 bottom-0 lg:hidden")} aria-hidden={!visible}>
        <nav
          aria-label="Quick actions"
          className="flex w-full items-center gap-12 border-t border-neutral-10 bg-white p-16 shadow-[0_-4px_16px_rgba(10,13,27,0.08)]"
        >
          <Link
            href={requestQuoteHref}
            tabIndex={visible ? 0 : -1}
            className="flex flex-1 items-center justify-center rounded-full border-[1.5px] border-neutral-10 px-20 py-14 text-btn-sm font-semibold text-neutral-1 outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {requestQuoteLabel}
          </Link>
          <Link
            href={downloadHref}
            tabIndex={visible ? 0 : -1}
            className="flex flex-1 items-center justify-center gap-8 rounded-full bg-secondary px-20 py-14 text-btn-sm font-semibold text-neutral-1 outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <Download size={18} />
            {downloadLabel}
          </Link>
        </nav>
      </div>
    </>
  );
}
