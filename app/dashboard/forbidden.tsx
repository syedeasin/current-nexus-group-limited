import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function DashboardForbidden() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-16 border border-neutral-10 bg-white px-32 py-64 text-center">
      <span className="flex h-56 w-56 items-center justify-center rounded-full bg-surface-1 text-primary">
        <ShieldAlert size={24} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <p className="mt-20 text-p4 font-semibold uppercase tracking-[2px] text-primary">403 · No access</p>
      <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
        This area isn&apos;t part of your role
      </h1>
      <p className="mx-auto mt-12 max-w-md text-p3 font-light leading-relaxed text-neutral-5">
        Your account can&apos;t open this section of the dashboard. If you need it, ask an administrator to change
        your role in Users.
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
