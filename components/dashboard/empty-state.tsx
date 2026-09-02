export default function EmptyState({
  title,
  description,
  actionLabel,
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-16 border border-neutral-10 bg-white px-32 py-64 text-center">
      <p className="text-h6 font-extralight tracking-[-0.2px] text-neutral-1">{title}</p>
      <p className="mx-auto mt-12 max-w-sm text-p3 font-light leading-relaxed text-neutral-5">
        {description}
      </p>
      {actionLabel && (
        <button
          type="button"
          aria-disabled="true"
          title="Post creation is not available yet"
          className="mt-32 inline-block cursor-not-allowed rounded-full bg-primary/40 px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
