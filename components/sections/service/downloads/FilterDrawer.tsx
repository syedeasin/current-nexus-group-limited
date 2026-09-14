"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";
import type { FilterGroupView } from "@/lib/downloads-types";
import { countActiveFilters, type ParsedDownloadParams } from "@/lib/downloads-params";
import { getLenis } from "@/lib/motion/lenis-instance";
import { cn } from "@/lib/utils";
import FilterPanel from "./FilterPanel";
import { formatLabel, type DownloadsLabels } from "./labels";

/** No-op subscribe: the mounted snapshot never changes after hydration. */
const subscribeNever = () => () => {};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface FilterDrawerProps {
  groups: FilterGroupView[];
  params: ParsedDownloadParams;
  basePath: string;
  labels: DownloadsLabels;
  className?: string;
}

/**
 * The < lg replacement for the sidebar: same `FilterPanel`, in a modal sheet.
 *
 * Follows `components/layout/nav/MobileDrawer.tsx` for the trap/Escape/restore
 * behaviour, with two additions it needs and the nav drawer does not: Lenis is
 * stopped while the sheet is open (locking `body` alone does not stop a smooth
 * scroller that drives transforms), and the closed sheet is `inert` so its
 * checkboxes stay out of the tab order and the accessibility tree instead of
 * being merely invisible.
 */
export default function FilterDrawer({
  groups,
  params,
  basePath,
  labels,
  className,
}: FilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Isomorphic "are we on the client yet" without setState-in-effect: the
  // server snapshot is false and the client snapshot is true, so the portal
  // appears on hydration with no mismatch and nothing to subscribe to.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const activeCount = countActiveFilters(params.filters);

  const close = useCallback(() => {
    setIsOpen(false);
    // Focus can only return once the sheet is no longer inert.
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const lenis = getLenis();
    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
  }, [isOpen]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // The overlay is portalled to <body>. It has to be: this section is wrapped
  // in <Reveal>, which keeps a `transform` on the element even at rest, and a
  // transformed ancestor becomes the containing block for `position: fixed` —
  // the sheet would be sized and clipped to the section instead of the
  // viewport. Portalling also keeps the parked, off-canvas sheet from widening
  // the page. Gated on mount so the server and first client render agree.
  const overlay = (
    <div
      className={cn("fixed inset-0 z-50 overflow-hidden lg:hidden", !isOpen && "pointer-events-none")}
      inert={!isOpen}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-[var(--dur-header)] ease-[var(--ease-out)] motion-reduce:transition-none",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        id={panelId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={labels.filtersButton}
        onKeyDown={handleKeyDown}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-390 flex-col bg-white",
          "transition-transform duration-[var(--dur-header)] ease-[var(--ease-out)] motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex shrink-0 justify-end px-20 py-16">
          <button
            type="button"
            onClick={close}
            aria-label={labels.closeFilters}
            className="-m-10 flex items-center justify-center p-10 text-neutral-1 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        {/* data-lenis-prevent: let the sheet scroll natively while Lenis is paused. */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto px-20 pb-32">
          <FilterPanel
            groups={groups}
            params={params}
            basePath={basePath}
            labels={labels}
            onApplied={close}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn(
          "inline-flex shrink-0 items-center gap-8 rounded-8 border-[1.5px] border-neutral-10 bg-white py-8 pl-16 pr-12 text-p4 text-neutral-1",
          "transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] hover:border-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none",
          className
        )}
      >
        <SlidersHorizontal size={20} aria-hidden="true" className="shrink-0" />
        {labels.filtersButton}
        {activeCount > 0 ? (
          <span
            aria-label={formatLabel(labels.activeFilterCount, { count: activeCount })}
            className="inline-flex min-w-20 items-center justify-center rounded-full bg-neutral-1 px-6 text-p4 font-medium text-white"
          >
            {activeCount}
          </span>
        ) : null}
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
