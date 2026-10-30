import Image from "@/components/ui/Picture";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { HERO_HEADER_OFFSET } from "@/src/layout/headerOffset";
import { cn } from "@/lib/utils";

interface BrandHeroProps {
  eyebrow: string;
  heading: string;
  body: string;
  backgroundImage: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}

/**
 * Banner for the Tier 1 brand pages and the brands collection page: the
 * Solutions "centered" banner (PageBanner, Figma node 4028:10446) — same
 * height, scrim and type — plus the two CTAs the brief asks for. Fits in one
 * viewport at every breakpoint.
 */
export default function BrandHero({ eyebrow, heading, body, backgroundImage, primary, secondary }: BrandHeroProps) {
  return (
    <section
      aria-label={heading}
      data-hero-sentinel
      className={cn("relative w-full overflow-hidden bg-neutral-1", HERO_HEADER_OFFSET)}
    >
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "right center" }}
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,13,27,0.92) 0%, rgba(10,13,27,0.78) 38%, rgba(10,13,27,0.3) 68%, rgba(10,13,27,0.05) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-167"
        style={{ background: "linear-gradient(to top, rgba(10,13,27,0) 0%, rgba(10,13,27,0.5) 96.876%)" }}
      />

      <Container className="relative z-10 flex min-h-460 flex-col justify-center pt-120 pb-64 md:min-h-560 xl:h-660 xl:pt-88 xl:pb-0">
        <div className="flex max-w-820 flex-col gap-32">
          <div className="flex flex-col gap-12">
            <Reveal as="div" delay={0}>
              <SectionEyebrow label={eyebrow} />
            </Reveal>
            <div className="flex flex-col gap-16">
              <TextReveal delay={80}>
                <Heading level={1} size="h2" className="text-balance text-white">
                  {heading}
                </Heading>
              </TextReveal>
              {body ? (
                <Reveal as="div" delay={160}>
                  <Text size="p2" className="max-w-640 text-neutral-9">
                    {body}
                  </Text>
                </Reveal>
              ) : null}
            </div>
          </div>
          <Reveal as="div" delay={240} className="flex flex-col gap-12 min-[481px]:flex-row">
            <Button href={primary.href} size="lg" className="whitespace-nowrap">
              {primary.label}
              <ChevronRight size={BUTTON_ICON_SIZE} boxed />
            </Button>
            {secondary ? (
              <Button href={secondary.href} size="lg" variant="secondary" className="whitespace-nowrap">
                {secondary.label}
              </Button>
            ) : null}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
