import Reveal from "@/components/ui/Reveal";
import type { DownloadItemView } from "@/lib/downloads-types";
import { CONTENT_BASE_DELAY_MS, stagger } from "@/lib/motion/timing";
import DownloadRow from "./DownloadRow";
import type { DownloadsLabels } from "./labels";

interface DownloadsListProps {
  items: DownloadItemView[];
  labels: DownloadsLabels;
}

export default function DownloadsList({ items, labels }: DownloadsListProps) {
  return (
    <ul className="flex flex-col rounded-16 border-[1.5px] border-neutral-10">
      {items.map((item, index) => (
        <Reveal
          key={item.id}
          as="li"
          // `stagger` caps at REVEAL_STAGGER_CAP steps, so page 2 of a long
          // catalogue lands in ~400ms rather than cascading for a second.
          delay={stagger(index, CONTENT_BASE_DELAY_MS)}
          // Wrapping is a phone-only fallback. From sm up the button stays pinned
          // right and the title column absorbs the slack instead — below 1600 the
          // results column is narrower than Figma's 884px, so a nowrap title would
          // otherwise push the whole button onto its own line.
          className="group flex flex-wrap items-center justify-between gap-16 border-b-[1.5px] border-neutral-10 p-24 last:border-b-0 sm:flex-nowrap"
        >
          <DownloadRow item={item} labels={labels} />
        </Reveal>
      ))}
    </ul>
  );
}
