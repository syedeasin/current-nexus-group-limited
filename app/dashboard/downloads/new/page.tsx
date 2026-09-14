import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DownloadForm from "@/app/dashboard/downloads/download-form";

export default async function NewDownloadPage() {
  await requirePermission("download.manage");

  const groups = await prisma.filterGroup.findMany({
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
  });

  return (
    <div>
      <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Service</p>
      <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
        New download
      </h1>

      <div className="mt-32">
        <DownloadForm mode="create" groups={groups} />
      </div>
    </div>
  );
}
