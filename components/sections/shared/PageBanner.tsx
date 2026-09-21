import Image from "next/image";
import Container from "@/components/layout/Container";
import { HERO_HEADER_OFFSET } from "@/src/layout/headerOffset";
import { cn } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";

const DESCRIPTION_DELAY_MS = 160;

interface PageBannerProps {
  eyebrowLabel: string;
  heading: string;
  /**
   * Supporting paragraph under the heading. The manufacturing and news banners
   * are heading-only; the Solutions banners (Figma node 4028:10446) add one,
   * which is also what re-centres the text block inside the banner.
   */
  description?: string;
  image: {
    src: string;
    /** Decorative full-bleed background — leave empty unless the photo carries real information. */
    alt?: string;
    objectPosition?: string;
  };
  /** Tailwind max-width class for the text block. Defaults to the manufacturing category spec (855px). */
  textMaxWidthClassName?: string;
  /**
   * Banner height and vertical placement. Defaults to the manufacturing
   * category spec (548px tall at xl, text pinned to the bottom). Solutions
   * pages are taller and centre their text instead, so they pass their own.
   */
  containerClassName?: string;
}

export default function PageBanner({
  eyebrowLabel,
  heading,
  description,
  image,
  textMaxWidthClassName = "max-w-855",
  containerClassName = "h-400 justify-end py-64 md:h-460 xl:h-548 xl:pt-140 xl:pb-120",
}: PageBannerProps) {
  return (
    <section
      aria-label={heading}
      data-hero-sentinel
      className={cn("relative w-full overflow-hidden bg-neutral-1", HERO_HEADER_OFFSET)}
    >
      <Image
        src={image.src}
        alt={image.alt ?? ""}
        aria-hidden={image.alt ? undefined : "true"}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: image.objectPosition ?? "right center" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(270deg, rgba(10,13,27,0.2) 0%, rgba(10,13,27,0.8) 50%, rgba(10,13,27,0.9) 65%, #0A0D1B 80.364%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-167"
        style={{
          background: "linear-gradient(to top, rgba(10,13,27,0) 0%, rgba(10,13,27,0.64) 96.876%)",
        }}
      />

      <Container className={cn("relative z-10 flex flex-col", containerClassName)}>
        <div className={cn("flex flex-col gap-12", textMaxWidthClassName)}>
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={eyebrowLabel} />
          </Reveal>
          {/* Figma node 4028:10446 keeps the heading and its paragraph 16px apart
              inside the 12px eyebrow gap, so they group as one block. */}
          <div className="flex flex-col gap-16">
            <TextReveal delay={80}>
              <Heading level={1} size="h1" className="text-balance text-white">
                {heading}
              </Heading>
            </TextReveal>
            {description ? (
              <Reveal as="div" delay={DESCRIPTION_DELAY_MS}>
                <Text size="p2" className="text-neutral-9">
                  {description}
                </Text>
              </Reveal>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
