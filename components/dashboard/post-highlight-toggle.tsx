"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { setPostHighlight } from "@/app/dashboard/posts/actions";

/**
 * One-click "Show in Highlights" switch on the posts table — the same flag as
 * the checkbox in the post editor's "News Room placement" card.
 */
export default function PostHighlightToggle({
  id,
  title,
  isHighlight,
  canToggle,
}: {
  id: string;
  title: string;
  isHighlight: boolean;
  canToggle: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const icon = (
    <Star
      size={18}
      strokeWidth={1.5}
      aria-hidden="true"
      className={isHighlight ? "fill-secondary text-secondary" : "text-neutral-7"}
    />
  );

  if (!canToggle) {
    return (
      <span title={isHighlight ? "In Highlights" : "Not in Highlights"}>
        {icon}
        <span className="sr-only">{isHighlight ? "In Highlights" : "Not in Highlights"}</span>
      </span>
    );
  }

  function handleClick() {
    startTransition(async () => {
      const result = await setPostHighlight(id, !isHighlight);
      if (result.ok) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isHighlight}
      aria-label={`Show in Highlights: ${title}`}
      title={isHighlight ? "In Highlights — click to remove" : "Click to show in Highlights"}
      className="flex h-32 w-32 items-center justify-center rounded-full transition-colors duration-200 hover:bg-surface-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
    >
      {icon}
    </button>
  );
}
