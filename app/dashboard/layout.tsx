import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { NAV_ENTRIES, filterNavEntries } from "@/lib/dashboard-nav";
import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/topbar";
import { switzer } from "@/app/fonts";
import "@/app/globals.css";

export const metadata = {
  title: "Dashboard | CNX Energy",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  const newInquiries = can(user.role, "inquiry.manage")
    ? await prisma.inquiry.count({ where: { kind: "CONTACT", status: "NEW" } }).catch(() => 0)
    : 0;
  const items = filterNavEntries(NAV_ENTRIES, (permission) => can(user.role, permission)).map((entry) =>
    "href" in entry && entry.href === "/dashboard/inquiries" ? { ...entry, badge: newInquiries } : entry
  );

  return (
    <html lang="en" className={`${switzer.variable} h-full antialiased`}>
      <body className="h-full">
        <div className="flex h-screen overflow-hidden bg-surface-2">
          <Sidebar items={items} />
          {/* min-h-0 overrides the flex-item default of min-height:auto — without it
              <main>'s content can grow this column (and the row containing the
              sidebar) taller than h-screen, and the browser body becomes the
              scroll container instead of <main>, dragging the sidebar along with
              it and leaving a large blank gap below short pages. */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Topbar
              name={user.name}
              email={user.email}
              role={user.role}
              avatarUrl={user.avatarUrl}
              canManageUsers={can(user.role, "user.manage")}
              canManageSettings={can(user.role, "settings.manage")}
            />
            {/* `relative` makes <main> the containing block for absolutely
                positioned descendants (the `sr-only` file inputs in ImageUpload
                and the editor). Without it they resolved against the viewport
                at their in-flow offset — far below the fold on long edit
                pages — and stretched the document, so the whole dashboard
                scrolled up and left a tall blank area under it. */}
            <main className="relative min-h-0 flex-1 overflow-y-auto p-32">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
