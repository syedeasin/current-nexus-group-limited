"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { DOWNLOAD_SORTS, isDownloadSort } from "@/lib/downloads-types";
import type { ParsedDownloadParams } from "@/lib/downloads-params";
import { cn } from "@/lib/utils";
import { downloadsHref } from "./links";
import { formatLabel, type DownloadsLabels } from "./labels";

interface SortSelectProps {
  params: ParsedDownloadParams;
  basePath: string;
  labels: DownloadsLabels;
  className?: string;
}

/**
 * A real `<select>` held at full opacity zero over the styled box (Figma node
 * 2080:38697). The native popup, keyboard handling and mobile wheel come for
 * free; a hand-rolled listbox would have to reimplement all three.
 */
export default function SortSelect({ params, basePath, labels, className }: SortSelectProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center gap-8 rounded-8 border-[1.5px] border-neutral-10 bg-white py-8 pl-16 pr-12",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-secondary",
        className
      )}
    >
      <span aria-hidden="true" className="whitespace-nowrap text-p4 text-neutral-5">
        {formatLabel(labels.sortLabel, { value: labels.sortOptions[params.sort] })}
      </span>
      <ChevronDown size={24} aria-hidden="true" className="shrink-0 text-neutral-5" />
      <select
        aria-label={labels.sortSelectLabel}
        value={params.sort}
        onChange={(event) => {
          const next = event.target.value;
          if (!isDownloadSort(next)) return;
          router.push(downloadsHref(basePath, params, { sort: next }), { scroll: false });
        }}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        {DOWNLOAD_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {labels.sortOptions[sort]}
          </option>
        ))}
      </select>
    </div>
  );
}
