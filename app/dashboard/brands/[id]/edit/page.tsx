import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import StatusBadge from "@/components/dashboard/status-badge";
import PageContentEditor, { type EditorSection } from "@/components/dashboard/page-content-editor";
import { COLLECTION_PATTERNS } from "@/lib/page-content/registry";
import { PAGE_ICON_KEYS } from "@/lib/page-content/icons";
import { getAt, isTree, type MessageTree } from "@/lib/page-content/tree";
import { brandTemplate } from "@/lib/brands/template";
import { mergedBrandTree } from "@/lib/brands/content";
import { brandEntryHref } from "@/config/nav.config";
import { resetBrandPage, saveBrandPage } from "../../actions";
import { BRAND_CONTENT_SECTIONS, BRAND_SETTINGS_SECTION } from "../../sections";

const LOCALE_LABEL = { EN: "English", FR: "French" } as const;

/**
 * The brand page editor is the Dashboard → Pages editor: the same fields,
 * lists, image uploads and validation, pointed at this brand's record.
 */
export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("brandPage.manage");
  const { id } = await params;

  const row = await prisma.brandPage.findUnique({ where: { id } });
  if (!row) notFound();

  const settings: MessageTree = {
    name: row.name,
    slug: row.slug,
    publishStatus: row.status,
    brandCategory: row.category,
    logo: row.logo,
    summary: row.summary,
    menuOrder: String(row.menuOrder),
    showInMenu: String(row.showInMegaMenu),
  };

  const defaults = brandTemplate(row.name, row.category);
  const merged = mergedBrandTree(row.name, row.category, row.content);
  const contentSections: EditorSection[] = BRAND_CONTENT_SECTIONS.flatMap((section) => {
    const value = getAt(merged, section.path);
    const sectionDefaults = getAt(defaults, section.path);
    if (!isTree(value) || !isTree(sectionDefaults)) return [];
    return [{ ...section, value, defaults: sectionDefaults }];
  });
  const sections: EditorSection[] = [{ ...BRAND_SETTINGS_SECTION, value: settings, defaults: settings }, ...contentSections];

  const hasEdits = isTree(row.content) ? Object.keys(row.content).length > 0 : Array.isArray(row.content) && row.content.length > 0;
  const localeLabel = LOCALE_LABEL[row.locale];
  const viewHref = row.status === "PUBLISHED" ? `/${row.locale.toLowerCase()}${brandEntryHref(row.slug)}` : null;

  return (
    <div>
      <Link
        href="/dashboard/brands"
        className="mb-16 inline-flex items-center gap-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-5 hover:text-primary"
      >
        <ArrowLeft size={16} /> All brands
      </Link>
      <div className="mb-24 flex flex-wrap items-center gap-12">
        <h1 className="text-h5 font-semibold text-neutral-1">{row.name}</h1>
        <StatusBadge status={row.status} />
        {row.isProtectedTemplate && (
          <span
            title="Master template — the base the other brand pages were copied from"
            className="inline-flex items-center gap-4 rounded-full bg-surface-1 px-10 py-4 text-p4 font-semibold uppercase tracking-[1px] text-primary"
          >
            <Lock size={12} /> Master template
          </span>
        )}
        <span className="text-p4 font-light text-neutral-5">
          {localeLabel} · Updated {row.updatedAt.toLocaleDateString()}
        </span>
      </div>

      <PageContentEditor
        key={row.id}
        pageKey={`brand:${row.id}`}
        pageLabel={row.name}
        locale={row.locale.toLowerCase()}
        localeLabel={localeLabel}
        viewHref={viewHref}
        hasEdits={hasEdits}
        sections={sections}
        collections={COLLECTION_PATTERNS}
        iconKeys={PAGE_ICON_KEYS}
        onSave={saveBrandPage.bind(null, row.id)}
        onReset={resetBrandPage.bind(null, row.id)}
        statusNote={
          row.status === "PUBLISHED"
            ? "Published — changes go live as soon as you save. Untouched text follows the brand name automatically."
            : "Draft — not on the website yet. Set Status to Published in Brand settings and save to put it live."
        }
      />
    </div>
  );
}
