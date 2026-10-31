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
  WhyChooseShowcase,
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
      {/* Why choose us v2 (31 Oct). The previous layout, WhyChooseCnx, is kept
          in components/sections/home and can be swapped back in here. */}
      <WhyChooseShowcase />
      <Awards />
      <LatestNews />
      <Faq />
      <CtaBand />
    </>
  );
}
