import type { ReactNode } from "react";
import Navbar from "@/components/layout/nav/Navbar";
import Footer from "@/components/layout/Footer";
import { buildNavItems } from "@/config/nav.config";
import { getSolutionMenuEntries } from "@/lib/data/solutions-projects";
import { getManufacturingMenuEntries } from "@/lib/data/manufacturing-pages";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [solutions, manufacturing] = await Promise.all([
    getSolutionMenuEntries(locale),
    getManufacturingMenuEntries(locale),
  ]);
  const navItems = buildNavItems({ solutions, manufacturing });

  return (
    <>
      <Navbar navItems={navItems} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
