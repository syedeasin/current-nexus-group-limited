import type { Metadata } from "next";
import BlockPage from "@/components/sections/blocks/BlockPage";
import { getBlockPage } from "@/lib/block-pages/config";
import { blockPageMetadata } from "@/lib/block-pages/metadata";
import { assertPageVisible } from "@/lib/page-visibility";

const page = getBlockPage("revamping")!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return blockPageMetadata(page, locale);
}

/** Solar panel replacement / PV revamping (Manufacturing → Solar Panels → Revamping). Copy: Dashboard → Pages → Solar Panel Revamping. */
export default async function RevampingPage() {
  await assertPageVisible(page.href);
  return <BlockPage pageKey={page.key} />;
}
