import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import { residentialStats } from "@/lib/data/solutions/residential";
import { stagger } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

/**
 * Figma node 4028:10449 — a four-up module-spec band sitting directly under the
 * banner.
 *
 * The 1320px content column is split as 258px of text with a 96px gap between
 * columns and a 2px rule floating in the middle of each gap. `grid-cols-4` +
 * `gap-x-96` reproduces the 258px columns exactly ((1320 − 3×96) / 4), and the
 * rule is drawn as a `::before` pulled half a gap left so it lands on Figma's
 * 306 / 660 / 1014 positions without adding empty divider nodes to the DOM. The
 * rule is #F8F8F8 — lighter than the #EAEDF8 band it sits on, not darker.
 *
 * Values are rendered verbatim rather than through <CountUp>: "0.4%" and
 * "30 year" are units, and a counter that rounds them would print a wrong
 * number on the way up.
 */
const DIVIDER =
  "lg:relative lg:before:absolute lg:before:-left-48 lg:before:top-0 lg:before:h-96 lg:before:w-2 lg:before:rounded-full lg:before:bg-surface-2 lg:before:content-['']";

export default async function ResidentialStats() {
  const t = await getTranslations("solutions.residential.stats");

  return (
    <section aria-label={t("modulePerformance")} className="w-full bg-surface-1">
      <Container className="py-40 md:py-48 xl:py-60">
        <div className="grid grid-cols-2 gap-x-48 gap-y-32 lg:grid-cols-4 lg:gap-x-96">
          {residentialStats.map((stat, index) => (
            <Reveal
              key={stat.labelKey}
              as="div"
              delay={stagger(index)}
              className={cn("flex min-w-0 flex-col gap-12", index > 0 && DIVIDER)}
            >
              {/* Figma tracks this H2 at -1.2px, not the shared --text-h2 token's -0.72px. */}
              <p className="text-h2 font-semibold tracking-[-1.2px]! text-neutral-1">
                {stat.value}
              </p>
              <p className="text-p3 text-neutral-3">{t(stat.labelKey)}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
