"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
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

/**
 * Links that must not go through the locale-prefixing i18n <Link>: external
 * URLs, mail/phone, uploaded files (datasheets live under /media or /uploads)
 * and anything ending in a file extension. Prefixing those with "/en" 404s.
 */
function isRawHref(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href) || /^\/(media|uploads|api)\//.test(href) || /\.[a-z0-9]{2,5}$/i.test(href);
}

function ActionLink({ href, className, tabIndex, children }: { href: string; className: string; tabIndex: number; children: ReactNode }) {
  if (isRawHref(href)) {
    // Files and other sites open in a new tab; mailto/tel and /api stay put.
    const external = /^https?:/i.test(href) || /\.[a-z0-9]{2,5}$/i.test(href) || /^\/(media|uploads)\//.test(href);
    return (
      <a href={href} className={className} tabIndex={tabIndex} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} tabIndex={tabIndex}>
      {children}
    </Link>
  );
}

/** Small enough to count as "the user started scrolling", large enough to ignore rubber-banding/jitter. */
const SCROLL_REVEAL_THRESHOLD_PX = 24;

export default function FloatingActionBar({
  requestQuoteLabel,
  requestQuoteHref,
  downloadLabel,
  downloadHref,
  specialistLabel,
  specialistHref,
}: FloatingActionBarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");

    function onScroll() {
      setScrolled(window.scrollY > SCROLL_REVEAL_THRESHOLD_PX);
    }

    const footerObserver = footer
      ? new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0 })
      : null;

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (footer && footerObserver) footerObserver.observe(footer);

    return () => {
      window.removeEventListener("scroll", onScroll);
      footerObserver?.disconnect();
    };
  }, []);

  const visible = scrolled && !footerVisible;

  const transitionClass = cn(
    "fixed z-40 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
    visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"
  );

  return (
    <>
      <div className={cn(transitionClass, "inset-x-0 bottom-24 hidden justify-center px-20 lg:flex")} aria-hidden={!visible}>
        {/* Figma node 114:99606: buttons size to their own label (shrink-0 + nowrap), they
            never stretch to fill equal thirds — the old flex-1 forced "Download Datasheet"
            and "Talk to ODM Specialist" to wrap onto two lines at the fixed 784px width. */}
        <nav
          aria-label="Quick actions"
          className="flex max-w-784 items-center gap-12 rounded-full border border-neutral-10 bg-white p-6 shadow-lg"
        >
          <ActionLink
            href={requestQuoteHref}
            tabIndex={visible ? 0 : -1}
            // Figma Button/Button Large spec here tracks -1px, not the shared --text-btn-lg token's -0.2px.
            className="flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border-[1.5px] border-neutral-10 px-32 py-18 text-btn-lg font-semibold tracking-[-1px]! text-neutral-1 outline-none transition-colors duration-150 ease-out hover:bg-neutral-11 focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {requestQuoteLabel}
          </ActionLink>
          <ActionLink
            href={downloadHref}
            tabIndex={visible ? 0 : -1}
            className="flex shrink-0 items-center justify-center gap-8 whitespace-nowrap rounded-full bg-secondary px-32 py-18 text-btn-lg font-semibold tracking-[-1px]! text-neutral-1 outline-none transition-colors duration-150 ease-out hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <Download size={20} className="shrink-0" />
            {downloadLabel}
          </ActionLink>
          <ActionLink
            href={specialistHref}
            tabIndex={visible ? 0 : -1}
            className="flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border-[1.5px] border-neutral-10 px-32 py-18 text-btn-lg font-semibold tracking-[-1px]! text-neutral-1 outline-none transition-colors duration-150 ease-out hover:bg-neutral-11 focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {specialistLabel}
          </ActionLink>
        </nav>
      </div>

      <div className={cn(transitionClass, "inset-x-0 bottom-0 lg:hidden")} aria-hidden={!visible}>
        <nav
          aria-label="Quick actions"
          className="flex w-full items-center gap-12 border-t border-neutral-10 bg-white p-16 shadow-[0_-4px_16px_rgba(10,13,27,0.08)]"
        >
          <ActionLink
            href={requestQuoteHref}
            tabIndex={visible ? 0 : -1}
            className="flex flex-1 items-center justify-center rounded-full border-[1.5px] border-neutral-10 px-20 py-14 text-btn-sm font-semibold text-neutral-1 outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {requestQuoteLabel}
          </ActionLink>
          <ActionLink
            href={downloadHref}
            tabIndex={visible ? 0 : -1}
            className="flex flex-1 items-center justify-center gap-8 rounded-full bg-secondary px-20 py-14 text-btn-sm font-semibold text-neutral-1 outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <Download size={20} className="shrink-0" />
            {downloadLabel}
          </ActionLink>
        </nav>
      </div>
    </>
  );
}
