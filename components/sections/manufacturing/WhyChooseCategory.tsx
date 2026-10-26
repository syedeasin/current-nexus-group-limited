import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { ArrowRight } from "@/components/icons/ArrowRight";
import type { ProductCategory } from "@/lib/data/manufacturing";
import { pageIcon } from "@/lib/page-content/icons";
import { entries, str } from "@/lib/page-content/read";

const HEADING_DELAY_MS = 80;
const IMAGE_DELAY_MS = 160;
const FEATURE_BASE_DELAY_MS = 240;
const FEATURE_STEP_MS = 80;
const FEATURE_STAGGER_CAP_MS = 400;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Why Choose CNX?" on the Solar Panels / BESS collection pages (client
 * revision 1022). Long copy, so a sticky intro column (eyebrow, heading,
 * intro, CTAs) beside the photo and a numbered list of the four features,
 * divided by hairlines instead of boxed cards. "Show on the website" switches
 * it off — the BESS one ships hidden until the client turns it on.
 */
export default async function WhyChooseCategory({ category }: { category: ProductCategory }) {
  const t = await getTranslations(`${category.namespace}.whyChoose`);
  if (t.has("show") && t("show") !== "true") return null;
  const features = entries(t.raw("features" as never));
  const intro = t.has("intro") ? t("intro") : "";
  const primary = t.has("primaryCta") ? { label: t("primaryCta"), href: t("primaryCtaHref") } : null;
  const secondary = t.has("secondaryCta") ? { label: t("secondaryCta"), href: t("secondaryCtaHref") } : null;
  const image = t.has("image") ? t("image") : "";

  return (
    <section aria-label={t("heading")} className="w-full bg-surface-2 py-64 md:py-80 xl:py-120">
      <Container className="grid gap-48 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:gap-56 xl:gap-80">
        {/* Intro: stays in view while the feature list scrolls past. */}
        <div className="flex flex-col gap-32 md:gap-40 lg:sticky lg:top-120 lg:self-start">
          <div className="flex flex-col gap-20">
            <div className="flex flex-col gap-12">
              <Reveal as="div" delay={0}>
                <SectionEyebrow label={t("eyebrow")} />
              </Reveal>
              <TextReveal delay={HEADING_DELAY_MS}>
                {/* 580px breaks the default heading as "More Than Solar Modules /
                    — A Partner for Your / Sourcing Needs" at the 48px desktop size. */}
                <Heading level={2} size="h2" className="text-balance lg:max-w-[580px] lg:text-wrap">
                  {t("heading")}
                </Heading>
              </TextReveal>
            </div>
            {intro && (
              <Reveal as="div" delay={IMAGE_DELAY_MS}>
                <Text size="p3" className="max-w-[560px] text-neutral-3">
                  {intro}
                </Text>
              </Reveal>
            )}
          </div>
          {(primary?.label || secondary?.label) && (
            <Reveal as="div" delay={IMAGE_DELAY_MS} className="flex w-full flex-col gap-12 min-[481px]:w-fit min-[481px]:flex-row min-[481px]:flex-wrap lg:flex-nowrap">
              {primary?.label && (
                <Button href={primary.href} size="lg" className="w-full justify-center min-[481px]:w-fit">
                  {primary.label}
                  <ArrowRight size={BUTTON_ICON_SIZE} />
                </Button>
              )}
              {secondary?.label && (
                <Button href={secondary.href} size="lg" variant="outline" className="w-full justify-center min-[481px]:w-fit">
                  {secondary.label}
                </Button>
              )}
            </Reveal>
          )}
        </div>

        <div className="flex flex-col gap-40">
          {image && (
            <Reveal variant="scale" delay={IMAGE_DELAY_MS} className="relative aspect-[16/10] w-full overflow-hidden rounded-16">
              <Image src={image} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 720px, 100vw" className="object-cover" />
            </Reveal>
          )}

          {/* Features: icon | title + description | number, three columns. */}
          <ul className="flex flex-col">
            {features.map(([id, feature], index) => {
              const Icon = pageIcon(str(feature, "icon"));
              const delay = FEATURE_BASE_DELAY_MS + Math.min(index * FEATURE_STEP_MS, FEATURE_STAGGER_CAP_MS);
              return (
                <Reveal
                  key={id}
                  as="li"
                  delay={delay}
                  className="grid grid-cols-[40px_minmax(0,1fr)_auto] gap-x-16 border-b border-neutral-10 py-28 first:border-t sm:grid-cols-[48px_minmax(0,1fr)_auto] sm:gap-x-24 md:py-32"
                >
                  <span
                    aria-hidden="true"
                    className="row-span-2 flex size-40 items-center justify-center rounded-12 bg-white text-neutral-1 sm:size-48"
                  >
                    <Icon size={22} strokeWidth={1.5} />
                  </span>
                  <Heading level={3} size="h6" className="min-w-0 self-center sm:self-start">
                    {str(feature, "title")}
                  </Heading>
                  <span className="self-center pt-2 text-p4 font-medium tabular-nums text-neutral-6 sm:self-start">
                    {pad(index + 1)}
                  </span>
                  {/* Phones: the description also takes the number column's width. */}
                  <Text size="p3" className="col-span-2 col-start-2 mt-8 text-neutral-3 sm:col-span-1">
                    {str(feature, "description")}
                  </Text>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
