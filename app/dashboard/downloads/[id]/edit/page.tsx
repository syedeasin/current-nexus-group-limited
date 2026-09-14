import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DownloadForm from "@/app/dashboard/downloads/download-form";

export default async function EditDownloadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requirePermission("download.manage");

  const [resource, groups] = await Promise.all([
    prisma.downloadResource.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        locale: true,
        description: true,
        status: true,
        displayOrder: true,
        tags: true,
        fileName: true,
        mimeType: true,
        fileSize: true,
        downloadCount: true,
        filterOptions: { select: { optionId: true } },
      },
    }),
    prisma.filterGroup.findMany({
      orderBy: [{ locale: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        locale: true,
        isActive: true,
        options: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { id: true, name: true, isActive: true },
        },
      },
    }),
  ]);

  if (!resource) notFound();

  const formValues = {
    id: resource.id,
    title: resource.title,
    slug: resource.slug,
    locale: resource.locale,
    description: resource.description ?? "",
    status: resource.status,
    displayOrder: resource.displayOrder,
    tags: resource.tags.join(", "),
    filterOptionIds: resource.filterOptions.map((row) => row.optionId),
    file: {
      fileName: resource.fileName,
      mimeType: resource.mimeType,
      fileSize: resource.fileSize,
    },
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-16">
        <div>
          <Link
            href="/dashboard/downloads"
            className="inline-flex items-center gap-4 text-p4 font-semibold uppercase tracking-[2px] text-primary transition-colors duration-200 hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
            Downloads
          </Link>
          <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
            {resource.title}
          </h1>
        </div>

        <p className="text-p4 font-light text-neutral-5">
          {resource.downloadCount} {resource.downloadCount === 1 ? "delivery" : "deliveries"}
        </p>
      </div>

      <div className="mt-32">
        <DownloadForm mode="edit" download={formValues} groups={groups} />
      </div>
    </div>
  );
}
