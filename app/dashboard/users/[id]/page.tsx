import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { isEmailConfigured } from "@/lib/email";
import UserAvatar from "@/components/dashboard/user-avatar";
import RoleBadge from "@/components/dashboard/role-badge";
import { cardClass, noticeClass } from "@/components/dashboard/ui-classes";
import UserForm from "../user-form";
import UserAccessPanel from "../user-access-panel";
import UserDeletePanel from "../user-delete-panel";
import { USER_STATUS_STYLES, formatDateTime, formatRelative, userStatus } from "../user-status";

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const me = await requirePageAccess("user.manage");
  const { id } = await params;
  const { created } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      avatarUrl: true,
      bio: true,
      isActive: true,
      lastLoginAt: true,
      passwordChangedAt: true,
      createdAt: true,
      _count: { select: { posts: true, media: true } },
    },
  });
  if (!user) notFound();

  const isSelf = user.id === me.id;
  const st = userStatus(user);
  const heirs = isSelf
    ? []
    : await prisma.user.findMany({
        where: { id: { not: user.id } },
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
        select: { id: true, name: true },
      });

  const facts: [string, string][] = [
    ["Last sign-in", user.lastLoginAt ? `${formatRelative(user.lastLoginAt)} · ${formatDateTime(user.lastLoginAt)}` : "Never"],
    ["Password set", user.passwordChangedAt ? formatDateTime(user.passwordChangedAt) : "Not yet"],
    ["Member since", formatDateTime(user.createdAt)],
    ["Content", `${user._count.posts} ${user._count.posts === 1 ? "post" : "posts"} · ${user._count.media} ${user._count.media === 1 ? "image" : "images"}`],
  ];

  return (
    <div>
      <Link
        href="/dashboard/users"
        className="mb-20 inline-flex items-center gap-8 text-p4 font-medium text-neutral-5 transition-colors duration-200 hover:text-primary"
      >
        <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" />
        All users
      </Link>

      <div className="mb-32 flex flex-wrap items-center gap-20">
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="xl" className="ring-4 ring-white shadow-sm" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-12">
            <h1 className="text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">{user.name}</h1>
            <RoleBadge role={user.role} />
            <span className="inline-flex items-center gap-6 text-p4 font-medium text-neutral-4">
              <span aria-hidden="true" className={`h-8 w-8 rounded-full ${USER_STATUS_STYLES[st].dot}`} />
              {USER_STATUS_STYLES[st].label}
            </span>
          </div>
          <p className="mt-8 text-p3 font-light text-neutral-5">
            {user.email}
            {user.username && <span> · @{user.username}</span>}
          </p>
        </div>
      </div>

      {created && (
        <div role="status" className={`mb-24 ${noticeClass.success}`}>
          Account created. Share the password with {user.name.split(" ")[0]} securely — they can change it in Settings → Security.
        </div>
      )}

      <div className="grid items-start gap-24 xl:grid-cols-[minmax(0,1fr)_400px]">
        <UserForm
          mode="edit"
          isSelf={isSelf}
          emailEnabled={isEmailConfigured()}
          user={{ id: user.id, name: user.name, email: user.email, username: user.username, role: user.role, isActive: user.isActive }}
        />

        <div className="space-y-24">
          <section className={cardClass} aria-label="Account details">
            <dl className="space-y-14">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[12px] font-semibold uppercase tracking-[2px] text-neutral-6">{label}</dt>
                  <dd className="mt-2 text-p4 text-neutral-3">{value}</dd>
                </div>
              ))}
            </dl>
            {user.bio && <p className="mt-16 border-t border-neutral-10 pt-16 text-p4 font-light italic text-neutral-5">“{user.bio}”</p>}
          </section>

          {isSelf ? (
            <section className={cardClass}>
              <p className="text-p4 font-light leading-relaxed text-neutral-5">
                This is your account. Change your photo, password and sessions in{" "}
                <Link href="/dashboard/settings?tab=profile" className="font-medium text-primary underline-offset-4 hover:underline">
                  Settings
                </Link>
                .
              </p>
            </section>
          ) : (
            <>
              <UserAccessPanel user={{ id: user.id, name: user.name, isActive: user.isActive }} emailEnabled={isEmailConfigured()} />
              <UserDeletePanel
                user={{ id: user.id, name: user.name, postCount: user._count.posts }}
                heirs={heirs}
                defaultHeirId={heirs.find((h) => h.id === me.id)?.id ?? heirs[0]?.id ?? ""}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
