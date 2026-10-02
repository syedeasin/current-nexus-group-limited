import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import TaxonomyManager, { type TaxonomyField, type TaxonomyItem } from "@/components/dashboard/taxonomy-manager";
import { createTag, deleteTag, updateTag } from "./actions";

export default async function TagsPage() {
  await requirePageAccess("tag.manage");

  const tags = await prisma.tag.findMany({
    orderBy: [{ locale: "asc" }, { name: "asc" }],
    include: { _count: { select: { posts: true } } },
  });

  const fields: TaxonomyField[] = [
    { name: "name", label: "Name", kind: "text", required: true, maxLength: 50 },
    { name: "slug", label: "Slug", kind: "text", maxLength: 60, hint: "Leave empty to build it from the name." },
    {
      name: "locale",
      label: "Language",
      kind: "select",
      options: [
        { value: "EN", label: "English" },
        { value: "FR", label: "French" },
      ],
    },
  ];

  const items: TaxonomyItem[] = tags.map((t) => ({
    id: t.id,
    values: { name: t.name, slug: t.slug, locale: t.locale },
    cells: [
      <span key="name" className="inline-flex items-center rounded-full bg-surface-1 px-12 py-4 text-p4 font-medium text-primary">
        #{t.name}
      </span>,
      <span key="slug" className="whitespace-nowrap font-mono text-[13px] text-neutral-5">{t.slug}</span>,
      <span key="locale" className="font-semibold uppercase tracking-[1.5px]">{t.locale}</span>,
      t._count.posts === 0 ? (
        <span key="posts" className="text-neutral-6">Unused</span>
      ) : (
        <span key="posts" className="tabular-nums">{t._count.posts}</span>
      ),
    ],
    deleteWarning: t._count.posts > 0 ? `Removed from ${t._count.posts} ${t._count.posts === 1 ? "post" : "posts"}.` : undefined,
  }));

  return (
    <div>
      <div className="mb-32">
        <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">News</p>
        <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">Tags</h1>
        <p className="mt-8 max-w-[640px] text-p3 font-light text-neutral-5">
          Tags are also created automatically when you type them into a post. Rename or tidy them up here.
        </p>
      </div>
      <TaxonomyManager
        noun="tag"
        columns={["Tag", "Slug", "Lang", "Posts"]}
        fields={fields}
        defaults={{ name: "", slug: "", locale: "EN" }}
        items={items}
        emptyText="No tags yet. They appear here once you add tags to a post."
        onCreate={createTag}
        onUpdate={updateTag}
        onDelete={deleteTag}
      />
    </div>
  );
}
