"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { InquiryStatus } from "@prisma/client";
import { Archive, ArchiveRestore, Mail, MailOpen, Trash2 } from "lucide-react";
import { noticeClass, primaryButtonClass, secondaryButtonClass } from "@/components/dashboard/ui-classes";
import { deleteInquiry, setInquiryStatus } from "./actions";

type Props = {
  id: string;
  status: InquiryStatus;
  /** mailto: link prefilled with a reply subject. */
  replyHref: string;
  /** Where to go after deleting (the list without ?id=). */
  listHref: string;
  /** Mark a NEW message read on display — only when the admin opened it, not when it was shown by default. */
  markReadOnOpen: boolean;
};

/** Reply / read state / archive / delete for the open message. Opening a NEW message marks it read. */
export default function InquiryActionsBar({ id, status, replyHref, listHref, markReadOnOpen }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!markReadOnOpen || status !== "NEW" || markedRef.current === id) return;
    markedRef.current = id;
    setInquiryStatus(id, "READ")
      .then((result) => {
        if (result.ok) router.refresh();
      })
      .catch(() => {});
  }, [id, status, router, markReadOnOpen]);

  async function run(task: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setBusy(true);
    setError(null);
    try {
      const result = await task();
      if (result.ok) {
        after?.();
        router.refresh();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-wrap items-center gap-8">
        <a href={replyHref} className={`${primaryButtonClass} px-20 py-10 text-p4`}>
          <Mail size={15} strokeWidth={1.75} aria-hidden="true" />
          Reply by email
        </a>
        {status !== "ARCHIVED" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => setInquiryStatus(id, status === "NEW" ? "READ" : "NEW"))}
            className={secondaryButtonClass}
          >
            <MailOpen size={15} strokeWidth={1.75} aria-hidden="true" />
            {status === "NEW" ? "Mark as read" : "Mark as unread"}
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => setInquiryStatus(id, status === "ARCHIVED" ? "READ" : "ARCHIVED"))}
          className={secondaryButtonClass}
        >
          {status === "ARCHIVED" ? (
            <ArchiveRestore size={15} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Archive size={15} strokeWidth={1.75} aria-hidden="true" />
          )}
          {status === "ARCHIVED" ? "Move back to inbox" : "Archive"}
        </button>
        {confirmDelete ? (
          <span className="inline-flex items-center gap-8">
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => deleteInquiry(id), () => router.replace(listHref))}
              className="rounded-full bg-error px-16 py-10 text-p4 font-semibold uppercase tracking-[1px] text-white transition-colors duration-200 hover:bg-error/90 disabled:opacity-60"
            >
              {busy ? "Deleting…" : "Delete for good"}
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="text-p4 font-medium text-neutral-5 underline">
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete message"
            className="flex h-40 w-40 items-center justify-center rounded-full border border-neutral-10 text-neutral-5 transition-colors duration-200 hover:border-error hover:text-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          >
            <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className={noticeClass.error}>
          {error}
        </p>
      )}
    </div>
  );
}
