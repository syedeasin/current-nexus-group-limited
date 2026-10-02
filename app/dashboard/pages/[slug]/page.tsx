import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { routing, type Locale } from "@/i18n/routing";
import { COLLECTION_PATTERNS, getPageDefBySlug, pageSlug } from "@/lib/page-content/registry";
import { getBaseMessages, getMergedMessages, toPrismaLocale } from "@/lib/page-content/messages";
import { PAGE_ICON_KEYS } from "@/lib/page-content/icons";
import { getAt, isTree, type MessageTree } from "@/lib/page-content/tree";
import PageContentEditor, { type EditorSection } from "@/components/dashboard/page-content-editor";
import { cn } from "@/lib/utils";

const LOCALE_LABEL: Record<string, string> = { en: "English", fr: "French" };

function without(tree: MessageTree, exclude: string[] = []): MessageTree {
  if (exclude.length === 0) return tree;
  return Object.fromEntries(Object.entries(tree).filter(([key]) => !exclude.includes(key)));
}

export default async function EditWebsitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  await requirePermission("page.manage");
  const [{ slug }, sp] = await Promise.all([params, searchParams]);

  const page = getPageDefBySlug(slug);
  if (!page) notFound();

  const locale: Locale = (routing.locales as readonly string[]).includes(sp.locale ?? "")
    ? (sp.locale as Locale)
    : routing.defaultLocale;

  const [merged, row] = await Promise.all([
    getMergedMessages(locale),
    prisma.pageContent.findUnique({
      where: { pageKey_locale: { pageKey: page.key, locale: toPrismaLocale(locale) } },
      select: { id: true },
    }),
  ]);
  const base = getBaseMessages(locale);

  const sections: EditorSection[] = page.sections.flatMap((section) => {
    const value = getAt(merged, section.path);
    const defaults = getAt(base, section.path);
    if (!isTree(value) || !isTree(defaults)) return [];
    return [
      {
        id: section.id,
        label: section.label,
        description: section.description,
        path: section.path,
        value: without(value, section.exclude),
        defaults: without(defaults, section.exclude),
      },
    ];
  });

  const viewHref = page.href ? `/${locale}${page.href === "/" ? "" : page.href}` : null;
  const localeLabel = LOCALE_LABEL[locale] ?? locale.toUpperCase();

  return (
    <div>
      <Link
        href="/dashboard/pages"
        className="inline-flex items-center gap-6 text-p4 font-medium text-neutral-5 transition-colors duration-200 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft size={14} aria-hidden="true" /> All pages
      </Link>

      <div className="mt-12 mb-24 flex flex-wrap items-end justify-between gap-16">
        <div>
          <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">{page.group}</p>
          <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
            {page.label}
          </h1>
          <p className="mt-8 max-w-760 text-p3 font-light text-neutral-5">{page.description}</p>
        </div>

        <nav aria-label="Language" className="flex rounded-full border border-neutral-10 bg-white p-4">
          {routing.locales.map((l) => (
            <Link
              key={l}
              href={`/dashboard/pages/${pageSlug(page.key)}?locale=${l}`}
              aria-current={l === locale ? "page" : undefined}
              className={cn(
                "rounded-full px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                l === locale ? "bg-primary text-white" : "text-neutral-4 hover:text-primary"
              )}
            >
              {LOCALE_LABEL[l] ?? l}
            </Link>
          ))}
        </nav>
      </div>

      <PageContentEditor
        key={`${page.key}:${locale}`}
        pageKey={page.key}
        pageLabel={page.label}
        locale={locale}
        localeLabel={localeLabel}
        viewHref={viewHref}
        hasEdits={Boolean(row)}
        sections={sections}
        collections={COLLECTION_PATTERNS}
        iconKeys={PAGE_ICON_KEYS}
      />
    </div>
  );
}
