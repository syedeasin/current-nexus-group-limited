import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CtaBand from "@/components/sections/shared/CtaBand";
import Hero from "@/components/sections/about/why-choose-cnx/Hero";
import CompetitiveAdvantage from "@/components/sections/about/why-choose-cnx/CompetitiveAdvantage";
import BeyondProducts from "@/components/sections/about/why-choose-cnx/BeyondProducts";
import GlobalConfidence from "@/components/sections/about/why-choose-cnx/GlobalConfidence";
import IndustryRecognition from "@/components/sections/about/why-choose-cnx/IndustryRecognition";
import CaseStudy from "@/components/sections/about/why-choose-cnx/CaseStudy";
import { pageTitle } from "@/lib/seo";
import { assertPageVisible } from "@/lib/page-visibility";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.whyChooseCnx.meta" });

  return {
    title: pageTitle(t("title")),
    description: t("description"),
  };
}

export default async function WhyChooseCnxPage() {
  await assertPageVisible("/about/why-choose-cnx");
  const t = await getTranslations("about.whyChooseCnx.cta");

  return (
    <>
      <Hero />
      <CompetitiveAdvantage />
      <BeyondProducts />
      <GlobalConfidence />
      <IndustryRecognition />
      <CaseStudy />
      <CtaBand
        heading={t("heading")}
        subtext={t("subtext")}
        primaryCta={{ label: t("primaryCta.label"), href: t("primaryCta.href") }}
        secondaryCta={{ label: t("secondaryCta.label"), href: t("secondaryCta.href") }}
      />
    </>
  );
}
