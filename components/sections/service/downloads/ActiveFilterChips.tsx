import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { FilterGroupView } from "@/lib/downloads-types";
import type { ParsedDownloadParams } from "@/lib/downloads-params";
import { removeFilterHref } from "./links";
import { formatLabel, type DownloadsLabels } from "./labels";

interface ActiveFilterChipsProps {
  groups: FilterGroupView[];
  params: ParsedDownloadParams;
  basePath: string;
  labels: DownloadsLabels;
}

/**
 * Chips mirror *applied* state, so unlike the sidebar's staged tick boxes they
 * take effect on click. That makes them plain links — no client bundle, and
 * they keep working with JS off.
 *
 * Walking `groups` rather than `params.filters` is what puts the chips in
 * taxonomy order and silently drops a slug the admin has since retired.
 */
export default function ActiveFilterChips({
  groups,
  params,
  basePath,
  labels,
}: ActiveFilterChipsProps) {
  const chips = groups.flatMap((group) => {
    const selected = params.filters[group.slug] ?? [];
    return group.options
      .filter((option) => selected.includes(option.slug))
      .map((option) => ({
        key: `${group.slug}:${option.slug}`,
        name: option.name,
        href: removeFilterHref(basePath, params, group.slug, option.slug),
      }));
  });

  if (chips.length === 0) return null;

  return (
    <ul aria-label={labels.activeFilters} className="flex flex-wrap gap-8">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Link
            href={chip.href}
            scroll={false}
            aria-label={formatLabel(labels.removeFilter, { name: chip.name })}
            className="inline-flex items-center gap-8 rounded-full bg-surface-1 py-6 pl-14 pr-12 text-p4 text-neutral-1 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] hover:bg-neutral-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none"
          >
            <span className="min-w-0">{chip.name}</span>
            <X size={16} aria-hidden="true" className="shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
