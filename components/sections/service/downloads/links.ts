import {
  buildDownloadQuery,
  patchDownloadParams,
  toggleFilter,
  type DownloadParamsPatch,
  type ParsedDownloadParams,
} from "@/lib/downloads-params";

/**
 * Every href this section produces goes through here.
 *
 * `lib/downloads-params.ts` owns the serialisation; this module only pairs it
 * with the route the section is mounted on, so a chip, a page link and the
 * sort control can never disagree about what the next URL looks like.
 */

export function downloadsHref(
  basePath: string,
  params: ParsedDownloadParams,
  patch: DownloadParamsPatch = {}
): string {
  return `${basePath}${buildDownloadQuery(patchDownloadParams(params, patch))}`;
}

/** Drop one already-applied option — what the active chips do. */
export function removeFilterHref(
  basePath: string,
  params: ParsedDownloadParams,
  groupSlug: string,
  optionSlug: string
): string {
  return downloadsHref(basePath, params, {
    filters: toggleFilter(params.filters, groupSlug, optionSlug),
  });
}

/** Reset search and every facet. Sort is a preference, not a filter, so it survives. */
export function clearedHref(basePath: string, params: ParsedDownloadParams): string {
  return downloadsHref(basePath, params, { search: "", filters: {} });
}

export function pageHref(
  basePath: string,
  params: ParsedDownloadParams,
  page: number
): string {
  return downloadsHref(basePath, params, { page });
}
