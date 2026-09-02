import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-16 border border-neutral-10 bg-white px-32 py-64 text-center">
      <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">404</p>
      <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
        Page not found
      </h1>
      <p className="mx-auto mt-12 max-w-sm text-p3 font-light leading-relaxed text-neutral-5">
        This section of the dashboard does not exist yet.
      </p>
      <Link
        href="/dashboard"
        className="mt-32 inline-block rounded-full bg-primary px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Back to overview
      </Link>
    </div>
  );
}
