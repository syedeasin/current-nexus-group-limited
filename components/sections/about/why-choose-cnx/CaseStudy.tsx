import { getTranslations } from "next-intl/server";
import { Grid2x2, Settings, Sun } from "lucide-react";
import CaseStudySection from "@/components/sections/shared/CaseStudySection";

const SPEC_ICONS = [Grid2x2, Settings, Sun] as const;
const SPEC_KEYS = ["modules", "systemSize", "mountType"] as const;

export default async function CaseStudy() {
  const t = await getTranslations("about.whyChooseCnx.caseStudy");

  return (
    <CaseStudySection
      eyebrowLabel={t("eyebrow")}
      heading={t("heading")}
      backgroundImage="/images/home/clientTestimonialsBackground.webp"
      title={t("title")}
      body={t("body")}
      specs={SPEC_KEYS.map((key, index) => {
        const Icon = SPEC_ICONS[index];
        return {
          icon: <Icon size={20} className="shrink-0 text-secondary" aria-hidden="true" />,
          text: t(`specs.${key}`),
        };
      })}
    />
  );
}
