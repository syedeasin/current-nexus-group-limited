import { createElement } from "react";
import { getTranslations } from "next-intl/server";
import Image from "@/components/ui/Picture";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SceneCard from "@/components/ui/SceneCard";
import SceneCarousel from "@/components/sections/home/application-scenes/SceneCarousel";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { CircleCheck } from "lucide-react";
import BlockHeader, { BlockIntro, BlockTitle, paragraphs } from "@/components/sections/blocks/BlockHeader";
import { pageIcon } from "@/lib/page-content/icons";
import { entries, str } from "@/lib/page-content/read";
import type { MessageTree } from "@/lib/page-content/tree";
import { cascade, stagger } from "@/lib/motion/timing";
import { CARD_IMAGE_ZOOM, CARD_LIFT, CARD_TITLE_TINT } from "@/lib/motion/interactions";
import { cn } from "@/lib/utils";

export type BlockTone = "white" | "muted" | "dark";

export interface BlockProps {
  data: MessageTree;
  tone: BlockTone;
}

/** Section rhythm of the brand pages (BrandSections SECTION_Y). */
export const SECTION_Y = "py-48 md:py-64 xl:py-100";

const SECTION_BG: Record<BlockTone, string> = {
  white: "bg-white",
  muted: "bg-surface-2",
  dark: "bg-neutral-1",
};

/** A panel that sits on the section: white on grey, light grey on white. */
function panelBg(tone: BlockTone): string {
  return tone === "muted" ? "bg-white" : "bg-surface-2";
}

/** Shared section frame: background tone, standard padding, header, 48px to the content. */
export function BlockSection({ data, tone, children, centered = false, id }: BlockProps & { children: React.ReactNode; centered?: boolean; id?: string }) {
  const heading = str(data, "heading");
  return (
    <section id={id} aria-label={heading || undefined} className={cn("w-full scroll-mt-[120px]", SECTION_BG[tone])}>
      <Container className={cn("flex flex-col gap-48", SECTION_Y)}>
        <BlockHeader eyebrow={str(data, "eyebrow")} heading={heading} intro={str(data, "intro")} dark={tone === "dark"} centered={centered} />
        {children}
      </Container>
    </section>
  );
}

/** Gold-underlined text link with an arrow, used under rows and cards. */
export function TextLink({ href, label, dark = false, className }: { href: string; label: string; dark?: boolean; className?: string }) {
  if (!href || !label) return null;
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex w-fit items-center gap-8 text-p3 font-semibold underline decoration-secondary decoration-2 underline-offset-8 transition-colors duration-150 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary",
        dark ? "text-white" : "text-neutral-1",
        className
      )}
    >
      {label}
      <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-2 motion-reduce:transition-none" />
    </Link>
  );
}

/** Section-level button (`ctaLabel` / `ctaHref`). */
export function BlockCta({ data, className }: { data: MessageTree; className?: string }) {
  const label = str(data, "ctaLabel");
  const href = str(data, "ctaHref");
  if (!label || !href) return null;
  return (
    <Reveal as="div" delay={cascade(3)} className={className}>
      <Button href={href} size="lg" className="w-full whitespace-nowrap min-[481px]:w-fit">
        {label}
        <ArrowRight size={BUTTON_ICON_SIZE} />
      </Button>
    </Reveal>
  );
}

/** Number in a gold ring (steps, numbered lists). */
function NumberMark({ index, dark = false }: { index: number; dark?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-40 shrink-0 items-center justify-center rounded-full border border-secondary/60 text-p4 font-semibold tabular-nums",
        dark ? "text-secondary" : "text-primary"
      )}
    >
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

/** Line icon on the brand pages' lavender tile. */
function IconMark({ icon }: { icon: string }) {
  return (
    <span aria-hidden="true" className="flex size-44 shrink-0 items-center justify-center rounded-12 bg-surface-1 text-primary">
      {createElement(pageIcon(icon), { size: 22, strokeWidth: 1.5 })}
    </span>
  );
}

/**
 * Width a scene-card photo is drawn at. The box is 424:300, so a 16:9 photo is
 * drawn ~1.3× the card width (object-cover); declare that, or the browser
 * downloads a version narrower than it shows.
 */
function sceneSizes(count: number): string {
  if (count === 2) return "(min-width: 640px) 860px, 130vw";
  if (count === 4) return "(min-width: 1280px) 440px, (min-width: 640px) 65vw, 130vw";
  return "(min-width: 1024px) 580px, (min-width: 640px) 65vw, 130vw";
}

function sceneGrid(count: number): string {
  if (count === 2) return "sm:grid-cols-2";
  if (count === 4) return "sm:grid-cols-2 xl:grid-cols-4";
  return "sm:grid-cols-2 lg:grid-cols-3";
}

/**
 * Overview photos (Residential applications, C&I facilities, off-grid uses):
 * the site's scene cards — photo, title, description — in a grid. A row with a
 * link becomes a live card (gold wash and arrow on hover).
 */
export function ImageRows({ data, tone }: BlockProps) {
  const rows = entries(data.rows);
  return (
    <BlockSection data={data} tone={tone}>
      <ul className={cn("grid gap-x-24 gap-y-40", sceneGrid(rows.length))}>
        {rows.map(([id, row], index) => (
          <Reveal key={id} as="li" delay={stagger(index, cascade(2))} className="flex">
            <SceneCard
              href={str(row, "linkHref") || undefined}
              image={str(row, "image")}
              title={str(row, "title")}
              description={str(row, "description")}
              imageSizes={sceneSizes(rows.length)}
            />
          </Reveal>
        ))}
      </ul>
      <BlockCta data={data} />
    </BlockSection>
  );
}

/**
 * Linked photo cards (choose your solution, projects by type, VPP scenarios,
 * procurement scope): the homepage "Scene of applications" cards. Four or more
 * scroll in the same carousel; fewer sit in a grid.
 */
export async function ImageCards({ data, tone }: BlockProps) {
  const cards = entries(data.cards).map(([id, card]) => ({
    key: id,
    title: str(card, "title"),
    description: str(card, "description"),
    image: str(card, "image"),
    href: str(card, "href") || undefined,
  }));
  const t = await getTranslations("home.applicationScenes");
  return (
    <BlockSection data={data} tone={tone}>
      {cards.length >= 4 ? (
        <SceneCarousel cards={cards} ariaLabel={str(data, "heading")} previousLabel={t("previous")} nextLabel={t("next")} />
      ) : (
        <ul className={cn("grid gap-x-24 gap-y-40", sceneGrid(cards.length))}>
          {cards.map((card, index) => (
            <Reveal key={card.key} as="li" delay={stagger(index, cascade(2))} className="flex">
              <SceneCard href={card.href} image={card.image} title={card.title} description={card.description} imageSizes={sceneSizes(cards.length)} />
            </Reveal>
          ))}
        </ul>
      )}
      <BlockCta data={data} />
    </BlockSection>
  );
}

function ProductCard({ card, grouped, sizes }: { card: MessageTree; grouped: boolean; sizes: string }) {
  const Title = grouped ? "h4" : "h3";
  const image = str(card, "image");
  // Every card shares one light panel. Product photos are transparent cutouts on
  // a shared square canvas at one product height (public/images/client/products/square),
  // so they are contained, not cropped, and read the same size; brand logos (SVG) get padding.
  const logo = /\.svg$/i.test(image);
  const specs = str(card, "specs")
    .split(/[,\n]/)
    .map((spec) => spec.trim())
    .filter(Boolean);
  return (
    // Phones: photo beside the text, so a long list of products stays short.
    <Link
      href={str(card, "href") || "#"}
      fallbackHref={str(card, "fallbackHref") || undefined}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-16 border border-neutral-10 bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary max-sm:flex-row",
        CARD_LIFT
      )}
    >
      <div className="relative isolate aspect-square w-full transform-gpu overflow-clip bg-surface-2 [backface-visibility:hidden] max-sm:aspect-auto max-sm:w-120 max-sm:shrink-0">
        {image ? (
          <Image
            src={image}
            alt={str(card, "imageAlt")}
            fill
            sizes={sizes}
            className={cn("object-contain", logo && "p-20 sm:p-56", CARD_IMAGE_ZOOM)}
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-8 p-24 max-sm:min-w-0 max-sm:p-16">
        <Title className={cn("text-h6 font-semibold text-neutral-1", CARD_TITLE_TINT)}>{str(card, "title")}</Title>
        <p className="text-p3 text-neutral-4">{str(card, "description")}</p>
        {specs.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-6">
            {specs.map((spec) => (
              <li key={spec} className="rounded-full bg-surface-2 px-10 py-2 text-p4 text-neutral-3">
                {spec}
              </li>
            ))}
          </ul>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-8 pt-12 text-p3 font-semibold text-neutral-1">
          <span className={CARD_TITLE_TINT}>{str(card, "linkLabel") || "View Products"}</span>
          <ArrowRight size={16} className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:translate-x-4 group-hover:text-secondary motion-reduce:transition-none" />
        </span>
      </div>
    </Link>
  );
}

/** Width a product photo is drawn at, per row length (square box = card width; phones: 120px tile). */
function productSizes(count: number): string {
  if (count >= 4) return "(min-width: 1280px) 330px, (min-width: 640px) 50vw, 120px";
  if (count === 2) return "(min-width: 640px) 660px, 120px";
  return "(min-width: 1024px) 440px, (min-width: 640px) 50vw, 120px";
}

/**
 * Product entry cards: photo filling a square box, title, short description,
 * key parameters and "View Products". Cards that share a `group` are shown
 * together under that group name (Revamping: Solar modules / Inverters /
 * Energy storage). Hover is the site's card motion (lift, slow zoom, gold title).
 */
export function ProductCards({ data, tone }: BlockProps) {
  const cards = entries(data.cards);
  const groups: { name: string; cards: [string, MessageTree][] }[] = [];
  for (const entry of cards) {
    const name = str(entry[1], "group");
    const current = groups.find((group) => group.name === name);
    if (current) current.cards.push(entry);
    else groups.push({ name, cards: [entry] });
  }
  return (
    <BlockSection data={data} tone={tone}>
      <div className="flex flex-col gap-48">
        {groups.map((group) => (
          <div key={group.name || "products"} className="flex flex-col gap-24">
            {group.name ? <h3 className="border-b border-neutral-10 pb-12 text-h6 font-semibold text-neutral-1">{group.name}</h3> : null}
            <ul className={cn("grid gap-24", group.cards.length >= 4 ? "sm:grid-cols-2 xl:grid-cols-4" : group.cards.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
              {group.cards.map(([id, card], index) => (
                <Reveal key={id} as="li" delay={stagger(index, cascade(2))} className="flex">
                  <ProductCard card={card} grouped={Boolean(group.name)} sizes={productSizes(group.cards.length)} />
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <BlockCta data={data} />
    </BlockSection>
  );
}

/**
 * Points with a title and a sentence or two (challenges, considerations,
 * support): copy on the left, held in view while the points scroll past in a
 * bordered panel on the right — the brand pages' Documents layout, which keeps
 * long lists calm and every description at the same measure.
 */
export function NumberedList({ data, tone }: BlockProps) {
  const items = entries(data.items);
  const heading = str(data, "heading");
  return (
    <section aria-label={heading || undefined} className={cn("w-full scroll-mt-[120px]", SECTION_BG[tone])}>
      <Container className={cn("grid gap-40 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-80", SECTION_Y)}>
        <div className="flex flex-col gap-24 lg:sticky lg:top-120 lg:self-start">
          <BlockTitle eyebrow={str(data, "eyebrow")} heading={heading} />
          <BlockIntro text={str(data, "intro")} />
          {str(data, "closing") ? (
            <Reveal as="div" delay={cascade(3)}>
              <p className="max-w-[520px] border-l-2 border-secondary pl-16 text-p3 font-medium text-neutral-1">{str(data, "closing")}</p>
            </Reveal>
          ) : null}
          <BlockCta data={data} />
        </div>
        <ol className={cn("flex flex-col divide-y divide-neutral-10 rounded-16 border border-neutral-10 px-24 md:px-32", panelBg(tone))}>
          {items.map(([id, item], index) => {
            const icon = str(item, "icon");
            return (
              <Reveal key={id} as="li" delay={stagger(index, cascade(2))} className="flex gap-16 py-24 md:gap-20 md:py-28">
                {icon ? <IconMark icon={icon} /> : <NumberMark index={index} />}
                <div className="flex min-w-0 flex-col gap-8 pt-2">
                  <Heading level={3} size="h6">
                    {str(item, "title")}
                  </Heading>
                  <Text size="p3" className="text-neutral-4">
                    {str(item, "description")}
                  </Text>
                  <TextLink href={str(item, "linkHref")} label={str(item, "linkLabel")} className="mt-4" />
                </div>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}

/**
 * "Why choose CNX" band: a darkened project photo behind the brand pages'
 * procurement header (title left, intro and button right) and four glass cards.
 */
export function FeatureCards({ data }: BlockProps) {
  const items = entries(data.items);
  const heading = str(data, "heading");
  const image = str(data, "image");
  const aside = paragraphs(str(data, "intro")).length > 0 || Boolean(str(data, "ctaLabel"));
  return (
    <section aria-label={heading || undefined} className="relative isolate w-full overflow-hidden bg-neutral-1">
      {image ? <Image src={image} alt="" aria-hidden="true" fill sizes="100vw" className="-z-20 object-cover" /> : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,13,27,0.9)_0%,rgba(10,13,27,0.55)_45%,rgba(10,13,27,0.88)_100%)]"
      />
      <Container className={cn("flex flex-col gap-48", SECTION_Y)}>
        <div className="flex flex-col gap-24 lg:flex-row lg:items-end lg:justify-between lg:gap-80">
          <div className={aside ? "lg:max-w-[640px]" : "lg:max-w-[880px]"}>
            <BlockTitle eyebrow={str(data, "eyebrow")} heading={heading} dark />
          </div>
          {aside ? (
            <div className="flex flex-col items-start gap-24 lg:w-[40%] lg:shrink-0">
              <BlockIntro text={str(data, "intro")} dark />
              <BlockCta data={data} />
            </div>
          ) : null}
        </div>
        <ol className={cn("grid gap-16 sm:grid-cols-2 lg:gap-24", items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
          {items.map(([id, item], index) => (
            <Reveal
              key={id}
              as="li"
              delay={stagger(index, cascade(2))}
              className="flex flex-col gap-20 rounded-16 border border-white/15 bg-[rgba(10,13,27,0.5)] p-24 backdrop-blur-md md:p-28"
            >
              <NumberMark index={index} dark />
              <div className="flex flex-col gap-8">
                <Heading level={3} size="h6" className="text-white">
                  {str(item, "title")}
                </Heading>
                <Text size="p3" className="text-neutral-8">
                  {str(item, "description")}
                </Text>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/**
 * Process steps as the brand pages draw them: header with intro and button on
 * the right, then one card per step — icon (or number), title, description and
 * an optional "deliverable" line under a hairline.
 */
export function Steps({ data, tone }: BlockProps) {
  const steps = entries(data.steps);
  const heading = str(data, "heading");
  // Long processes (5+ steps or a deliverable per step) read as a timeline.
  if (steps.length >= 5 || steps.some(([, step]) => str(step, "deliverable"))) return <StepTimeline data={data} tone={tone} />;
  const columns = steps.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  const aside = paragraphs(str(data, "intro")).length > 0 || Boolean(str(data, "ctaLabel"));
  return (
    <section aria-label={heading || undefined} className={cn("w-full scroll-mt-[120px]", SECTION_BG[tone])}>
      <Container className={cn("flex flex-col gap-48", SECTION_Y)}>
        <div className="flex flex-col gap-24 lg:flex-row lg:items-end lg:justify-between lg:gap-80">
          <div className={aside ? "lg:max-w-[640px]" : "lg:max-w-[880px]"}>
            <BlockTitle eyebrow={str(data, "eyebrow")} heading={heading} />
          </div>
          {aside ? (
            <div className="flex flex-col items-start gap-24 lg:w-[40%] lg:shrink-0">
              <BlockIntro text={str(data, "intro")} />
              <BlockCta data={data} />
            </div>
          ) : null}
        </div>
        <ol className={cn("grid gap-16 sm:grid-cols-2 lg:gap-24", columns)}>
          {steps.map(([id, step], index) => {
            const icon = str(step, "icon");
            return (
              <Reveal
                key={id}
                as="li"
                delay={stagger(index, cascade(2))}
                className={cn("flex flex-col gap-20 rounded-16 border border-neutral-10 p-24", panelBg(tone))}
              >
                <div className="flex items-center justify-between gap-12">
                  {icon ? <IconMark icon={icon} /> : <NumberMark index={index} />}
                  {icon ? (
                    <span aria-hidden="true" className="text-p4 font-semibold tabular-nums text-neutral-6">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-8">
                  <Heading level={3} size="h6">
                    {str(step, "title")}
                  </Heading>
                  <Text size="p3" className="text-neutral-4">
                    {str(step, "description")}
                  </Text>
                </div>
                {str(step, "deliverable") ? (
                  <p className="mt-auto flex items-start gap-8 border-t border-neutral-10 pt-16 text-p4 font-medium text-neutral-2">
                    <CircleCheck size={16} aria-hidden="true" className="mt-2 shrink-0 text-secondary" />
                    {str(step, "deliverable")}
                  </p>
                ) : null}
              </Reveal>
            );
          })}
        </ol>
        {str(data, "note") ? <p className="max-w-[760px] text-p4 text-neutral-5">{str(data, "note")}</p> : null}
      </Container>
    </section>
  );
}

/**
 * A long process as a vertical timeline: copy, note and button held on the
 * left (as the numbered lists), the steps down the right — icon or number on a
 * connecting line, title, description and the step's deliverable.
 */
function StepTimeline({ data, tone }: BlockProps) {
  const steps = entries(data.steps);
  const heading = str(data, "heading");
  return (
    <section aria-label={heading || undefined} className={cn("w-full scroll-mt-[120px]", SECTION_BG[tone])}>
      <Container className={cn("grid gap-40 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-80", SECTION_Y)}>
        <div className="flex flex-col gap-24 lg:sticky lg:top-120 lg:self-start">
          <BlockTitle eyebrow={str(data, "eyebrow")} heading={heading} />
          <BlockIntro text={str(data, "intro")} />
          <BlockCta data={data} />
          {str(data, "note") ? <p className="max-w-[480px] text-p4 text-neutral-5">{str(data, "note")}</p> : null}
        </div>
        <ol className={cn("flex flex-col rounded-16 border border-neutral-10 px-24 py-8 md:px-32", panelBg(tone))}>
          {steps.map(([id, step], index) => {
            const icon = str(step, "icon");
            const last = index === steps.length - 1;
            return (
              <Reveal key={id} as="li" delay={stagger(index, cascade(2))} className="relative flex gap-16 py-24 md:gap-24">
                {/* Connector from this marker to the next. */}
                {!last ? <span aria-hidden="true" className="absolute top-[72px] bottom-[-4px] left-[21px] w-px bg-neutral-9" /> : null}
                <div className="relative flex flex-col items-center gap-6">
                  {icon ? <IconMark icon={icon} /> : <NumberMark index={index} />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-8 pt-2">
                  <span className="text-p4 font-semibold tabular-nums text-neutral-6">{String(index + 1).padStart(2, "0")}</span>
                  <Heading level={3} size="h6">
                    {str(step, "title")}
                  </Heading>
                  <Text size="p3" className="text-neutral-4">
                    {str(step, "description")}
                  </Text>
                  {str(step, "deliverable") ? (
                    <p className="mt-4 flex items-start gap-8 text-p4 font-medium text-neutral-2">
                      <CircleCheck size={16} aria-hidden="true" className="mt-2 shrink-0 text-secondary" />
                      {str(step, "deliverable")}
                    </p>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}

/** "What to send us" checklist: ticked items in two columns, a supporting line and a button. */
export function Checklist({ data, tone }: BlockProps) {
  const items = entries(data.items);
  return (
    <BlockSection data={data} tone={tone}>
      <div className={cn("rounded-24 border border-neutral-10 p-24 md:p-40", panelBg(tone))}>
        <ul className="grid gap-x-48 gap-y-16 md:grid-cols-2">
          {items.map(([id, item]) => (
            <li key={id} className="flex items-start gap-12 text-p3 text-neutral-2">
              <CircleCheck size={20} aria-hidden="true" className="mt-2 shrink-0 text-secondary" />
              <span>{str(item, "text")}</span>
            </li>
          ))}
        </ul>
        {str(data, "note") ? (
          <div className="mt-28 flex flex-col gap-8 border-t border-neutral-10 pt-24">
            {paragraphs(str(data, "note")).map((line) => (
              <p key={line} className="max-w-[760px] text-p3 text-neutral-3">
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </div>
      <BlockCta data={data} />
    </BlockSection>
  );
}
