import { Fragment } from "react";
import Image from "next/image";
import { ArrowRight, FileText } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { knownLogoWidth } from "@/config/nav.config";
import { HERO_HEADER_OFFSET } from "@/src/layout/headerOffset";
import { cn } from "@/lib/utils";
import type { BrandContent } from "@/lib/brands/content";

const LOGO_HEIGHT = 32;

interface BrandHeroProps {
  /** Alt text for the logo. */
  name: string;
  logo?: string;
  hero: BrandContent["hero"];
  /** Trail after nothing — the last crumb is the current page and has no href. */
  crumbs: { label: string; href?: string }[];
}

/**
 * Brand page hero (brief §1): breadcrumb, the brand's logo on a white chip so
 * any logo colour reads on the dark photo, H1, intro, quote + products buttons
 * and the "need help selecting a model?" text link. Same photo treatment as
 * PageBanner so it sits with the rest of the site.
 */
export default function BrandHero({ name, logo = "", hero, crumbs }: BrandHeroProps) {
  const logoWidth = knownLogoWidth(logo);

  return (
    <section
      aria-label={hero.heading}
      data-hero-sentinel
      className={cn("relative w-full overflow-hidden bg-neutral-1", HERO_HEADER_OFFSET)}
    >
      {hero.backgroundImage ? (
        <Image src={hero.backgroundImage} alt="" aria-hidden="true" fill priority sizes="100vw" className="object-cover" />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(270deg, rgba(10,13,27,0.25) 0%, rgba(10,13,27,0.8) 45%, rgba(10,13,27,0.92) 65%, #0A0D1B 82%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-167"
        style={{ background: "linear-gradient(to top, rgba(10,13,27,0) 0%, rgba(10,13,27,0.64) 96.876%)" }}
      />

      <Container className="relative z-10 flex flex-col gap-32 pt-120 pb-64 md:pt-152 md:pb-80 xl:pt-200 xl:pb-120">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-8 text-p4 text-neutral-8">
            {crumbs.map((crumb, index) => (
              <Fragment key={`${crumb.label}-${index}`}>
                {index > 0 ? <li aria-hidden="true">/</li> : null}
                {crumb.href ? (
                  <li>
                    <Link href={crumb.href} className="transition-colors duration-150 hover:text-white">
                      {crumb.label}
                    </Link>
                  </li>
                ) : (
                  <li aria-current="page" className="text-white">
                    {crumb.label}
                  </li>
                )}
              </Fragment>
            ))}
          </ol>
        </nav>

        <div className="flex max-w-760 flex-col gap-32 lg:gap-40">
          <div className="flex flex-col gap-20">
            {logo ? (
              <Reveal as="div" delay={0}>
                <span className="inline-flex h-64 items-center rounded-12 bg-white px-20">
                  <Image
                    src={logo}
                    alt={name}
                    width={logoWidth ? Math.round((logoWidth * LOGO_HEIGHT) / 24) : 180}
                    height={LOGO_HEIGHT}
                    style={{ height: LOGO_HEIGHT, width: logoWidth ? Math.round((logoWidth * LOGO_HEIGHT) / 24) : "auto" }}
                    className="object-contain"
                  />
                </span>
              </Reveal>
            ) : null}
            <Reveal as="div" delay={40}>
              <SectionEyebrow label={hero.eyebrow} tone="dark" />
            </Reveal>
            <div className="flex flex-col gap-16">
              <TextReveal delay={80}>
                <Heading level={1} size="h1" className="text-balance text-white">
                  {hero.heading}
                </Heading>
              </TextReveal>
              <Reveal as="div" delay={160}>
                <Text size="p2" className="max-w-680 text-neutral-9">
                  {hero.body}
                </Text>
              </Reveal>
            </div>
          </div>

          <Reveal as="div" delay={240} className="flex flex-col gap-20">
            <div className="flex w-full flex-col gap-12 min-[560px]:w-auto min-[560px]:flex-row">
              <Button
                href={hero.primaryHref}
                size="lg"
                className="w-full min-[560px]:h-60 min-[560px]:w-auto min-[560px]:px-32 min-[560px]:text-btn-lg"
              >
                <FileText size={BUTTON_ICON_SIZE} aria-hidden="true" />
                {hero.primaryLabel}
              </Button>
              <Button
                href={hero.secondaryHref}
                size="lg"
                variant="ghost"
                className="w-full border-[1.5px] border-neutral-6 text-white hover:bg-white hover:text-neutral-1 min-[560px]:h-60 min-[560px]:w-auto min-[560px]:px-32 min-[560px]:text-btn-lg"
              >
                {hero.secondaryLabel}
              </Button>
            </div>
            {hero.linkLabel && hero.linkHref ? (
              <Link
                href={hero.linkHref}
                className="group inline-flex w-fit items-center gap-8 text-p3 font-medium text-secondary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                {hero.linkLabel}
                <ArrowRight size={18} aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-2" />
              </Link>
            ) : null}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
