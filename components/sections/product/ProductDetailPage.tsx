import { Building2, Download, Layers, Zap } from "lucide-react";
import Image from "next/image";
import Hero from "@/components/sections/product/Hero";
import ProductIntroduction from "@/components/sections/product/ProductIntroduction";
import FeatureGrid from "@/components/sections/shared/FeatureGrid";
import EngineeringDetails from "@/components/sections/product/EngineeringDetails";
import ManufacturingReliability from "@/components/sections/product/ManufacturingReliability";
import ManufacturingWorkflow from "@/components/sections/product/ManufacturingWorkflow";
import AwardsSection from "@/components/sections/shared/AwardsSection";
import TechnicalSpecifications from "@/components/sections/product/TechnicalSpecifications";
import WhyChooseComparison from "@/components/sections/product/WhyChooseComparison";
import EnergyGainChart from "@/components/sections/product/EnergyGainChart";
import ProductVariants from "@/components/sections/product/ProductVariants";
import OdmSection from "@/components/sections/product/OdmSection";
import CaseStudySection from "@/components/sections/shared/CaseStudySection";
import RelatedProducts from "@/components/sections/product/RelatedProducts";
import FaqSection from "@/components/sections/product/FaqSection";
import QuotationForm from "@/components/sections/product/QuotationForm";
import CtaBand from "@/components/sections/shared/CtaBand";
import FloatingActionBar from "@/components/sections/product/FloatingActionBar";
import { toAbsolute } from "@/lib/manufacturing/metadata";
import { siteConfig } from "@/site.config";
import type { ProductDetail } from "@/lib/data/products/types";

// Figma node 2254:8872 ("Why choose BC") ships these as bespoke line-art SVGs (stroke
// #0A0D1B), not stock icon-set glyphs — the closest Lucide equivalents didn't match, so
// the exported assets are rendered directly instead.
const FEATURE_ICON_SRC: Record<string, string> = {
  layer: "/images/manufacturing/bc-solar/bifacial-double-glass-icon.svg",
  "cloud-sun-rain": "/images/manufacturing/bc-solar/low-light-performance-icon.svg",
  "chart-increase": "/images/manufacturing/bc-solar/high-bifaciality-icon.svg",
  apartment: "/images/manufacturing/bc-solar/wide-installation-scenarios-icon.svg",
  "menu-square": "/images/manufacturing/bc-solar/multi-cut-technology-icon.svg",
  snow: "/images/manufacturing/bc-solar/low-temperature-coefficient-icon.svg",
};

const CASE_STUDY_ICONS: Record<string, typeof Layers> = {
  layers: Layers,
  zap: Zap,
  building: Building2,
};

/**
 * Product schema built entirely from page data — no BC-specific values —
 * so it stays correct for every page this template renders. Only the two
 * hero photos are meaningful/identifying enough to list as `image`; every
 * other photo in the template is decorative by design (see the alt-text
 * fields' doc comments in lib/data/products/types.ts).
 */
function buildProductJsonLd(product: ProductDetail) {
  const images = [product.hero.productImage, product.hero.backgroundImage]
    .filter((src): src is string => Boolean(src))
    .map(toAbsolute);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.hero.heading || product.meta.title,
    description: product.meta.description || product.hero.body || undefined,
    category: product.category,
    ...(images.length ? { image: images } : {}),
    brand: { "@type": "Organization", name: siteConfig.name },
  };
}

export default function ProductDetailPage({ product }: { product: ProductDetail }) {
  return (
    <main>
      {/* Serialised from DB fields, JSON.stringify only — avoids React's text-node escaping corrupting the JSON. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductJsonLd(product)) }}
      />
      <Hero hero={product.hero} />

      {product.introduction ? <ProductIntroduction data={product.introduction} /> : null}

      {product.competitiveAdvantage ? (
        <FeatureGrid
          className="w-full bg-surface-2"
          eyebrowLabel={product.competitiveAdvantage.eyebrow}
          heading={product.competitiveAdvantage.heading}
          items={product.competitiveAdvantage.items.map((item) => {
            const iconSrc = FEATURE_ICON_SRC[item.icon];
            return {
              icon: iconSrc ? (
                <Image src={iconSrc} alt="" aria-hidden="true" width={40} height={40} />
              ) : (
                <Layers size={40} className="text-neutral-1" aria-hidden="true" />
              ),
              title: item.title,
              body: item.body,
            };
          })}
        />
      ) : null}

      {product.engineeringDetails ? <EngineeringDetails data={product.engineeringDetails} /> : null}

      {product.manufacturingReliability ? (
        <ManufacturingReliability data={product.manufacturingReliability} />
      ) : null}

      {product.manufacturingWorkflow ? <ManufacturingWorkflow data={product.manufacturingWorkflow} /> : null}

      {product.awards ? (
        <AwardsSection
          eyebrowLabel={product.awards.eyebrow}
          heading={product.awards.heading}
          backgroundImage={product.awards.backgroundImage}
          veilGradient="linear-gradient(to bottom, #F8F8F8 0%, rgba(248,248,248,0.9) 35.182%, rgba(255,255,255,0) 80.871%)"
          cards={product.awards.cards}
          // Figma's Awards frame is a fixed 900px tall — noticeably more than its own
          // auto-layout content needs (~680px with py-100 both sides) — leaving ~220px of
          // empty space below the cards purely so the photo shows through. Matched here
          // with extra xl:pb so the existing (already Figma-exact) veilGradient percentages
          // resolve against the same proportions Figma intended, instead of being crushed
          // into a shorter box where the fade reaches the cards themselves.
          containerClassName="relative pt-48 pb-56 md:pt-64 md:pb-72 xl:pt-100 xl:pb-320"
          headerClassName="flex max-w-690 flex-col items-center gap-20 text-center"
          // Figma node 2254:9165: a local 52/60/-1.04px/medium override on this heading,
          // distinct from the shared --text-h2 token (48/56/-0.72) — forced with `!` since
          // this project's Tailwind build resolves same-property utility conflicts by
          // generation order, not source order (see Hero.tsx's pt/py fix for precedent).
          headingClassName="text-[52px]! leading-[60px]! tracking-[-1.04px]! font-medium!"
          rowClassName="flex w-full flex-col items-center gap-16 md:flex-row md:justify-center"
          cardClassName="flex w-full flex-col items-center gap-32 rounded-16 bg-white p-24 md:w-251"
          logoSizeClassName="relative size-140 shrink-0"
          captionClassName="text-center text-p4 font-semibold text-neutral-1"
        />
      ) : null}

      {product.technicalSpecifications ? (
        <TechnicalSpecifications data={product.technicalSpecifications} />
      ) : null}

      {product.whyChooseComparison ? <WhyChooseComparison data={product.whyChooseComparison} /> : null}

      {product.energyGain ? <EnergyGainChart data={product.energyGain} /> : null}

      {product.productVariants ? <ProductVariants data={product.productVariants} /> : null}

      {product.odm ? <OdmSection data={product.odm} /> : null}

      {product.caseStudy ? (
        <CaseStudySection
          eyebrowLabel={product.caseStudy.eyebrow}
          heading={product.caseStudy.heading}
          backgroundImage={product.caseStudy.backgroundImage}
          backgroundImageAlt={product.caseStudy.backgroundImageAlt}
          title={product.caseStudy.title}
          body={product.caseStudy.body}
          // Figma node 114:99286 differs from the Why Choose CNX page's defaults on every
          // one of these — padding is asymmetric (pt-80/pb-100, not py-100), the H2/H5
          // headings track tighter than their shared tokens, the veil gradient reaches 90%
          // opacity by 61.566% instead of ramping 30%→100%, the content row centers instead
          // of bottom-aligning, the divider is a fixed 108px (not stretched to the row), and
          // the body/spec text is P3 (18px) not P2 (20px) with an 8px icon gap, not 12px.
          // pt/pb spelled out at every breakpoint (not py-*) — mixing py-* and pt-*/pb-*
          // anywhere in the same cascade is the same generation-order footgun fixed in
          // Hero.tsx's pt/py conflict, so it's avoided from the base breakpoint up.
          containerClassName="flex flex-col gap-48 pt-48 pb-48 md:pt-64 md:pb-64 xl:pt-80 xl:pb-100"
          headingClassName="tracking-[-1.2px]!"
          gradientCss="linear-gradient(180deg, rgba(10,13,27,0) 0%, rgba(10,13,27,0.9) 61.566%)"
          contentRowClassName="relative flex flex-col gap-24 p-24 min-[480px]:p-32 lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex-row lg:items-center lg:justify-between lg:gap-40 lg:p-60"
          dividerClassName="hidden w-0 border-l border-white/20 lg:block lg:h-108"
          titleClassName="text-white tracking-[-0.5px]!"
          bodySize="p3"
          specItemClassName="flex items-center gap-8 text-p3 font-medium text-white"
          specs={product.caseStudy.specs.map((spec) => {
            const Icon = CASE_STUDY_ICONS[spec.icon] ?? Layers;
            return {
              icon: <Icon size={20} className="shrink-0 text-white" aria-hidden="true" />,
              text: spec.text,
            };
          })}
        />
      ) : null}

      {product.relatedProducts ? (
        <RelatedProducts
          data={product.relatedProducts}
          learnMoreLabel="Learn more"
          previousLabel="Previous product"
          nextLabel="Next product"
        />
      ) : null}

      {product.faq ? <FaqSection data={product.faq} /> : null}

      {product.quotationForm ? <QuotationForm data={product.quotationForm} /> : null}

      {product.documentsCta ? (
        <CtaBand
          heading={product.documentsCta.heading}
          primaryCta={{ label: product.documentsCta.buttonLabel, href: product.documentsCta.buttonHref }}
          primaryIcon={<Download size={20} />}
          secondaryCta={null}
          image={{ src: product.documentsCta.backgroundImage, alt: product.documentsCta.backgroundImageAlt }}
        />
      ) : null}

      <FloatingActionBar
        requestQuoteLabel="Request Quote"
        requestQuoteHref="#quotation"
        downloadLabel="Download Datasheet"
        downloadHref={product.hero.primaryCta.href}
        specialistLabel="Talk to ODM Specialist"
        specialistHref={product.hero.secondaryCta.href}
      />
    </main>
  );
}
