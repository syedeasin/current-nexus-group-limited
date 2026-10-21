import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import EmptyState from "@/components/dashboard/empty-state";
import { BRAND_CATEGORY_LABELS } from "@/lib/brands/template";
import BrandsTable from "./brands-table";

export default async function BrandsPage() {
  await requirePageAccess("brandPage.manage");

  const brands = await prisma.brandPage.findMany({
    orderBy: [{ locale: "asc" }, { menuOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      locale: true,
      category: true,
      status: true,
      logo: true,
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
          <h1 className="text-h5 font-semibold text-neutral-1">Tier 1 Brands</h1>
          <p className="mt-4 max-w-760 text-p3 font-light text-neutral-5">
            One page per brand, all from the same template. Published brands appear in the Tier 1 Brands menu, the
            footer and the Tier 1 Brands page. The Tier 1 Brands page&rsquo;s own text is in Pages → Tier 1 Brands.
          </p>
        </div>
        <Link
          href="/dashboard/brands/new"
          className="inline-flex items-center gap-8 rounded-full bg-primary px-24 py-12 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90"
        >
          <Plus size={18} /> Add brand
        </Link>
      </div>

      {brands.length === 0 ? (
        <EmptyState title="No brand pages yet" description="Add your first Tier 1 brand. It starts as a draft with the template copy." />
      ) : (
        <BrandsTable
          rows={brands.map((b) => ({
            ...b,
            categoryLabel: BRAND_CATEGORY_LABELS[b.category],
            updatedAt: b.updatedAt.toISOString(),
          }))}
        />
      )}
    </div>
  );
}
