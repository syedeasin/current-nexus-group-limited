import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDashboardOverview } from "@/lib/data/dashboard-overview";
import StatCard from "@/components/dashboard/stat-card";
import StatusBadge from "@/components/dashboard/status-badge";

const ACTIVITY_HREF: Record<string, (id: string) => string> = {
  Post: (id) => `/dashboard/posts/${id}/edit`,
  Manufacturing: (id) => `/dashboard/manufacturing/${id}/edit`,
  "Solutions & Projects": (id) => `/dashboard/solutions-projects/${id}/edit`,
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function DashboardOverview() {
  const user = await requireUser();
  const data = await getDashboardOverview();

  return (
    <div>
      <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Overview</p>
      <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
        Welcome back, {user.name.split(" ")[0]}
      </h1>

      {/* Quick statistics */}
      <div className="mt-40 overflow-hidden rounded-16 border border-neutral-10">
        <div className="grid grid-cols-1 gap-1 bg-neutral-10 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Published Posts" value={data.posts.published} hint="Live on the public site" />
          <StatCard label="Draft Posts" value={data.posts.draft} hint="Not yet visible" />
          <StatCard label="Manufacturing Pages" value={data.manufacturing.total} hint={`${data.manufacturing.published} published`} />
          <StatCard label="Solutions & Projects" value={data.solutions.total} hint={`${data.solutions.published} published`} />
        </div>
      </div>

      {/* Website analytics — honest empty state, no analytics source wired up yet */}
      <div className="mt-48">
        <h2 className="mb-20 text-h6 font-extralight tracking-[-0.2px] text-neutral-1">Website analytics</h2>
        <div className="flex flex-col items-center gap-12 rounded-16 border border-dashed border-neutral-10 bg-white px-32 py-48 text-center">
          <BarChart3 size={28} strokeWidth={1.25} className="text-neutral-6" aria-hidden="true" />
          <p className="text-p3 font-light text-neutral-5">No visitor analytics connected yet.</p>
          <p className="max-w-[440px] text-p4 font-light text-neutral-6">
            Connect an analytics provider (e.g. GA4, Plausible, Vercel Analytics) to see visitors, sessions and traffic sources here.
          </p>
        </div>
      </div>

      {/* Content overview + team */}
      <div className="mt-48 grid grid-cols-1 gap-24 lg:grid-cols-2">
        <div>
          <h2 className="mb-20 text-h6 font-extralight tracking-[-0.2px] text-neutral-1">Content overview</h2>
          <ul className="divide-y divide-neutral-10 rounded-16 border border-neutral-10 bg-white">
            {[
              ["Posts", data.contentOverview.posts],
              ["Manufacturing", data.contentOverview.manufacturing],
              ["Solutions & Projects", data.contentOverview.solutions],
              ["Downloads", data.contentOverview.downloads],
              ["Media", data.contentOverview.media],
            ].map(([label, value]) => (
              <li key={label as string} className="flex items-center justify-between px-24 py-14">
                <span className="text-p4 font-light text-neutral-5">{label}</span>
                <span className="text-p3 font-medium text-neutral-1">{value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-20 text-h6 font-extralight tracking-[-0.2px] text-neutral-1">Users & downloads</h2>
          <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-16 border border-neutral-10 bg-neutral-10">
            <StatCard label="Active Users" value={data.users.total} hint="Dashboard accounts" />
            <StatCard label="Protected Templates" value={data.manufacturing.protected} hint="Cannot be deleted" />
            <StatCard label="Downloads" value={data.downloads.total} hint={`${data.downloads.published} published`} />
            <StatCard label="Draft Downloads" value={data.downloads.draft} hint="Not yet visible" />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-48">
        <h2 className="mb-20 text-h6 font-extralight tracking-[-0.2px] text-neutral-1">Recent activity</h2>

        {data.recentActivity.length === 0 ? (
          <div className="rounded-16 border border-neutral-10 bg-white px-32 py-56 text-center">
            <p className="text-p3 font-light text-neutral-5">
              No content yet. Once you publish something it will appear here.
            </p>
          </div>
        ) : (
          <ul className="rounded-16 border border-neutral-10 bg-white">
            {data.recentActivity.map((item) => (
              <li
                key={`${item.kind}-${item.id}`}
                className="border-b border-neutral-10 last:border-b-0"
              >
                <Link
                  href={ACTIVITY_HREF[item.kind]?.(item.id) ?? "#"}
                  className="flex items-center justify-between gap-16 px-24 py-16 transition-colors duration-200 hover:bg-surface-1"
                >
                  <div className="min-w-0">
                    <p className="truncate text-p3 font-light text-neutral-1">{item.title}</p>
                    <p className="mt-4 text-p4 text-neutral-5">
                      {item.kind}
                      {item.category ? ` · ${item.category}` : ""} · {formatDate(item.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
