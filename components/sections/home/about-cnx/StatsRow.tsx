import { getTranslations } from "next-intl/server";
import StatItem from "@/components/ui/StatItem";
import { entries, num, str } from "@/lib/page-content/read";

export default async function StatsRow() {
  const t = await getTranslations("home.about");
  const stats = entries(t.raw("stats" as never));

  return (
    <div
      className={
        "grid grid-cols-2 gap-x-24 gap-y-32 lg:grid-cols-4 lg:gap-32 " +
        "[&>*:nth-child(odd)]:max-lg:border-l-0"
      }
    >
      {stats.map(([id, stat]) => (
        <StatItem
          key={id}
          value={num(stat, "number")}
          suffix={str(stat, "suffix") || undefined}
          label={str(stat, "label")}
        />
      ))}
    </div>
  );
}
