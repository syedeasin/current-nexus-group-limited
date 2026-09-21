import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { cn } from "@/lib/utils";
import type { TechnicalSpecifications as TechnicalSpecificationsData } from "@/lib/data/products/types";

// Figma header cells (node 2254:9193 etc): Heading/H6 (20/28), tracking -0.2px — a local
// override distinct from the shared --text-h6 token's -0.1px, forced with `!` since this
// project's Tailwind build resolves same-property utility conflicts by generation order,
// not source order (see Hero.tsx's pt/py fix for precedent). Also a fixed 64px row height.
const headerCellClass =
  "flex h-64 shrink-0 items-center border-r border-neutral-3 px-16 text-h6 tracking-[-0.2px]! font-semibold text-white last:border-r-0 md:px-24";
// Figma label cells (left column, e.g. node 2254:9201): same H6 style as the header.
const bodyLabelCellClass =
  "shrink-0 border-r border-neutral-2 px-16 py-12 text-h6 tracking-[-0.2px]! font-semibold text-white last:border-r-0 md:px-32 md:py-20";
// Figma value cells (node 2254:9203 etc): Paragraph/Regular P3 (18/28), not P2.
const bodyValueCellClass =
  "shrink-0 border-r border-neutral-2 px-16 py-12 text-p3 text-neutral-9 last:border-r-0 md:px-32 md:py-20";

export default function TechnicalSpecifications({ data }: { data: TechnicalSpecificationsData }) {
  return (
    <section className="w-full bg-neutral-1 py-100">
      <Container className="flex flex-col gap-48">
        <div className="mx-auto flex max-w-660 flex-col items-center gap-12 text-center">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={data.eyebrow} />
          </Reveal>
          <TextReveal delay={80}>
            <Heading level={2} size="h2" className="text-balance text-white">
              {data.heading}
            </Heading>
          </TextReveal>
        </div>

        <div className="flex flex-col gap-40">
          <Reveal as="div" className="w-full overflow-x-auto rounded-12 border-2 border-neutral-2">
            <div className="min-w-560">
              <div className="flex bg-neutral-2">
                <div className={cn(headerCellClass, "sticky left-0 w-200 bg-neutral-2 md:w-360")}>Specification item</div>
                <div className={cn(headerCellClass, "flex-1")}>Value</div>
              </div>
              {data.tableA.map((row, index) => (
                <div
                  key={row.label}
                  className={cn(
                    "flex bg-white/5",
                    index < data.tableA.length - 1 && "border-b border-neutral-2"
                  )}
                >
                  <div className={cn(bodyLabelCellClass, "sticky left-0 w-200 bg-neutral-1 md:w-360")}>
                    {row.label}
                  </div>
                  <div className={cn(bodyValueCellClass, "flex-1")}>{row.value}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal as="div" className="w-full overflow-x-auto rounded-12 border-2 border-neutral-2">
            <div className="min-w-720">
              <div className="flex bg-neutral-2">
                <div className={cn(headerCellClass, "sticky left-0 w-160 bg-neutral-2 md:w-270")}>Model</div>
                {["Pmax W", "Vmp V", "Imp A", "Voc V", "Isc A", "Max voltage", "Fuse"].map((label) => (
                  <div key={label} className={cn(headerCellClass, "flex-1 text-center")}>
                    {label}
                  </div>
                ))}
              </div>
              {data.tableB.map((row, index) => (
                <div
                  key={row.model}
                  className={cn(
                    "flex bg-white/5",
                    index < data.tableB.length - 1 && "border-b border-neutral-2"
                  )}
                >
                  <div className={cn(bodyLabelCellClass, "sticky left-0 w-160 bg-neutral-1 md:w-270")}>
                    {row.model}
                  </div>
                  {[row.pmax, row.vmp, row.imp, row.voc, row.isc, row.maxVoltage, row.fuse].map((value, i) => (
                    <div key={i} className={cn(bodyValueCellClass, "flex-1 text-center")}>
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
