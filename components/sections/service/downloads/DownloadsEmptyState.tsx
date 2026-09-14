import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import type { ParsedDownloadParams } from "@/lib/downloads-params";
import { clearedHref } from "./links";
import type { DownloadsLabels } from "./labels";

interface DownloadsEmptyStateProps {
  params: ParsedDownloadParams;
  basePath: string;
  labels: DownloadsLabels;
}

/** Zero results keeps the list's frame so the column does not collapse. */
export default function DownloadsEmptyState({
  params,
  basePath,
  labels,
}: DownloadsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-16 rounded-16 border-[1.5px] border-neutral-10 px-24 py-64 text-center md:px-48 md:py-80">
      <Heading level={3} size="h5" className="text-neutral-1">
        {labels.emptyTitle}
      </Heading>
      <Text size="p3" className="max-w-480 text-neutral-4">
        {labels.emptyBody}
      </Text>
      <Button href={clearedHref(basePath, params)} size="lg" className="mt-8">
        {labels.emptyAction}
      </Button>
    </div>
  );
}
