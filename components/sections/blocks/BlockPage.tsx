import { Fragment } from "react";
import { getMessages } from "next-intl/server";
import CtaBand from "@/components/sections/shared/CtaBand";
import BlockHero from "@/components/sections/blocks/BlockHero";
import BlockFaq from "@/components/sections/blocks/BlockFaq";
import BlockInquiryForm from "@/components/sections/blocks/BlockInquiryForm";
import ProjectCases from "@/components/sections/blocks/ProjectCases";
import {
  Checklist,
  FeatureCards,
  ImageCards,
  ImageRows,
  NumberedList,
  ProductCards,
  Steps,
  type BlockProps,
  type BlockTone,
} from "@/components/sections/blocks/ContentBlocks";
import { Buyers, CaseExample, Comparison, Routes, TrustStrip } from "@/components/sections/blocks/RevampingBlocks";
import { BLOCK_PAGES_NAMESPACE, getBlockPage, type BlockKind, type BlockSectionDef } from "@/lib/block-pages/config";
import { bool, str } from "@/lib/page-content/read";
import { getAt, isTree, type MessageTree } from "@/lib/page-content/tree";

const TONED: Partial<Record<BlockKind, (props: BlockProps) => React.ReactNode | Promise<React.ReactNode>>> = {
  rows: ImageRows,
  imageCards: ImageCards,
  products: ProductCards,
  list: NumberedList,
  steps: Steps,
  checklist: Checklist,
  cases: ProjectCases,
  faq: BlockFaq,
  routes: Routes,
  comparison: Comparison,
  buyers: Buyers,
  caseExample: CaseExample,
  trust: TrustStrip,
};

/** Kinds that draw their own fixed background, so the white / grey rhythm skips them. */
const OWN_BACKGROUND = new Set<BlockKind>(["hero", "cta", "features"]);

function renderSection(pageKey: string, section: BlockSectionDef, data: MessageTree, tone: BlockTone) {
  switch (section.kind) {
    case "hero":
      return <BlockHero data={data} />;
    case "features":
      return <FeatureCards data={data} tone="dark" />;
    case "inquiry":
      return <BlockInquiryForm pageKey={pageKey} sectionId={section.id} data={data} tone={tone === "white" ? "white" : "muted"} />;
    case "cta": {
      const secondaryLabel = str(data, "secondaryLabel");
      const secondaryHref = str(data, "secondaryHref");
      return (
        <CtaBand
          heading={str(data, "heading")}
          subtext={str(data, "subtext") || undefined}
          primaryCta={{ label: str(data, "primaryLabel"), href: str(data, "primaryHref") }}
          secondaryCta={secondaryLabel && secondaryHref ? { label: secondaryLabel, href: secondaryHref } : null}
          image={str(data, "image") ? { src: str(data, "image"), alt: "" } : undefined}
        />
      );
    }
    default: {
      const Block = TONED[section.kind];
      return Block ? <Block data={data} tone={tone} /> : null;
    }
  }
}

/**
 * Draws a content-block page (lib/block-pages/config.ts) from its copy in
 * the merged messages (Dashboard → Pages). Light sections (the form too)
 * alternate white and grey; "Why choose" bands are always dark, and the
 * banner and bottom CTA keep their photos. A section with "hideSection" on is
 * skipped.
 */
export default async function BlockPage({ pageKey }: { pageKey: string }) {
  const page = getBlockPage(pageKey);
  if (!page) return null;
  const tree = getAt(await getMessages(), `${BLOCK_PAGES_NAMESPACE}.${page.key}`);
  if (!isTree(tree)) return null;

  const visible: { section: BlockSectionDef; data: MessageTree; tone: BlockTone }[] = [];
  let previous: BlockTone | "none" = "none";
  for (const section of page.sections) {
    const data = tree[section.id];
    if (!isTree(data) || bool(data, "hideSection")) continue;
    let tone: BlockTone = "white";
    if (OWN_BACKGROUND.has(section.kind)) {
      previous = section.kind === "features" ? "dark" : "none";
    } else {
      tone = previous === "white" ? "muted" : "white";
      previous = tone;
    }
    visible.push({ section, data, tone });
  }

  return (
    <>
      {visible.map(({ section, data, tone }) => (
        <Fragment key={section.id}>{renderSection(page.key, section, data, tone)}</Fragment>
      ))}
    </>
  );
}
