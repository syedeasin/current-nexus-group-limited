import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import PostForm from "@/components/dashboard/post-form";

export default async function NewPostPage() {
  const user = await requirePermission("post.create");
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  const canPublish = can(user.role, "post.publish");

  return (
    <div>
      <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Content</p>
      <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
        New post
      </h1>

      <div className="mt-32">
        <PostForm mode="create" categories={categories} canPublish={canPublish} />
      </div>
    </div>
  );
}
