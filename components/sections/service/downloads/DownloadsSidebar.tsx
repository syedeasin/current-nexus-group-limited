import type { FilterGroupView } from "@/lib/downloads-types";
import type { ParsedDownloadParams } from "@/lib/downloads-params";
import DownloadsSearch from "./DownloadsSearch";
import FilterPanel from "./FilterPanel";
import type { DownloadsLabels } from "./labels";

interface DownloadsSidebarProps {
  groups: FilterGroupView[];
  params: ParsedDownloadParams;
  basePath: string;
  labels: DownloadsLabels;
}

/** The >= lg column: search over facets, 40px apart (Figma node 2080:38697). */
export default function DownloadsSidebar({
  groups,
  params,
  basePath,
  labels,
}: DownloadsSidebarProps) {
  return (
    <aside aria-label={labels.filterLandmark} className="flex flex-col gap-40">
      <DownloadsSearch params={params} basePath={basePath} labels={labels} />
      <FilterPanel groups={groups} params={params} basePath={basePath} labels={labels} />
    </aside>
  );
}
