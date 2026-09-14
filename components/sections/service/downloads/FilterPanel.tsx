"use client";

import { useId, useState, type FormEvent } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { FilterGroupView, SelectedFilters } from "@/lib/downloads-types";
import { toggleFilter, type ParsedDownloadParams } from "@/lib/downloads-params";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { clearedHref, downloadsHref } from "./links";
import type { DownloadsLabels } from "./labels";

const CHECKBOX_SELECTED = "/images/service/Downloads/checkbox-selected.svg";
const CHECKBOX_UNSELECTED = "/images/service/Downloads/checkbox-unselected.svg";

interface FilterPanelProps {
  groups: FilterGroupView[];
  params: ParsedDownloadParams;
  basePath: string;
  labels: DownloadsLabels;
  /** Called after Apply commits — the drawer uses it to close itself. */
  onApplied?: () => void;
  className?: string;
}

/** Stable identity for a selection, so "has anything changed?" is a string compare. */
function filtersKey(filters: SelectedFilters): string {
  return Object.entries(filters)
    .map(([group, options]) => `${group}:${[...options].sort().join(",")}`)
    .sort()
    .join("|");
}

/**
 * The filter facets, shared by the desktop sidebar and the < lg drawer.
 *
 * Figma (node 2080:38697) puts an explicit "Apply all filters" button under the
 * groups, so ticking a box *stages* the change in local state and only Apply
 * writes it to the URL. "Clear all" is a reset rather than an edit, so it
 * commits immediately — as do the active chips in the results header, which
 * represent state that is already applied.
 */
export default function FilterPanel({
  groups,
  params,
  basePath,
  labels,
  onApplied,
  className,
}: FilterPanelProps) {
  const router = useRouter();
  const baseId = useId();
  const appliedKey = filtersKey(params.filters);

  const [staged, setStaged] = useState<SelectedFilters>(params.filters);
  // The URL can change under us (a chip removed, the back button, Clear all).
  // Re-deriving during render rather than in an effect keeps the panel from
  // painting one frame of stale ticks.
  const [stagedFor, setStagedFor] = useState(appliedKey);
  if (stagedFor !== appliedKey) {
    setStagedFor(appliedKey);
    setStaged(params.filters);
  }

  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});
  const pending = filtersKey(staged) !== appliedKey;
  const hintId = `${baseId}-pending`;

  function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(downloadsHref(basePath, params, { filters: staged }), { scroll: false });
    onApplied?.();
  }

  function handleClearAll() {
    setStaged({});
    router.push(clearedHref(basePath, params), { scroll: false });
    onApplied?.();
  }

  return (
    <form onSubmit={handleApply} className={cn("flex flex-col gap-40", className)}>
      <div className="flex flex-col gap-24">
        <div className="flex items-center justify-between gap-16">
          <h2 className="text-h5 font-semibold text-neutral-1">{labels.filterHeading}</h2>
          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-4 text-p4 font-medium text-neutral-1 underline underline-offset-2 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] hover:text-neutral-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none"
          >
            {labels.clearAll}
          </button>
        </div>

        <div className="flex flex-col">
          {groups.map((group, index) => {
            const panelId = `${baseId}-group-${group.slug}`;
            // A group opens by default when it has something to show; an empty
            // one stays shut so the sidebar does not list dead ends.
            const isOpen = openOverrides[group.slug] ?? group.options.length > 0;
            const selected = staged[group.slug] ?? [];

            return (
              <fieldset
                key={group.id}
                className={cn(
                  "min-w-0 border-b-[1.5px] border-neutral-10 py-24",
                  index === 0 && "border-t-[1.5px]"
                )}
              >
                <legend className="w-full p-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() =>
                      setOpenOverrides((current) => ({ ...current, [group.slug]: !isOpen }))
                    }
                    className="flex w-full items-center justify-between gap-12 rounded-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                  >
                    <span className="text-p3 font-medium text-neutral-1">{group.name}</span>
                    <span className="flex shrink-0 items-center py-4 text-neutral-1">
                      <ChevronDown
                        size={20}
                        aria-hidden="true"
                        className={cn(
                          "transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] motion-reduce:transition-none",
                          isOpen && "rotate-180"
                        )}
                      />
                    </span>
                  </button>
                </legend>

                <div id={panelId} hidden={!isOpen} className="mt-16 flex flex-col gap-12">
                  {group.options.map((option) => {
                    const checked = selected.includes(option.slug);
                    return (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-center gap-8 text-left"
                      >
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={checked}
                          onChange={() =>
                            setStaged((current) =>
                              toggleFilter(current, group.slug, option.slug)
                            )
                          }
                        />
                        <span className="relative block size-20 shrink-0 rounded-4 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary">
                          {/* Both states render up front and cross-fade, so ticking a
                              box never waits on a network request. */}
                          <Image
                            src={CHECKBOX_UNSELECTED}
                            alt=""
                            width={20}
                            height={20}
                            className={cn(
                              "absolute inset-0 transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] motion-reduce:transition-none",
                              checked && "opacity-0"
                            )}
                          />
                          <Image
                            src={CHECKBOX_SELECTED}
                            alt=""
                            width={20}
                            height={20}
                            className={cn(
                              "absolute inset-0 transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] motion-reduce:transition-none",
                              !checked && "opacity-0"
                            )}
                          />
                        </span>
                        <span
                          className={cn(
                            "min-w-0 text-p3 font-medium transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] motion-reduce:transition-none",
                            checked ? "text-neutral-1" : "text-neutral-4"
                          )}
                        >
                          {option.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          size="xl"
          aria-describedby={pending ? hintId : undefined}
          // Figma node 2080:38697 tightens this label past the token's -0.2px.
          className={cn("w-full tracking-[-1px]", pending && "ring-4 ring-secondary/30")}
        >
          {labels.applyFilters}
        </Button>
        <p id={hintId} role="status" className="sr-only">
          {pending ? labels.pendingFilters : ""}
        </p>
      </div>
    </form>
  );
}
