import Image from "next/image";
import type { DownloadItemView } from "@/lib/downloads-types";
import { formatLabel, type DownloadsLabels } from "./labels";

const DOC_ICON = "/images/service/Downloads/doc.svg";
const DOC_ICON_WHITE = "/images/service/Downloads/docWhite.svg";
const DOWNLOAD_ICON = "/images/service/Downloads/download.svg";

interface DownloadRowProps {
  item: DownloadItemView;
  labels: DownloadsLabels;
}

/**
 * One result row. The hover treatment is Figma node 2080:38745: the icon tile
 * inverts, the title darkens and the outline button fills with the accent —
 * colour only, no lift and no shadow, so a list of ten rows stays calm.
 *
 * `group-focus-within` is paired with every `group-hover` so a keyboard user
 * tabbing onto the Download button sees the same row state a mouse user does.
 */
export default function DownloadRow({ item, labels }: DownloadRowProps) {
  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-12">
        <span className="relative shrink-0 rounded-4 bg-surface-1 p-12 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:bg-neutral-1 group-focus-within:bg-neutral-1 motion-reduce:transition-none">
          {/* Both weights ship with the row and cross-fade, so hovering never
              triggers a request for the white variant. */}
          <span className="relative block size-24">
            <Image
              src={DOC_ICON}
              alt=""
              width={24}
              height={24}
              className="absolute inset-0 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:opacity-0 group-focus-within:opacity-0 motion-reduce:transition-none"
            />
            <Image
              src={DOC_ICON_WHITE}
              alt=""
              width={24}
              height={24}
              className="absolute inset-0 opacity-0 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
            />
          </span>
        </span>
        <span className="min-w-0 text-p2 font-medium text-neutral-3 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:text-neutral-1 group-focus-within:text-neutral-1 motion-reduce:transition-none">
          {item.title}
        </span>
      </div>

      <a
        href={item.downloadHref}
        download={item.fileName}
        aria-label={formatLabel(labels.downloadFile, { title: item.title })}
        className="inline-flex h-48 shrink-0 items-center justify-center gap-8 rounded-full border-[1.5px] border-neutral-10 pl-20 pr-24 text-btn-sm font-semibold text-neutral-1 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:border-transparent group-hover:bg-secondary group-focus-within:border-transparent group-focus-within:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none max-sm:w-full"
      >
        <Image src={DOWNLOAD_ICON} alt="" width={18} height={18} className="shrink-0" />
        {labels.download}
      </a>
    </>
  );
}
