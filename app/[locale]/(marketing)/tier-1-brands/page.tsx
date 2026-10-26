import type { Metadata } from "next";
import type { BrandCategory } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import BrandHero from "@/components/brands/BrandHero";
import { BrandAdvantages } from "@/components/brands/BrandSections";
import {
  BrandPartnership,
  BrandPortfolio,
  FeaturedProducts,
  type FeaturedProduct,
  type PortfolioGroup,
} from "@/components/brands/HubSections";
import LatestNews from "@/components/sections/home/LatestNews";
import FaqSection from "@/components/sections/product/FaqSection";
import CtaBand from "@/components/sections/shared/CtaBand";
import { brandEntryHref } from "@/config/nav.config";
import { getPublishedBrands, type BrandEntry } from "@/lib/data/brands";
import { BRAND_CATEGORY_LABELS } from "@/lib/brands/template";
import { readBrandContent } from "@/lib/brands/content";
import { entries, str } from "@/lib/page-content/read";
import { assertPageVisible } from "@/lib/page-visibility";
import { pageTitle } from "@/lib/seo";

/** Brand wall groups, in order. Inverter + storage brands (Deye) sit with the inverters, as in the wireframe. */
const GROUPS: { category: BrandCategory; includes: BrandCategory[] }[] = [
  { category: "MODULES", includes: ["MODULES"] },
  { category: "INVERTERS", includes: ["INVERTERS", "MIXED"] },
  { category: "BESS", includes: ["BESS"] },
];
const FEATURED_COUNT = 4;
const CNX_LOGO = "/logos/cnx-logo-dark.svg";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tier1Brands.meta" });
  return { title: pageTitle(t("title")), description: t("description") };
}

/**
 * Tier 1 brands collection page — opens from the Tier 1 Brands menu. Uses the
 * "PV & BESS brands" structure from the client's mind map (portfolio, brand
 * mix, partnership map, brand news, product display). Copy: Dashboard → Pages
 * → Tier 1 Brands; brands and products: Dashboard → Tier 1 Brands.
 */
export default async function Tier1BrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  await assertPageVisible("/tier-1-brands");
  const { locale } = await params;
  const t = await getTranslations("tier1Brands");

  let brands: BrandEntry[] = [];
  try {
    brands = await getPublishedBrands(locale);
  } catch (error) {
    console.error("[tier-1-brands] brand query failed", error);
  }

  const own = (category: BrandCategory) =>
    category === "MODULES"
      ? { summary: t("portfolio.ownModulesSummary"), href: t("portfolio.ownModulesHref") }
      : category === "BESS"
        ? { summary: t("portfolio.ownBessSummary"), href: t("portfolio.ownBessHref") }
        : null;

  const groups: PortfolioGroup[] = GROUPS.flatMap(({ category, includes }) => {
    const partners = brands
      .filter((brand) => includes.includes(brand.category))
      .map((brand) => ({ key: brand.slug, name: brand.name, logo: brand.logo, summary: brand.summary, href: brandEntryHref(brand.slug) }));
    // A category with only CNX's own card and no partner brand isn't shown.
    if (partners.length === 0) return [];
    const ownCard = own(category);
    // CNX's own products lead their category (wireframe note: "CNX own products listed first").
    const cards = ownCard
      ? [{ key: `cnx-${category}`, name: t("portfolio.ownName"), logo: CNX_LOGO, summary: ownCard.summary, href: ownCard.href }, ...partners]
      : partners;
    const tabLabel = t.has(`portfolio.tabs.${category}` as never) ? t(`portfolio.tabs.${category}` as never) : "";
    return [{ category, label: tabLabel || BRAND_CATEGORY_LABELS[category], cards }];
  });

  // One product per brand, those with a real photo first.
  const featured: FeaturedProduct[] = brands
    .flatMap((brand) => {
      const items = readBrandContent(brand.name, brand.category, brand.content).products.items;
      const product = items.find((item) => item.image) ?? items[0];
      return product
        ? [{ key: `${brand.slug}-${product.id}`, brand: brand.name, logo: brand.logo, series: product.series, category: product.category, image: product.image, href: `${brandEntryHref(brand.slug)}#products` }]
        : [];
    })
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)))
    .slice(0, FEATURED_COUNT);

  const faqItems = entries(t.raw("faq.items" as never)).map(([id, item]) => ({
    id,
    question: str(item, "question"),
    answer: str(item, "answer"),
  }));

  return (
    <>
      <BrandHero
        eyebrow={t("hero.eyebrow")}
        heading={t("hero.heading")}
        body={t("hero.description")}
        backgroundImage={t("hero.image")}
        primary={{ label: t("hero.primaryCta.label"), href: t("hero.primaryCta.href") }}
        secondary={{ label: t("hero.secondaryCta.label"), href: t("hero.secondaryCta.href") }}
      />

      <BrandPortfolio
        eyebrow={t("portfolio.eyebrow")}
        heading={t("portfolio.heading")}
        viewLabel={t("portfolio.viewBrandLabel")}
        emptyLabel={t("portfolio.emptyLabel")}
        allLabel={t("portfolio.tabs.all")}
        groups={groups}
      />

      <BrandAdvantages
        data={{
          hidden: false,
          eyebrow: t("mix.eyebrow"),
          heading: t("mix.heading"),
          items: entries(t.raw("mix.items" as never)).map(([id, item]) => ({
            id,
            icon: str(item, "icon"),
            title: str(item, "title"),
            body: str(item, "body"),
          })),
        }}
      />

      <FeaturedProducts
        eyebrow={t("products.eyebrow")}
        heading={t("products.heading")}
        viewLabel={t("products.viewAll")}
        items={featured}
      />

      <BrandPartnership
        eyebrow={t("partnership.eyebrow")}
        heading={t("partnership.heading")}
        body={t("partnership.body")}
        image={t("partnership.image")}
        stats={entries(t.raw("partnership.stats" as never)).map(([key, stat]) => ({
          key,
          value: str(stat, "value"),
          label: str(stat, "label"),
        }))}
      />

      <LatestNews namespace="tier1Brands.news" />

      {faqItems.length > 0 ? (
        <FaqSection
          data={{
            eyebrow: t("faq.eyebrow"),
            heading: t("faq.heading"),
            items: faqItems,
            defaultOpenId: faqItems[0].id,
            needHelpLabel: "",
            contact: { avatarSrc: "", name: "", role: "", message: "", ctaLabel: "", ctaHref: "" },
          }}
        />
      ) : null}

      <CtaBand
        heading={t("cta.heading")}
        subtext={t("cta.subtext")}
        primaryCta={{ label: t("cta.primaryCta.label"), href: t("cta.primaryCta.href") }}
        secondaryCta={{ label: t("cta.secondaryCta.label"), href: t("cta.secondaryCta.href") }}
        image={{ src: t("cta.image") }}
      />
    </>
  );
}
