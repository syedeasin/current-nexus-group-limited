import Image from "next/image";
import type { ReactNode } from "react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";

export interface CaseStudySpecItem {
  icon: ReactNode;
  text: string;
}

interface CaseStudySectionProps {
  eyebrowLabel: string;
  heading: string;
  backgroundImage: string;
  title: string;
  body: string;
  specs: CaseStudySpecItem[];
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
  title,
  body,
  specs,
}: CaseStudySectionProps) {
  return (
    <section aria-label={heading} className="w-full bg-surface-2">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <div className="flex w-full flex-col items-center gap-12">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={eyebrowLabel} />
          </Reveal>
          <Reveal as="div" delay={HEADING_DELAY_MS}>
            <Heading level={2} size="h2" className="text-balance text-center">
              {heading}
            </Heading>
          </Reveal>
        </div>

        <Reveal
          variant="scale"
          delay={IMAGE_DELAY_MS}
          className="relative w-full overflow-hidden rounded-16 lg:h-600"
        >
          <div className="relative aspect-[4/3] w-full lg:absolute lg:inset-0 lg:aspect-auto">
            <Image
              src={backgroundImage}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1280px) 1320px, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(10,13,27,0) 30%, rgba(10,13,27,0.9) 100%)" }}
            />
          </div>

          <Reveal
            variant="fade"
            delay={CONTENT_DELAY_MS}
            as="div"
            className="relative flex flex-col gap-24 p-24 min-[480px]:p-32 lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex-row lg:items-end lg:justify-between lg:gap-40 lg:p-60"
          >
            <div className="flex max-w-704 flex-col gap-12">
              <Heading level={3} size="h5" className="text-white">
                {title}
              </Heading>
              <Text size="p2" className="text-neutral-9">
                {body}
              </Text>
            </div>

            <div className="hidden self-stretch border-l border-white/20 lg:block" aria-hidden="true" />

            <ul className="flex max-w-319 flex-col gap-16">
              {specs.map((spec) => (
                <li key={spec.text} className="flex items-center gap-12 text-p2 font-medium text-white">
                  {spec.icon}
                  {spec.text}
                </li>
              ))}
            </ul>
          </Reveal>
        </Reveal>
      </Container>
    </section>
  );
}
