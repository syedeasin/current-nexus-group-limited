"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishPost, unpublishPost } from "@/app/dashboard/posts/actions";

export default function PostPublishToggle({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isPublished = status === "PUBLISHED";

  function handleClick() {
    startTransition(async () => {
      const result = isPublished ? await unpublishPost(id) : await publishPost(id);
      if (result.ok) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-full border border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "…" : isPublished ? "Unpublish" : "Publish"}
    </button>
  );
}
