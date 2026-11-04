import type { Metadata } from "next";
import BlockPage from "@/components/sections/blocks/BlockPage";
import { getBlockPage } from "@/lib/block-pages/config";
import { blockPageMetadata } from "@/lib/block-pages/metadata";
import { assertPageVisible } from "@/lib/page-visibility";

const page = getBlockPage("solutionsHub")!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return blockPageMetadata(page, locale);
}

/** Solutions overview — opens from Solutions & Projects → Solutions. Copy: Dashboard → Pages → Solutions (overview). */
export default async function SolutionsOverviewPage() {
  await assertPageVisible(page.href);
  return <BlockPage pageKey={page.key} />;
}
