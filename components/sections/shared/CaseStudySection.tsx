import Image from "next/image";
import type { ReactNode } from "react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/motion/ImageReveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { cn } from "@/lib/utils";

export interface CaseStudySpecItem {
  icon: ReactNode;
  text: string;
}

interface CaseStudySectionProps {
  eyebrowLabel: string;
  heading: string;
  backgroundImage: string;
  /** Decorative by default (empty) — the photo sits behind a text scrim. */
  backgroundImageAlt?: string;
  title: string;
  body: string;
  specs: CaseStudySpecItem[];
  /** Container top/bottom padding — defaults to the Why Choose CNX page's symmetric scale. */
  containerClassName?: string;
  /** Extra classes for the heading, appended after the base H2 style. */
  headingClassName?: string;
  /** CSS `background` for the photo veil — defaults to the Why Choose CNX page's gradient. */
  gradientCss?: string;
  /** The bottom content row (title/body, divider, specs) — alignment, gaps, padding. */
  contentRowClassName?: string;
  /** The vertical divider between the text block and the specs list. */
  dividerClassName?: string;
  /** Extra classes for the title, appended after the base H5 style. */
  titleClassName?: string;
  /** Body paragraph size token. */
  bodySize?: "p1" | "p2" | "p3" | "p4";
  /** Each spec `<li>` — icon/text gap, font size/weight/color. */
  specItemClassName?: string;
}

const HEADING_DELAY_MS = 80;
const IMAGE_DELAY_MS = 160;
const CONTENT_DELAY_MS = 320;

/**
 * Generic "client success story" section — extracted from the Why Choose CNX
 * page's CaseStudy so the product detail template can reuse it with its own
 * copy, photo, and spec list.
 */
export default function CaseStudySection({
  eyebrowLabel,
  heading,
  backgroundImage,
  backgroundImageAlt,
  title,
  body,
  specs,
  containerClassName = "flex flex-col gap-48 py-48 md:py-64 xl:py-100",
  headingClassName,
  gradientCss = "linear-gradient(180deg, rgba(10,13,27,0) 30%, rgba(10,13,27,0.9) 100%)",
  contentRowClassName = "relative flex flex-col gap-24 p-24 min-[480px]:p-32 lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex-row lg:items-end lg:justify-between lg:gap-40 lg:p-60",
  dividerClassName = "hidden self-stretch border-l border-white/20 lg:block",
  titleClassName = "text-white",
  bodySize = "p2",
  specItemClassName = "flex items-center gap-12 text-p2 font-medium text-white",
}: CaseStudySectionProps) {
  return (
    <section aria-label={heading} className="w-full bg-surface-2">
      <Container className={containerClassName}>
        <div className="flex w-full flex-col items-center gap-12">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={eyebrowLabel} />
          </Reveal>
          <TextReveal delay={HEADING_DELAY_MS}>
            <Heading level={2} size="h2" className={cn("text-balance text-center", headingClassName)}>
              {heading}
            </Heading>
          </TextReveal>
        </div>

        <div className="relative w-full overflow-hidden rounded-16 lg:h-600">
          <ImageReveal
            delay={IMAGE_DELAY_MS}
            className="relative aspect-[4/3] w-full lg:absolute lg:inset-0 lg:aspect-auto"
          >
            <Image
              src={backgroundImage}
              alt={backgroundImageAlt ?? ""}
              aria-hidden={backgroundImageAlt ? undefined : "true"}
              fill
              sizes="(min-width: 1280px) 1320px, 100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0" style={{ background: gradientCss }} />
          </ImageReveal>

          <Reveal variant="fade" delay={CONTENT_DELAY_MS} as="div" className={contentRowClassName}>
            <div className="flex max-w-704 flex-col gap-12">
              <Heading level={3} size="h5" className={titleClassName}>
                {title}
              </Heading>
              <Text size={bodySize} className="text-neutral-9">
                {body}
              </Text>
            </div>

            <div className={dividerClassName} aria-hidden="true" />

            <ul className="flex max-w-319 flex-col gap-16">
              {specs.map((spec) => (
                <li key={spec.text} className={specItemClassName}>
                  {spec.icon}
                  {spec.text}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
