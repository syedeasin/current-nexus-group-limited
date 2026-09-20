import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
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
    metaTitle: row.metaTitle ?? "",
    metaDescription: row.metaDescription ?? "",
    content: row.content as unknown as SolutionPageContent,
  };

  return (
    <div>
      <Link href="/dashboard/solutions-projects" className="mb-16 inline-flex items-center gap-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5 hover:text-primary">
        <ArrowLeft size={16} /> Back to pages
      </Link>
      <h1 className="mb-24 text-h5 font-semibold text-neutral-1">{row.title}</h1>
      <SolutionForm mode="edit" page={page} />
    </div>
  );
}
