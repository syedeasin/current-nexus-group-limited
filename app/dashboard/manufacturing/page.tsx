import Link from "next/link";
import { ExternalLink, PencilLine, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { routing } from "@/i18n/routing";
import { getPageDef, pageSlug } from "@/lib/page-content/registry";
import EmptyState from "@/components/dashboard/empty-state";
import ManufacturingTable from "./manufacturing-table";

/** Second-level pages, edited in Dashboard → Pages (registry keys). */
const CATEGORY_PAGE_KEYS = ["manufacturing.solarPanels", "manufacturing.bess"] as const;

export default async function ManufacturingDashboardPage() {
  const user = await requirePageAccess("manufacturingPage.manage");
  const canEditCategories = can(user.role, "page.manage");
  const categoryPages = CATEGORY_PAGE_KEYS.map((key) => getPageDef(key)).filter((p) => p !== undefined);

  const pages = await prisma.manufacturingPage.findMany({
    orderBy: [{ category: "asc" }, { menuOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      locale: true,
      category: true,
      status: true,
      menuLabel: true,
      menuOrder: true,
      showInMegaMenu: true,
      isProtectedTemplate: true,
      updatedAt: true,
    },
  });

  return (
    <div>
      <div className="mb-24 flex flex-wrap items-center justify-between gap-16">
        <div>
          <h1 className="text-h5 font-semibold text-neutral-1">Manufacturing</h1>
          <p className="mt-4 text-p3 font-light text-neutral-5">
            Product pages built from the BC master template. Published pages appear in the mega menu.
          </p>
        </div>
        <Link
          href="/dashboard/manufacturing/new"
          className="inline-flex items-center gap-8 rounded-full bg-primary px-24 py-12 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90"
        >
          <Plus size={18} /> Add new page
        </Link>
      </div>

      {canEditCategories && (
        <section aria-labelledby="category-pages-heading" className="mb-32">
          <h2 id="category-pages-heading" className="text-p2 font-medium text-neutral-1">
            Category pages (second level)
          </h2>
          <p className="mt-4 text-p4 font-light text-neutral-5">
            The Solar Panels and BESS pages: banner, product cards, &ldquo;why choose&rdquo; block, CTA image and SEO.
            Their menu labels are under Pages → Header navigation.
          </p>
          <ul className="mt-12 grid gap-12 sm:grid-cols-2">
            {categoryPages.map((page) => (
              <li
                key={page.key}
                className="flex flex-wrap items-center justify-between gap-12 rounded-16 border border-neutral-10 bg-white px-20 py-16"
              >
                <div>
                  <p className="text-p3 font-medium text-neutral-1">{page.label}</p>
                  <p className="text-p4 text-neutral-5">{page.href}</p>
                </div>
                <div className="flex flex-wrap items-center gap-8">
                  {routing.locales.map((locale) => (
                    <Link
                      key={locale}
                      href={`/dashboard/pages/${pageSlug(page.key)}?locale=${locale}`}
                      className="inline-flex items-center gap-6 rounded-full border border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <PencilLine size={14} aria-hidden="true" />
                      Edit {locale.toUpperCase()}
                      <span className="sr-only"> — {page.label}</span>
                    </Link>
                  ))}
                  <a
                    href={`/${routing.defaultLocale}${page.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-6 px-8 py-8 text-p4 font-semibold uppercase tracking-[1px] text-primary hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    View <ExternalLink size={14} aria-hidden="true" />
                    <span className="sr-only"> {page.label} (opens in a new tab)</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mb-12 text-p2 font-medium text-neutral-1">Product pages (third level)</h2>
      {pages.length === 0 ? (
        <EmptyState title="No pages yet" description="Seed or create the first manufacturing product page." />
      ) : (
        <ManufacturingTable pages={pages.map((p) => ({ ...p, updatedAt: p.updatedAt.toISOString() }))} />
      )}
    </div>
  );
}
