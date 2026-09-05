import { cn } from "@/lib/utils";

type SectionEyebrowTone = "light" | "dark";

interface SectionEyebrowProps {
  label: string;
  /** Both tones resolve to the tertiary token — confirmed identical on dark backgrounds via Figma node 2283:8465. Kept as an explicit prop so a future surface that needs to diverge has a seam to do it. */
  tone?: SectionEyebrowTone;
  className?: string;
}

const toneStyles: Record<SectionEyebrowTone, string> = {
  light: "text-tertiary",
  dark: "text-tertiary",
};

export default function SectionEyebrow({ label, tone = "light", className }: SectionEyebrowProps) {
  return (
    <div className={cn("flex h-24 items-center gap-8", className)}>
      <span className="relative inline-flex size-16 shrink-0 items-center justify-center">
        <span
          aria-hidden="true"
          className="section-eyebrow-ring pointer-events-none absolute inset-0 rounded-full"
        />
        <span className="relative size-8 rounded-full bg-tertiary" />
      </span>
      <span
        className={cn("text-badge font-medium uppercase", toneStyles[tone])}
      >
        {label}
      </span>
    </div>
  );
}
