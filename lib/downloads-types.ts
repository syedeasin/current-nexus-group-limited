/**
 * Client-safe half of the Downloads contract.
 *
 * `lib/data/downloads.ts` is `server-only` — it reaches Prisma — but the filter
 * sidebar, the sort control and the search box are client components and still
 * need the same shapes and the same sort vocabulary. Importing them from the
 * query module would drag `server-only` (and the Prisma client) into the
 * browser bundle, which Next rejects at compile time.
 *
 * So the types and the pure constants live here, the query module re-exports
 * them, and both sides of the boundary agree by construction.
 */

export const DOWNLOAD_SORTS = ["relevant", "newest", "oldest", "az"] as const;
export type DownloadSort = (typeof DOWNLOAD_SORTS)[number];
export const DEFAULT_SORT: DownloadSort = "relevant";

export const DOWNLOADS_PER_PAGE = 10;

export function isDownloadSort(value: unknown): value is DownloadSort {
  return typeof value === "string" && (DOWNLOAD_SORTS as readonly string[]).includes(value);
}

export interface FilterOptionView {
  id: string;
  name: string;
  slug: string;
  /** Published resources carrying this option, under the current locale. */
  count: number;
}

export interface FilterGroupView {
  id: string;
  name: string;
  slug: string;
  options: FilterOptionView[];
}

export interface DownloadItemView {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  /** Always the controlled route, never the raw storage path. */
  downloadHref: string;
}

export interface DownloadQueryResult {
  items: DownloadItemView[];
  total: number;
  page: number;
  totalPages: number;
  perPage: number;
}

/** Selected option slugs, keyed by their group's slug. */
export type SelectedFilters = Record<string, string[]>;
