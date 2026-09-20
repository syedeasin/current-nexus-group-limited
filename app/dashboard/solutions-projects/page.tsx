import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import EmptyState from "@/components/dashboard/empty-state";
import PagesTable from "./pages-table";

export default async function SolutionsProjectsPage() {
  await requirePermission("solutionsPage.manage");

  const pages = await prisma.solutionPage.findMany({
    orderBy: [{ menuGroup: "asc" }, { menuOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      locale: true,
      status: true,
      menuGroup: true,
      menuLabel: true,
      menuOrder: true,
      showInMegaMenu: true,
      updatedAt: true,
    },
  });

  return (
    <div>
      <div className="mb-24 flex flex-wrap items-center justify-between gap-16">
        <div>
          <h1 className="text-h5 font-semibold text-neutral-1">Solutions &amp; Projects</h1>
          <p className="mt-4 text-p3 font-light text-neutral-5">
            Pages built from the shared template. Published pages appear in the mega menu.
          </p>
        </div>
        <Link
          href="/dashboard/solutions-projects/new"
          className="inline-flex items-center gap-8 rounded-full bg-primary px-24 py-12 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90"
        >
          <Plus size={18} /> Add new page
        </Link>
      </div>

      {pages.length === 0 ? (
        <EmptyState
          title="No pages yet"
          description="Create your first Solutions & Projects page. It uses the same template as Residential."
        />
      ) : (
        <PagesTable pages={pages.map((p) => ({ ...p, updatedAt: p.updatedAt.toISOString() }))} />
      )}
    </div>
  );
}
