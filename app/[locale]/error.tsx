"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-16 py-172">
      <h1 className="text-h3 text-neutral-1">Something went wrong</h1>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-secondary px-24 py-12 text-btn-sm font-semibold text-neutral-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        Try again
      </button>
    </div>
  );
}
