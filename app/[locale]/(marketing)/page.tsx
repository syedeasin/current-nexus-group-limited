import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  Hero,
  TrustedLogos,
  AboutCnx,
  EnergyEcosystem,
  PremiumSolutions,
  ApplicationScenes,
  ClientTestimonials,
  WhyChooseCnx,
  Awards,
  LatestNews,
  Faq,
} from "@/components/sections/home";
import CtaBand from "@/components/sections/shared/CtaBand";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home.meta");
  return {
    // Absolute: the homepage title is the whole title, not "%s | CNX Energy".
    title: { absolute: t("title") },
    description: t("description"),
  };
}

export default function Home() {
  return (
    <>
      <Hero />
      <TrustedLogos />
      <AboutCnx />
      <EnergyEcosystem />
      <PremiumSolutions />
      <ApplicationScenes />
      <ClientTestimonials />
      <WhyChooseCnx />
      <Awards />
      <LatestNews />
      <Faq />
      <CtaBand />
    </>
  );
}
