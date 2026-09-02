"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { deleteMedia, updateMediaAlt } from "@/app/dashboard/media/actions";

type MediaTileProps = {
  media: {
    id: string;
    url: string;
    fileName: string;
    size: number;
    width: number | null;
    height: number | null;
    alt: string | null;
    createdAt: Date;
    uploadedBy: { name: string } | null;
  };
  canDelete: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Display only — original filenames can be long meaningless strings.
// Stored UUID name on disk is untouched.
function truncateFileName(name: string): string {
  return name.length > 24 ? `${name.slice(0, 24)}…` : name;
}

export default function MediaTile({ media, canDelete }: MediaTileProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingAlt, setEditingAlt] = useState(false);
  const [altValue, setAltValue] = useState(media.alt ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function saveAlt() {
    startTransition(async () => {
      const result = await updateMediaAlt(media.id, altValue);
      if (result.ok) {
        setEditingAlt(false);
        setError(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteMedia(media.id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
        setConfirmDelete(false);
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.url}
        alt=""
        width={media.width ?? undefined}
        height={media.height ?? undefined}
        loading="lazy"
        className="h-160 w-full bg-surface-2 object-cover"
      />

      <div className="p-16">
        <p className="truncate text-p4 font-medium text-neutral-1" title={media.fileName}>
          {truncateFileName(media.fileName)}
        </p>
        <p className="mt-2 text-p4 text-neutral-5">
          {media.width && media.height ? `${media.width}×${media.height}px · ` : ""}
          {formatBytes(media.size)}
        </p>
        <p className="mt-2 text-p4 text-neutral-5">
          {media.createdAt.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          {media.uploadedBy && ` · ${media.uploadedBy.name}`}
        </p>

        <div className="mt-12 border-t border-neutral-10 pt-12">
          {editingAlt ? (
            <div>
              <label htmlFor={`alt-${media.id}`} className="sr-only">
                Alt text
              </label>
              <input
                id={`alt-${media.id}`}
                value={altValue}
                onChange={(e) => setAltValue(e.target.value)}
                className="w-full rounded-8 border border-neutral-10 bg-white px-12 py-8 text-p4 text-neutral-1 outline-none transition-colors duration-200 focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
              <div className="mt-8 flex gap-8">
                <button
                  type="button"
                  onClick={saveAlt}
                  disabled={isPending}
                  className="rounded-full bg-primary px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAlt(false);
                    setAltValue(media.alt ?? "");
                  }}
                  className="rounded-full border border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingAlt(true)}
              className="flex w-full items-start gap-8 rounded-8 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {!media.alt && (
                <AlertTriangle
                  size={14}
                  strokeWidth={1.5}
                  className="mt-2 shrink-0 text-warning"
                  aria-hidden="true"
                />
              )}
              <span className={`text-p4 ${media.alt ? "text-neutral-5" : "text-warning"}`}>
                {media.alt || "Missing alt text — click to add"}
              </span>
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-8 text-p4 text-error">
            {error}
          </p>
        )}

        {canDelete && (
          <div className="mt-12 border-t border-neutral-10 pt-12">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="w-full rounded-full border border-error px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-error transition-colors duration-200 hover:bg-error/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
              >
                Delete
              </button>
            ) : (
              <div className="flex gap-8">
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isPending}
                  className="flex-1 rounded-full bg-error px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-white transition-colors duration-200 hover:bg-error/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-full border border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
