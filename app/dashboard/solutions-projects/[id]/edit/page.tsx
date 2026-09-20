import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import StatusBadge from "@/components/dashboard/status-badge";
import SolutionForm, { type SolutionPageInitial } from "../../solution-form";
import type { SolutionPageContent } from "@/lib/solutions-projects/types";

export default async function EditSolutionPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("solutionsPage.manage");
  const { id } = await params;

  const row = await prisma.solutionPage.findUnique({ where: { id } });
  if (!row) notFound();

  const page: SolutionPageInitial = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    locale: row.locale,
    status: row.status,
    menuGroup: row.menuGroup,
    menuLabel: row.menuLabel,
    menuOrder: row.menuOrder,
    showInMegaMenu: row.showInMegaMenu,
    isProtectedTemplate: row.isProtectedTemplate,
    metaTitle: row.metaTitle ?? "",
    metaDescription: row.metaDescription ?? "",
    seo: (row.seo as unknown as SolutionPageInitial["seo"]) ?? {},
    content: row.content as unknown as SolutionPageContent,
  };

  return (
    <div>
      <Link href="/dashboard/solutions-projects" className="mb-16 inline-flex items-center gap-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5 hover:text-primary">
        <ArrowLeft size={16} /> Back to pages
      </Link>
      <div className="mb-24 flex flex-wrap items-center gap-12">
        <h1 className="text-h5 font-semibold text-neutral-1">{row.title}</h1>
        <StatusBadge status={row.status} />
        {row.isProtectedTemplate && (
          <span title="Master template — the base design other pages are built from" className="inline-flex items-center gap-4 rounded-full bg-surface-1 px-10 py-4 text-p4 font-semibold uppercase tracking-[1px] text-primary">
            <Lock size={12} /> Master template
          </span>
        )}
        <span className="text-p4 font-light text-neutral-5">Updated {row.updatedAt.toLocaleDateString()}</span>
      </div>
      <SolutionForm mode="edit" page={page} />
    </div>
  );
}
