import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { NAV_ITEMS } from "@/lib/dashboard-nav";
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

  const items = NAV_ITEMS.filter(
    (item) => !item.permission || can(user.role, item.permission)
  );

  return (
    <html lang="en" className={`${switzer.variable} h-full antialiased`}>
      <body className="h-full">
        <div className="flex h-screen overflow-hidden bg-surface-2">
          <Sidebar items={items} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar name={user.name} email={user.email} role={user.role} />
            <main className="flex-1 overflow-y-auto p-32">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
