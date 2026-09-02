import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can, canEditPost } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { postPublicUrl } from "@/lib/routes";
import PostForm from "@/components/dashboard/post-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      locale: true,
      excerpt: true,
      content: true,
      status: true,
      categoryId: true,
      featuredImage: true,
      featuredImageAlt: true,
      metaTitle: true,
      metaDescription: true,
      focusKeyword: true,
      canonicalUrl: true,
      ogImage: true,
      noIndex: true,
      authorId: true,
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  if (!post) notFound();
  if (!canEditPost(user, post)) notFound();

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  const canPublish = can(user.role, "post.publish");
  const publicUrl = post.status === "PUBLISHED" ? postPublicUrl(post.locale, post.slug) : null;

  const formValues = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    locale: post.locale,
    excerpt: post.excerpt ?? "",
    content: post.content,
    status: post.status,
    categoryId: post.categoryId ?? "",
    tags: post.tags.map((t) => t.tag.name).join(", "),
    featuredImage: post.featuredImage ?? "",
    featuredImageAlt: post.featuredImageAlt ?? "",
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    focusKeyword: post.focusKeyword ?? "",
    canonicalUrl: post.canonicalUrl ?? "",
    ogImage: post.ogImage ?? "",
    noIndex: post.noIndex,
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-16">
        <div>
          <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Content</p>
          <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
            {post.title}
          </h1>
        </div>

        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-8 rounded-full border border-neutral-10 px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View on site
            <ExternalLink size={15} strokeWidth={1.5} aria-hidden="true" />
          </a>
        )}
      </div>

      <div className="mt-32">
        <PostForm mode="edit" post={formValues} categories={categories} canPublish={canPublish} />
      </div>
    </div>
  );
}
