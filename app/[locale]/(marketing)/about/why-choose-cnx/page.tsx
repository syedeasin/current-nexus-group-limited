import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Hero from "@/components/sections/about/why-choose-cnx/Hero";
import CompetitiveAdvantage from "@/components/sections/about/why-choose-cnx/CompetitiveAdvantage";
import WhoWeAre from "@/components/sections/about/why-choose-cnx/WhoWeAre";
import SourcingRoutes from "@/components/sections/about/why-choose-cnx/SourcingRoutes";
import IndustryRecognition from "@/components/sections/about/why-choose-cnx/IndustryRecognition";
import CaseStudy from "@/components/sections/about/why-choose-cnx/CaseStudy";
import FinalInquiry from "@/components/sections/about/why-choose-cnx/FinalInquiry";
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
    keywords: t("keywords") || undefined,
  };
}

export default async function WhyChooseCnxPage() {
  await assertPageVisible("/about/why-choose-cnx");

  return (
    <>
      {/* About Us page structure from the client's brief (revision 1022). */}
      <Hero />
      <WhoWeAre />
      <CompetitiveAdvantage />
      <SourcingRoutes />
      <CaseStudy />
      <IndustryRecognition />
      <FinalInquiry />
    </>
  );
}
