import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import type { DownloadQueryResult, FilterGroupView } from "@/lib/downloads-types";
import type { ParsedDownloadParams } from "@/lib/downloads-params";
import { EYEBROW_DELAY_MS, HEADING_DELAY_MS, CONTENT_BASE_DELAY_MS } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";
import DownloadsEmptyState from "./DownloadsEmptyState";
import DownloadsList from "./DownloadsList";
import DownloadsPagination from "./DownloadsPagination";
import DownloadsSearch from "./DownloadsSearch";
import DownloadsSidebar from "./DownloadsSidebar";
import FilterDrawer from "./FilterDrawer";
import ResultsHeader from "./ResultsHeader";
import SidebarRail from "./SidebarRail";
import SortSelect from "./SortSelect";
import type { DownloadsLabels } from "./labels";

export interface DownloadsExplorerProps {
  groups: FilterGroupView[];
  result: DownloadQueryResult;
  params: ParsedDownloadParams;
  labels: DownloadsLabels;
  /**
   * The locale-less route this section is mounted on, e.g. "/service/downloads".
   * Every chip, page link and sort change is built from it, so the section can
   * be reused on another route without a second serialisation format.
   */
  basePath: string;
  className?: string;
}

/**
 * Service → Downloads, the "Technical resource" explorer (Figma node
 * 2080:38697, 1600 frame).
 *
 * Desktop is a 344px facet column, a 12px hairline track and the results,
 * which puts the results box at x=388 of the 1320 content column. Below lg the
 * sidebar leaves the flow entirely and its facets move into a modal sheet —
 * squeezing a 344px column into a phone would cost the results their width.
 *
 * State lives in the URL and nowhere else: this component and everything under
 * it read `params` and write hrefs through `lib/downloads-params.ts`, so the
 * server query and the rendered UI can never disagree.
 */
export default function DownloadsExplorer({
  groups,
  result,
  params,
  labels,
  basePath,
  className,
}: DownloadsExplorerProps) {
  const hasResults = result.items.length > 0;

  return (
    <section className={cn("bg-surface-2", className)}>
      <Container>
        {/* No `gap` on the row: Figma puts 32px between the sidebar and the
            track and none between the track and the results, whose own 48px
            left padding carries the rest. */}
        <div className="flex flex-col py-48 md:py-64 lg:flex-row lg:py-80">
          <Reveal delay={HEADING_DELAY_MS} className="hidden w-344 shrink-0 lg:block">
            <DownloadsSidebar
              groups={groups}
              params={params}
              basePath={basePath}
              labels={labels}
            />
          </Reveal>

          <SidebarRail className="ml-32 hidden lg:block" />

          <div className="flex min-w-0 flex-1 flex-col gap-24 lg:pl-48">
            <Reveal delay={EYEBROW_DELAY_MS} className="flex flex-col gap-16 lg:hidden">
              <DownloadsSearch params={params} basePath={basePath} labels={labels} />
              <div className="flex flex-wrap items-center justify-between gap-12">
                <FilterDrawer
                  groups={groups}
                  params={params}
                  basePath={basePath}
                  labels={labels}
                />
                <SortSelect params={params} basePath={basePath} labels={labels} />
              </div>
            </Reveal>

            <Reveal delay={EYEBROW_DELAY_MS}>
              <ResultsHeader
                total={result.total}
                groups={groups}
                params={params}
                basePath={basePath}
                labels={labels}
              />
            </Reveal>

            {hasResults ? (
              <DownloadsList items={result.items} labels={labels} />
            ) : (
              <Reveal delay={CONTENT_BASE_DELAY_MS}>
                <DownloadsEmptyState params={params} basePath={basePath} labels={labels} />
              </Reveal>
            )}

            {result.totalPages > 1 ? (
              <div className="pt-16">
                <DownloadsPagination
                  currentPage={result.page}
                  totalPages={result.totalPages}
                  params={params}
                  basePath={basePath}
                  labels={labels}
                />
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
