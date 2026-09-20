"use client";

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown, CircleCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Open/closed state + error-aware navigation for a page editor's step
 * sections. Multiple sections may be open at once; `openAndReveal` is what a
 * failed submit calls to jump the admin straight to the first invalid step.
 */
export function useFormAccordion(defaultOpenIds: string[]) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpenIds));
  const nodeRefs = useRef<Record<string, HTMLElement | null>>({});

  const toggle = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    nodeRefs.current[id] = el;
  }, []);

  /** Opens a section (without closing others) and scrolls it into view — used after a failed submit. */
  const openAndReveal = useCallback((id: string) => {
    setOpen((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    requestAnimationFrame(() => {
      nodeRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return { open, toggle, registerRef, openAndReveal };
}

/**
 * Given a form's field-error map (dotted paths, e.g. "content.hero.heading")
 * and a section→prefix table, returns the ids of sections that contain at
 * least one error, in section order — the first entry is what a failed submit
 * should auto-open.
 */
export function sectionsWithErrors(
  fieldErrors: Record<string, string>,
  sectionOrder: string[],
  prefixesById: Record<string, string[]>
): string[] {
  const errorKeys = Object.keys(fieldErrors);
  if (errorKeys.length === 0) return [];
  return sectionOrder.filter((id) => {
    const prefixes = prefixesById[id] ?? [];
    return errorKeys.some((key) => prefixes.some((p) => key === p || key.startsWith(`${p}.`)));
  });
}

interface FormAccordionProps {
  id: string;
  step: string;
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  hasError?: boolean;
  isComplete?: boolean;
  /** Extra control rendered in the header, right of the chevron (e.g. an include/hide toggle). */
  headerExtra?: ReactNode;
  registerRef?: (id: string, el: HTMLElement | null) => void;
  children: ReactNode;
}

export default function FormAccordion({
  id,
  step,
  title,
  description,
  open,
  onToggle,
  hasError,
  isComplete,
  headerExtra,
  registerRef,
  children,
}: FormAccordionProps) {
  const panelId = useId();

  return (
    <section
      ref={(el) => registerRef?.(id, el)}
      className={cn(
        "overflow-hidden rounded-16 border bg-white transition-colors duration-200",
        hasError ? "border-error" : "border-neutral-10"
      )}
    >
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center gap-16 px-24 py-20 text-left transition-colors duration-150 hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:px-32"
        >
          <span className="text-p4 font-semibold uppercase tracking-[2px] text-secondary shrink-0">{step}</span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-8">
              <span className="text-p2 font-medium text-neutral-1">{title}</span>
              {hasError ? (
                <TriangleAlert size={16} className="shrink-0 text-error" aria-label="Needs attention" />
              ) : isComplete ? (
                <CircleCheck size={16} className="shrink-0 text-success" aria-label="Complete" />
              ) : null}
            </span>
            {description ? (
              <span className="mt-2 block text-p4 font-light text-neutral-5">
                {hasError ? "Required information is missing" : description}
              </span>
            ) : null}
          </span>

          {headerExtra ? (
            <span onClick={(e) => e.stopPropagation()} className="shrink-0">
              {headerExtra}
            </span>
          ) : null}

          <ChevronDown
            size={20}
            aria-hidden="true"
            className={cn("shrink-0 text-neutral-4 transition-transform duration-200 ease-out", open && "rotate-180")}
          />
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        className={cn(
          "grid transition-[grid-template-rows] duration-250 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-neutral-10 px-24 py-24 sm:px-32">{children}</div>
        </div>
      </div>
    </section>
  );
}
