import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import { stagger } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";
import type { SolutionStatsSection } from "@/lib/solutions-projects/types";

/**
 * Data-driven port of the Residential stats band (Figma node 4028:10449) — a
 * four-up spec band under the banner. Layout, dividers and typography are the
 * master design verbatim; only the values/labels come from page data.
 */
const DIVIDER =
  "lg:relative lg:before:absolute lg:before:-left-48 lg:before:top-0 lg:before:h-96 lg:before:w-2 lg:before:rounded-full lg:before:bg-surface-2 lg:before:content-['']";

export default function SolutionsStats({ items }: SolutionStatsSection) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Key figures" className="w-full bg-surface-1">
      <Container className="py-40 md:py-48 xl:py-60">
        <div className="grid grid-cols-2 gap-x-48 gap-y-32 lg:grid-cols-4 lg:gap-x-96">
          {items.map((stat, index) => (
            <Reveal
              key={`${stat.label}-${index}`}
              as="div"
              delay={stagger(index)}
              className={cn("flex min-w-0 flex-col gap-12", index > 0 && DIVIDER)}
            >
              <p className="text-h2 font-semibold tracking-[-1.2px]! text-neutral-1">{stat.value}</p>
              <p className="text-p3 text-neutral-3">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
