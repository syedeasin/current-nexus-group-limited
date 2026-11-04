import type { Metadata } from "next";
import BlockPage from "@/components/sections/blocks/BlockPage";
import { getBlockPage } from "@/lib/block-pages/config";
import { blockPageMetadata } from "@/lib/block-pages/metadata";
import { assertPageVisible } from "@/lib/page-visibility";

const page = getBlockPage("projectsHub")!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return blockPageMetadata(page, locale);
}

/** Renewable Projects overview — opens from Solutions & Projects → Renewable Projects. Copy: Dashboard → Pages → Renewable Projects (overview). */
export default async function RenewableProjectsOverviewPage() {
  await assertPageVisible(page.href);
  return <BlockPage pageKey={page.key} />;
}
