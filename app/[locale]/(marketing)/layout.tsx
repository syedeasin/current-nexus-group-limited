import type { ReactNode } from "react";
import Navbar from "@/components/layout/nav/Navbar";
import { getTranslations } from "next-intl/server";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/layout/CookieConsent";
import { brandEntryHref, buildNavItems, manufacturingEntryHref, solutionEntryHref } from "@/config/nav.config";
import { LinkAvailabilityProvider } from "@/i18n/SafeLink";
import { getSolutionMenuEntries } from "@/lib/data/solutions-projects";
import { getManufacturingMenuEntries } from "@/lib/data/manufacturing-pages";
import { getPublishedBrands } from "@/lib/data/brands";
import { getHiddenPaths } from "@/lib/page-visibility";

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
  const [solutions, manufacturing, publishedBrands, hidden] = await Promise.all([
    orEmpty("solutions", getSolutionMenuEntries(locale)),
    orEmpty("manufacturing", getManufacturingMenuEntries(locale)),
    orEmpty("brands", getPublishedBrands(locale)),
    getHiddenPaths(),
  ]);
  const brands = publishedBrands
    .filter((brand) => brand.showInMegaMenu)
    .map(({ name, slug, logo }) => ({ name, slug, logo }));
  const navItems = buildNavItems({ solutions, manufacturing, brands, hidden });
  const consent = await getTranslations("cookieConsent");

  const publishedDetailPaths = [
    ...manufacturing.map((entry) => manufacturingEntryHref(entry.category, entry.slug)),
    ...solutions.map((entry) => solutionEntryHref(entry.menuGroup, entry.slug)),
    ...publishedBrands.map((brand) => brandEntryHref(brand.slug)),
  ];

  return (
    <LinkAvailabilityProvider hidden={[...hidden]} publishedDetailPaths={publishedDetailPaths}>
      <Navbar navItems={navItems} />
      <main className="flex-1">{children}</main>
      <Footer solutions={solutions} manufacturing={manufacturing} brands={brands} hidden={hidden} />
      <CookieConsent
        labels={{
          title: consent("title"),
          message: consent("message"),
          policyLabel: consent("policyLabel"),
          accept: consent("accept"),
          reject: consent("reject"),
          dialogLabel: consent("dialogLabel"),
        }}
      />
    </LinkAvailabilityProvider>
  );
}
