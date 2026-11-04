import Image from "@/components/ui/Picture";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import TopHeavyText from "@/components/ui/TopHeavyText";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { paragraphs } from "@/components/sections/blocks/BlockHeader";
import { entries, str } from "@/lib/page-content/read";
import type { MessageTree } from "@/lib/page-content/tree";
import { cascade, HERO_BODY_DELAY_MS, HERO_CTA_DELAY_MS, HERO_HEADING_DELAY_MS } from "@/lib/motion/timing";
import { HERO_HEADER_OFFSET } from "@/src/layout/headerOffset";
import { cn } from "@/lib/utils";

/**
 * Banner for the content-block pages (Solutions, Projects, Revamping): photo
 * under the site's inner-hero scrims, eyebrow, H1 (h2 size like every inner
 * page), lead paragraph, optional chips and two buttons on the left; any
 * further paragraph and the note sit in a glass panel on the right (desktop).
 */
export default function BlockHero({ data }: { data: MessageTree }) {
  const image = str(data, "image");
  const chips = entries(data.chips).map(([id, chip]) => ({ id, text: str(chip, "text") })).filter((chip) => chip.text);
  const primary = { label: str(data, "primaryLabel"), href: str(data, "primaryHref") };
  const secondary = { label: str(data, "secondaryLabel"), href: str(data, "secondaryHref") };
  const [lead = "", ...rest] = paragraphs(str(data, "description"));
  const note = str(data, "note");

  return (
    <section
      aria-label={str(data, "heading")}
      data-hero-sentinel
      className={cn("relative flex min-h-[620px] w-full flex-col justify-end overflow-hidden bg-neutral-1 md:min-h-[680px] xl:min-h-[760px]", HERO_HEADER_OFFSET)}
    >
      {image ? (
        <Image src={image} alt={str(data, "imageAlt")} fill preload sizes="100vw" className="object-cover" style={{ objectPosition: str(data, "imagePosition") || "center" }} />
      ) : null}
      {/* Same scrims as the About and brand heroes: dark from the text side
          (left on desktop, bottom on phones) plus a top fade under the header. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,#0A0D1B_0%,rgba(10,13,27,0.92)_38%,rgba(10,13,27,0.45)_70%,rgba(10,13,27,0.25)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(10,13,27,0.55)_0%,rgba(10,13,27,0.85)_55%,#0A0D1B_100%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-160 bg-[linear-gradient(to_bottom,rgba(10,13,27,0.6),rgba(10,13,27,0))]" />
      <Container
        className={cn(
          "relative z-10 grid gap-40 pt-120 pb-56 md:pt-140 md:pb-80 xl:pb-100",
          // The glass panel takes a fixed 400px; without it the copy has the full width.
          rest.length > 0 && "lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-end lg:gap-64"
        )}
      >
        <div className="flex flex-col gap-28">
          <div className="flex flex-col gap-16">
            {str(data, "eyebrow") ? (
              <Reveal as="div" delay={cascade(0)}>
                <SectionEyebrow label={str(data, "eyebrow")} tone="dark" />
              </Reveal>
            ) : null}
            <TextReveal delay={HERO_HEADING_DELAY_MS}>
              <Heading level={1} size="h2" className="text-balance text-white">
                {str(data, "heading")}
              </Heading>
            </TextReveal>
            {lead ? (
              // Wide enough for 3–4 lines of intro; the top-heavy fit may not add a line.
              <Reveal as="div" delay={HERO_BODY_DELAY_MS} className={cn("flex flex-col gap-12", rest.length > 0 ? "max-w-[860px]" : "max-w-[960px]")}>
                <TopHeavyText maxExtraLines={0} className="text-p2 text-white/90">
                  {lead}
                </TopHeavyText>
                {/* Tablets: the supporting paragraph inline (phones skip it to keep the buttons above the fold). */}
                {rest.map((line) => (
                  <TopHeavyText key={line} className="hidden text-p3 text-neutral-8 md:block lg:hidden">
                    {line}
                  </TopHeavyText>
                ))}
              </Reveal>
            ) : null}
          </div>

          {chips.length > 0 ? (
            <Reveal as="div" delay={HERO_BODY_DELAY_MS} className="flex flex-wrap gap-8">
              {chips.map((chip) => (
                <span key={chip.id} className="rounded-full border border-white/20 bg-white/10 px-14 py-6 text-p4 font-medium text-white backdrop-blur-sm">
                  {chip.text}
                </span>
              ))}
            </Reveal>
          ) : null}

          {primary.label || secondary.label ? (
            <Reveal as="div" delay={HERO_CTA_DELAY_MS} className="flex flex-col gap-12">
              <div className="flex w-full flex-col gap-12 min-[481px]:flex-row min-[481px]:flex-wrap">
                {primary.label && primary.href ? (
                  <Button href={primary.href} size="lg" className="w-full justify-center whitespace-nowrap max-[480px]:px-16 min-[481px]:w-fit">
                    {primary.label}
                    <ArrowRight size={BUTTON_ICON_SIZE} />
                  </Button>
                ) : null}
                {secondary.label && secondary.href ? (
                  <Button href={secondary.href} size="lg" variant="secondary" className="w-full justify-center whitespace-nowrap max-[480px]:px-16 min-[481px]:w-fit">
                    {secondary.label}
                  </Button>
                ) : null}
              </div>
              {note ? <p className={cn("max-w-[620px] text-p4 text-neutral-8", rest.length > 0 && "lg:hidden")}>{note}</p> : null}
            </Reveal>
          ) : null}
        </div>

        {/* Desktop: the longer supporting copy and the note move into a glass
            panel at the bottom right, so the left column stays headline, lead
            and buttons. */}
        {rest.length > 0 ? (
          <Reveal as="div" delay={HERO_CTA_DELAY_MS} className="hidden lg:block">
            <div className="flex flex-col gap-16 rounded-20 border border-white/10 bg-[rgba(10,13,27,0.55)] p-28 backdrop-blur-md">
              {rest.map((line) => (
                <p key={line} className="text-p3 text-white/85">
                  {line}
                </p>
              ))}
              {note ? (
                <p className="flex items-start gap-10 border-t border-white/10 pt-16 text-p4 text-neutral-8">
                  <span aria-hidden="true" className="mt-6 size-6 shrink-0 rounded-full bg-secondary" />
                  {note}
                </p>
              ) : null}
            </div>
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
