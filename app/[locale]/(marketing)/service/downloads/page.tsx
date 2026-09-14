import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Locale as PrismaLocale } from "@prisma/client";
import PageBanner from "@/components/sections/shared/PageBanner";
import DownloadsExplorer from "@/components/sections/service/downloads/DownloadsExplorer";
import type { DownloadsLabels } from "@/components/sections/service/downloads/labels";
import {
  getFilterTaxonomy,
  queryDownloads,
  DOWNLOAD_SORTS,
  DEFAULT_SORT,
  type DownloadQueryResult,
  type FilterGroupView,
} from "@/lib/data/downloads";
import { parseDownloadParams, type RawSearchParams } from "@/lib/downloads-params";

const BASE_PATH = "/service/downloads";
const BANNER_IMAGE = "/images/service/Downloads/service-downloads-heroBanner.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("service.downloads.meta");
  return { title: t("title"), description: t("description") };
}

/** next-intl's locale strings are lower case; Prisma's enum is upper. */
function toPrismaLocale(locale: string): PrismaLocale {
  return locale.toLowerCase() === "fr" ? PrismaLocale.FR : PrismaLocale.EN;
}

export default async function DownloadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const [{ locale }, rawSearchParams] = await Promise.all([params, searchParams]);
  const t = await getTranslations("service.downloads");
  const prismaLocale = toPrismaLocale(locale);

  // The taxonomy has to resolve before the query params can: a group slug is
  // only a facet if the database says it is one (lib/downloads-params.ts).
  // A database outage degrades to an empty, still-rendered page rather than a
  // 500 — the banner, header and footer are worth serving on their own.
  let groups: FilterGroupView[] = [];
  let dbReachable = true;
  try {
    groups = await getFilterTaxonomy(prismaLocale);
  } catch (error) {
    console.error("[downloads] taxonomy query failed", error);
    dbReachable = false;
  }

  const parsed = parseDownloadParams(
    rawSearchParams,
    groups.map((group) => group.slug)
  );

  let result: DownloadQueryResult = {
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
    perPage: 10,
  };

  if (dbReachable) {
    try {
      result = await queryDownloads({
        locale: prismaLocale,
        search: parsed.search,
        filters: parsed.filters,
        sort: parsed.sort,
        page: parsed.page,
      });
    } catch (error) {
      console.error("[downloads] resource query failed", error);
      dbReachable = false;
    }
  }

  const sortOptions = Object.fromEntries(
    DOWNLOAD_SORTS.map((sort) => [sort, t(`sort.${sort}`)])
  ) as DownloadsLabels["sortOptions"];

  const labels: DownloadsLabels = {
    searchLabel: t("searchLabel"),
    searchPlaceholder: t("searchPlaceholder"),
    searchSubmit: t("searchSubmit"),
    filterHeading: t("filterHeading"),
    filterLandmark: t("filterLandmark"),
    clearAll: t("clearAll"),
    applyFilters: t("applyFilters"),
    pendingFilters: t("pendingFilters"),
    filtersButton: t("filtersButton"),
    closeFilters: t("closeFilters"),
    // `{token}` strings are templates for the section's own `formatLabel`, not
    // ICU messages — `t()` would try to format them and throw on the missing
    // argument, so they are read raw and interpolated at the call site.
    activeFilterCount: t.raw("activeFilterCount"),
    activeFilters: t("activeFilters"),
    removeFilter: t.raw("removeFilter"),
    resultsSuffix: result.total === 1 ? t("resultsSuffixOne") : t("resultsSuffix"),
    sortLabel: t("sortPrefix") + sortOptions[parsed.sort ?? DEFAULT_SORT],
    sortSelectLabel: t("sortSelectLabel"),
    sortOptions,
    download: t("download"),
    downloadFile: t.raw("downloadFile"),
    emptyTitle: dbReachable ? t("empty.title") : t("error.title"),
    emptyBody: dbReachable ? t("empty.body") : t("error.body"),
    emptyAction: t("empty.action"),
    pagination: t("paginationLandmark"),
    previous: t("pagination.previous"),
    next: t("pagination.next"),
    goToPage: t.raw("goToPage"),
  };

  return (
    <main>
      {/* Figma node 2080:38679 — the same 660px banner the Solutions pages use,
          text block centred in the 572px below the header. Unlike those pages
          this one has no CTA band: the CTA frame in node 4011:3670 is hidden,
          so the results run straight into the site footer. */}
      <PageBanner
        eyebrowLabel={t("banner.eyebrow")}
        heading={t("banner.heading")}
        description={t("banner.description")}
        image={{ src: BANNER_IMAGE }}
        textMaxWidthClassName="max-w-573"
        containerClassName="h-460 justify-center pt-56 md:h-560 xl:h-660 xl:pt-88"
      />

      <DownloadsExplorer
        groups={groups}
        result={result}
        params={parsed}
        labels={labels}
        basePath={BASE_PATH}
      />
    </main>
  );
}
