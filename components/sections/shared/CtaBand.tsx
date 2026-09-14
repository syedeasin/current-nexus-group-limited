import Image from "next/image";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { ChevronRight } from "@/components/icons/ChevronRight";

interface CtaLink {
  label: string;
  href: string;
}

interface CtaBandProps {
  heading?: string;
  /** Optional — sections that only want the heading can omit this. */
  subtext?: string;
  primaryCta?: CtaLink;
  /** Omit for the default secondary button; pass `null` explicitly for a single-button CTA. */
  secondaryCta?: CtaLink | null;
  /** Replaces the default trailing chevron with a leading icon (e.g. a download icon for a datasheet CTA). */
  primaryIcon?: ReactNode;
  image?: {
    src: string;
    /** Decorative full-bleed background — leave empty unless the photo carries real information. */
    alt?: string;
  };
}

const BUTTON_DELAY_MS = 80;

export default async function CtaBand({
  heading,
  subtext,
  primaryCta,
  secondaryCta,
  primaryIcon,
  image,
}: CtaBandProps) {
  const t = await getTranslations("home.cta");

  const resolvedHeading = heading ?? t("heading");
  const resolvedPrimary = primaryCta ?? { label: t("primaryCta.label"), href: t("primaryCta.href") };
  const resolvedSecondary =
    secondaryCta === undefined
      ? { label: t("secondaryCta.label"), href: t("secondaryCta.href") }
      : secondaryCta;
  const resolvedImage = image ?? { src: "/images/home/CTABackground.webp", alt: "" };

  return (
    <section
      aria-label={resolvedHeading}
      className="relative flex w-full min-h-[420px] flex-col items-center justify-end overflow-hidden bg-neutral-1 pt-40 pb-60 md:min-h-[560px] md:pt-48 md:pb-80 xl:min-h-[740px] xl:pt-60 xl:pb-120"
    >
      <Reveal variant="scale" as="div" className="absolute inset-0">
        <Image
          src={resolvedImage.src}
          alt={resolvedImage.alt ?? ""}
          aria-hidden={resolvedImage.alt ? undefined : "true"}
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </Reveal>
      {/* Exact Figma stops (node 4013:9998) — the gradient's own end-stop is #0A0D1B,
          identical to Footer's bg-neutral-1, so the two sections sit flush with no
          overlap and the seam disappears purely from the matching color. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,13,27,0) 15.444%, rgba(10,13,27,0.86) 72.236%, #0a0d1b 100%)",
        }}
      />
      <Container className="relative flex flex-col items-center gap-32">
        <Reveal as="div" className="flex flex-col items-center gap-20">
          {/* Figma node 114:99602: H2 here tracks -1.2px, not the shared --text-h2 token's -0.72px. */}
          <Heading
            level={2}
            size="h2"
            className="max-w-846 text-balance text-center text-white tracking-[-1.2px]!"
          >
            {resolvedHeading}
          </Heading>
          {subtext ? (
            <Text size="p1" className="max-w-736 text-balance text-center text-white">
              {subtext}
            </Text>
          ) : null}
        </Reveal>
        <Reveal as="div" delay={BUTTON_DELAY_MS} className="flex w-full flex-col items-center gap-12 min-[481px]:w-auto min-[481px]:flex-row min-[481px]:gap-16">
          {/* Figma Button/Button Large spec here tracks -1px, not the shared --text-btn-lg token's -0.2px. */}
          <Button
            href={resolvedPrimary.href}
            size="xl"
            className="w-full tracking-[-1px]! min-[481px]:w-auto"
          >
            {primaryIcon ?? null}
            {resolvedPrimary.label}
            {primaryIcon ? null : <ChevronRight size={BUTTON_ICON_SIZE} />}
          </Button>
          {resolvedSecondary ? (
            <Button
              href={resolvedSecondary.href}
              size="xl"
              variant="secondary"
              className="w-full tracking-[-1px]! min-[481px]:w-auto"
            >
              {resolvedSecondary.label}
            </Button>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}
