import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import TopHeavyText from "@/components/ui/TopHeavyText";
import { cascade } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

/** Split a multi-paragraph field (blank line or line break between paragraphs). */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Eyebrow + H2, the opening of every content block. */
export function BlockTitle({ eyebrow, heading, dark = false, centered = false }: { eyebrow?: string; heading: string; dark?: boolean; centered?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-12", centered && "items-center text-center")}>
      {eyebrow ? (
        <Reveal as="div" delay={cascade(0)}>
          <SectionEyebrow label={eyebrow} tone={dark ? "dark" : undefined} />
        </Reveal>
      ) : null}
      <TextReveal delay={cascade(1)}>
        <Heading level={2} size="h2" className={cn("text-balance tracking-[-1.2px]!", dark && "text-white")}>
          {heading}
        </Heading>
      </TextReveal>
    </div>
  );
}

/** Intro paragraphs at one fixed measure, wrapped top-heavy (house rule). */
export function BlockIntro({ text, dark = false, className }: { text: string; dark?: boolean; className?: string }) {
  const lines = paragraphs(text);
  if (lines.length === 0) return null;
  return (
    <Reveal as="div" delay={cascade(2)} className={cn("flex max-w-[560px] flex-col gap-12", className)}>
      {lines.map((line) => (
        <TopHeavyText key={line} className={cn("text-p3", dark ? "text-neutral-8" : "text-neutral-4")}>
          {line}
        </TopHeavyText>
      ))}
    </Reveal>
  );
}

/**
 * Standard header for the content blocks, as on the brand pages: eyebrow and
 * H2 on the left, the intro on the right starting level with the heading
 * (not bottom-aligned), both at fixed widths so every section reads the same.
 * Without an intro the title stands alone (centred when `centered`).
 */
export default function BlockHeader({
  eyebrow,
  heading,
  intro,
  dark = false,
  centered = false,
}: {
  eyebrow?: string;
  heading: string;
  intro?: string;
  dark?: boolean;
  centered?: boolean;
}) {
  if (!heading) return null;
  const hasIntro = paragraphs(intro ?? "").length > 0;

  if (!hasIntro) {
    return (
      <div className={cn("max-w-[760px]", centered && "mx-auto")}>
        <BlockTitle eyebrow={eyebrow} heading={heading} dark={dark} centered={centered} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-20 lg:flex-row lg:items-start lg:justify-between lg:gap-80">
      <div className="lg:max-w-[600px]">
        <BlockTitle eyebrow={eyebrow} heading={heading} dark={dark} />
      </div>
      <BlockIntro text={intro ?? ""} dark={dark} className="lg:w-[46%] lg:shrink-0 lg:pt-36" />
    </div>
  );
}
