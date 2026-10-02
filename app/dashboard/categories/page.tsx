import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import TaxonomyManager, { type TaxonomyField, type TaxonomyItem } from "@/components/dashboard/taxonomy-manager";
import { createCategory, deleteCategory, updateCategory } from "./actions";

export default async function CategoriesPage() {
  await requirePageAccess("category.manage");

  const categories = await prisma.category.findMany({
    orderBy: [{ locale: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: { parent: { select: { name: true } }, _count: { select: { posts: true, children: true } } },
  });

  const fields: TaxonomyField[] = [
    { name: "name", label: "Name", kind: "text", required: true, maxLength: 80 },
    { name: "slug", label: "Slug", kind: "text", maxLength: 80, hint: "Leave empty to build it from the name." },
    {
      name: "locale",
      label: "Language",
      kind: "select",
      options: [
        { value: "EN", label: "English" },
        { value: "FR", label: "French" },
      ],
    },
    {
      name: "parentId",
      label: "Parent category",
      kind: "select",
      hint: "Optional. Must be in the same language.",
      options: [
        { value: "", label: "None (top level)" },
        ...categories.map((c) => ({ value: c.id, label: `${c.name} (${c.locale})` })),
      ],
    },
    { name: "sortOrder", label: "Order", kind: "number", hint: "Lower numbers come first in the post editor." },
    { name: "description", label: "Description", kind: "textarea", maxLength: 300, span: "full" },
    { name: "metaTitle", label: "SEO title", kind: "text", maxLength: 70 },
    { name: "metaDescription", label: "SEO description", kind: "textarea", maxLength: 170, span: "full" },
  ];

  const items: TaxonomyItem[] = categories.map((c) => ({
    id: c.id,
    values: {
      name: c.name,
      slug: c.slug,
      locale: c.locale,
      parentId: c.parentId ?? "",
      sortOrder: String(c.sortOrder),
      description: c.description ?? "",
      metaTitle: c.metaTitle ?? "",
      metaDescription: c.metaDescription ?? "",
    },
    cells: [
      <div key="name">
        <p className="text-p3 font-normal text-neutral-1">{c.name}</p>
        {c.description && <p className="mt-2 line-clamp-2 max-w-[420px] text-p4 font-light text-neutral-5">{c.description}</p>}
      </div>,
      <span key="slug" className="whitespace-nowrap font-mono text-[13px] text-neutral-5">/{c.slug}</span>,
      <span key="locale" className="font-semibold uppercase tracking-[1.5px]">{c.locale}</span>,
      c.parent?.name ?? "—",
      <span key="posts" className="tabular-nums">{c._count.posts}</span>,
      <span key="order" className="tabular-nums">{c.sortOrder}</span>,
    ],
    deleteWarning:
      [
        c._count.posts > 0 && `${c._count.posts} ${c._count.posts === 1 ? "post becomes" : "posts become"} uncategorised.`,
        c._count.children > 0 && `${c._count.children} sub-${c._count.children === 1 ? "category moves" : "categories move"} to the top level.`,
      ]
        .filter(Boolean)
        .join(" ") || undefined,
  }));

  return (
    <div>
      <div className="mb-32">
        <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">News</p>
        <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">Categories</h1>
        <p className="mt-8 max-w-[640px] text-p3 font-light text-neutral-5">
          Group news posts by topic. A post&apos;s category shows on its article page and in the post editor.
        </p>
      </div>
      <TaxonomyManager
        noun="category"
        columns={["Name", "Slug", "Lang", "Parent", "Posts", "Order"]}
        fields={fields}
        defaults={{ name: "", slug: "", locale: "EN", parentId: "", sortOrder: "0", description: "", metaTitle: "", metaDescription: "" }}
        items={items}
        emptyText="No categories yet. Add one to start grouping posts."
        onCreate={createCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />
    </div>
  );
}
