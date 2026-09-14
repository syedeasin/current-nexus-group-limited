import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Layers, Settings, Sun } from "lucide-react";
import PageBanner from "@/components/sections/shared/PageBanner";
import CaseStudySection from "@/components/sections/shared/CaseStudySection";
import CtaBand from "@/components/sections/shared/CtaBand";
import ResidentialStats from "@/components/sections/solutions/residential/ResidentialStats";
import WhyChooseResidential from "@/components/sections/solutions/residential/WhyChooseResidential";
import ResidentialProductModels from "@/components/sections/solutions/residential/ResidentialProductModels";
import ResidentialApplications from "@/components/sections/solutions/residential/ResidentialApplications";
import {
  residentialBannerImage,
  residentialCaseStudyImage,
} from "@/lib/data/solutions/residential";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("solutions.residential.meta");
  return { title: t("title"), description: t("description") };
}

/** Figma node 4028:10634 — solar panel, gear and sun, in that order. */
const CASE_STUDY_SPEC_ICONS = [Layers, Settings, Sun] as const;
const CASE_STUDY_SPEC_KEYS = ["modules", "systemSize", "mount"] as const;

export default async function ResidentialSolutionsPage() {
  const t = await getTranslations("solutions.residential");

  return (
    <main>
      {/* Figma node 4028:10431. Unlike the manufacturing banner this one is 660px
          tall and centres its text block in the 572px below the header, because
          the heading carries a supporting paragraph. */}
      <PageBanner
        eyebrowLabel={t("banner.eyebrow")}
        heading={t("banner.heading")}
        description={t("banner.description")}
        image={{ src: residentialBannerImage }}
        textMaxWidthClassName="max-w-606"
        containerClassName="h-460 justify-center pt-56 md:h-560 xl:h-660 xl:pt-88"
      />

      <ResidentialStats />
      <WhyChooseResidential />
      <ResidentialProductModels />
      <ResidentialApplications />

      {/* Figma node 4028:10614 is the BC product page's success story with a
          different veil ramp and symmetric 100px padding, so every other knob
          matches that page's overrides exactly. */}
      <CaseStudySection
        eyebrowLabel={t("caseStudy.eyebrow")}
        heading={t("caseStudy.heading")}
        backgroundImage={residentialCaseStudyImage}
        title={t("caseStudy.title")}
        body={t("caseStudy.body")}
        headingClassName="tracking-[-1.2px]!"
        gradientCss="linear-gradient(180deg, rgba(10,13,27,0) 38.01%, rgba(10,13,27,0.9) 70.03%)"
        contentRowClassName="relative flex flex-col gap-24 p-24 min-[480px]:p-32 lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex-row lg:items-center lg:justify-between lg:gap-40 lg:p-60"
        dividerClassName="hidden w-0 border-l border-white/20 lg:block lg:h-108"
        titleClassName="text-white tracking-[-0.5px]!"
        bodySize="p3"
        specItemClassName="flex items-center gap-8 text-p3 font-medium text-white"
        specs={CASE_STUDY_SPEC_KEYS.map((key, index) => {
          const Icon = CASE_STUDY_SPEC_ICONS[index];
          return {
            icon: <Icon size={20} className="shrink-0 text-white" aria-hidden="true" />,
            text: t(`caseStudy.specs.${key}`),
          };
        })}
      />

      <CtaBand />
    </main>
  );
}
