"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteInquiry } from "./actions";

export default function SubscriberDeleteButton({ id, email }: { id: string; email: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      const result = await deleteInquiry(id);
      if (result.ok) router.refresh();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  return confirming ? (
    <span className="inline-flex items-center gap-8">
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="rounded-full bg-error px-14 py-6 text-p4 font-semibold text-white hover:bg-error/90 disabled:opacity-60"
      >
        {busy ? "Removing…" : "Remove"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-p4 text-neutral-5 underline">
        Cancel
      </button>
    </span>
  ) : (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Remove ${email} from the newsletter list`}
      className="flex h-34 w-34 items-center justify-center rounded-full border border-neutral-10 text-neutral-5 transition-colors duration-200 hover:border-error hover:text-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
    >
      <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
