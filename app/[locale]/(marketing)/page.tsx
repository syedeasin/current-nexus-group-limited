import type { Metadata } from "next";
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
import { siteConfig } from "@/site.config";

export function generateMetadata(): Metadata {
  return {
    title: siteConfig.name,
    description:
      "Solar, BESS and energy manufacturing partner. Tier 1 brands, global distribution and end to end project support.",
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
