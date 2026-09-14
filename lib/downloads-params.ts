import { DEFAULT_SORT, DOWNLOAD_SORTS, type DownloadSort, type SelectedFilters } from "@/lib/downloads-types";

/**
 * The URL *is* the state for the Downloads page.
 *
 * Search, every ticked facet, the sort and the page number all live in the
 * query string, so a filtered view can be shared, bookmarked, reloaded and
 * walked with the browser's back button. This module is the single place that
 * knows how to read that string and how to write it, and it is deliberately
 * free of server-only imports so the client filter UI builds the very same
 * links the server parses.
 *
 * Shape: `?q=uranus&documents-type=datasheets,brochures&solar-panel-modules=hjt-series&sort=newest&page=2`
 *
 * Each filter group gets its own parameter named after its slug, holding a
 * comma-separated list of option slugs. That keeps URLs readable and lets a
 * group be added by an admin without this file changing.
 */

export const SEARCH_KEY = "q";
export const SORT_KEY = "sort";
export const PAGE_KEY = "page";

const RESERVED = new Set<string>([SEARCH_KEY, SORT_KEY, PAGE_KEY]);

/** Next.js hands dynamic search params through as string | string[] | undefined. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function splitSlugs(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((part) => part.trim()).filter(Boolean))];
}

export interface ParsedDownloadParams {
  search: string;
  filters: SelectedFilters;
  sort: DownloadSort;
  page: number;
}

/**
 * `knownGroupSlugs` is what separates a real facet from a stray query param —
 * anything not in the taxonomy is ignored rather than turned into a WHERE
 * clause that matches nothing.
 */
export function parseDownloadParams(
  params: RawSearchParams,
  knownGroupSlugs: readonly string[]
): ParsedDownloadParams {
  const filters: SelectedFilters = {};
  for (const slug of knownGroupSlugs) {
    if (RESERVED.has(slug)) continue;
    const slugs = splitSlugs(firstValue(params[slug]));
    if (slugs.length > 0) filters[slug] = slugs;
  }

  const rawSort = firstValue(params[SORT_KEY]);
  const sort = (DOWNLOAD_SORTS as readonly string[]).includes(rawSort ?? "")
    ? (rawSort as DownloadSort)
    : DEFAULT_SORT;

  const rawPage = Number.parseInt(firstValue(params[PAGE_KEY]) ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  return {
    search: (firstValue(params[SEARCH_KEY]) ?? "").trim(),
    filters,
    sort,
    page,
  };
}

export interface DownloadParamsPatch {
  search?: string;
  filters?: SelectedFilters;
  sort?: DownloadSort;
  page?: number;
}

/**
 * Serialise state back to a query string, omitting anything at its default so
 * the canonical unfiltered URL stays clean (`/service/downloads`, not
 * `/service/downloads?q=&sort=relevant&page=1`).
 */
export function buildDownloadQuery(state: ParsedDownloadParams): string {
  const params = new URLSearchParams();

  if (state.search) params.set(SEARCH_KEY, state.search);

  for (const [groupSlug, optionSlugs] of Object.entries(state.filters)) {
    if (optionSlugs.length > 0) params.set(groupSlug, optionSlugs.join(","));
  }

  if (state.sort !== DEFAULT_SORT) params.set(SORT_KEY, state.sort);
  if (state.page > 1) params.set(PAGE_KEY, String(state.page));

  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * Apply a change on top of current state. Any change other than paging resets
 * to page 1 — landing on page 4 of a two-page result set is the classic
 * faceted-search bug.
 */
export function patchDownloadParams(
  current: ParsedDownloadParams,
  patch: DownloadParamsPatch
): ParsedDownloadParams {
  const next: ParsedDownloadParams = {
    search: patch.search ?? current.search,
    filters: patch.filters ?? current.filters,
    sort: patch.sort ?? current.sort,
    page: patch.page ?? 1,
  };
  return next;
}

/** Toggle one option within one group, preserving every other facet. */
export function toggleFilter(
  filters: SelectedFilters,
  groupSlug: string,
  optionSlug: string
): SelectedFilters {
  const current = filters[groupSlug] ?? [];
  const next = current.includes(optionSlug)
    ? current.filter((slug) => slug !== optionSlug)
    : [...current, optionSlug];

  const result: SelectedFilters = { ...filters };
  if (next.length > 0) result[groupSlug] = next;
  else delete result[groupSlug];
  return result;
}

export function countActiveFilters(filters: SelectedFilters): number {
  return Object.values(filters).reduce((total, slugs) => total + slugs.length, 0);
}
