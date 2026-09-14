import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import BarChart from "@/components/sections/product/BarChart";
import { cn } from "@/lib/utils";
import type { WhyChooseComparison as WhyChooseComparisonData } from "@/lib/data/products/types";

const SERIES_COLOR_CLASS: Record<string, string> = {
  PERC: "bg-chart-perc",
  TOPCon: "bg-chart-topcon",
  HJT: "bg-chart-hjt",
  BC: "bg-chart-bc",
};

const CHART_BASE_DELAY_MS = 160;
const CHART_STEP_MS = 80;
const CHART_STAGGER_CAP_MS = 400;

export default function WhyChooseComparison({ data }: { data: WhyChooseComparisonData }) {
  return (
    <section className="w-full bg-white pt-100 pb-80">
      <Container className="flex flex-col gap-48">
        <div className="mx-auto flex max-w-660 flex-col items-center gap-8 text-center">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={data.eyebrow} />
          </Reveal>
          <Reveal as="div" delay={80}>
            <Heading level={2} size="h2" className="text-balance">
              {data.heading}
            </Heading>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-24 sm:grid-cols-2 lg:grid-cols-3">
          {data.charts.map((chart, index) => {
            const delay = CHART_BASE_DELAY_MS + Math.min(index * CHART_STEP_MS, CHART_STAGGER_CAP_MS);
            const showPercent = chart.title.includes("(%)");
            return (
              <Reveal
                key={chart.title}
                as="div"
                delay={delay}
                className="flex flex-1 flex-col gap-24 rounded-16 border-[1.5px] border-neutral-10 bg-surface-2 py-24"
              >
                {/* Figma H5 spec (node 2254:9348 etc.) tracks -0.5px, not the shared
                    --text-h5 token's -0.24px. */}
                <Heading level={3} size="h5" className="text-center tracking-[-0.5px]!">
                  {chart.title}
                </Heading>
                <div className="px-24">
                  <BarChart
                    bars={chart.values.map((v) => ({
                      label: v.label,
                      value: v.value,
                      colorClassName: SERIES_COLOR_CLASS[v.label] ?? "bg-neutral-6",
                    }))}
                    valueFormat={showPercent ? "percent" : "raw"}
                  />
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal as="div" className="w-full overflow-x-auto rounded-12 border border-neutral-10">
          <div className="hidden min-w-720 md:block">
            <div className="flex bg-surface-2">
              {/* Figma header cells (node 2254:9425 etc.): Heading/H6 (20/28), tracking
                  -0.2px — a local override distinct from the shared --text-h6 token's
                  -0.1px, forced with `!` since this project's Tailwind build resolves
                  same-property utility conflicts by generation order, not source order. */}
              {["Technology", "Positioning", "Strength", "Trade-off", "Best-fit applications"].map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "flex h-64 items-center border-r border-neutral-10 px-24 py-6 text-h6 tracking-[-0.2px]! font-semibold text-neutral-1 last:border-r-0",
                    i === 0 ? "sticky left-0 w-172 shrink-0 bg-surface-2" : "flex-1"
                  )}
                >
                  {label}
                </div>
              ))}
            </div>
            {data.table.map((row) => (
              <div
                key={row.technology}
                className={cn(
                  "flex border-b border-neutral-10 last:border-b-0",
                  row.highlight && "border-y border-secondary bg-surface-2"
                )}
              >
                <div className="sticky left-0 w-172 shrink-0 border-r border-neutral-10 bg-white px-24 py-16 text-h6 tracking-[-0.2px]! font-semibold text-neutral-1">
                  {row.technology}
                </div>
                {/* Figma value cells (node 2254:9438 etc.): Paragraph/Regular P3 (18/28), not P2. */}
                {[row.positioning, row.strength, row.tradeOff, row.bestFit].map((value, i) => (
                  <div key={i} className="flex-1 border-r border-neutral-10 px-24 py-16 text-p3 text-neutral-3 last:border-r-0">
                    {value}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-16 p-16 md:hidden">
            {data.table.map((row) => (
              <div
                key={row.technology}
                className={cn(
                  "flex flex-col gap-8 rounded-12 border border-neutral-10 p-16",
                  row.highlight && "border-secondary bg-surface-2"
                )}
              >
                <Text size="p2" weight="semibold" className="text-neutral-1">
                  {row.technology}
                </Text>
                {[
                  { label: "Positioning", value: row.positioning },
                  { label: "Strength", value: row.strength },
                  { label: "Trade-off", value: row.tradeOff },
                  { label: "Best-fit applications", value: row.bestFit },
                ].map((pair) => (
                  <div key={pair.label} className="flex flex-col gap-2">
                    <Text size="p4" weight="semibold" className="text-neutral-6">
                      {pair.label}
                    </Text>
                    <Text size="p3" className="text-neutral-3">
                      {pair.value}
                    </Text>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
