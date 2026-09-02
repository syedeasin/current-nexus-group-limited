const STYLES: Record<string, string> = {
  PUBLISHED: "bg-success/10 text-success",
  PENDING_REVIEW: "bg-warning/10 text-warning",
  DRAFT: "bg-surface-1 text-neutral-5",
  ARCHIVED: "bg-neutral-11 text-neutral-4",
};

const LABELS: Record<string, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  PENDING_REVIEW: "In review",
  ARCHIVED: "Archived",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-12 py-4 text-badge font-medium uppercase tracking-[1.5px] ${
        STYLES[status] ?? STYLES.DRAFT
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
