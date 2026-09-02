import Link from "next/link";
import StatusBadge from "@/components/dashboard/status-badge";
import PostPublishToggle from "@/components/dashboard/post-publish-toggle";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  locale: string;
  status: string;
  updatedAt: Date;
  viewCount: number;
  category: { name: string } | null;
  author: { name: string };
};

const HEADINGS = ["Title", "Category", "Author", "Locale", "Status", "Views", "Updated", "Actions"];

export default function PostsTable({
  posts,
  canPublish,
}: {
  posts: PostRow[];
  canPublish: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="border-b border-neutral-10 bg-surface-2">
            {HEADINGS.map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-20 py-16 text-left text-p4 font-semibold uppercase tracking-[2px] text-neutral-5"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr
              key={post.id}
              className="border-b border-neutral-10 transition-colors duration-200 last:border-b-0 hover:bg-surface-1"
            >
              <td className="px-20 py-16">
                <Link
                  href={`/dashboard/posts/${post.id}/edit`}
                  className="text-p3 font-light text-neutral-1 transition-colors duration-200 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {post.title}
                </Link>
                <p className="mt-2 text-p4 text-neutral-5">/{post.slug}</p>
              </td>
              <td className="px-20 py-16 text-p4 font-light text-neutral-5">
                {post.category?.name ?? "—"}
              </td>
              <td className="px-20 py-16 text-p4 font-light text-neutral-5">
                {post.author.name}
              </td>
              <td className="px-20 py-16 text-p4 font-semibold uppercase tracking-[1.5px] text-neutral-5">
                {post.locale}
              </td>
              <td className="px-20 py-16">
                <StatusBadge status={post.status} />
              </td>
              <td className="px-20 py-16 text-p4 font-light text-neutral-5">{post.viewCount}</td>
              <td className="whitespace-nowrap px-20 py-16 text-p4 font-light text-neutral-5">
                {post.updatedAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-20 py-16">
                <div className="flex items-center gap-8">
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="rounded-full border border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Edit
                  </Link>
                  {canPublish && <PostPublishToggle id={post.id} status={post.status} />}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
