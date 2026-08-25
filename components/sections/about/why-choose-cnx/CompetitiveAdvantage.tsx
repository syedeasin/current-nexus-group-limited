import { getTranslations } from "next-intl/server";
import { Blend, Cpu, Factory, Globe, Handshake, ShieldCheck } from "lucide-react";
import FeatureGrid from "@/components/sections/shared/FeatureGrid";

const ITEMS = [
  { key: "advancedTechnologies", Icon: Cpu },
  { key: "integratedManufacturing", Icon: Factory },
  { key: "oemOdmSolutions", Icon: Blend },
  { key: "provenQuality", Icon: ShieldCheck },
  { key: "globalSupplyNetwork", Icon: Globe },
  { key: "technicalPartnership", Icon: Handshake },
] as const;

export default async function CompetitiveAdvantage() {
  const t = await getTranslations("about.whyChooseCnx.competitiveAdvantage");

  return (
    <FeatureGrid
      className="w-full bg-surface-2"
      eyebrowLabel={t("eyebrow")}
      heading={t("heading")}
      items={ITEMS.map(({ key, Icon }) => ({
        icon: <Icon size={40} className="text-secondary" aria-hidden="true" />,
        title: t(`items.${key}.title`),
        body: t(`items.${key}.body`),
      }))}
    />
  );
}
