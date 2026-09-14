"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDownload } from "@/app/dashboard/downloads/actions";

export default function DownloadDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteDownload(id);
      if (result.ok) {
        setConfirming(false);
        router.refresh();
      } else {
        setError(result.error);
        setConfirming(false);
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-8">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={
          confirming ? `Confirm deleting ${title}` : `Delete ${title}`
        }
        className={[
          "rounded-full border px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-60",
          confirming
            ? "border-error bg-error text-white hover:bg-error/90"
            : "border-neutral-10 text-neutral-4 hover:border-error hover:text-error",
        ].join(" ")}
      >
        {isPending ? "Deleting…" : confirming ? "Confirm" : "Delete"}
      </button>
      {confirming && !isPending && (
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-p4 font-medium text-neutral-5 underline transition-colors duration-200 hover:text-neutral-1"
        >
          Cancel
        </button>
      )}
      {error && (
        <span role="alert" className="text-p4 text-error">
          {error}
        </span>
      )}
    </span>
  );
}
