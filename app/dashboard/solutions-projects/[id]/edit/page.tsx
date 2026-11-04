import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import StatusBadge from "@/components/dashboard/status-badge";
import SolutionForm, { type SolutionPageInitial } from "../../solution-form";
import type { SolutionPageContent } from "@/lib/solutions-projects/types";
import { BLOCK_PAGES_NAMESPACE, blockPageForSlug } from "@/lib/block-pages/config";
import { pageSlug } from "@/lib/page-content/registry";

export default async function EditSolutionPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("solutionsPage.manage");
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
  // Pages redesigned as content blocks take their copy from Dashboard → Pages.
  const blocks = blockPageForSlug(row.menuGroup, row.slug);

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
      {blocks ? (
        <div role="note" className="mb-24 flex items-start gap-12 rounded-12 border border-primary/20 bg-primary/5 px-16 py-14 text-p4 text-neutral-2">
          <Info size={18} aria-hidden="true" className="mt-2 shrink-0 text-primary" />
          <p>
            The text, photos and sections of this page are edited in{" "}
            <Link
              href={`/dashboard/pages/${pageSlug(`${BLOCK_PAGES_NAMESPACE}.${blocks.key}`)}`}
              className="font-semibold text-primary underline underline-offset-4"
            >
              Pages → {blocks.label}
            </Link>
            . Here you still control Draft / Published, the web address (slug) and the menu label and order; the content and SEO fields below are not used on the website (SEO is edited in Pages too).
          </p>
        </div>
      ) : null}
      <SolutionForm mode="edit" page={page} />
    </div>
  );
}
