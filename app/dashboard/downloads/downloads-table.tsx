import Link from "next/link";
import StatusBadge from "@/components/dashboard/status-badge";
import DownloadDeleteButton from "@/app/dashboard/downloads/download-delete-button";
import { fileTypeLabel, formatFileSize } from "@/app/dashboard/downloads/file-utils";

export type DownloadRow = {
  id: string;
  title: string;
  slug: string;
  locale: string;
  status: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  updatedAt: Date;
  filterOptions: { option: { name: string; group: { name: string } } }[];
};

const HEADINGS = ["Title", "Type", "Size", "Filters", "Status", "Locale", "Updated", "Actions"];

export default function DownloadsTable({ downloads }: { downloads: DownloadRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] border-collapse">
        <thead>
          <tr className="border-b border-neutral-10 bg-surface-2">
            {HEADINGS.map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-20 py-16 text-left text-p4 font-semibold uppercase tracking-[2px] text-neutral-5"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {downloads.map((item) => (
            <tr
              key={item.id}
              className="border-b border-neutral-10 transition-colors duration-200 last:border-b-0 hover:bg-surface-1"
            >
              <td className="px-20 py-16">
                <Link
                  href={`/dashboard/downloads/${item.id}/edit`}
                  className="text-p3 font-light text-neutral-1 transition-colors duration-200 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {item.title}
                </Link>
                <p className="mt-2 truncate text-p4 text-neutral-5">{item.fileName}</p>
              </td>
              <td className="px-20 py-16">
                <span className="inline-flex items-center rounded-4 bg-surface-1 px-8 py-4 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4">
                  {fileTypeLabel(item.mimeType)}
                </span>
              </td>
              <td className="whitespace-nowrap px-20 py-16 text-p4 font-light text-neutral-5">
                {formatFileSize(item.fileSize)}
              </td>
              <td className="px-20 py-16">
                {item.filterOptions.length === 0 ? (
                  <span className="text-p4 font-light text-neutral-5">—</span>
                ) : (
                  <div className="flex max-w-320 flex-wrap gap-4">
                    {item.filterOptions.map(({ option }) => (
                      <span
                        key={`${option.group.name}-${option.name}`}
                        title={`${option.group.name}: ${option.name}`}
                        className="inline-flex items-center rounded-full bg-surface-1 px-8 py-4 text-p4 font-light text-neutral-4"
                      >
                        {option.name}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="px-20 py-16">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-20 py-16 text-p4 font-semibold uppercase tracking-[1.5px] text-neutral-5">
                {item.locale}
              </td>
              <td className="whitespace-nowrap px-20 py-16 text-p4 font-light text-neutral-5">
                {item.updatedAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-20 py-16">
                <div className="flex items-center gap-8">
                  <Link
                    href={`/dashboard/downloads/${item.id}/edit`}
                    className="rounded-full border border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Edit
                  </Link>
                  <DownloadDeleteButton id={item.id} title={item.title} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
