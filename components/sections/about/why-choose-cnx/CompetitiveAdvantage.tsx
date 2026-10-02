import { getTranslations } from "next-intl/server";
import FeatureGrid from "@/components/sections/shared/FeatureGrid";
import { pageIcon } from "@/lib/page-content/icons";
import { entries, str } from "@/lib/page-content/read";

export default async function CompetitiveAdvantage() {
  const t = await getTranslations("about.whyChooseCnx.competitiveAdvantage");

  return (
    <FeatureGrid
      className="w-full bg-surface-2"
      eyebrowLabel={t("eyebrow")}
      heading={t("heading")}
      items={entries(t.raw("items" as never)).map(([, item]) => {
        const Icon = pageIcon(str(item, "icon"));
        return {
          icon: <Icon size={32} strokeWidth={1.5} className="text-neutral-1" aria-hidden="true" />,
          title: str(item, "title"),
          body: str(item, "body"),
        };
      })}
    />
  );
}
