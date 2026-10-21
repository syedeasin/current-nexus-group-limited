import { permanentRedirect } from "@/i18n/navigation";
import { assertPageVisible } from "@/lib/page-visibility";

/**
 * The client's "PV & BESS Brands" page and the Tier 1 brands collection page
 * are the same page (mind map + brief, Oct 2026), which lives at
 * /tier-1-brands. This About Us entry stays hidden by default; switched on in
 * Settings → Page visibility, it forwards there instead of duplicating it.
 */
export default async function PvBessBrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  await assertPageVisible("/about/pv-bess-brands");
  const { locale } = await params;
  permanentRedirect({ href: "/tier-1-brands", locale });
}
