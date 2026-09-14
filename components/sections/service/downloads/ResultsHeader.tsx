import type { FilterGroupView } from "@/lib/downloads-types";
import type { ParsedDownloadParams } from "@/lib/downloads-params";
import ActiveFilterChips from "./ActiveFilterChips";
import SortSelect from "./SortSelect";
import type { DownloadsLabels } from "./labels";

interface ResultsHeaderProps {
  /** Total matching resources, from the server query — never a client-side length. */
  total: number;
  groups: FilterGroupView[];
  params: ParsedDownloadParams;
  basePath: string;
  labels: DownloadsLabels;
}

export default function ResultsHeader({
  total,
  groups,
  params,
  basePath,
  labels,
}: ResultsHeaderProps) {
  return (
    <div className="flex flex-col gap-24">
      <div className="flex items-center justify-between gap-16">
        {/* One sentence, two weights (Figma node 2080:38697). aria-live so a
            filter change announces the new count without moving focus. */}
        <p aria-live="polite" className="text-p3">
          <span className="font-medium text-neutral-1">{total}</span>
          <span className="text-neutral-3">{labels.resultsSuffix}</span>
        </p>
        {/* Below lg the sort control moves up into the filter bar. */}
        <SortSelect
          params={params}
          basePath={basePath}
          labels={labels}
          className="hidden lg:inline-flex"
        />
      </div>

      <ActiveFilterChips
        groups={groups}
        params={params}
        basePath={basePath}
        labels={labels}
      />
    </div>
  );
}
