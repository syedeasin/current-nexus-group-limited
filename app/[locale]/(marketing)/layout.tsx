import type { ReactNode } from "react";
import Navbar from "@/components/layout/nav/Navbar";
import Footer from "@/components/layout/Footer";
import { buildNavItems } from "@/config/nav.config";
import { getSolutionMenuEntries } from "@/lib/data/solutions-projects";
import { getManufacturingMenuEntries } from "@/lib/data/manufacturing-pages";

/**
 * The menus are the only DB reads every marketing page shares. A database
 * outage (e.g. the local Docker Postgres not running) used to 500 every page
 * from here; now the header/footer degrade to their static links and the
 * page itself decides how to handle its own data.
 */
async function orEmpty<T>(label: string, query: Promise<T[]>): Promise<T[]> {
  try {
    return await query;
  } catch (error) {
    console.error(`[marketing-layout] ${label} menu query failed`, error);
    return [];
  }
}

export default async function MarketingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [solutions, manufacturing] = await Promise.all([
    orEmpty("solutions", getSolutionMenuEntries(locale)),
    orEmpty("manufacturing", getManufacturingMenuEntries(locale)),
  ]);
  const navItems = buildNavItems({ solutions, manufacturing });

  return (
    <>
      <Navbar navItems={navItems} />
      <main className="flex-1">{children}</main>
      <Footer solutions={solutions} manufacturing={manufacturing} />
    </>
  );
}
