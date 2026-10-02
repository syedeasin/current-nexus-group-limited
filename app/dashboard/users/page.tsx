import Link from "next/link";
import type { Prisma, Role } from "@prisma/client";
import { Check, Minus, Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PERMISSION_GROUPS, ROLES, ROLE_META, isRole } from "@/lib/roles";
import UserAvatar from "@/components/dashboard/user-avatar";
import RoleBadge from "@/components/dashboard/role-badge";
import StatCard from "@/components/dashboard/stat-card";
import { formatRelative, userStatus, USER_STATUS_STYLES } from "./user-status";

type SearchParams = { q?: string; role?: string; status?: string; view?: string };

const STATUS_FILTERS = ["active", "inactive", "invited"] as const;

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const me = await requirePageAccess("user.manage");
  const sp = await searchParams;
  const view = sp.view === "roles" ? "roles" : "accounts";

  const [total, active, admins, invited, roleCounts] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "ADMIN", isActive: true } }),
    prisma.user.count({ where: { lastLoginAt: null, passwordChangedAt: null } }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
  ]);
  const countByRole = Object.fromEntries(roleCounts.map((r) => [r.role, r._count._all])) as Partial<Record<Role, number>>;

  return (
    <div>
      <div className="mb-32 flex flex-wrap items-end justify-between gap-16">
        <div>
          <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Team</p>
          <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">Users</h1>
          <p className="mt-8 text-p3 font-light text-neutral-5">
            Who can sign in to this dashboard, and what each role is allowed to do.
          </p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="inline-flex items-center gap-8 rounded-full bg-primary px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus size={15} strokeWidth={2} aria-hidden="true" />
          New user
        </Link>
      </div>

      <div className="mb-32 overflow-hidden rounded-16 border border-neutral-10">
        <div className="grid grid-cols-2 gap-1 bg-neutral-10 xl:grid-cols-4">
          <StatCard label="Accounts" value={total} hint="Everyone with a login" />
          <StatCard label="Active" value={active} hint={`${total - active} deactivated`} />
          <StatCard label="Admins" value={admins} hint="Active, with full access" />
          <StatCard label="Awaiting first sign-in" value={invited} hint="Invited, password not set yet" />
        </div>
      </div>

      <nav aria-label="Users views" className="mb-24 flex gap-4 border-b border-neutral-10">
        {[
          { key: "accounts", label: "Accounts", href: "/dashboard/users" },
          { key: "roles", label: "Roles & permissions", href: "/dashboard/users?view=roles" },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={view === tab.key ? "page" : undefined}
            className={[
              "-mb-px border-b-2 px-16 py-12 text-p4 font-semibold uppercase tracking-[1.5px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
              view === tab.key ? "border-primary text-primary" : "border-transparent text-neutral-5 hover:text-neutral-1",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {view === "roles" ? <RolesMatrix countByRole={countByRole} /> : <AccountsTable sp={sp} meId={me.id} />}
    </div>
  );
}

async function AccountsTable({ sp, meId }: { sp: SearchParams; meId: string }) {
  const query = sp.q?.trim() ?? "";
  const role = isRole(sp.role) ? sp.role : undefined;
  const status = (STATUS_FILTERS as readonly string[]).includes(sp.status ?? "") ? sp.status : undefined;

  const where: Prisma.UserWhereInput = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(role ? { role } : {}),
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
    ...(status === "invited" ? { lastLoginAt: null, passwordChangedAt: null } : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      lastLoginAt: true,
      passwordChangedAt: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
  });
  const isFiltered = Boolean(query || role || status);

  return (
    <div className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
      <form method="get" className="flex flex-wrap items-center gap-12 border-b border-neutral-10 p-16">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search users</span>
          <Search size={16} strokeWidth={1.5} aria-hidden="true" className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 text-neutral-6" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search name, email or username"
            className="w-full rounded-full border border-neutral-10 bg-surface-2 py-10 pl-40 pr-16 text-p4 text-neutral-1 outline-none transition-colors duration-200 placeholder:text-neutral-6 focus:border-primary focus:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <label>
          <span className="sr-only">Role</span>
          <select
            name="role"
            defaultValue={role ?? ""}
            className="rounded-full border border-neutral-10 bg-white px-16 py-10 text-p4 text-neutral-3 outline-none focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_META[r].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-full border border-neutral-10 bg-white px-16 py-10 text-p4 text-neutral-3 outline-none focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
            <option value="invited">Awaiting first sign-in</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full border border-primary px-20 py-10 text-p4 font-semibold uppercase tracking-[1px] text-primary transition-colors duration-200 hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Filter
        </button>
        {isFiltered && (
          <Link href="/dashboard/users" className="text-p4 font-medium text-neutral-5 underline underline-offset-4 hover:text-neutral-1">
            Clear
          </Link>
        )}
      </form>

      {users.length === 0 ? (
        <p className="px-32 py-64 text-center text-p3 font-light text-neutral-5">
          {isFiltered ? "No users match these filters." : "No users yet."}
        </p>
      ) : (
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-10 bg-surface-2">
                {["User", "Role", "Status", "Last sign-in", "Posts", ""].map((heading, i) => (
                  <th
                    key={heading || i}
                    scope="col"
                    className="px-20 py-14 text-left text-p4 font-semibold uppercase tracking-[2px] text-neutral-5"
                  >
                    {heading || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const st = userStatus(user);
                return (
                  <tr key={user.id} className="border-b border-neutral-10 transition-colors duration-200 last:border-b-0 hover:bg-surface-2">
                    <td className="px-20 py-14">
                      <div className="flex items-center gap-14">
                        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className={user.isActive ? "" : "opacity-50"} />
                        <div className="min-w-0">
                          <p className="flex items-center gap-8 text-p3 font-normal text-neutral-1">
                            <Link
                              href={`/dashboard/users/${user.id}`}
                              className="truncate transition-colors duration-200 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                              {user.name}
                            </Link>
                            {user.id === meId && (
                              <span className="rounded-full bg-surface-1 px-8 text-[11px] font-semibold uppercase tracking-[1px] text-primary">You</span>
                            )}
                          </p>
                          <p className="truncate text-p4 font-light text-neutral-5">
                            {user.email}
                            {user.username && <span className="text-neutral-6"> · @{user.username}</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-20 py-14">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-20 py-14">
                      <span className="inline-flex items-center gap-8 text-p4 font-medium text-neutral-3">
                        <span aria-hidden="true" className={`h-8 w-8 rounded-full ${USER_STATUS_STYLES[st].dot}`} />
                        {USER_STATUS_STYLES[st].label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-20 py-14 text-p4 font-light text-neutral-5">
                      {user.lastLoginAt ? formatRelative(user.lastLoginAt) : "Never"}
                    </td>
                    <td className="px-20 py-14 text-p4 font-light tabular-nums text-neutral-5">{user._count.posts}</td>
                    <td className="px-20 py-14 text-right">
                      <Link
                        href={`/dashboard/users/${user.id}`}
                        className="rounded-full border border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RolesMatrix({ countByRole }: { countByRole: Partial<Record<Role, number>> }) {
  return (
    <div className="space-y-24">
      <div className="grid gap-16 sm:grid-cols-2 xl:grid-cols-4">
        {ROLES.map((role) => (
          <div key={role} className="rounded-16 border border-neutral-10 bg-white p-24">
            <div className="flex items-center justify-between gap-12">
              <RoleBadge role={role} />
              <span className="text-p4 font-light text-neutral-5">
                {countByRole[role] ?? 0} {(countByRole[role] ?? 0) === 1 ? "user" : "users"}
              </span>
            </div>
            <p className="mt-16 text-p4 font-light leading-relaxed text-neutral-4">{ROLE_META[role].summary}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <caption className="border-b border-neutral-10 px-24 py-16 text-left text-p4 font-light text-neutral-5">
              What each role can do. Access is enforced on every page and action, not just hidden from the menu.
            </caption>
            <thead>
              <tr className="border-b border-neutral-10 bg-surface-2">
                <th scope="col" className="px-24 py-14 text-left text-p4 font-semibold uppercase tracking-[2px] text-neutral-5">
                  Permission
                </th>
                {ROLES.map((role) => (
                  <th key={role} scope="col" className="w-[120px] px-12 py-14 text-center text-p4 font-semibold uppercase tracking-[2px] text-neutral-5">
                    {ROLE_META[role].label}
                  </th>
                ))}
              </tr>
            </thead>
            {PERMISSION_GROUPS.map((group) => (
              <tbody key={group.label}>
                <tr className="border-b border-neutral-10 bg-surface-2/60">
                  <th colSpan={ROLES.length + 1} scope="colgroup" className="px-24 py-8 text-left text-[12px] font-semibold uppercase tracking-[2px] text-primary">
                    {group.label}
                  </th>
                </tr>
                {group.permissions.map((permission) => (
                  <tr key={permission.key} className="border-b border-neutral-10">
                    <th scope="row" className="px-24 py-12 text-left text-p4 font-normal text-neutral-3">
                      {permission.label}
                    </th>
                    {ROLES.map((role) => (
                      <td key={role} className="px-12 py-12 text-center">
                        {can(role, permission.key) ? (
                          <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success">
                            <Check size={14} strokeWidth={2.25} aria-hidden="true" />
                            <span className="sr-only">Allowed</span>
                          </span>
                        ) : (
                          <span className="inline-flex h-24 w-24 items-center justify-center text-neutral-8">
                            <Minus size={14} strokeWidth={2} aria-hidden="true" />
                            <span className="sr-only">Not allowed</span>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
}
