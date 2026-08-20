import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import { ChevronRight } from "@/components/icons/ChevronRight";

interface CtaLink {
  label: string;
  href: string;
}

interface CtaBandProps {
  heading?: string;
  primaryCta?: CtaLink;
  /** Optional — a page that only wants one button can omit this. */
  secondaryCta?: CtaLink;
  image?: {
    src: string;
    /** Decorative full-bleed background — leave empty unless the photo carries real information. */
    alt?: string;
  };
}

const BUTTON_DELAY_MS = 80;

export default async function CtaBand({
  heading,
  primaryCta,
  secondaryCta,
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
      className="relative flex w-full min-h-[420px] flex-col items-center justify-end overflow-hidden bg-neutral-1 py-40 md:min-h-[560px] md:py-48 xl:min-h-[740px] xl:py-60"
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
      <Container size="section" className="relative flex flex-col items-center gap-32">
        <Reveal as="div">
          <Heading level={2} size="h2" className="max-w-750 text-balance text-center text-white">
            {resolvedHeading}
          </Heading>
        </Reveal>
        <Reveal as="div" delay={BUTTON_DELAY_MS} className="flex w-full flex-col items-center gap-12 min-[481px]:w-auto min-[481px]:flex-row min-[481px]:gap-16">
          <Button
            href={resolvedPrimary.href}
            size="xl"
            className="w-full min-[481px]:w-auto"
          >
            {resolvedPrimary.label}
            <ChevronRight size={24} />
          </Button>
          {resolvedSecondary ? (
            <Button
              href={resolvedSecondary.href}
              size="xl"
              variant="ghost"
              className="w-full border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white min-[481px]:w-auto"
            >
              {resolvedSecondary.label}
              <ChevronRight size={24} />
            </Button>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}
