import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import ProductIntroduction from "@/components/sections/product/ProductIntroduction";
import FaqSection from "@/components/sections/product/FaqSection";
import BrandHero from "@/components/brands/BrandHero";
import BrandProducts from "@/components/brands/BrandProducts";
import BrandInquiryForm from "@/components/brands/BrandInquiryForm";
import {
  BrandAdvantages,
  BrandApplications,
  BrandCaseStudies,
  BrandDocuments,
  BrandNumberedGrid,
  BrandProcurement,
} from "@/components/brands/BrandSections";
import { brandEntryHref } from "@/config/nav.config";
import { toAbsolute } from "@/lib/manufacturing/metadata";
import { cascade } from "@/lib/motion/timing";
import type { BrandContent } from "@/lib/brands/content";

interface BrandPageTemplateProps {
  name: string;
  slug: string;
  logo: string;
  locale: string;
  content: BrandContent;
}

/**
 * One Tier 1 brand landing page, in the order of the client brief: hero,
 * overview, products, advantages, for the buyers, documents, applications,
 * case studies, procurement support, FAQ, final inquiry. Every section but
 * the hero and the form can be switched off per brand in the dashboard.
 */
export default async function BrandPageTemplate({ name, slug, logo, locale, content }: BrandPageTemplateProps) {
  const t = await getTranslations("tier1Brands.brandPage");
  const { overview, products, advantages, buyers, documents, applications, cases, procurement, faq } = content;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("breadcrumbHome"), item: toAbsolute(`/${locale}`) },
      { "@type": "ListItem", position: 2, name: t("breadcrumbBrands"), item: toAbsolute(`/${locale}/tier-1-brands`) },
      { "@type": "ListItem", position: 3, name, item: toAbsolute(`/${locale}${brandEntryHref(slug)}`) },
    ],
  };
  const productsJsonLd =
    !products.hidden && products.items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: products.heading,
          itemListElement: products.items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Product",
              name: item.series,
              category: item.category || undefined,
              brand: { "@type": "Brand", name },
              ...(item.image ? { image: toAbsolute(item.image) } : {}),
            },
          })),
        }
      : null;

  return (
    <>
      {/* Serialised from DB fields with JSON.stringify only — same convention as ProductDetailPage. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {productsJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }} />
      ) : null}

      <BrandHero
        name={name}
        logo={logo}
        hero={content.hero}
        crumbs={[{ label: t("breadcrumbHome"), href: "/" }, { label: t("breadcrumbBrands"), href: "/tier-1-brands" }, { label: name }]}
      />

      {!overview.hidden && overview.paragraphs.length > 0 ? (
        <ProductIntroduction
          data={{ eyebrow: overview.eyebrow, heading: overview.heading, paragraphs: overview.paragraphs, image: overview.image }}
        />
      ) : null}

      {!products.hidden && products.items.length > 0 ? (
        <section id="products" aria-label={products.heading} className="w-full scroll-mt-96 bg-white">
          <Container className="flex flex-col gap-40 py-48 md:py-64 xl:py-100">
            <div className="flex max-w-720 flex-col gap-12">
              <Reveal as="div" delay={cascade(0)}>
                <SectionEyebrow label={products.eyebrow} />
              </Reveal>
              <TextReveal delay={cascade(1)}>
                <Heading level={2} size="h2" className="text-balance tracking-[-1.2px]!">
                  {products.heading}
                </Heading>
              </TextReveal>
              {products.intro ? (
                <Reveal as="div" delay={cascade(2)}>
                  <Text size="p3" className="text-neutral-4">
                    {products.intro}
                  </Text>
                </Reveal>
              ) : null}
            </div>
            <BrandProducts
              brandName={name}
              logo={logo}
              items={products.items}
              allLabel={products.allLabel}
              tabsLabel={t("productsTabsLabel")}
              viewSpecsLabel={products.viewSpecsLabel}
              datasheetLabel={products.datasheetLabel}
              quoteLabel={products.quoteLabel}
              closeLabel={products.closeLabel}
              specsDialogLabel={t("specsDialogLabel")}
            />
          </Container>
        </section>
      ) : null}

      {!advantages.hidden && advantages.items.length > 0 ? <BrandAdvantages data={advantages} /> : null}

      {!buyers.hidden && buyers.items.length > 0 ? (
        <BrandNumberedGrid eyebrow={buyers.eyebrow} heading={buyers.heading} items={buyers.items} />
      ) : null}

      {!documents.hidden ? <BrandDocuments data={documents} /> : null}

      {!applications.hidden && applications.items.length > 0 ? <BrandApplications data={applications} /> : null}

      {!cases.hidden && cases.items.length > 0 ? <BrandCaseStudies data={cases} /> : null}

      {!procurement.hidden ? <BrandProcurement data={procurement} /> : null}

      {!faq.hidden && faq.items.length > 0 ? (
        <FaqSection
          data={{
            eyebrow: faq.eyebrow,
            heading: faq.heading,
            items: faq.items,
            defaultOpenId: faq.items[0].id,
            needHelpLabel: "",
            // No contact card on brand pages — the inquiry form follows directly.
            contact: { avatarSrc: "", name: "", role: "", message: "", ctaLabel: "", ctaHref: "" },
          }}
        />
      ) : null}

      <BrandInquiryForm slug={slug} data={content.inquiry} />
    </>
  );
}
