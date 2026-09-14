import type { DownloadSort } from "@/lib/downloads-types";

/**
 * Every user-facing string the Downloads explorer renders.
 *
 * The section is deliberately translation-agnostic: no component under
 * `components/sections/service/downloads/` calls `useTranslations` or
 * `getTranslations`. The page resolves the messages once on the server and
 * hands them down, which keeps the client bundle free of the i18n runtime and
 * keeps the filter UI — which is already client-side for interaction reasons —
 * from shipping a second copy of the message catalogue.
 *
 * Strings marked `{token}` are templates; render them through `formatLabel`.
 */
export interface DownloadsLabels {
  /** Accessible name for the search field. */
  searchLabel: string;
  searchPlaceholder: string;
  /** Accessible name for the search form's submit control. */
  searchSubmit: string;

  /** "Filter" — the sidebar heading. */
  filterHeading: string;
  /** Accessible name for the filter landmark, e.g. "Filter downloads". */
  filterLandmark: string;
  clearAll: string;
  applyFilters: string;
  /** Announced when staged tick boxes have not been applied yet, e.g. "You have unapplied filter changes." */
  pendingFilters: string;

  /** "Filters" — the < lg drawer trigger. */
  filtersButton: string;
  closeFilters: string;
  /** Accessible name for the drawer's active-count badge, e.g. "{count} active". */
  activeFilterCount: string;

  /** Accessible name for the chip row, e.g. "Active filters". */
  activeFilters: string;
  /** "Remove filter: {name}" */
  removeFilter: string;

  /** Follows the count: " results found" (include the leading space if the language needs one). */
  resultsSuffix: string;

  /** "Sort: {value}" */
  sortLabel: string;
  /** Accessible name for the sort control, e.g. "Sort downloads". */
  sortSelectLabel: string;
  sortOptions: Record<DownloadSort, string>;

  /** "Download" — the row button. */
  download: string;
  /** "Download {title}" — the row button's accessible name. */
  downloadFile: string;

  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;

  /** Accessible name for the pagination landmark, e.g. "Downloads pagination". */
  pagination: string;
  previous: string;
  next: string;
  /** "Go to page {page}" */
  goToPage: string;
}

/** Minimal `{token}` interpolation — the messages are already translated upstream. */
export function formatLabel(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}
