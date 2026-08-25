import {
  Building2,
  CloudSunRain,
  Download,
  Grid2x2,
  Layers,
  Snowflake,
  TrendingUp,
  Zap,
} from "lucide-react";
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
import FloatingActionBar, { HeroEndSentinel } from "@/components/sections/product/FloatingActionBar";
import type { ProductDetail } from "@/lib/data/products/types";

const FEATURE_ICONS: Record<string, typeof Layers> = {
  layer: Layers,
  "cloud-sun-rain": CloudSunRain,
  "chart-increase": TrendingUp,
  apartment: Building2,
  "menu-square": Grid2x2,
  snow: Snowflake,
};

const CASE_STUDY_ICONS: Record<string, typeof Layers> = {
  layers: Layers,
  zap: Zap,
  building: Building2,
};

export default function ProductDetailPage({ product }: { product: ProductDetail }) {
  return (
    <main>
      <Hero hero={product.hero} />
      <HeroEndSentinel />

      {product.introduction ? <ProductIntroduction data={product.introduction} /> : null}

      {product.competitiveAdvantage ? (
        <FeatureGrid
          className="w-full bg-surface-2"
          eyebrowLabel={product.competitiveAdvantage.eyebrow}
          heading={product.competitiveAdvantage.heading}
          items={product.competitiveAdvantage.items.map((item) => {
            const Icon = FEATURE_ICONS[item.icon] ?? Layers;
            return {
              icon: <Icon size={40} className="text-secondary" aria-hidden="true" />,
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

      {product.manufacturingWorkflow ? (
        <ManufacturingWorkflow
          data={product.manufacturingWorkflow}
          previousLabel="Previous step"
          nextLabel="Next step"
        />
      ) : null}

      {product.awards ? (
        <AwardsSection
          eyebrowLabel={product.awards.eyebrow}
          heading={product.awards.heading}
          backgroundImage={product.awards.backgroundImage}
          veilGradient="linear-gradient(to bottom, #F8F8F8 0%, rgba(248,248,248,0.9) 35.182%, rgba(255,255,255,0) 80.871%)"
          cards={product.awards.cards}
          rowClassName="flex w-full flex-col items-center gap-16 md:flex-row md:justify-center"
          cardClassName="flex w-full flex-col items-center gap-32 rounded-16 bg-white p-24 md:w-251"
          logoSizeClassName="relative size-140 shrink-0"
          captionClassName="text-center text-p3 font-semibold text-[#131314]"
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
          title={product.caseStudy.title}
          body={product.caseStudy.body}
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
          image={{ src: product.documentsCta.backgroundImage }}
        />
      ) : null}

      <div aria-hidden="true" style={{ height: 112 }} />

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
