import Link from "next/link";
import { CircleCheck, CircleAlert, Globe, KeyRound, Mail, Server, UserRound, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { emailStatus } from "@/lib/email";
import { getSiteSettings } from "@/lib/site-settings";
import { siteConfig } from "@/site.config";
import { cardClass, cardTitleClass } from "@/components/dashboard/ui-classes";
import ProfileForm from "./profile-form";
import PasswordForm from "./password-form";
import SiteSettingsForm from "./site-settings-form";
import ActionButton from "./action-button";
import { refreshSiteCache, sendTestEmail, signOutOtherDevices } from "./actions";
import { formatBytes, getSystemInfo } from "./system-info";
import { formatDateTime, formatRelative } from "../users/user-status";

type TabKey = "profile" | "security" | "website" | "email" | "system";

const TABS: { key: TabKey; label: string; icon: LucideIcon; admin: boolean; group: string }[] = [
  { key: "profile", label: "Profile", icon: UserRound, admin: false, group: "Your account" },
  { key: "security", label: "Password & security", icon: KeyRound, admin: false, group: "Your account" },
  { key: "website", label: "Website", icon: Globe, admin: true, group: "Site" },
  { key: "email", label: "Email delivery", icon: Mail, admin: true, group: "Site" },
  { key: "system", label: "System", icon: Server, admin: true, group: "Site" },
];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const me = await requireUser();
  const isAdmin = can(me.role, "settings.manage");
  const tabs = TABS.filter((tab) => isAdmin || !tab.admin);
  const { tab: requested } = await searchParams;
  const tab = tabs.find((t) => t.key === requested)?.key ?? "profile";
  const groups = [...new Set(tabs.map((t) => t.group))];

  return (
    <div>
      <div className="mb-32">
        <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Settings</p>
        <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
          {TABS.find((t) => t.key === tab)?.label}
        </h1>
      </div>

      <div className="grid items-start gap-24 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="rounded-16 border border-neutral-10 bg-white p-12 lg:sticky lg:top-0">
          {groups.map((group) => (
            <div key={group} className="mb-8 last:mb-0">
              <p className="px-12 pb-6 pt-8 text-[12px] font-semibold uppercase tracking-[2px] text-neutral-6">{group}</p>
              <ul>
                {tabs
                  .filter((t) => t.group === group)
                  .map((t) => (
                    <li key={t.key}>
                      <Link
                        href={`/dashboard/settings?tab=${t.key}`}
                        aria-current={tab === t.key ? "page" : undefined}
                        className={[
                          "flex items-center gap-10 rounded-8 px-12 py-10 text-p4 font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                          tab === t.key ? "bg-surface-1 text-primary" : "text-neutral-4 hover:bg-surface-2 hover:text-neutral-1",
                        ].join(" ")}
                      >
                        <t.icon size={16} strokeWidth={1.5} aria-hidden="true" />
                        {t.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="min-w-0 space-y-24">
          {tab === "profile" && <ProfileTab userId={me.id} />}
          {tab === "security" && <SecurityTab userId={me.id} />}
          {tab === "website" && <WebsiteTab />}
          {tab === "email" && <EmailTab />}
          {tab === "system" && <SystemTab />}
        </div>
      </div>
    </div>
  );
}

async function ProfileTab({ userId }: { userId: string }) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true, username: true, bio: true, avatarUrl: true, role: true },
  });
  return <ProfileForm user={user} />;
}

async function SecurityTab({ userId }: { userId: string }) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { lastLoginAt: true, passwordChangedAt: true, createdAt: true },
  });
  return (
    <>
      <PasswordForm />
      <section className={cardClass} aria-labelledby="sessions-title">
        <h2 id="sessions-title" className={cardTitleClass}>
          Sessions
        </h2>
        <dl className="mt-20 grid gap-16 sm:grid-cols-2">
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[2px] text-neutral-6">Last sign-in</dt>
            <dd className="mt-2 text-p4 text-neutral-3">
              {user.lastLoginAt ? `${formatRelative(user.lastLoginAt)} · ${formatDateTime(user.lastLoginAt)}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[2px] text-neutral-6">Password last changed</dt>
            <dd className="mt-2 text-p4 text-neutral-3">
              {user.passwordChangedAt ? formatDateTime(user.passwordChangedAt) : `Not since the account was created (${formatDateTime(user.createdAt)})`}
            </dd>
          </div>
        </dl>
        <p className="mb-16 mt-24 border-t border-neutral-10 pt-20 text-p4 font-light text-neutral-5">
          Left the dashboard open on a shared or lost computer? Sign out everywhere except this browser.
        </p>
        <ActionButton action={signOutOtherDevices} pendingLabel="Signing out…">
          Sign out of other devices
        </ActionButton>
      </section>
    </>
  );
}

async function WebsiteTab() {
  const settings = await getSiteSettings();
  const shortcuts = [
    { label: "Contact details & social links", href: "/dashboard/pages/footer?locale=en", hint: "Pages → Footer" },
    { label: "Header menu labels", href: "/dashboard/pages/nav?locale=en", hint: "Pages → Header" },
    { label: "Homepage SEO title & description", href: "/dashboard/pages/home?locale=en", hint: "Pages → Home" },
  ];
  return (
    <>
      <SiteSettingsForm settings={settings} fallbackUrl={process.env.APP_URL?.trim() || siteConfig.url} />
      <section className={cardClass} aria-labelledby="elsewhere-title">
        <h2 id="elsewhere-title" className={cardTitleClass}>
          Edited elsewhere
        </h2>
        <p className="mt-6 text-p4 font-light text-neutral-5">Site-wide content lives with the page it appears on.</p>
        <ul className="mt-16 divide-y divide-neutral-10">
          {shortcuts.map((s) => (
            <li key={s.href} className="flex flex-wrap items-center justify-between gap-12 py-12">
              <span className="text-p4 text-neutral-3">{s.label}</span>
              <Link href={s.href} className="text-p4 font-medium text-primary underline-offset-4 hover:underline">
                {s.hint} →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function EmailTab() {
  const status = emailStatus();
  return (
    <section className={cardClass} aria-labelledby="email-title">
      <div className="flex flex-wrap items-center justify-between gap-12">
        <h2 id="email-title" className={cardTitleClass}>
          Email delivery
        </h2>
        <StatusPill ok={status.configured} okLabel="Connected" offLabel="Not set up" />
      </div>
      <p className="mt-6 max-w-[640px] text-p4 font-light text-neutral-5">
        Used for forgot-password and new-user invitation emails. Without it, admins copy those links from Users and send them
        themselves.
      </p>

      {status.configured ? (
        <>
          <dl className="mt-20 grid gap-16 sm:grid-cols-2">
            {[
              ["SMTP server", `${status.host}:${status.port}`],
              ["Encryption", status.secure ? "TLS (implicit)" : "STARTTLS when offered"],
              ["Sends as", status.from],
              ["Login", status.authenticated ? "Username & password" : "None"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[12px] font-semibold uppercase tracking-[2px] text-neutral-6">{label}</dt>
                <dd className="mt-2 break-all text-p4 text-neutral-3">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-24 border-t border-neutral-10 pt-20">
            <ActionButton action={sendTestEmail} pendingLabel="Sending…">
              Send me a test email
            </ActionButton>
          </div>
        </>
      ) : (
        <div className="mt-20 rounded-12 bg-surface-2 p-20">
          <p className="text-p4 text-neutral-3">
            To switch it on, add your mail provider&apos;s SMTP details to the server&apos;s <code className="font-mono">.env</code>{" "}
            file, then restart the app. The password stays on the server — it is never stored in the dashboard.
          </p>
          <pre className="mt-12 overflow-x-auto rounded-8 bg-neutral-1 p-16 font-mono text-[13px] leading-[22px] text-white/85">
{`SMTP_HOST="smtp.your-provider.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="CNX Energy <no-reply@your-domain.com>"`}
          </pre>
        </div>
      )}
    </section>
  );
}

async function SystemTab() {
  const info = await getSystemInfo();
  const rows: [string, string][] = [
    ["Running version", info.commit ? `${info.commit}` : "Unknown"],
    ["Environment", info.environment],
    ["Next.js", info.nextVersion ?? "—"],
    ["Node.js", info.nodeVersion],
    ["File storage", info.storageDriver === "local" ? "Server disk (public/uploads)" : info.storageDriver],
    ["Database", info.database.ok ? `Connected · ${info.database.latencyMs} ms` : "Not reachable"],
  ];
  const usage: [string, string][] = info.counts
    ? [
        ["Users", String(info.counts.users)],
        ["Posts", String(info.counts.posts)],
        ["Edited pages", String(info.counts.editedPages)],
        ["Media library", `${info.counts.mediaFiles} files · ${formatBytes(info.counts.mediaBytes)}`],
        ["Downloads", `${info.counts.downloads} files · ${formatBytes(info.counts.downloadBytes)}`],
      ]
    : [];

  return (
    <>
      <section className={cardClass} aria-labelledby="system-title">
        <div className="flex flex-wrap items-center justify-between gap-12">
          <h2 id="system-title" className={cardTitleClass}>
            Server
          </h2>
          <StatusPill ok={info.database.ok} okLabel="Healthy" offLabel="Database offline" />
        </div>
        <dl className="mt-20 grid gap-x-24 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[12px] font-semibold uppercase tracking-[2px] text-neutral-6">{label}</dt>
              <dd className="mt-2 text-p4 text-neutral-3">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {usage.length > 0 && (
        <section className={cardClass} aria-labelledby="usage-title">
          <h2 id="usage-title" className={cardTitleClass}>
            Content & storage
          </h2>
          <dl className="mt-20 grid gap-x-24 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
            {usage.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[12px] font-semibold uppercase tracking-[2px] text-neutral-6">{label}</dt>
                <dd className="mt-2 text-p4 text-neutral-3">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className={cardClass} aria-labelledby="cache-title">
        <h2 id="cache-title" className={cardTitleClass}>
          Website cache
        </h2>
        <p className="mb-16 mt-6 max-w-[640px] text-p4 font-light text-neutral-5">
          Saving content already refreshes the pages it appears on. If a public page still shows something old, rebuild
          every page from the latest content.
        </p>
        <ActionButton action={refreshSiteCache} pendingLabel="Refreshing…">
          Refresh all pages
        </ActionButton>
      </section>
    </>
  );
}

function StatusPill({ ok, okLabel, offLabel }: { ok: boolean; okLabel: string; offLabel: string }) {
  const Icon = ok ? CircleCheck : CircleAlert;
  return (
    <span
      className={`inline-flex items-center gap-6 rounded-full px-12 py-4 text-p4 font-medium ${
        ok ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
      }`}
    >
      <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
      {ok ? okLabel : offLabel}
    </span>
  );
}
