import { getTranslations } from "next-intl/server";
import StatItem from "@/components/ui/StatItem";
import { aboutStats } from "@/lib/data/aboutStats";

export default async function StatsRow() {
  const t = await getTranslations("home.about.stats");

  return (
    <div
      className={
        "grid grid-cols-2 gap-x-24 gap-y-32 lg:grid-cols-4 lg:gap-32 " +
        "[&>*:nth-child(odd)]:max-lg:border-l-0"
      }
    >
      {aboutStats.map((stat) => (
        <StatItem
          key={stat.labelKey}
          value={stat.value}
          suffix={stat.suffix}
          label={t(stat.labelKey)}
        />
      ))}
    </div>
  );
}
